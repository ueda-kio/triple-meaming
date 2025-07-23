import { extractYouTubeVideoId } from '../youtube-utils';

describe('youtube-utils', () => {
  describe('extractYouTubeVideoId', () => {
    it('標準的なYouTube URLからVideo IDを抽出できること', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = extractYouTubeVideoId(url);
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('短縮形のYouTube URLからVideo IDを抽出できること', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const result = extractYouTubeVideoId(url);
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('追加パラメータがあるURLからVideo IDを抽出できること', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s';
      const result = extractYouTubeVideoId(url);
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('無効なURLの場合nullを返すこと', () => {
      const url = 'https://example.com/video';
      const result = extractYouTubeVideoId(url);
      expect(result).toBeNull();
    });

    it('空文字の場合nullを返すこと', () => {
      const url = '';
      const result = extractYouTubeVideoId(url);
      expect(result).toBeNull();
    });

    it('YouTube以外のドメインの場合nullを返すこと', () => {
      const url = 'https://vimeo.com/123456789';
      const result = extractYouTubeVideoId(url);
      expect(result).toBeNull();
    });
  });
});
