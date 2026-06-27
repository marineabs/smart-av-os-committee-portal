import { CheckCircleOutlined } from '@ant-design/icons'
import styles from './StatisticsCenter.module.css'

interface MonthlySummaryCardProps {
  items: string[]
}

function MonthlySummaryCard({ items }: MonthlySummaryCardProps) {
  return (
    <article className={styles.sideCard}>
      <h3>本月运行摘要</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <CheckCircleOutlined />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default MonthlySummaryCard
