import { InfoCircleOutlined } from '@ant-design/icons'
import styles from './StatisticsCenter.module.css'

function DataDescriptionCard() {
  return (
    <article className={styles.sideCard}>
      <h3>数据说明</h3>
      <p className={styles.descriptionText}>
        <InfoCircleOutlined />
        活跃度得分由会议参与、资料提交、任务完成、意见反馈、标准项目参与等指标综合计算，仅用于秘书处掌握运行情况和工作参考。
      </p>
    </article>
  )
}

export default DataDescriptionCard
