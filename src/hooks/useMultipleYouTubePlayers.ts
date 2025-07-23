import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Track } from '@/types';
import { useYouTubePlayer } from './useYouTubePlayer';

interface MultiplePlayersState {
  isPlaying: boolean;
  readyPlayers: number;
  totalPlayers: number;
}

interface UseMultipleYouTubePlayersReturn extends MultiplePlayersState {
  playTracks: (tracks: [Track, Track, Track], startTime: number, duration: number) => void;
  stopTracks: () => void;
  preloadTracks: (tracks: [Track, Track, Track]) => void;
  isAllPlayersReady: boolean;
}

export const useMultipleYouTubePlayers = (): UseMultipleYouTubePlayersReturn => {
  const [isPlaying, setIsPlaying] = useState(false);

  // 3つのYouTubeプレイヤーを初期化
  const player1 = useYouTubePlayer('youtube-player-1');
  const player2 = useYouTubePlayer('youtube-player-2');
  const player3 = useYouTubePlayer('youtube-player-3');

  const players = useMemo(() => [player1, player2, player3], [player1, player2, player3]);

  // 準備完了済みプレイヤー数をカウント
  const readyPlayers = useMemo(() => {
    return players.filter((player) => player.isPlayerReady).length;
  }, [players]);

  // デバッグ用：プレイヤーの状態をログ出力
  useEffect(() => {
    console.log('Players ready status:', {
      player1: player1.isPlayerReady,
      player2: player2.isPlayerReady,
      player3: player3.isPlayerReady,
      total: `${readyPlayers}/${players.length}`,
    });
  }, [player1.isPlayerReady, player2.isPlayerReady, player3.isPlayerReady, readyPlayers, players.length]);

  const isAllPlayersReady = readyPlayers === 3;

  // 3曲同時再生
  const playTracks = useCallback(
    (tracks: [Track, Track, Track], startTime: number, duration: number) => {
      if (!isAllPlayersReady) {
        console.warn('All players are not ready yet');
        return;
      }

      try {
        // 3つのプレイヤーで同時に再生開始
        players.forEach((player, index) => {
          const track = tracks[index];
          if (track) {
            player.playTrack(track.youtubeUrl, startTime, duration);
          }
        });

        setIsPlaying(true);

        // 指定時間後に自動停止
        setTimeout(() => {
          setIsPlaying(false);
        }, duration * 1000);
      } catch (error) {
        console.error('Failed to play tracks:', error);
      }
    },
    [isAllPlayersReady, players],
  );

  // 3曲同時停止
  const stopTracks = useCallback(() => {
    players.forEach((player) => {
      player.stopTrack();
    });
    setIsPlaying(false);
  }, [players]);

  // 3曲同時プリロード
  const preloadTracks = useCallback(
    (tracks: [Track, Track, Track]) => {
      if (!isAllPlayersReady) return;

      tracks.forEach((track, index) => {
        const player = players[index];
        if (track && player) {
          player.preloadVideo(track.youtubeUrl);
        }
      });
    },
    [isAllPlayersReady, players],
  );

  return {
    isPlaying,
    readyPlayers,
    totalPlayers: 3,
    isAllPlayersReady,
    playTracks,
    stopTracks,
    preloadTracks,
  };
};
