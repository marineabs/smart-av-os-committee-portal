import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { WorkgroupCardItem } from '../types/portal'
import styles from './WorkgroupCard.module.css'

interface WorkgroupCardProps {
  group: WorkgroupCardItem
}

function WorkgroupCard({ group }: WorkgroupCardProps) {
  return (
    <article
      className={styles.card}
      style={
        {
          '--card-accent': group.accent,
        } as CSSProperties
      }
    >
      <div className={styles.upperPanel}>
        <div className={styles.headerPanel}>
          <div className={styles.header}>
            <div className={styles.titleWrap}>
              <div className={styles.titleBadge}>
                <h3>{group.name}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentPanel}>
          <div className={styles.tagRow}>
            {group.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.metaBlock}>
            <div>
              <span className={styles.metaLabel}>组长单位：</span>
              {group.leaderUnit}
            </div>
            <div>
              <span className={styles.metaLabel}>副组长单位：</span>
              {group.deputyUnits.join(' / ')}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.metrics}>
          <div className={styles.metricCard}>
            <span>成员单位</span>
            <strong className={styles.metricValue}>{group.memberUnitCount}</strong>
          </div>
        </div>
        <div className={styles.footerDivider} aria-hidden="true" />
        <Link to={`/workgroups/${group.id}`} className={styles.enterButton}>
          <span>进入工作组</span>
          <span className={styles.enterButtonArrow} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

export default WorkgroupCard
