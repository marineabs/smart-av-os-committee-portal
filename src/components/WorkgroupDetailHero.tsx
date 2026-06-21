import {
  CalendarOutlined,
  FileAddOutlined,
  NotificationOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import type { WorkgroupCardItem, WorkgroupDetailData } from '../types/portal'
import styles from './WorkgroupDetailHero.module.css'

interface WorkgroupDetailHeroProps {
  detail: WorkgroupDetailData
  group: WorkgroupCardItem
  onAction: (label: string) => void
}

function WorkgroupDetailHero({ detail, group, onAction }: WorkgroupDetailHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <span className={styles.iconWrap} style={{ background: group.accent }}>
            {group.icon}
          </span>
          <div>
            <h1>{group.name}</h1>
            <p>{detail.bannerDescription}</p>
          </div>
        </div>

        <div className={styles.metaGrid}>
          <div>
            <span>工作组职责</span>
            <strong>{group.positioning}</strong>
          </div>
          <div>
            <span>组长单位</span>
            <strong>{group.leaderUnit}</strong>
          </div>
          <div>
            <span>副组长单位</span>
            <strong>{group.deputyUnits.join(' / ')}</strong>
          </div>
          <div>
            <span>当前状态</span>
            <strong>{detail.currentStatus}</strong>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button icon={<NotificationOutlined />} onClick={() => onAction('发布公告')}>
          发布公告
        </Button>
        <Button icon={<FileAddOutlined />} onClick={() => onAction('上传资料')}>
          上传资料
        </Button>
        <Button icon={<CalendarOutlined />} onClick={() => onAction('发起会议')}>
          发起会议
        </Button>
        <Button type="primary" icon={<PlusSquareOutlined />} onClick={() => onAction('新建任务')}>
          新建任务
        </Button>
      </div>
    </section>
  )
}

export default WorkgroupDetailHero
