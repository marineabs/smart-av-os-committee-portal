import { ExclamationCircleOutlined } from '@ant-design/icons'
import styles from './StatisticsCenter.module.css'

interface FocusIssuesCardProps {
  items: string[]
}

function FocusIssuesCard({ items }: FocusIssuesCardProps) {
  return (
    <article className={styles.sideCard}>
      <h3>重点关注</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <ExclamationCircleOutlined />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default FocusIssuesCard
