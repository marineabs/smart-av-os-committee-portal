import {
  PlusCircleOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Input } from 'antd'
import styles from './WorkgroupHero.module.css'

interface WorkgroupHeroProps {
  canCreateGroup?: boolean
  createButtonLabel?: string
  keyword: string
  onChangeKeyword: (value: string) => void
  onCreateGroup: () => void
  onManageMembers: () => void
  onSearch: () => void
}

function WorkgroupHero({
  canCreateGroup = true,
  createButtonLabel = '新建工作组',
  keyword,
  onChangeKeyword,
  onCreateGroup,
  onManageMembers,
  onSearch,
}: WorkgroupHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1>工作组空间</h1>
        <p>
          面向各专题工作组，集中展示工作组概况、成员组成、公告通知、会议资料、任务事项和成果沉淀，
          支撑跨单位协同攻关。
        </p>

        <div className={styles.searchRow}>
          <Input
            value={keyword}
            placeholder="搜索工作组名称 / 牵头单位 / 关键词"
            prefix={<SearchOutlined />}
            onChange={(event) => onChangeKeyword(event.target.value)}
            onPressEnter={onSearch}
          />
        </div>
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
