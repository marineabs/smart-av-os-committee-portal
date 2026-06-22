import type { KnowledgeStatItem } from '../types/portal'
import styles from './KnowledgeStatCard.module.css'

interface KnowledgeStatCardProps {
  className?: string
  iconClassName?: string
  item: KnowledgeStatItem
  showDelta?: boolean
}

function KnowledgeStatCard({ className, iconClassName, item, showDelta = true }: KnowledgeStatCardProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <span className={[styles.iconWrap, iconClassName].filter(Boolean).join(' ')} style={{ background: item.accent }}>
        {item.icon}
      </span>
      <div className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        <div className={styles.valueRow}>
          <strong>{item.value}</strong>
          <span>{item.unit}</span>
        </div>
        {showDelta && item.delta ? <small className={styles.delta}>{item.delta}</small> : null}
      </div>
    </article>
  )
}

export default KnowledgeStatCard
