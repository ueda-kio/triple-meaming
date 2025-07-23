import { useCallback, useEffect, useRef, useState } from 'react';
import { createPlayerElement, debugYouTubeAPIStatus, extractYouTubeVideoId, loadYouTubeAPIWithRetry } from '@/lib/youtube-utils';
import type { YouTubePlayerState } from '@/types';

interface UseYouTubePlayerReturn extends YouTubePlayerState {
  playTrack: (youtubeUrl: string, startTime: number, duration: number) => void;
  stopTrack: () => void;
  preloadVideo: (youtubeUrl: string) => void;
}

export const useYouTubePlayer = (playerId: string = 'youtube-player'): UseYouTubePlayerReturn => {
  // Player インスタンス
  const playerRef = useRef<YT.Player | null>(null);

  // 状態管理
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // プリロード管理
  const preloadedVideoRef = useRef<string | null>(null);
  const currentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Player 初期化
  useEffect(() => {
    const initPlayer = async () => {
      try {
        console.log('=== Initializing YouTube Player ===', {
          playerId,
          timestamp: new Date().toISOString()
        });
        
        // API状態をデバッグ出力
        debugYouTubeAPIStatus();
        
        await loadYouTubeAPIWithRetry();
        console.log('=== YouTube API loaded successfully ===', playerId);

        // プレイヤー用の要素を作成
        const playerElement = createPlayerElement(playerId);
        console.log('Player element created:', {
          playerId,
          element: playerElement,
          inDOM: document.body.contains(playerElement)
        });

        // 少し待ってからプレイヤーを初期化
        console.log('Waiting before player initialization...', playerId);
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('Creating YT.Player instance...', {
          playerId,
          YT: !!window.YT,
          Player: !!(window.YT && window.YT.Player)
        });

        const player = new window.YT!.Player(playerId, {
          height: '315',
          width: '560',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              console.log('=== YouTube Player Ready ===', {
                playerId,
                event,
                player,
                timestamp: new Date().toISOString()
              });
              playerRef.current = player;
              setIsPlayerReady(true);
            },
            onStateChange: (event) => {
              console.log('=== Player State Change ===', {
                playerId,
                state: event.data,
                stateName: getStateName(event.data),
                timestamp: new Date().toISOString()
              });
              const state = event.data;

              // 再生状態の管理
              setIsPlaying(state === window.YT!.PlayerState.PLAYING);

              // 動画読み込み状態の管理
              if (
                state === window.YT!.PlayerState.CUED ||
                state === window.YT!.PlayerState.PAUSED ||
                state === window.YT!.PlayerState.PLAYING
              ) {
                setIsVideoLoaded(true);
              }
            },
            onError: (event) => {
              console.error('=== YouTube Player Error ===', {
                playerId,
                error: event.data,
                timestamp: new Date().toISOString()
              });
              setIsVideoLoaded(false);
            },
          },
        });
        
        console.log('YT.Player instance created:', {
          playerId,
          player,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('=== YouTube Player initialization failed ===', {
          playerId,
          error,
          timestamp: new Date().toISOString()
        });
      }
    };

    initPlayer();

    // クリーンアップ
    return () => {
      console.log('=== Cleaning up YouTube Player ===', playerId);
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Player destroy error:', error);
        }
      }
    };
  }, [playerId]);

  // ヘルパー関数：状態名を取得
  const getStateName = (state: number): string => {
    if (!window.YT) return 'UNKNOWN';
    
    const states = {
      [window.YT.PlayerState.UNSTARTED]: 'UNSTARTED',
      [window.YT.PlayerState.ENDED]: 'ENDED', 
      [window.YT.PlayerState.PLAYING]: 'PLAYING',
      [window.YT.PlayerState.PAUSED]: 'PAUSED',
      [window.YT.PlayerState.BUFFERING]: 'BUFFERING',
      [window.YT.PlayerState.CUED]: 'CUED'
    };
    
    return states[state] || `UNKNOWN(${state})`;
  };

  // プリロード機能
  const preloadVideo = useCallback(
    (youtubeUrl: string) => {
      if (!playerRef.current || !isPlayerReady) return;

      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId || preloadedVideoRef.current === videoId) {
        return; // 重複プリロードを防止
      }

      try {
        // cueVideoById で動画を事前読み込み（再生は開始しない）
        playerRef.current.cueVideoById({
          videoId,
          startSeconds: 0,
        });

        preloadedVideoRef.current = videoId;
        setIsVideoLoaded(false); // ロード開始のため一旦false
        setCurrentVideoId(videoId);
      } catch (error) {
        console.error('Video preload failed:', error);
      }
    },
    [isPlayerReady],
  );

  // 再生機能（プリロード対応）
  const playTrack = useCallback(
    (youtubeUrl: string, startTime: number, duration: number) => {
      if (!playerRef.current || !isPlayerReady) return;

      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) return;

      // 現在の再生タイマーをクリア
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
      }

      try {
        // プリロード済み動画の場合：即座に再生
        if (preloadedVideoRef.current === videoId && isVideoLoaded) {
          playerRef.current.seekTo(startTime, true);
          playerRef.current.playVideo();
        } else {
          // 未プリロード動画：従来通りの読み込み
          playerRef.current.loadVideoById({
            videoId,
            startSeconds: startTime,
          });
        }

        setCurrentVideoId(videoId);

        // 指定時間後に自動停止
        currentTimeoutRef.current = setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
          }
        }, duration * 1000);
      } catch (error) {
        console.error('Video playback failed:', error);
      }
    },
    [isPlayerReady, isVideoLoaded],
  );

  // 停止機能
  const stopTrack = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }

    if (currentTimeoutRef.current) {
      clearTimeout(currentTimeoutRef.current);
      currentTimeoutRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  return {
    isPlayerReady,
    isPlaying,
    isVideoLoaded,
    currentVideoId,
    playTrack,
    stopTrack,
    preloadVideo,
  };
};
