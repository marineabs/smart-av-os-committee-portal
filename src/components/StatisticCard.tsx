import type { StatisticItem } from '../types/portal'
import styles from './StatisticCard.module.css'

interface StatisticCardProps {
  item: StatisticItem
}

function StatisticCard({ item }: StatisticCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.iconWrap} style={{ background: item.accent }}>
        {item.icon}
      </div>

      <div className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        <div className={styles.valueRow}>
          <strong>{item.value}</strong>
          <span>{item.unit}</span>
        </div>
        <span
          className={`${styles.trend} ${
            item.trendDirection === 'up'
              ? styles.up
              : item.trendDirection === 'down'
                ? styles.down
                : styles.flat
          }`}
        >
          {item.trendText}
        </span>
      </div>
    </article>
  )
}

export default StatisticCard
