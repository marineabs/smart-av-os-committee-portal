import {
  CloudUploadOutlined,
  FolderAddOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import knowledgeHeroPoster from '../assets/knowledge-hero-poster.png'
import styles from './KnowledgeHero.module.css'

interface KnowledgeHeroProps {
  canCreateCategory?: boolean
  canUpload?: boolean
  onCreateCategory: () => void
  onOpenPermission: () => void
  onUpload: () => void
  scopeLabel?: string
}

function KnowledgeHero({
  canCreateCategory = true,
  canUpload = true,
  onCreateCategory,
  onOpenPermission,
  onUpload,
  scopeLabel,
}: KnowledgeHeroProps) {
  return (
    <section className={styles.hero}>
      <img className={styles.poster} src={knowledgeHeroPoster} alt="文件与知识中心海报" />

      <div className={styles.content}>
        <div className={styles.copy}>
          <div className={styles.titleRow}>
            <h1>文件与知识中心</h1>
            <span className={styles.badge}>{scopeLabel ?? '知识资产管理'}</span>
          </div>
          <div className={styles.actionRow}>
            <Button icon={<UnlockOutlined />} onClick={onOpenPermission}>
              权限说明
            </Button>
            {canUpload ? (
              <Button type="primary" icon={<CloudUploadOutlined />} onClick={onUpload}>
                上传资料
              </Button>
            ) : null}
            {canCreateCategory ? (
              <Button icon={<FolderAddOutlined />} onClick={onCreateCategory}>
                新建分类
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default KnowledgeHero
