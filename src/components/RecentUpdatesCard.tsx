import { RightOutlined } from '@ant-design/icons'
import type { KnowledgeRecentItem, KnowledgeFileType } from '../types/portal'
import FileTypeIcon from './FileTypeIcon'
import styles from './RecentUpdatesCard.module.css'
import sideCardStyles from './KnowledgeSideCard.module.css'

const fileTypeMap: Record<KnowledgeFileType, 'pdf' | 'word' | 'excel' | 'ppt'> = {
  pdf: 'pdf',
  docx: 'word',
  xlsx: 'excel',
  pptx: 'ppt',
}

interface RecentUpdatesCardProps {
  items: KnowledgeRecentItem[]
  onMore: () => void
}

function RecentUpdatesCard({ items, onMore }: RecentUpdatesCardProps) {
  return (
    <section className={sideCardStyles.card}>
      <div className={sideCardStyles.header}>
        <h3>最近更新</h3>
        <button className={sideCardStyles.moreButton} type="button" onClick={onMore}>
          更多 <RightOutlined />
        </button>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={`${item.title}-${item.date}`} className={styles.item}>
            <FileTypeIcon type={fileTypeMap[item.type]} />
            <div className={styles.body}>
              <strong>{item.title}</strong>
              <span>{item.uploader}</span>
            </div>
            <small>{item.date}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentUpdatesCard
