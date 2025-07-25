'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/common';
import { useMultipleYouTubePlayers } from '@/hooks';
import {
  calculateProgress,
  generateQuizQuestions,
  getTracksFromSelectedAlbums,
} from '@/lib/quiz-utils';
import { fetchSongsData, getSelectedAlbumIds } from '@/lib/songs-api';
import type { Album, QuizQuestion, SongsData, Track } from '@/types';
import { AnswerModal } from './AnswerModal';
import styles from './QuizContainer.module.css';

interface QuizContainerProps {
  albumIds: string[];
}

export const QuizContainer: React.FC<QuizContainerProps> = ({ albumIds }) => {
  const router = useRouter();

  // クイズ状態
  const [songsData, setSongsData] = useState<SongsData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル状態
  const [answerModalState, setAnswerModalState] = useState<{
    isOpen: boolean;
    trackNumber: number;
  }>({ isOpen: false, trackNumber: 1 });

  // YouTube Player
  const { isPlaying, isAllPlayersReady, playTracks, stopTracks, preloadTracks } =
    useMultipleYouTubePlayers();

  // データの初期読み込みとクイズ生成
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSongsData();
        setSongsData(data);

        const availableTracks = getTracksFromSelectedAlbums(data.artists, albumIds);

        if (availableTracks.length < 3) {
          throw new Error('選択されたアルバムの楽曲が不足しています（最低3曲必要）');
        }

        const quizQuestions = generateQuizQuestions(availableTracks, 5);
        setQuestions(quizQuestions);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'クイズの初期化に失敗しました');
        console.error('Quiz initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (albumIds.length > 0) {
      initializeQuiz();
    } else {
      setError('出題範囲が選択されていません');
      setIsLoading(false);
    }
  }, [albumIds]);

  // 次の問題のプリロード
  useEffect(() => {
    if (questions.length > 0 && isAllPlayersReady) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < questions.length) {
        const nextQuestion = questions[nextQuestionIndex];
        preloadTracks(nextQuestion.tracks);
      }
    }
  }, [questions, currentQuestionIndex, isAllPlayersReady, preloadTracks]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = calculateProgress(questions, currentQuestionIndex);

  // 楽曲再生
  const handlePlayTracks = () => {
    if (!currentQuestion || !isAllPlayersReady) return;

    // 事前決定された各楽曲の開始時間を使用
    playTracks(currentQuestion.tracks, currentQuestion.startTimes, 5);
  };

  // 楽曲停止
  const handleStopTracks = () => {
    stopTracks();
  };

  // 回答モーダルを開く
  const handleOpenAnswerModal = (trackNumber: number) => {
    setAnswerModalState({ isOpen: true, trackNumber });
  };

  // 回答モーダルを閉じる
  const handleCloseAnswerModal = () => {
    setAnswerModalState({ isOpen: false, trackNumber: 1 });
  };

  // 楽曲選択処理（順不同対応）
  const handleTrackSelect = useCallback(
    (selectedTrack: Track, setFeedback: (feedback: any) => void, shouldClose?: boolean) => {
      if (!currentQuestion) return;

      // 選択された楽曲が問題の楽曲に含まれているかチェック
      const isCorrect = currentQuestion.tracks.some(track => track.id === selectedTrack.id);
      // すでに正解済みかチェック
      const isAlreadyAnswered = currentQuestion.correctAnswers.includes(selectedTrack.id);

      if (isCorrect && !isAlreadyAnswered) {
        // 正解の場合、correctAnswersに追加
        const updatedQuestions = [...questions];
        const newCorrectAnswers = [...currentQuestion.correctAnswers, selectedTrack.id];
        updatedQuestions[currentQuestionIndex] = {
          ...currentQuestion,
          correctAnswers: newCorrectAnswers,
        };
        setQuestions(updatedQuestions);
        
        // 問題4対応: モーダル下部にフィードバック表示
        setFeedback({
          type: 'correct',
          message: `正解！ ${selectedTrack.title}`
        });

        // 問題6対応: 全問正解時（3問すべて正解）にはモーダルを即座に閉じる
        if (newCorrectAnswers.length === 3) {
          setTimeout(() => {
            handleCloseAnswerModal();
          }, 100); // フィードバック表示後、即座に閉じる
        }
      } else if (isAlreadyAnswered) {
        // すでに正解済みの場合
        setFeedback({
          type: 'already-answered',
          message: `すでに正解済みです: ${selectedTrack.title}`
        });
      } else {
        // 不正解の場合（問題7対応: 正解の楽曲名は表示しない）
        setFeedback({
          type: 'incorrect',
          message: '不正解...'
        });
      }
    },
    [currentQuestion, questions, currentQuestionIndex],
  );

  // 答えを見る
  const handleShowAnswer = () => {
    if (!currentQuestion) return;

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      isAnswerRevealed: true,
    };
    setQuestions(updatedQuestions);
  };

  // 次の問題へ
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // クイズ終了
      router.push('/result');
    }
  };

  // トップページに戻る
  const handleBackToTop = () => {
    const queryParam = albumIds.length > 0 ? `?albums=${albumIds.join(',')}` : '';
    router.push(`/${queryParam}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>クイズを準備中...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuestion || !songsData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>エラーが発生しました</h2>
          <p>{error || 'クイズの読み込みに失敗しました'}</p>
          <Button onClick={handleBackToTop}>トップページに戻る</Button>
        </div>
      </div>
    );
  }

  // 出題範囲のアルバムを取得
  const availableAlbums = songsData.artists.flatMap((artist) =>
    artist.albums.filter((album) => albumIds.includes(album.id)),
  );

  const canProceedToNext =
    currentQuestion.correctAnswers.length === 3 || currentQuestion.isAnswerRevealed;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
        <div className={styles.questionInfo}>
          <h1>
            問題 {progress.currentQuestion} / {progress.totalQuestions}
          </h1>
          <Button variant="outline" size="small" onClick={handleBackToTop}>
            トップに戻る
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.playerSection}>
          <div className={styles.playButton}>
            <Button
              variant="primary"
              size="large"
              onClick={isPlaying ? handleStopTracks : handlePlayTracks}
              disabled={!isAllPlayersReady}
            >
              {isPlaying ? '⏹ 停止' : '▶ 再生'}
            </Button>
          </div>

          {!isAllPlayersReady && <p className={styles.loadingText}>プレイヤーを準備中...</p>}
        </div>

        <div className={styles.answersSection}>
          <h2>楽曲を特定してください</h2>
          <div className={styles.answerButton}>
            <Button
              variant="primary"
              size="large"
              onClick={() => handleOpenAnswerModal(1)}
              disabled={currentQuestion.isAnswerRevealed && currentQuestion.correctAnswers.length === 3}
            >
              回答する
            </Button>
          </div>
          {/* 正解済み楽曲の表示 */}
          {currentQuestion.correctAnswers.length > 0 && (
            <div className={styles.correctAnswers}>
              <h3>正解済み楽曲:</h3>
              <ul>
                {currentQuestion.correctAnswers.map((trackId) => {
                  const track = currentQuestion.tracks.find(t => t.id === trackId);
                  return (
                    <li key={trackId}>{track?.title}</li>
                  );
                })}
              </ul>
            </div>
          )}
          {/* 答えが見られた場合の全楽曲表示 */}
          {currentQuestion.isAnswerRevealed && (
            <div className={styles.revealedAnswers}>
              <h3>この問題の楽曲一覧:</h3>
              <ul>
                {currentQuestion.tracks.map((track) => (
                  <li key={track.id}>{track.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.controls}>
          {!currentQuestion.isAnswerRevealed && (
            <Button variant="secondary" onClick={handleShowAnswer}>
              答えを見る
            </Button>
          )}

          <Button variant="primary" onClick={handleNextQuestion} disabled={!canProceedToNext}>
            {progress.isLastQuestion ? 'クイズ終了' : '次の問題へ'}
          </Button>
        </div>
      </main>

      <AnswerModal
        isOpen={answerModalState.isOpen}
        onClose={handleCloseAnswerModal}
        albums={availableAlbums}
        onTrackSelect={handleTrackSelect}
        trackNumber={answerModalState.trackNumber}
      />
    </div>
  );
};
