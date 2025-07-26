import { useState } from 'react';
import Image from 'next/image';
import { Button, Modal } from '@/components/common';
import type { Album, Track } from '@/types';
import styles from './AnswerModal.module.css';

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  albums: Album[];
  onTrackSelect: (track: Track, setFeedback: (feedback: FeedbackState) => void, shouldClose?: boolean) => void;
  trackNumber: number; // 1, 2, 3のいずれか
}

interface FeedbackState {
  type: 'correct' | 'incorrect' | 'already-answered' | null;
  message: string;
}

export const AnswerModal: React.FC<AnswerModalProps> = ({ isOpen, onClose, albums, onTrackSelect }) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' });

  const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);

  const handleAlbumSelect = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setSelectedTrack(null); // アルバム変更時にトラック選択をリセット
  };

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
  };

  const handleConfirm = () => {
    if (selectedTrack) {
      // フィードバックをリセット
      setFeedback({ type: null, message: '' });

      // トラック選択を実行（問題4,5対応のため、フィードバック処理をこちらで行う）
      onTrackSelect(selectedTrack, setFeedback);

      // 選択をクリア（問題5対応: モーダルを閉じずに次の回答を可能にする）
      setSelectedTrack(null);
    }
  };

  const handleClose = () => {
    setSelectedAlbumId(null);
    setSelectedTrack(null);
    setFeedback({ type: null, message: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="楽曲を選択してください">
      <div className={styles.content}>
        <div className={styles.twoPane}>
          {/* 左ペイン: アルバムリスト */}
          <div className={styles.leftPane}>
            <h3 className={styles.paneTitle}>アルバム</h3>
            <div className={styles.albumList}>
              {albums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  className={`${styles.albumItem} ${selectedAlbumId === album.id ? styles.selected : ''}`}
                  onClick={() => handleAlbumSelect(album.id)}
                >
                  <Image
                    src={album.jacketUrl}
                    alt={`${album.name}のジャケット`}
                    className={styles.albumJacket}
                    width={80}
                    height={80}
                    priority={false}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-album.svg';
                    }}
                  />
                  <div className={styles.albumInfo}>
                    <span className={styles.albumName}>{album.name}</span>
                    <span className={styles.trackCount}>{album.tracks.length}曲</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 右ペイン: 楽曲リスト */}
          <div className={styles.rightPane}>
            <h3 className={styles.paneTitle}>楽曲</h3>
            {selectedAlbum ? (
              <div className={styles.trackList}>
                {selectedAlbum.tracks.map((track, index) => (
                  <button
                    key={track.id}
                    type="button"
                    className={`${styles.trackItem} ${selectedTrack?.id === track.id ? styles.selected : ''}`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    <span className={styles.trackNumber}>{index + 1}</span>
                    <span className={styles.trackTitle}>{track.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.noSelection}>
                <p>左側からアルバムを選択してください</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          {/* フィードバック表示エリア */}
          {feedback.type && <div className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.message}</div>}

          <div className={styles.footerContent}>
            {selectedTrack && (
              <div className={styles.selectedInfo}>
                <strong>選択中:</strong> {selectedTrack.title}
              </div>
            )}

            <div className={styles.footerButtons}>
              <Button variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
              <Button variant="primary" onClick={handleConfirm} disabled={!selectedTrack}>
                決定
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
