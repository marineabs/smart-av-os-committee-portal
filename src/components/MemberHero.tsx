import {
  CloudUploadOutlined,
  ExportOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { memberHeroTags } from '../mock/memberCenter'
import styles from './MemberHero.module.css'

interface MemberHeroProps {
  onAdd: () => void
  onExport: () => void
  onImport: () => void
  onOpenPermissionGuide: () => void
}

function MemberHero({
  onAdd,
  onExport,
  onImport,
  onOpenPermissionGuide,
}: MemberHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <h1>会员管理中心</h1>
          <span className={styles.badge}>组织资源管理</span>
        </div>
        <p>
          统一管理专委会成员单位、联系人、参与工作组、会员状态和协同贡献，
          支撑专委会组织运行、工作协同和成员服务。
        </p>
      </div>

      <div className={styles.visual}>
        <div className={styles.actionColumn}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            新增会员单位
          </Button>
          <Button icon={<CloudUploadOutlined />} onClick={onImport}>
            批量导入
          </Button>
          <Button icon={<ExportOutlined />} onClick={onExport}>
            导出名册
          </Button>
          <Button icon={<SafetyCertificateOutlined />} onClick={onOpenPermissionGuide}>
            会员权限说明
          </Button>
        </div>

        <div className={styles.illustration}>
          <div className={styles.corePlatform}>
            <div className={styles.coreBuilding} />
            <div className={styles.coreBuildingTall} />
            <div className={styles.coreBuildingSlim} />
          </div>
          <div className={styles.nodeTop} />
          <div className={styles.nodeLeftTop} />
          <div className={styles.nodeLeftBottom} />
          <div className={styles.nodeRightTop} />
          <div className={styles.nodeRightBottom} />
          <span className={styles.visualTag} style={{ top: '10%', left: '2%' }}>
            成员单位管理
          </span>
          <span className={styles.visualTag} style={{ top: '40%', left: '4%' }}>
            参与关系管理
          </span>
          <span className={styles.visualTag} style={{ top: '12%', right: '3%' }}>
            协同贡献画像
          </span>
          <span className={styles.visualTag} style={{ top: '48%', right: '4%' }}>
            组织生态协同
          </span>
          <div className={styles.legend}>
            {memberHeroTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MemberHero
