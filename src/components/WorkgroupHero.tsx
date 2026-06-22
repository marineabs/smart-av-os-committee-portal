import {
  PlusCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import styles from './WorkgroupHero.module.css'

interface WorkgroupHeroProps {
  canCreateGroup?: boolean
  createButtonLabel?: string
  onCreateGroup: () => void
  onManageMembers: () => void
}

function WorkgroupHero({
  canCreateGroup = true,
  createButtonLabel = '新建工作组',
  onCreateGroup,
  onManageMembers,
}: WorkgroupHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1>工作组空间</h1>
        <p>集中管理各委员会工作组，快速检索与协同推进。</p>
      </div>

      <div className={styles.visual}>
        <div className={styles.actionRow}>
          {canCreateGroup ? (
            <Button
              type="primary"
              className={styles.createButton}
              icon={<PlusCircleOutlined />}
              onClick={onCreateGroup}
            >
              {createButtonLabel}
            </Button>
          ) : null}
          <Button className={styles.manageButton} icon={<TeamOutlined />} onClick={onManageMembers}>
            工作组管理
          </Button>
        </div>
      </div>
    </section>
  )
}

export default WorkgroupHero
