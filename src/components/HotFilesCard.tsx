import { RightOutlined } from '@ant-design/icons'
import type { KnowledgeHotItem } from '../types/portal'
import styles from './HotFilesCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

interface HotFilesCardProps {
  items: KnowledgeHotItem[]
  onMore: () => void
}

function HotFilesCard({ items, onMore }: HotFilesCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>热门资料</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.rank}>{index + 1}</span>
            <strong>{item.title}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HotFilesCard
