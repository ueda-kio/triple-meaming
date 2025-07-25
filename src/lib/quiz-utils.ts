import type { Artist, QuizQuestion, Track } from '@/types';

/**
 * 指定されたアルバムIDから楽曲を取得する
 * @param artists アーティストデータ
 * @param selectedAlbumIds 選択されたアルバムID
 * @returns 楽曲の配列
 */
export const getTracksFromSelectedAlbums = (
  artists: Artist[],
  selectedAlbumIds: string[],
): Track[] => {
  const tracks: Track[] = [];

  for (const artist of artists) {
    for (const album of artist.albums) {
      if (selectedAlbumIds.includes(album.id)) {
        tracks.push(...album.tracks);
      }
    }
  }

  return tracks;
};

/**
 * 配列からランダムに指定した数の要素を取得する
 * @param array 元の配列
 * @param count 取得する数
 * @returns ランダムに選ばれた要素の配列
 */
export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * クイズの問題セットを生成する
 * @param tracks 楽曲の配列
 * @param questionCount 問題数（デフォルト: 5）
 * @returns クイズ問題の配列
 */
export const generateQuizQuestions = (
  tracks: Track[],
  questionCount: number = 5,
): QuizQuestion[] => {
  if (tracks.length < 3) {
    throw new Error('楽曲が3曲未満のためクイズを生成できません');
  }

  const questions: QuizQuestion[] = [];
  const usedTrackIds = new Set<string>();

  for (let i = 0; i < questionCount; i++) {
    // 使用していない楽曲から3曲をランダム選択
    const availableTracks = tracks.filter((track) => !usedTrackIds.has(track.id));

    if (availableTracks.length < 3) {
      // 使用済み楽曲をリセットして再利用を可能にする
      usedTrackIds.clear();
      availableTracks.push(...tracks);
    }

    const selectedTracks = getRandomItems(availableTracks, 3) as [Track, Track, Track];

    // 使用済み楽曲としてマーク
    selectedTracks.forEach((track) => usedTrackIds.add(track.id));

    // 各楽曲の開始時間を事前決定
    const startTimes: [number, number, number] = [
      calculateStartTime(selectedTracks[0], 5),
      calculateStartTime(selectedTracks[1], 5),
      calculateStartTime(selectedTracks[2], 5),
    ];

    questions.push({
      questionNumber: i + 1,
      tracks: selectedTracks,
      startTimes,
      correctAnswers: [],
      isAnswerRevealed: false,
    });
  }

  return questions;
};

/**
 * 楽曲の開始時間を算出する（クイズ毎に異なる開始時間）
 * @param track 楽曲データ
 * @param playDuration 再生時間（秒）
 * @returns 開始時間（秒）
 */
export const calculateStartTime = (track: Track, playDuration: number = 5): number => {
  // 楽曲の長さが指定されている場合、40-60%の範囲からランダム選択
  // ただし、楽曲が十分な長さ（180秒以上）の場合のみ
  if (track.duration !== undefined && track.duration >= 180) {
    const min = Math.floor(track.duration * 0.4);
    const max = Math.floor(track.duration * 0.6);
    // 再生時間を考慮して最大開始時間を調整
    const adjustedMax = Math.min(max, track.duration - playDuration);
    if (adjustedMax > min) {
      return Math.floor(Math.random() * (adjustedMax - min + 1)) + min;
    }
  }

  // 原則: 90秒から150秒の間のランダムな時間（再生時間を考慮）
  const defaultMin = 90;
  const defaultMax = Math.min(150, 180 - playDuration); // 最大3分 - 再生時間
  return Math.floor(Math.random() * (defaultMax - defaultMin + 1)) + defaultMin;
};

/**
 * 問題の進行状況を計算する
 * @param questions 全問題
 * @param currentIndex 現在の問題インデックス
 * @returns 進行状況の情報
 */
export const calculateProgress = (questions: QuizQuestion[], currentIndex: number) => {
  const totalQuestions = questions.length;
  const completedQuestions = questions.slice(0, currentIndex).length;
  const currentQuestion = currentIndex + 1;
  const progressPercentage = Math.round((completedQuestions / totalQuestions) * 100);

  return {
    totalQuestions,
    completedQuestions,
    currentQuestion,
    progressPercentage,
    isLastQuestion: currentIndex === totalQuestions - 1,
  };
};

/**
 * 最終スコアを計算する
 * @param questions 全問題
 * @returns スコア情報
 */
export const calculateFinalScore = (questions: QuizQuestion[]) => {
  let totalCorrect = 0;
  let totalPossible = 0;

  questions.forEach((question) => {
    totalCorrect += question.correctAnswers.length;
    totalPossible += 3; // 各問題3曲
  });

  const percentage = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0;

  return {
    totalCorrect,
    totalPossible,
    percentage,
    perfectQuestions: questions.filter((q) => q.correctAnswers.length === 3).length,
  };
};
