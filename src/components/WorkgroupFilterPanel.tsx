import type { WorkgroupDirection, WorkgroupFilterCategory } from '../types/portal'
import styles from './WorkgroupFilterPanel.module.css'

interface WorkgroupFilterPanelProps {
  activeCategory: string
  activeDirection: string | null
  categories: WorkgroupFilterCategory[]
  directions: WorkgroupDirection[]
  onCategoryChange: (categoryId: string) => void
  onDirectionChange: (directionId: string | null) => void
}

function WorkgroupFilterPanel({
  activeCategory,
  activeDirection,
  categories,
  directions,
  onCategoryChange,
  onDirectionChange,
}: WorkgroupFilterPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.block}>
        <h3>工作组分类</h3>
        <div className={styles.list}>
          {categories.map((item) => (
            <button
              key={item.id}
              className={`${styles.categoryItem} ${activeCategory === item.id ? styles.active : ''}`}
              type="button"
              onClick={() => onCategoryChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <h3>技术方向</h3>
        <div className={styles.directionList}>
          {directions.map((item) => (
            <button
              key={item.id}
              className={`${styles.directionItem} ${activeDirection === item.id ? styles.activeDirection : ''}`}
              type="button"
              onClick={() => onDirectionChange(activeDirection === item.id ? null : item.id)}
            >
              <span className={styles.dot} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkgroupFilterPanel
