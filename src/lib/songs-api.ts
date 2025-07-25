import type { SongsData } from '@/types';

/**
 * songs.jsonからデータを取得する
 * @returns 楽曲データ
 */
export const fetchSongsData = async (): Promise<SongsData> => {
  try {
    const response = await fetch('/songs.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch songs data: ${response.status}`);
    }
    const data: SongsData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching songs data:', error);
    throw error;
  }
};

/**
 * URLクエリパラメータからアルバムIDの配列を取得する
 * @param searchParams URLSearchParams
 * @returns アルバムIDの配列
 */
export const getSelectedAlbumIds = (searchParams: URLSearchParams): string[] => {
  const albumsParam = searchParams.get('albums');
  if (!albumsParam) return [];

  return albumsParam.split(',').filter((id) => id.trim() !== '');
};

/**
 * アルバムIDの配列をURLクエリパラメータに変換する
 * すべてのアルバムが選択されている場合は空文字を返す
 * @param albumIds アルバムIDの配列
 * @param allAlbumIds すべてのアルバムIDの配列（オプション）
 * @returns クエリパラメータ文字列
 */
export const createAlbumsQueryParam = (albumIds: string[], allAlbumIds?: string[]): string => {
  if (albumIds.length === 0) return '';
  
  // すべてのアルバムが選択されている場合はクエリパラメータ不要
  if (allAlbumIds && albumIds.length === allAlbumIds.length && 
      albumIds.every(id => allAlbumIds.includes(id))) {
    return '';
  }
  
  return `albums=${albumIds.join(',')}`;
};
