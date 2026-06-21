import type { MemberStatItem } from '../types/portal'
import styles from './MemberStatCard.module.css'

interface MemberStatCardProps {
  item: MemberStatItem
}

function MemberStatCard({ item }: MemberStatCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.iconWrap} style={{ background: item.accent }}>
        {item.icon}
      </span>
      <div className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        <div className={styles.valueRow}>
          <strong>{item.value}</strong>
          <span>{item.unit}</span>
        </div>
        <small className={styles.delta}>{item.delta}</small>
      </div>
    </article>
  )
}

export default MemberStatCard
