import { RightOutlined } from '@ant-design/icons'
import { Progress } from 'antd'
import type { WorkgroupTaskProgressItem } from '../types/portal'
import styles from './WorkgroupProgressCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface WorkgroupProgressCardProps {
  items: WorkgroupTaskProgressItem[]
  onMore: () => void
}

function WorkgroupProgressCard({ items, onMore }: WorkgroupProgressCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>重点推进任务</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.row}>
              <strong>{item.title}</strong>
              <span className={item.status === '重点推进' ? styles.focus : styles.normal}>{item.status}</span>
            </div>
            <Progress percent={item.progress} showInfo={false} strokeColor={item.accent} trailColor="#edf3ff" />
            <small>{item.progress}%</small>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WorkgroupProgressCard
