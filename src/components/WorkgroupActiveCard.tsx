import { RightOutlined } from '@ant-design/icons'
import type { WorkgroupActiveItem } from '../types/portal'
import styles from './WorkgroupActiveCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface WorkgroupActiveCardProps {
  items: WorkgroupActiveItem[]
  onMore: () => void
}

function WorkgroupActiveCard({ items, onMore }: WorkgroupActiveCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>活跃工作组</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.rank}>{index + 1}</span>
            <div className={styles.body}>
              <strong>{item.name}</strong>
              <small>{item.hint}</small>
            </div>
            <span className={styles.score}>{item.score}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WorkgroupActiveCard
