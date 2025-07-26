'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';
import styles from './ResultPage.module.css';

export const ResultPage: React.FC = () => {
  const router = useRouter();

  const handleBackToTop = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.resultCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>クイズ完了</h1>
          <div className={styles.completionBadge}>🎉 お疲れさまでした！</div>
        </header>

        <main className={styles.main}>
          <div className={styles.messageSection}>
            <h2 className={styles.messageTitle}>Triple Meaningで遊んでくれてありがとう！</h2>
            <p className={styles.messageText}>
              音楽の知識を深めて、さらなる高得点を目指しましょう。
              <br />
              異なるアルバムでもぜひ挑戦してみてください。
            </p>
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.actionButtons}>
            <Button variant="primary" size="large" onClick={handleBackToTop}>
              トップページに戻る
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};
