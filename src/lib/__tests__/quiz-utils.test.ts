import type { Artist, QuizQuestion, Track } from '@/types';
import {
  calculateFinalScore,
  calculateMidpointStartTime,
  calculateProgress,
  calculateStartTime,
  generateQuizQuestions,
  getRandomItems,
  getTracksFromSelectedAlbums,
} from '../quiz-utils';

// Mock Math.random for predictable testing
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateMidpointStartTime', () => {
    it('楽曲が再生時間より短い場合は0を返す', () => {
      const result = calculateMidpointStartTime(3, 5);
      expect(result).toBe(0);
    });

    it('楽曲が再生時間と同じ場合は0を返す', () => {
      const result = calculateMidpointStartTime(5, 5);
      expect(result).toBe(0);
    });

    it('中間地点付近の時間を正しく計算する（62秒の楽曲）', () => {
      // Math.random() = 0.5 をモック（範囲の中央値を返す）
      (Math.random as jest.Mock).mockReturnValue(0.5);

      const totalDuration = 62;
      const playDuration = 5;
      const result = calculateMidpointStartTime(totalDuration, playDuration);

      // 中間地点: 31秒
      // 25%の範囲: 15.5秒 → 15秒
      // 最小: max(0, 31-15) = 16秒
      // 最大: min(62-5, 31+15) = min(57, 46) = 46秒
      // 範囲: 16-46秒, 0.5の場合 → 16 + (46-16) * 0.5 = 31秒
      expect(result).toBe(31);
    });

    it('中間地点付近の時間を正しく計算する（228秒の楽曲）', () => {
      // Math.random() = 0.0 をモック（範囲の最小値を返す）
      (Math.random as jest.Mock).mockReturnValue(0.0);

      const totalDuration = 228;
      const playDuration = 5;
      const result = calculateMidpointStartTime(totalDuration, playDuration);

      // 中間地点: 114秒
      // 25%の範囲: 57秒
      // 最小: max(0, 114-57) = 57秒
      // 最大: min(228-5, 114+57) = min(223, 171) = 171秒
      // 範囲: 57-171秒, 0.0の場合 → 57秒
      expect(result).toBe(57);
    });

    it('短い楽曲（39秒）で適切に調整される', () => {
      // Math.random() = 1.0 をモック（範囲の最大値を返す）
      (Math.random as jest.Mock).mockReturnValue(0.99999); // 実質1.0

      const totalDuration = 39;
      const playDuration = 5;
      const result = calculateMidpointStartTime(totalDuration, playDuration);

      // 中間地点: 19秒
      // 25%の範囲: 9秒
      // 最小: max(0, 19-9) = 10秒
      // 最大: min(39-5, 19+9) = min(34, 28) = 28秒
      // 範囲: 10-28秒, 0.99999の場合 → 28秒
      expect(result).toBe(28);
    });

    it('範囲が無効になる場合は最大開始時間を返す', () => {
      const totalDuration = 8; // 非常に短い楽曲
      const playDuration = 5;
      const result = calculateMidpointStartTime(totalDuration, playDuration);

      // 総時間8秒、再生時間5秒の場合、最大開始時間は3秒
      expect(result).toBe(3);
    });
  });

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
      const testTracksWithDuration: Track[] = [
        { id: 'track001', title: 'トラック1', youtubeUrl: 'https://youtube.com/1', duration: 120 },
        { id: 'track002', title: 'トラック2', youtubeUrl: 'https://youtube.com/2', duration: 180 },
        { id: 'track003', title: 'トラック3', youtubeUrl: 'https://youtube.com/3' }, // duration未定義
        { id: 'track004', title: 'トラック4', youtubeUrl: 'https://youtube.com/4', duration: 62 },
        { id: 'track005', title: 'トラック5', youtubeUrl: 'https://youtube.com/5', duration: 228 },
      ];

      const result = generateQuizQuestions(testTracksWithDuration, 2);
      result.forEach((question) => {
        expect(question.startTimes).toHaveLength(3);
        question.startTimes.forEach((startTime) => {
          expect(typeof startTime).toBe('number');
          expect(startTime).toBeGreaterThanOrEqual(0);
          // 最大値は楽曲によって異なるが、少なくとも有効な数値であることを確認
          expect(startTime).toBeLessThan(300); // 十分大きい値で上限チェック
        });
      });
    });
  });

  describe('calculateStartTime', () => {
    it('durationが指定されている楽曲は中間地点計算を使用する', () => {
      (Math.random as jest.Mock).mockReturnValue(0.5);

      const trackWithDuration: Track = {
        id: 'test1',
        title: 'Test Track',
        youtubeUrl: 'https://youtube.com/watch?v=test',
        duration: 120,
      };

      const result = calculateStartTime(trackWithDuration, 5);

      // duration=120の場合の中間地点計算結果
      // 中間地点: 60秒, 25%範囲: 30秒
      // 最小: 30秒, 最大: min(115, 90) = 90秒
      // 0.5の場合 → 30 + (90-30) * 0.5 = 60秒
      expect(result).toBe(60);
    });

    it('durationが0の楽曲はデフォルトロジックを使用する', () => {
      (Math.random as jest.Mock).mockReturnValue(0.5);

      const trackWithoutDuration: Track = {
        id: 'test2',
        title: 'Test Track',
        youtubeUrl: 'https://youtube.com/watch?v=test',
        duration: 0,
      };

      const result = calculateStartTime(trackWithoutDuration, 5);

      // デフォルトロジック: 90-150秒（min(150, 180-5) = 150）の範囲
      // defaultMin = 90, defaultMax = 150, adjustedMax = min(150, 175) = 150
      // Math.floor(0.5 * (150 - 90 + 1)) + 90 = Math.floor(0.5 * 61) + 90 = 30 + 90 = 120秒
      expect(result).toBe(120);
    });

    it('durationが未定義の楽曲はデフォルトロジックを使用する', () => {
      (Math.random as jest.Mock).mockReturnValue(0.0);

      const trackWithoutDuration: Track = {
        id: 'test3',
        title: 'Test Track',
        youtubeUrl: 'https://youtube.com/watch?v=test',
      };

      const result = calculateStartTime(trackWithoutDuration, 5);

      // デフォルトロジック: 90-150秒の範囲、0.0の場合 → 90秒
      expect(result).toBe(90);
    });

    it('実際のsongs.jsonの楽曲でテスト（62秒）', () => {
      (Math.random as jest.Mock).mockReturnValue(0.5);

      const track: Track = {
        id: 'track009',
        title: 'オープニング',
        youtubeUrl: 'https://www.youtube.com/watch?v=OdgMJUmxVWA',
        duration: 62,
      };

      const result = calculateStartTime(track, 5);

      // 中間地点計算: 62秒の楽曲で5秒再生
      // 中間地点: 31秒, 25%範囲: 15秒
      // 最小: 16秒, 最大: 46秒
      // 0.5の場合 → 31秒
      expect(result).toBe(31);
    });

    it('実際のsongs.jsonの楽曲でテスト（228秒）', () => {
      (Math.random as jest.Mock).mockReturnValue(0.25);

      const track: Track = {
        id: 'track087',
        title: 'WILL',
        youtubeUrl: 'https://www.youtube.com/watch?v=JvN6ZUJfKNY',
        duration: 228,
      };

      const result = calculateStartTime(track, 5);

      // 中間地点計算: 228秒の楽曲で5秒再生
      // 中間地点: 114秒, 25%範囲: 57秒
      // 最小: 57秒, 最大: 171秒
      // 0.25の場合 → 57 + (171-57) * 0.25 = 85.5 → 85秒
      expect(result).toBe(85);
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
