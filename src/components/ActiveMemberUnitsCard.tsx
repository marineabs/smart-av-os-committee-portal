import { RightOutlined } from '@ant-design/icons'
import type { MemberActiveUnitItem } from '../types/portal'
import styles from './ActiveMemberUnitsCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface ActiveMemberUnitsCardProps {
  items: MemberActiveUnitItem[]
  onMore: () => void
}

function ActiveMemberUnitsCard({ items, onMore }: ActiveMemberUnitsCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>活跃成员单位（本月）</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>

      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.rank}>{index + 1}</span>
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <strong>{item.name}</strong>
                <small>{item.score} 分</small>
              </div>
              <div className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${item.score}%` }} />
              </div>
              <span className={styles.metrics}>{item.metrics}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ActiveMemberUnitsCard
