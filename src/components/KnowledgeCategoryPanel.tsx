import {
  DownOutlined,
  FolderOpenOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { KnowledgeCategory, KnowledgeTopic } from '../types/portal'
import styles from './KnowledgeCategoryPanel.module.css'

interface KnowledgeCategoryPanelProps {
  activeCategory: string
  activeTopic: string | null
  categories: KnowledgeCategory[]
  topics: KnowledgeTopic[]
  onCategoryChange: (categoryId: string) => void
  onTopicChange: (topicId: string | null) => void
}

function KnowledgeCategoryPanel({
  activeCategory,
  activeTopic,
  categories,
  topics,
  onCategoryChange,
  onTopicChange,
}: KnowledgeCategoryPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2>知识分类</h2>
        <button className={styles.iconButton} type="button" aria-label="分类设置">
          <SettingOutlined />
        </button>
      </div>

      <div className={styles.sectionTitle}>
        <span>
          <FolderOpenOutlined />
          全部资料
        </span>
        <DownOutlined />
      </div>

      <div className={styles.categoryList}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryItem} ${activeCategory === category.id ? styles.categoryItemActive : ''}`}
            type="button"
            onClick={() => onCategoryChange(category.id)}
          >
            <span className={styles.categoryLabel}>
              <FolderOpenOutlined />
              {category.label}
            </span>
            <small>{category.count}</small>
          </button>
        ))}
      </div>

      <div className={styles.topicBlock}>
        <div className={styles.topicHeader}>
          <strong>专题资料</strong>
          <DownOutlined />
        </div>
        <div className={styles.topicList}>
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={`${styles.topicItem} ${activeTopic === topic.id ? styles.topicItemActive : ''}`}
              type="button"
              onClick={() => onTopicChange(activeTopic === topic.id ? null : topic.id)}
            >
              <span className={styles.topicDot} />
              {topic.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KnowledgeCategoryPanel
