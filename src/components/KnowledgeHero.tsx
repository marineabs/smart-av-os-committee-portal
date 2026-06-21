import {
  CloudUploadOutlined,
  FolderAddOutlined,
  SafetyCertificateOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { knowledgeHeroTags } from '../mock/knowledgeCenter'
import styles from './KnowledgeHero.module.css'

interface KnowledgeHeroProps {
  onCreateCategory: () => void
  onOpenPermission: () => void
  onUpload: () => void
}

function KnowledgeHero({ onCreateCategory, onOpenPermission, onUpload }: KnowledgeHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <h1>文件与知识中心</h1>
          <span className={styles.badge}>知识资产管理</span>
        </div>
        <p>
          汇聚专委会制度文件、会议资料、技术方案、接口规范、测试认证和成果资料，
          支撑工作组协同编制、版本管理和知识沉淀。
        </p>
      </div>

      <div className={styles.visual}>
        <div className={styles.actionRow}>
          <Button icon={<UnlockOutlined />} onClick={onOpenPermission}>
            权限说明
          </Button>
          <Button type="primary" icon={<CloudUploadOutlined />} onClick={onUpload}>
            上传资料
          </Button>
          <Button icon={<FolderAddOutlined />} onClick={onCreateCategory}>
            新建分类
          </Button>
        </div>

        <div className={styles.illustration}>
          <div className={styles.folderBack} />
          <div className={styles.folderMiddle} />
          <div className={styles.folderFront}>
            <div className={styles.searchLens} />
          </div>
          <div className={styles.signal} />
          {knowledgeHeroTags.map((tag, index) => (
            <span
              key={tag}
              className={styles.visualTag}
              style={{
                top: `${index % 2 === 0 ? 6 + index * 10 : 20 + index * 8}%`,
                left: index < 2 ? `${8 + index * 18}%` : undefined,
                right: index >= 2 ? `${4 + (index - 2) * 16}%` : undefined,
              }}
            >
              {tag}
            </span>
          ))}
          <span className={styles.shield}>
            <SafetyCertificateOutlined />
            安全合规
          </span>
        </div>
      </div>
    </section>
  )
}

export default KnowledgeHero
