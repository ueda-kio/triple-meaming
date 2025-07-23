import { HttpResponse, http } from 'msw';

export const handlers = [
  // songs.jsonファイルのモック
  http.get('/songs.json', () => {
    return HttpResponse.json({
      artists: [
        {
          id: 'artist001',
          name: 'BUMP OF CHICKEN',
          albums: [
            {
              id: 'album001',
              name: 'FLAME VEIN',
              jacketUrl: '/images/image_album001.png',
              tracks: [
                {
                  id: 'track001',
                  title: 'ガラスのブルース',
                  youtubeUrl: 'https://www.youtube.com/watch?v=wa20XajXjLE',
                },
                {
                  id: 'track002',
                  title: 'くだらない唄',
                  youtubeUrl: 'https://www.youtube.com/watch?v=xqRHhG0P2vs',
                },
              ],
            },
          ],
        },
      ],
    });
  }),
];
