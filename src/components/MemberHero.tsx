import {
  CloudUploadOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import styles from './MemberHero.module.css'

interface MemberHeroProps {
  canAdd?: boolean
  canImport?: boolean
  onAdd: () => void
  onImport: () => void
  scopeLabel?: string
}

function MemberHero({
  canAdd = true,
  canImport = true,
  onAdd,
  onImport,
  scopeLabel,
}: MemberHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <h1>会员信息中心</h1>
          {scopeLabel ? <span>{scopeLabel}</span> : null}
        </div>
        <div className={styles.actionColumn}>
          {canAdd ? (
            <Button
              type="primary"
              className={styles.createButton}
              icon={<PlusOutlined />}
              onClick={onAdd}
            >
              新增会员单位
            </Button>
          ) : null}
          {canImport ? (
            <Button className={styles.manageButton} icon={<CloudUploadOutlined />} onClick={onImport}>
              批量导入
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default MemberHero
