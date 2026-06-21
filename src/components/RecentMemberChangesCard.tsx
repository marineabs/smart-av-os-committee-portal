import { RightOutlined } from '@ant-design/icons'
import type { MemberRecentChangeItem } from '../types/portal'
import styles from './RecentMemberChangesCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface RecentMemberChangesCardProps {
  items: MemberRecentChangeItem[]
  onMore: () => void
}

function RecentMemberChangesCard({ items, onMore }: RecentMemberChangesCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>最近变更</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.dot} />
            <div className={styles.body}>
              <strong>{item.title}</strong>
              <span>{item.summary}</span>
            </div>
            <small>{item.time}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentMemberChangesCard
