import { CalendarOutlined, FileTextOutlined, ScheduleOutlined, TeamOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import type { WorkgroupCardItem } from '../types/portal'
import styles from './WorkgroupCard.module.css'

interface WorkgroupCardProps {
  group: WorkgroupCardItem
}

function WorkgroupCard({ group }: WorkgroupCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.iconWrap} style={{ background: group.accent }}>
            {group.icon}
          </span>
          <div>
            <h3>{group.name}</h3>
            <p>{group.positioning}</p>
          </div>
        </div>
      </div>

      <div className={styles.tagRow}>
        {group.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className={styles.metaBlock}>
        <div>组长单位：{group.leaderUnit}</div>
        <div>副组长单位：{group.deputyUnits.join(' / ')}</div>
      </div>

      <div className={styles.metrics}>
        <div>
          <TeamOutlined />
          <strong>{group.memberUnitCount}</strong>
          <span>成员单位</span>
        </div>
        <div>
          <FileTextOutlined />
          <strong>{group.fileCount}</strong>
          <span>资料数量</span>
        </div>
        <div>
          <ScheduleOutlined />
          <strong>{group.taskCount}</strong>
          <span>进行中任务</span>
        </div>
        <div>
          <CalendarOutlined />
          <strong>{group.meetingCount}</strong>
          <span>本月会议</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.latest}>当前重点工作：{group.latestUpdate}</div>
        <Link to={`/workgroups/${group.id}`} className={styles.enterButton}>
          进入工作组
        </Link>
      </div>
    </article>
  )
}

export default WorkgroupCard
