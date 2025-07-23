import '@testing-library/jest-dom';

// YouTube Player API のモック
Object.defineProperty(window, 'YT', {
  value: {
    Player: jest.fn().mockImplementation(() => ({
      loadVideoById: jest.fn(),
      cueVideoById: jest.fn(),
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      addEventListener: jest.fn(),
    })),
    PlayerState: {
      UNSTARTED: -1,
      ENDED: 0,
      PLAYING: 1,
      PAUSED: 2,
      BUFFERING: 3,
      CUED: 5,
    },
  },
  writable: true,
});

// YouTube IFrame API Ready関数のモック
Object.defineProperty(window, 'onYouTubeIframeAPIReady', {
  value: jest.fn(),
  writable: true,
});
