// 楽曲データの型定義
export interface Track {
  id: string;
  title: string;
  youtubeUrl: string;
  duration?: number; // 秒単位
}

// アルバムの型定義
export interface Album {
  id: string;
  name: string;
  jacketUrl: string;
  tracks: Track[];
}

// アーティストの型定義
export interface Artist {
  id: string;
  name: string;
  albums: Album[];
}

// songs.jsonのルート型定義
export interface SongsData {
  artists: Artist[];
}

// クイズ関連の型定義
export interface QuizQuestion {
  questionNumber: number;
  tracks: [Track, Track, Track]; // 必ず3曲
  startTimes: [number, number, number]; // 各楽曲の開始時間（秒）
  correctAnswers: string[]; // 正解した楽曲のID
  isAnswerRevealed: boolean; // 答えが表示されているか
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAlbumIds: string[];
  isCompleted: boolean;
  totalScore: number;
}

// YouTube Player関連の型定義
export interface YouTubePlayerState {
  isPlayerReady: boolean;
  isPlaying: boolean;
  isVideoLoaded: boolean;
  currentVideoId: string | null;
}

// モーダルの型定義
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

// 回答モーダルの型定義
export interface AnswerModalProps extends ModalProps {
  albums: Album[];
  onTrackSelect: (track: Track) => void;
  selectedTrack?: Track;
}

// ボタンの型定義
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// チェックボックスの型定義
export interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
