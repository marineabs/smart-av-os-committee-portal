import type { MemberStatusGuideItem } from '../types/portal'
import MemberStatusTag from './MemberStatusTag'
import styles from './MemberStatusGuideCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface MemberStatusGuideCardProps {
  items: MemberStatusGuideItem[]
}

function MemberStatusGuideCard({ items }: MemberStatusGuideCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>会员状态说明</h3>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.status} className={styles.item}>
            <MemberStatusTag status={item.status} />
            <span>{item.description}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MemberStatusGuideCard
