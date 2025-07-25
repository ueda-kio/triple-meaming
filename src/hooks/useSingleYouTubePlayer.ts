/// <reference path="../types/youtube.d.ts" />
import { useCallback, useState } from 'react';
import type { Track } from '@/types';
import { useYouTubePlayer } from './useYouTubePlayer';

interface UseSingleYouTubePlayerReturn {
  isPlaying: boolean;
  isPlayerReady: boolean;
  playTrack: (track: Track, startTime: number, duration?: number) => void;
  stopTrack: () => void;
}

export const useSingleYouTubePlayer = (playerId: string = 'single-youtube-player'): UseSingleYouTubePlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useYouTubePlayer(playerId);

  const playTrack = useCallback(
    (track: Track, startTime: number, duration: number = 5) => {
      if (!player.isPlayerReady) {
        console.warn('Player is not ready yet');
        return;
      }

      try {
        player.playTrack(track.youtubeUrl, startTime, duration);
        setIsPlaying(true);

        // 指定時間後に自動停止
        setTimeout(() => {
          setIsPlaying(false);
        }, duration * 1000);
      } catch (error) {
        console.error('Failed to play track:', error);
      }
    },
    [player],
  );

  const stopTrack = useCallback(() => {
    player.stopTrack();
    setIsPlaying(false);
  }, [player]);

  return {
    isPlaying,
    isPlayerReady: player.isPlayerReady,
    playTrack,
    stopTrack,
  };
};