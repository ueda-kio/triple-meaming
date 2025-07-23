'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/common';
import { useMultipleYouTubePlayers } from '@/hooks';
import {
  calculateProgress,
  generateQuizQuestions,
  getRandomStartTime,
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

    const startTime = getRandomStartTime(currentQuestion.tracks[0], 30);
    playTracks(currentQuestion.tracks, startTime, 30);
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

  // 楽曲選択処理
  const handleTrackSelect = useCallback(
    (selectedTrack: Track) => {
      if (!currentQuestion) return;

      const trackNumber = answerModalState.trackNumber;
      const correctTrack = currentQuestion.tracks[trackNumber - 1];
      const isCorrect = selectedTrack.id === correctTrack.id;

      // 正解の場合、correctAnswersに追加
      if (isCorrect) {
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
          ...currentQuestion,
          correctAnswers: [...currentQuestion.correctAnswers, correctTrack.id],
        };
        setQuestions(updatedQuestions);
      }

      // アラートで正解・不正解を表示
      if (isCorrect) {
        alert(`正解！\n${correctTrack.title}`);
      } else {
        alert(`不正解...\n正解: ${correctTrack.title}\nあなたの回答: ${selectedTrack.title}`);
      }
    },
    [currentQuestion, questions, currentQuestionIndex, answerModalState.trackNumber],
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
          <h2>楽曲を選択してください</h2>
          <div className={styles.trackButtons}>
            {[1, 2, 3].map((trackNumber) => {
              const isAnswered = currentQuestion.correctAnswers.includes(
                currentQuestion.tracks[trackNumber - 1].id,
              );
              const isRevealed = currentQuestion.isAnswerRevealed;

              return (
                <div key={trackNumber} className={styles.trackButton}>
                  <Button
                    variant={isAnswered ? 'primary' : 'outline'}
                    size="large"
                    onClick={() => handleOpenAnswerModal(trackNumber)}
                    disabled={isAnswered || isRevealed}
                  >
                    Track {trackNumber}
                    {isAnswered && ' ✓'}
                    {isRevealed && !isAnswered && (
                      <span className={styles.revealedAnswer}>
                        <br />
                        {currentQuestion.tracks[trackNumber - 1].title}
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
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
