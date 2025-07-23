import { useEffect } from 'react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

interface YouTubePlayerWrapperProps {
  playerId: string;
  youtubeUrl?: string;
  startTime?: number;
  duration?: number;
  shouldPlay?: boolean;
  shouldPreload?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onPlayerReady?: () => void;
}

export const YouTubePlayerWrapper: React.FC<YouTubePlayerWrapperProps> = ({
  playerId,
  youtubeUrl,
  startTime = 0,
  duration = 30,
  shouldPlay = false,
  shouldPreload = false,
  onPlayStart,
  onPlayEnd,
  onPlayerReady,
}) => {
  const { isPlayerReady, isPlaying, playTrack, stopTrack, preloadVideo } =
    useYouTubePlayer(playerId);

  // プレイヤー準備完了時のコールバック
  useEffect(() => {
    if (isPlayerReady && onPlayerReady) {
      onPlayerReady();
    }
  }, [isPlayerReady, onPlayerReady]);

  // プリロード処理
  useEffect(() => {
    if (shouldPreload && youtubeUrl && isPlayerReady) {
      preloadVideo(youtubeUrl);
    }
  }, [shouldPreload, youtubeUrl, isPlayerReady, preloadVideo]);

  // 再生制御
  useEffect(() => {
    if (!youtubeUrl || !isPlayerReady) return;

    if (shouldPlay && !isPlaying) {
      playTrack(youtubeUrl, startTime, duration);
      onPlayStart?.();
    } else if (!shouldPlay && isPlaying) {
      stopTrack();
      onPlayEnd?.();
    }
  }, [
    shouldPlay,
    youtubeUrl,
    startTime,
    duration,
    isPlayerReady,
    isPlaying,
    playTrack,
    stopTrack,
    onPlayStart,
    onPlayEnd,
  ]);

  // 再生終了時のコールバック
  useEffect(() => {
    if (!isPlaying && onPlayEnd) {
      // 再生が停止した時にコールバックを呼ぶ
      // ただし、初期状態やプレイヤー準備中は除外
      if (isPlayerReady && youtubeUrl) {
        onPlayEnd();
      }
    }
  }, [isPlaying, isPlayerReady, youtubeUrl, onPlayEnd]);

  // このコンポーネントは実際のDOM要素をレンダリングしない
  // YouTube Playerは非表示のdiv要素で動作する
  return null;
};
