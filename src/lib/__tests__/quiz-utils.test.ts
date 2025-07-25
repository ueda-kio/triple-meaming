import type { Artist, QuizQuestion, Track } from '@/types';
import {
  calculateFinalScore,
  calculateProgress,
  calculateStartTime,
  generateQuizQuestions,
  getRandomItems,
  getTracksFromSelectedAlbums,
} from '../quiz-utils';

// テスト用のモックデータ
const mockArtists: Artist[] = [
  {
    id: 'artist001',
    name: 'テストアーティスト1',
    albums: [
      {
        id: 'album001',
        name: 'テストアルバム1',
        jacketUrl: '/test1.jpg',
        tracks: [
          { id: 'track001', title: 'トラック1', youtubeUrl: 'https://youtube.com/1' },
          { id: 'track002', title: 'トラック2', youtubeUrl: 'https://youtube.com/2' },
          { id: 'track003', title: 'トラック3', youtubeUrl: 'https://youtube.com/3' },
        ],
      },
      {
        id: 'album002',
        name: 'テストアルバム2',
        jacketUrl: '/test2.jpg',
        tracks: [
          { id: 'track004', title: 'トラック4', youtubeUrl: 'https://youtube.com/4' },
          { id: 'track005', title: 'トラック5', youtubeUrl: 'https://youtube.com/5' },
        ],
      },
    ],
  },
];

describe('quiz-utils', () => {
  describe('getTracksFromSelectedAlbums', () => {
    it('選択されたアルバムから楽曲を正しく取得できること', () => {
      const result = getTracksFromSelectedAlbums(mockArtists, ['album001']);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('track001');
      expect(result[1].id).toBe('track002');
      expect(result[2].id).toBe('track003');
    });

    it('複数のアルバムから楽曲を取得できること', () => {
      const result = getTracksFromSelectedAlbums(mockArtists, ['album001', 'album002']);
      expect(result).toHaveLength(5);
    });

    it('存在しないアルバムIDの場合空配列を返すこと', () => {
      const result = getTracksFromSelectedAlbums(mockArtists, ['nonexistent']);
      expect(result).toHaveLength(0);
    });
  });

  describe('getRandomItems', () => {
    it('指定した数の要素をランダムに取得できること', () => {
      const items = [1, 2, 3, 4, 5];
      const result = getRandomItems(items, 3);
      expect(result).toHaveLength(3);
      expect(result.every((item) => items.includes(item))).toBe(true);
    });

    it('配列より多い数を指定した場合全要素を返すこと', () => {
      const items = [1, 2, 3];
      const result = getRandomItems(items, 5);
      expect(result).toHaveLength(3);
    });
  });

  describe('generateQuizQuestions', () => {
    const mockTracks: Track[] = [
      { id: 'track001', title: 'トラック1', youtubeUrl: 'https://youtube.com/1' },
      { id: 'track002', title: 'トラック2', youtubeUrl: 'https://youtube.com/2' },
      { id: 'track003', title: 'トラック3', youtubeUrl: 'https://youtube.com/3' },
      { id: 'track004', title: 'トラック4', youtubeUrl: 'https://youtube.com/4' },
      { id: 'track005', title: 'トラック5', youtubeUrl: 'https://youtube.com/5' },
    ];

    it('指定した数の問題を生成できること', () => {
      const result = generateQuizQuestions(mockTracks, 3);
      expect(result).toHaveLength(3);
    });

    it('各問題が3曲を持っていること', () => {
      const result = generateQuizQuestions(mockTracks, 2);
      result.forEach((question) => {
        expect(question.tracks).toHaveLength(3);
      });
    });

    it('楽曲が3曲未満の場合エラーを投げること', () => {
      const insufficientTracks = mockTracks.slice(0, 2);
      expect(() => generateQuizQuestions(insufficientTracks, 1)).toThrow(
        '楽曲が3曲未満のためクイズを生成できません',
      );
    });

    it('問題番号が正しく設定されること', () => {
      const result = generateQuizQuestions(mockTracks, 3);
      expect(result[0].questionNumber).toBe(1);
      expect(result[1].questionNumber).toBe(2);
      expect(result[2].questionNumber).toBe(3);
    });

    it('初期状態で正解数が0であること', () => {
      const result = generateQuizQuestions(mockTracks, 1);
      expect(result[0].correctAnswers).toHaveLength(0);
      expect(result[0].isAnswerRevealed).toBe(false);
    });

    it('各問題に各楽曲の開始時間が設定されること', () => {
      const result = generateQuizQuestions(mockTracks, 2);
      result.forEach((question) => {
        expect(question.startTimes).toHaveLength(3);
        question.startTimes.forEach((startTime) => {
          expect(typeof startTime).toBe('number');
          expect(startTime).toBeGreaterThanOrEqual(90);
          expect(startTime).toBeLessThanOrEqual(175);
        });
      });
    });
  });

  describe('calculateStartTime', () => {
    it('durationが180秒以上の場合40-60%の範囲で開始時間を返すこと', () => {
      const track: Track = {
        id: 'track001',
        title: 'テストトラック',
        youtubeUrl: 'https://youtube.com/1',
        duration: 200, // 200秒
      };

      const result = calculateStartTime(track, 5);
      const min = Math.floor(200 * 0.4); // 80秒
      const max = Math.min(Math.floor(200 * 0.6), 200 - 5); // min(120, 195) = 120秒
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });

    it('durationが180秒未満の場合はデフォルト範囲で開始時間を返すこと', () => {
      const track: Track = {
        id: 'track001',
        title: 'テストトラック',
        youtubeUrl: 'https://youtube.com/1',
        duration: 120, // 120秒（180秒未満）
      };

      const result = calculateStartTime(track, 5);
      // durationが180秒未満の場合はデフォルト範囲になる
      expect(result).toBeGreaterThanOrEqual(90);
      expect(result).toBeLessThanOrEqual(175); // min(150, 180-5)
    });

    it('durationが指定されていない場合90-150秒の範囲で開始時間を返すこと', () => {
      const track: Track = {
        id: 'track001',
        title: 'テストトラック',
        youtubeUrl: 'https://youtube.com/1',
      };

      const result = calculateStartTime(track, 5);
      expect(result).toBeGreaterThanOrEqual(90);
      expect(result).toBeLessThanOrEqual(175); // min(150, 180-5)
    });

    it('playDurationが考慮されること', () => {
      const track: Track = {
        id: 'track001',
        title: 'テストトラック',
        youtubeUrl: 'https://youtube.com/1',
        duration: 300, // 300秒（180秒以上）
      };

      const result = calculateStartTime(track, 30);
      const min = Math.floor(300 * 0.4); // 120秒
      const max = Math.min(Math.floor(300 * 0.6), 300 - 30); // min(180, 270) = 180秒
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('calculateProgress', () => {
    const mockQuestions: QuizQuestion[] = [
      {
        questionNumber: 1,
        tracks: [{} as Track, {} as Track, {} as Track] as [Track, Track, Track],
        startTimes: [90, 95, 100] as [number, number, number],
        correctAnswers: [],
        isAnswerRevealed: false,
      },
      {
        questionNumber: 2,
        tracks: [{} as Track, {} as Track, {} as Track] as [Track, Track, Track],
        startTimes: [110, 115, 120] as [number, number, number],
        correctAnswers: [],
        isAnswerRevealed: false,
      },
      {
        questionNumber: 3,
        tracks: [{} as Track, {} as Track, {} as Track] as [Track, Track, Track],
        startTimes: [130, 135, 140] as [number, number, number],
        correctAnswers: [],
        isAnswerRevealed: false,
      },
    ];

    it('進行状況を正しく計算できること', () => {
      const result = calculateProgress(mockQuestions, 1);
      expect(result.totalQuestions).toBe(3);
      expect(result.completedQuestions).toBe(1);
      expect(result.currentQuestion).toBe(2);
      expect(result.progressPercentage).toBe(33);
      expect(result.isLastQuestion).toBe(false);
    });

    it('最後の問題であることを正しく判定できること', () => {
      const result = calculateProgress(mockQuestions, 2);
      expect(result.isLastQuestion).toBe(true);
    });
  });

  describe('calculateFinalScore', () => {
    const mockQuestionsWithAnswers: QuizQuestion[] = [
      {
        questionNumber: 1,
        tracks: [{} as Track, {} as Track, {} as Track] as [Track, Track, Track],
        startTimes: [90, 95, 100] as [number, number, number],
        correctAnswers: ['track001', 'track002'], // 2問正解
        isAnswerRevealed: false,
      },
      {
        questionNumber: 2,
        tracks: [{} as Track, {} as Track, {} as Track] as [Track, Track, Track],
        startTimes: [110, 115, 120] as [number, number, number],
        correctAnswers: ['track003', 'track004', 'track005'], // 3問正解
        isAnswerRevealed: false,
      },
      {
        questionNumber: 3,
        tracks: [{} as Track, {} as Track, {} as Track] as [Track, Track, Track],
        startTimes: [130, 135, 140] as [number, number, number],
        correctAnswers: [], // 0問正解
        isAnswerRevealed: true,
      },
    ];

    it('最終スコアを正しく計算できること', () => {
      const result = calculateFinalScore(mockQuestionsWithAnswers);
      expect(result.totalCorrect).toBe(5);
      expect(result.totalPossible).toBe(9);
      expect(result.percentage).toBe(56);
      expect(result.perfectQuestions).toBe(1);
    });

    it('全問正解の場合100%になること', () => {
      const perfectQuestions: QuizQuestion[] = [
        {
          questionNumber: 1,
          tracks: [{} as Track, {} as Track, {} as Track] as [Track, Track, Track],
          startTimes: [90, 95, 100] as [number, number, number],
          correctAnswers: ['track001', 'track002', 'track003'],
          isAnswerRevealed: false,
        },
      ];

      const result = calculateFinalScore(perfectQuestions);
      expect(result.percentage).toBe(100);
      expect(result.perfectQuestions).toBe(1);
    });
  });
});
