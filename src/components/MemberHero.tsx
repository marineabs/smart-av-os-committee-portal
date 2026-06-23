import {
  CloudUploadOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import styles from './MemberHero.module.css'

interface MemberHeroProps {
  onAdd: () => void
  onImport: () => void
}

function MemberHero({
  onAdd,
  onImport,
}: MemberHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <h1>会员信息中心</h1>
        </div>
        <div className={styles.actionColumn}>
          <Button
            type="primary"
            className={styles.createButton}
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            新增会员单位
          </Button>
          <Button className={styles.manageButton} icon={<CloudUploadOutlined />} onClick={onImport}>
            批量导入
          </Button>
        </div>
      </div>
    </section>
  )
}

export default MemberHero
