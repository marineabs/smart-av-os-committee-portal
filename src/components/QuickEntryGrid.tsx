import {
  ApartmentOutlined,
  ApiOutlined,
  DeploymentUnitOutlined,
  NotificationOutlined,
  PlayCircleOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { QuickEntryItem, QuickIconKey } from '../types/portal'
import styles from './QuickEntryGrid.module.css'

const iconMap: Record<QuickIconKey, ReactNode> = {
  architecture: <ApartmentOutlined />,
  interface: <ApiOutlined />,
  terminal: <DeploymentUnitOutlined />,
  testing: <SafetyCertificateOutlined />,
  project: <NotificationOutlined />,
  ai: <RadarChartOutlined />,
  media: <PlayCircleOutlined />,
  promotion: <SoundOutlined />,
}

interface QuickEntryGridProps {
  items: QuickEntryItem[]
}

function QuickEntryGrid({ items }: QuickEntryGridProps) {
  return (
    <section className={styles.card}>
      <div className={styles.grid}>
        {items.map((item) => (
          <Link key={item.path} to={item.path} className={styles.entry}>
            <span className={styles.iconWrap} style={{ background: item.accent }}>
              {iconMap[item.icon]}
            </span>
            <span className={styles.label}>{item.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default QuickEntryGrid
