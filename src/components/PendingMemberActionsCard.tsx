import { RightOutlined } from '@ant-design/icons'
import type { MemberPendingActionItem } from '../types/portal'
import styles from './PendingMemberActionsCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface PendingMemberActionsCardProps {
  items: MemberPendingActionItem[]
  onClickItem: (item: MemberPendingActionItem) => void
  onMore: () => void
}

function PendingMemberActionsCard({
  items,
  onClickItem,
  onMore,
}: PendingMemberActionsCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>待处理事项</h3>
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

export default PendingMemberActionsCard
