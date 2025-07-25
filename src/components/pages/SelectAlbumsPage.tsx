'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlbumSelectModal } from '@/components/albums/AlbumSelectModal';
import { Button } from '@/components/common';
import { createAlbumsQueryParam, fetchSongsData, getSelectedAlbumIds } from '@/lib/songs-api';
import type { SongsData } from '@/types';
import styles from './SelectAlbumsPage.module.css';

export const SelectAlbumsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [songsData, setSongsData] = useState<SongsData | null>(null);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データの初期読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSongsData();
        setSongsData(data);

        // URLパラメータから選択済みアルバムを復元
        const urlAlbumIds = getSelectedAlbumIds(searchParams);
        
        // URLクエリがない場合はすべてのアルバムを選択状態にする
        if (urlAlbumIds.length === 0) {
          const allAlbumIds = data.artists.flatMap(artist => 
            artist.albums.map(album => album.id)
          );
          setSelectedAlbumIds(allAlbumIds);
        } else {
          setSelectedAlbumIds(urlAlbumIds);
        }

        setError(null);
      } catch (err) {
        setError('楽曲データの読み込みに失敗しました');
        console.error('Failed to load songs data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleAlbumSelection = (albumIds: string[]) => {
    setSelectedAlbumIds(albumIds);

    // URLを更新（すべてのアルバムが選択されている場合はクエリ不要）
    if (songsData) {
      const allAlbumIds = songsData.artists.flatMap(artist => 
        artist.albums.map(album => album.id)
      );
      const queryParam = createAlbumsQueryParam(albumIds, allAlbumIds);
      const newUrl = queryParam ? `/?${queryParam}` : '/';
      router.replace(newUrl);
    }
  };

  const handleStartQuiz = () => {
    if (selectedAlbumIds.length === 0) {
      alert('出題範囲を選択してください');
      return;
    }

    // すべてのアルバムが選択されている場合はクエリ不要
    if (songsData) {
      const allAlbumIds = songsData.artists.flatMap(artist => 
        artist.albums.map(album => album.id)
      );
      const queryParam = createAlbumsQueryParam(selectedAlbumIds, allAlbumIds);
      const quizUrl = queryParam ? `/quiz?${queryParam}` : '/quiz';
      router.push(quizUrl);
    }
  };

  const getSelectedAlbumsInfo = () => {
    if (!songsData || selectedAlbumIds.length === 0) {
      return { albumCount: 0, trackCount: 0 };
    }

    const selectedAlbums = songsData.artists.flatMap((artist) =>
      artist.albums.filter((album) => selectedAlbumIds.includes(album.id)),
    );

    return {
      albumCount: selectedAlbums.length,
      trackCount: selectedAlbums.reduce((sum, album) => sum + album.tracks.length, 0),
    };
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>楽曲データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !songsData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>エラーが発生しました</h2>
          <p>{error || '楽曲データの読み込みに失敗しました'}</p>
          <Button onClick={() => window.location.reload()}>再読み込み</Button>
        </div>
      </div>
    );
  }

  const { albumCount, trackCount } = getSelectedAlbumsInfo();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Triple Meaning</h1>
        <p className={styles.subtitle}>3つの楽曲を同時に再生して、楽曲名を当てる音楽クイズ</p>
      </header>

      <main className={styles.main}>
        <div className={styles.selectionCard}>
          <h2 className={styles.cardTitle}>出題範囲の設定</h2>

          {selectedAlbumIds.length > 0 ? (
            <div className={styles.selectionSummary}>
              <div className={styles.summaryStats}>
                <span className={styles.stat}>
                  <strong>{albumCount}</strong> アルバム
                </span>
                <span className={styles.stat}>
                  <strong>{trackCount}</strong> 楽曲
                </span>
              </div>
              <p className={styles.summaryText}>から出題されます</p>
            </div>
          ) : (
            <div className={styles.noSelection}>
              <p>出題範囲が選択されていません</p>
              <p className={styles.hint}>「範囲を選択」ボタンからアルバムを選んでください</p>
            </div>
          )}

          <div className={styles.cardActions}>
            <Button variant="outline" size="large" onClick={() => setIsModalOpen(true)}>
              範囲を選択
            </Button>
          </div>
        </div>

        <div className={styles.startSection}>
          <Button
            variant="primary"
            size="large"
            onClick={handleStartQuiz}
            disabled={selectedAlbumIds.length === 0}
          >
            クイズを始める
          </Button>
        </div>
      </main>

      <AlbumSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artists={songsData.artists}
        selectedAlbumIds={selectedAlbumIds}
        onSelectionChange={handleAlbumSelection}
      />
    </div>
  );
};
