import type { NameValueDatum } from '../../types/statistics'
import styles from './StatisticsCenter.module.css'

interface StandardProjectProgressCardProps {
  data: NameValueDatum[]
}

function StandardProjectProgressCard({ data }: StandardProjectProgressCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <article className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>标准项目进展</h2>
          <p>按项目阶段展示标准工作推进情况。</p>
        </div>
      </div>
      <div className={styles.stageList}>
        {data.map((item) => (
          <div key={item.name} className={styles.stageItem}>
            <div className={styles.stageMeta}>
              <span>{item.name}</span>
              <strong>{item.value} 项</strong>
            </div>
            <div className={styles.stageTrack}>
              <i style={{ width: total > 0 ? `${Math.max((item.value / total) * 100, 8)}%` : '0%' }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default StandardProjectProgressCard
