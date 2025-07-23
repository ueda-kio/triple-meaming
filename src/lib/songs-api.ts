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
 * @param albumIds アルバムIDの配列
 * @returns クエリパラメータ文字列
 */
export const createAlbumsQueryParam = (albumIds: string[]): string => {
  if (albumIds.length === 0) return '';
  return `albums=${albumIds.join(',')}`;
};
