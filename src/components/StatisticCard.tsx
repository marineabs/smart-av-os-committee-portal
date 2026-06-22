import type { StatisticItem } from '../types/portal'
import styles from './StatisticCard.module.css'

interface StatisticCardProps {
  className?: string
  iconClassName?: string
  item: StatisticItem
  showTrend?: boolean
}

function StatisticCard({
  className,
  iconClassName,
  item,
  showTrend = true,
}: StatisticCardProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <div
        className={[styles.iconWrap, iconClassName].filter(Boolean).join(' ')}
        style={{ background: item.accent }}
      >
        {item.icon}
      </div>

      <div className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        <div className={styles.valueRow}>
          <strong>{item.value}</strong>
          <span>{item.unit}</span>
        </div>
        {showTrend ? (
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
        ) : null}
      </div>
    </article>
  )
}

export default StatisticCard
