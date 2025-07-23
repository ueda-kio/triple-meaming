// YouTube IFrame Player API の型定義
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementId: string,
        config: {
          height: string | number;
          width: string | number;
          videoId?: string;
          events?: {
            onReady?: (event: YT.PlayerEvent) => void;
            onStateChange?: (event: YT.OnStateChangeEvent) => void;
            onError?: (event: YT.OnErrorEvent) => void;
          };
          playerVars?: {
            autoplay?: 0 | 1;
            controls?: 0 | 1;
            disablekb?: 0 | 1;
            enablejsapi?: 0 | 1;
            fs?: 0 | 1;
            iv_load_policy?: 1 | 3;
            modestbranding?: 0 | 1;
            playsinline?: 0 | 1;
            rel?: 0 | 1;
            showinfo?: 0 | 1;
            start?: number;
            end?: number;
          };
        },
      ) => YT.Player;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
  }
}

declare namespace YT {
  interface Player {
    loadVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
    cueVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getPlayerState(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoUrl(): string;
    addEventListener(event: string, listener: (event: any) => void): void;
    removeEventListener(event: string, listener: (event: any) => void): void;
    destroy(): void;
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: number;
  }

  interface OnErrorEvent extends PlayerEvent {
    data: number;
  }
}

export {};
