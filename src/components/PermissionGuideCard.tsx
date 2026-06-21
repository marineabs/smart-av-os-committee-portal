import { RightOutlined } from '@ant-design/icons'
import type { KnowledgePermissionGuideItem } from '../types/portal'
import PermissionTag from './PermissionTag'
import styles from './PermissionGuideCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface PermissionGuideCardProps {
  items: KnowledgePermissionGuideItem[]
  onMore: () => void
}

function PermissionGuideCard({ items, onMore }: PermissionGuideCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>权限说明</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.level} className={styles.item}>
            <PermissionTag level={item.level} />
            <span>{item.description}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PermissionGuideCard
