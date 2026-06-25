import {
  PlusCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import styles from './WorkgroupHero.module.css'

interface WorkgroupHeroProps {
  canManageWorkgroups?: boolean
  createButtonLabel?: string
  onCreateGroup: () => void
  onManageWorkgroups: () => void
}

function WorkgroupHero({
  canManageWorkgroups = true,
  createButtonLabel = '新建工作组',
  onCreateGroup,
  onManageWorkgroups,
}: WorkgroupHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1>工作组空间</h1>
        {canManageWorkgroups ? (
          <div className={styles.actionRow}>
            <Button
              type="primary"
              className={styles.createButton}
              icon={<PlusCircleOutlined />}
              onClick={onCreateGroup}
            >
              {createButtonLabel}
            </Button>
            <Button className={styles.manageButton} icon={<TeamOutlined />} onClick={onManageWorkgroups}>
              工作组管理
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default WorkgroupHero
