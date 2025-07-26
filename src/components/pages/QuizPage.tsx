'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { getSelectedAlbumIds } from '@/lib/songs-api';

const QuizContent: React.FC = () => {
  const searchParams = useSearchParams();
  const albumIds = getSelectedAlbumIds(searchParams);

  return <QuizContainer albumIds={albumIds} />;
};

export const QuizPage: React.FC = () => {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <QuizContent />
    </Suspense>
  );
};
