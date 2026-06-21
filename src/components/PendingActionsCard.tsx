import { RightOutlined } from '@ant-design/icons'
import type { KnowledgePendingItem } from '../types/portal'
import styles from './PendingActionsCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface PendingActionsCardProps {
  items: KnowledgePendingItem[]
  onClickItem: (item: KnowledgePendingItem) => void
  onMore: () => void
}

function PendingActionsCard({ items, onClickItem, onMore }: PendingActionsCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>待我处理</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <button key={item.id} className={styles.item} type="button" onClick={() => onClickItem(item)}>
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </button>
        ))}
      </div>
    </section>
  )
}

export default PendingActionsCard
