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
import KnowledgeStatCard from '../KnowledgeStatCard'
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

const metricAccentMap: Record<OverviewMetric['accent'], string> = {
  blue: 'linear-gradient(135deg, #2d74ff 0%, #5fa2ff 100%)',
  cyan: 'linear-gradient(135deg, #18be98 0%, #43d3a9 100%)',
  purple: 'linear-gradient(135deg, #7a5dff 0%, #9b7cff 100%)',
  orange: 'linear-gradient(135deg, #ff9b2f 0%, #ffc453 100%)',
}

interface OverviewMetricCardProps {
  metric: OverviewMetric
}

function OverviewMetricCard({ metric }: OverviewMetricCardProps) {
  return (
    <KnowledgeStatCard
      className={styles.compactStatCard}
      iconClassName={styles.compactStatIcon}
      item={{
        title: metric.title,
        value: metric.value,
        unit: metric.unit ?? '',
        delta: metric.note,
        icon: metricIconMap[metric.id],
        accent: metricAccentMap[metric.accent],
      }}
      showDelta={false}
    />
  )
}

export default OverviewMetricCard
