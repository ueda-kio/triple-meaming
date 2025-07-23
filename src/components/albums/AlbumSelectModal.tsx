import { useEffect, useState } from 'react';
import { Button, Checkbox, Modal } from '@/components/common';
import type { Album, Artist } from '@/types';
import styles from './AlbumSelectModal.module.css';

interface AlbumSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: Artist[];
  selectedAlbumIds: string[];
  onSelectionChange: (albumIds: string[]) => void;
}

export const AlbumSelectModal: React.FC<AlbumSelectModalProps> = ({
  isOpen,
  onClose,
  artists,
  selectedAlbumIds,
  onSelectionChange,
}) => {
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedAlbumIds);

  // モーダルが開かれた時に現在の選択状態を反映
  useEffect(() => {
    if (isOpen) {
      setTempSelectedIds(selectedAlbumIds);
    }
  }, [isOpen, selectedAlbumIds]);

  const handleAlbumToggle = (albumId: string, checked: boolean) => {
    if (checked) {
      setTempSelectedIds((prev) => [...prev, albumId]);
    } else {
      setTempSelectedIds((prev) => prev.filter((id) => id !== albumId));
    }
  };

  const handleConfirm = () => {
    onSelectionChange(tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedAlbumIds); // 元の状態に戻す
    onClose();
  };

  const handleSelectAll = () => {
    const allAlbumIds = artists.flatMap((artist) => artist.albums.map((album) => album.id));
    setTempSelectedIds(allAlbumIds);
  };

  const handleDeselectAll = () => {
    setTempSelectedIds([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="出題範囲を選択">
      <div className={styles.content}>
        <div className={styles.controls}>
          <Button variant="outline" size="small" onClick={handleSelectAll}>
            すべて選択
          </Button>
          <Button variant="outline" size="small" onClick={handleDeselectAll}>
            すべて解除
          </Button>
        </div>

        <div className={styles.artistList}>
          {artists.map((artist) => (
            <div key={artist.id} className={styles.artistSection}>
              <h3 className={styles.artistName}>{artist.name}</h3>
              <div className={styles.albumGrid}>
                {artist.albums.map((album) => (
                  <div key={album.id} className={styles.albumCard}>
                    <img
                      src={album.jacketUrl}
                      alt={`${album.name}のジャケット`}
                      className={styles.albumJacket}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-album.svg'; // フォールバック画像
                      }}
                    />
                    <div className={styles.albumInfo}>
                      <Checkbox
                        id={`album-${album.id}`}
                        label={album.name}
                        checked={tempSelectedIds.includes(album.id)}
                        onChange={(checked) => handleAlbumToggle(album.id, checked)}
                      />
                      <span className={styles.trackCount}>{album.tracks.length}曲</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.selectionSummary}>選択中: {tempSelectedIds.length}アルバム</div>
          <div className={styles.footerButtons}>
            <Button variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={tempSelectedIds.length === 0}
            >
              決定
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
