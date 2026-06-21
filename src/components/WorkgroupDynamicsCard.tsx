import { RightOutlined } from '@ant-design/icons'
import type { WorkgroupDynamicItem } from '../types/portal'
import styles from './WorkgroupDynamicsCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface WorkgroupDynamicsCardProps {
  items: WorkgroupDynamicItem[]
  onMore: () => void
}

function WorkgroupDynamicsCard({ items, onMore }: WorkgroupDynamicsCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>工作组动态</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.dot} style={{ background: item.accent }} />
            <div className={styles.body}>
              <strong>{item.group}</strong>
              <p>{item.summary}</p>
              <small>{item.time}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WorkgroupDynamicsCard
