## **開発タスクリスト: トリプルミーニング 🚀**

### **1\. 開発環境のセットアップ**

* [ ] Next.jsプロジェクトの初期化 (pnpm create next-app)  
* [ ] TypeScriptの厳格な設定 (tsconfig.json)  
* [ ] Biomeの導入と設定（フォーマット、リント）  
* [ ] JestおよびReact Testing Libraryの導入と設定  
* [ ] Mock Service Worker (MSW) の導入と設定  
* [ ] アプリケーションの基本的なディレクトリ構造を作成 (/app, /components, /hooks, /lib, /types等)

### **2\. データと型の準備**

* [ ] public/songs.json ファイルを作成し、動作確認用のダミーデータを投入する (最低2アーティスト、各2アルバム、各3曲以上)  
* [ ] songs.json のデータ構造に合わせたTypeScriptの型定義を作成する (/types/index.ts)

### **3\. 共通コンポーネントの実装**

* [ ] 汎用的な Modal コンポーネントを作成する  
* [ ] 汎用的な Button コンポーネントを作成する  
* [ ] 汎用的な Checkbox コンポーネントを作成する

### **4\. 主要機能の実装**

#### **4.1. トップページと出題範囲設定機能**

* [ ] SelectAlbumsPage の静的なUIを実装する (ヘッダー、各種ボタン)  
* [ ] AlbumSelectModal コンポーネントの静的なUIを実装する  
* [ ] songs.json からデータをフェッチし、モーダル内にアルバム情報を表示するロジックを実装する  
* [ ] アルバム選択状態を管理し、URLクエリパラメータ (?albums=...) と同期させるロジックを実装する

#### **4.2. 楽曲再生機能 (YouTube Player)**

* [ ] YouTubePlayerWrapper コンポーネントを作成し、YouTube IFrame Player APIの初期化処理を実装する  
* [ ] useYouTubePlayer カスタムフックを作成し、再生・停止・プリロード (cueVideoById) の制御ロジックをカプセル化する

#### **4.3. クイズ画面機能**

* [ ] QuizPage および QuizContainer の静的なUIを実装する  
* [ ] QuizContainer に、URLパラメータを基に全5問のクイズデータを生成するロジックを実装する  
* [ ] QuizContainer に、次問の楽曲3曲をバックグラウンドでプリロードさせるロジックを実装する  
* [ ] AnswerModal コンポーネントの2ペインUIを実装する  
* [ ] AnswerModal 内で、アルバム選択→楽曲選択のロジックを実装する  
* [ ] QuizContainer に、ユーザーの回答を管理し、正誤判定を行うロジックを実装する  
* [ ] 「答えを見る」「次の問題へ」の進行制御ロジックを実装する
