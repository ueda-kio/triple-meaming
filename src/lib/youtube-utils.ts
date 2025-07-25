/// <reference path="../types/youtube.d.ts" />

/**
 * YouTube URL から Video ID を抽出する
 * @param url YouTube URL
 * @returns Video ID または null
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * リトライ機能付きYouTube APIローダー
 * @param retryCount リトライ回数
 * @returns APIが読み込み完了した際に解決されるPromise
 */
export const loadYouTubeAPIWithRetry = async (retryCount = 0): Promise<void> => {
  const maxRetries = 3;
  
  try {
    await loadYouTubeAPI();
  } catch (error) {
    console.error(`YouTube API load attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < maxRetries) {
      console.log(`Retrying YouTube API load... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
      return loadYouTubeAPIWithRetry(retryCount + 1);
    }
    
    throw new Error(`YouTube API failed to load after ${maxRetries + 1} attempts`);
  }
};

/**
 * YouTube IFrame Player API スクリプトを動的に読み込む
 * @returns APIが読み込み完了した際に解決されるPromise
 */
export const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('=== YouTube API Loading Started ===');
    console.log('Window object available:', typeof window !== 'undefined');
    console.log('window.YT exists:', !!window.YT);
    console.log('window.YT.Player exists:', !!(window.YT && window.YT.Player));
    console.log('YouTube script in DOM:', !!document.querySelector('script[src*="youtube.com/iframe_api"]'));
    
    // 既にAPIが読み込まれている場合
    if (window.YT && window.YT.Player) {
      console.log('YouTube API already loaded and ready');
      resolve();
      return;
    }

    // APIスクリプトは読み込まれているが、まだ初期化されていない場合
    if (typeof window !== 'undefined') {
      // タイムアウト設定（20秒に延長）
      const timeout = setTimeout(() => {
        console.error('=== YouTube API initialization timeout after 20 seconds ===');
        console.log('Final state - window.YT:', !!window.YT);
        console.log('Final state - window.YT.Player:', !!(window.YT && window.YT.Player));
        reject(new Error('YouTube API initialization timeout'));
      }, 20000);

      let checkCount = 0;
      // 定期的にAPIの準備状況をチェック
      const checkAPI = () => {
        checkCount++;
        console.log(`API Check #${checkCount}: YT=${!!window.YT}, YT.Player=${!!(window.YT && window.YT.Player)}`);
        
        if (window.YT && window.YT.Player) {
          console.log('=== YouTube API is now ready ===');
          clearTimeout(timeout);
          resolve();
          return;
        }
        
        // 200回チェック（20秒）後にタイムアウト
        if (checkCount < 200) {
          setTimeout(checkAPI, 100);
        }
      };

      // onYouTubeIframeAPIReadyコールバックを設定
      const originalCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        console.log('=== YouTube API ready callback fired ===');
        clearTimeout(timeout);
        if (originalCallback) {
          originalCallback();
        }
        resolve();
      };

      // APIチェックを開始
      console.log('Starting API polling...');
      checkAPI();
    } else {
      reject(new Error('Window object not available'));
    }
  });
};

/**
 * YouTube APIの読み込み状態をデバッグ出力
 */
export const debugYouTubeAPIStatus = (): void => {
  console.log('=== YouTube API Debug Status ===');
  console.log('window object:', typeof window !== 'undefined');
  console.log('window.YT:', !!window.YT);
  console.log('window.YT type:', typeof window.YT);
  if (window.YT) {
    console.log('window.YT.Player:', !!window.YT.Player);
    console.log('window.YT.PlayerState:', !!window.YT.PlayerState);
    console.log('window.YT keys:', Object.keys(window.YT));
  }
  console.log('YouTube script in DOM:', !!document.querySelector('script[src*="youtube.com/iframe_api"]'));
  console.log('onYouTubeIframeAPIReady defined:', typeof window.onYouTubeIframeAPIReady);
  console.log('==================================');
};

/**
 * YouTube Player用の非表示divを作成・取得する
 * @param playerId プレイヤーのID
 * @returns プレイヤー用のdiv要素
 */
export const createPlayerElement = (playerId: string): HTMLDivElement => {
  let playerElement = document.getElementById(playerId) as HTMLDivElement;

  if (!playerElement) {
    playerElement = document.createElement('div');
    playerElement.id = playerId;
    playerElement.style.position = 'absolute';
    playerElement.style.left = '-9999px';
    playerElement.style.width = '560px';
    playerElement.style.height = '315px';
    document.body.appendChild(playerElement);
  }

  return playerElement;
};
