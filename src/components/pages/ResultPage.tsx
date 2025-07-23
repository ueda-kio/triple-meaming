'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';
import styles from './ResultPage.module.css';

export const ResultPage: React.FC = () => {
  const router = useRouter();

  // 実際のアプリケーションでは、クイズの結果データを
  // セッションストレージやContext等から取得する必要があります
  // ここでは簡単な実装として固定値を使用
  const mockResults = {
    totalCorrect: 12,
    totalPossible: 15,
    percentage: 80,
    perfectQuestions: 2,
    totalQuestions: 5,
  };

  const handleBackToTop = () => {
    router.push('/');
  };

  const handleRetry = () => {
    router.back(); // 前のページ（クイズ設定）に戻る
  };

  const getPerformanceMessage = (percentage: number): string => {
    if (percentage >= 90) return '素晴らしい成績です！';
    if (percentage >= 70) return 'よくできました！';
    if (percentage >= 50) return 'もう少し頑張りましょう！';
    return '次回はもっと頑張りましょう！';
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 90) return '#10b981'; // green
    if (percentage >= 70) return '#3b82f6'; // blue
    if (percentage >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className={styles.container}>
      <div className={styles.resultCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>クイズ結果</h1>
          <div className={styles.completionBadge}>🎉 お疲れさまでした！</div>
        </header>

        <main className={styles.main}>
          <div className={styles.scoreSection}>
            <div
              className={styles.scoreCircle}
              style={{ borderColor: getPerformanceColor(mockResults.percentage) }}
            >
              <span className={styles.percentage}>{mockResults.percentage}%</span>
              <span className={styles.scoreText}>
                {mockResults.totalCorrect}/{mockResults.totalPossible}
              </span>
            </div>

            <p
              className={styles.performanceMessage}
              style={{ color: getPerformanceColor(mockResults.percentage) }}
            >
              {getPerformanceMessage(mockResults.percentage)}
            </p>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.statGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{mockResults.totalQuestions}</div>
                <div className={styles.statLabel}>総問題数</div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statNumber}>{mockResults.perfectQuestions}</div>
                <div className={styles.statLabel}>全問正解</div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statNumber}>{mockResults.totalCorrect}</div>
                <div className={styles.statLabel}>正解数</div>
              </div>
            </div>
          </div>

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
            <Button variant="outline" size="large" onClick={handleRetry}>
              もう一度挑戦
            </Button>
            <Button variant="primary" size="large" onClick={handleBackToTop}>
              トップページに戻る
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};
