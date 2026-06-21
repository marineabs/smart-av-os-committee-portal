import {
  DownOutlined,
  FolderOpenOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MemberCapabilityDefinition, MemberCategoryDefinition } from '../types/portal'
import styles from './MemberCategoryPanel.module.css'

interface MemberCategoryPanelProps {
  activeCapability: string | null
  activeCategory: string
  capabilities: MemberCapabilityDefinition[]
  categories: MemberCategoryDefinition[]
  onCapabilityChange: (value: string | null) => void
  onCategoryChange: (value: string) => void
}

function MemberCategoryPanel({
  activeCapability,
  activeCategory,
  capabilities,
  categories,
  onCapabilityChange,
  onCategoryChange,
}: MemberCategoryPanelProps) {
  return (
    <div className={styles.column}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h2>会员分类</h2>
          <button className={styles.iconButton} type="button" aria-label="分类设置">
            <SettingOutlined />
          </button>
        </div>

        <div className={styles.sectionTitle}>
          <span>
            <FolderOpenOutlined />
            单位资源库
          </span>
          <DownOutlined />
        </div>

        <div className={styles.list}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`${styles.item} ${activeCategory === category.id ? styles.itemActive : ''}`}
              type="button"
              onClick={() => onCategoryChange(category.id)}
            >
              <span className={styles.label}>
                <FolderOpenOutlined />
                {category.label}
              </span>
              <small>{category.count}</small>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.header}>
          <h2>能力标签</h2>
          <button className={styles.iconButton} type="button" aria-label="展开能力标签">
            <DownOutlined />
          </button>
        </div>

        <div className={styles.tagList}>
          {capabilities.map((capability) => (
            <button
              key={capability.id}
              className={`${styles.tagItem} ${activeCapability === capability.id ? styles.tagItemActive : ''}`}
              type="button"
              onClick={() =>
                onCapabilityChange(activeCapability === capability.id ? null : capability.id)
              }
            >
              <span className={styles.dot} />
              <span>{capability.label}</span>
              <small>{capability.count}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default MemberCategoryPanel
