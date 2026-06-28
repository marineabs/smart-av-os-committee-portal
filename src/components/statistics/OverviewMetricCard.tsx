import {
  ApartmentOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import type { OverviewMetric } from '../../types/statistics'
import styles from './StatisticsCenter.module.css'

const metricIconMap: Record<string, ReactNode> = {
  members: <TeamOutlined />,
  workgroups: <ApartmentOutlined />,
  files: <FileTextOutlined />,
  meetings: <CalendarOutlined />,
  tasks: <CheckSquareOutlined />,
  standards: <FundProjectionScreenOutlined />,
  achievements: <FileDoneOutlined />,
  activeMembers: <TrophyOutlined />,
}

interface OverviewMetricCardProps {
  metric: OverviewMetric
}

function OverviewMetricCard({ metric }: OverviewMetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[metric.accent]}`}>{metricIconMap[metric.id]}</div>
      <div className={styles.metricBody}>
        <span>{metric.title}</span>
        <strong>
          {metric.value}
          {metric.unit ? <small>{metric.unit}</small> : null}
        </strong>
      </div>
    </article>
  )
}

export default OverviewMetricCard
