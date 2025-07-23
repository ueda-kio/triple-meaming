'use client';

import { useSearchParams } from 'next/navigation';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { getSelectedAlbumIds } from '@/lib/songs-api';

export const QuizPage: React.FC = () => {
  const searchParams = useSearchParams();
  const albumIds = getSelectedAlbumIds(searchParams);

  return <QuizContainer albumIds={albumIds} />;
};
