import { AlertOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import type { OverdueTask } from '../../types/statistics'
import styles from './StatisticsCenter.module.css'

interface OverdueTasksCardProps {
  data: OverdueTask[]
  onTaskClick: (task: OverdueTask) => void
}

function OverdueTasksCard({ data, onTaskClick }: OverdueTasksCardProps) {
  return (
    <article className={styles.detailCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>任务逾期提醒</h2>
          <p>展示逾期或临近截止的重点任务事项。</p>
        </div>
      </div>
      <div className={styles.taskList}>
        {data.map((item) => (
          <button key={item.id} className={styles.taskItem} type="button" onClick={() => onTaskClick(item)}>
            <span className={styles.taskIcon}>
              <AlertOutlined />
            </span>
            <span className={styles.taskContent}>
              <strong>{item.title}</strong>
              <span>
                {item.workgroup} · {item.unit} · 截止 {item.deadline}
              </span>
            </span>
            <Tag color={item.status === '已逾期' ? 'red' : 'orange'}>{item.status}</Tag>
          </button>
        ))}
      </div>
    </article>
  )
}

export default OverdueTasksCard
