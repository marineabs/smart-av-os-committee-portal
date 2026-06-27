import { DownloadOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import styles from './StatisticsCenter.module.css'

interface StatisticsHeroProps {
  onExport: () => void
  onGenerateMonthlyReport: () => void
  onShowIndicatorInfo: () => void
}

function StatisticsHero({ onExport, onGenerateMonthlyReport, onShowIndicatorInfo }: StatisticsHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>运行数据洞察</span>
        <h1>统计分析中心</h1>
        <div className={styles.heroActions}>
          <Button type="primary" icon={<DownloadOutlined />} onClick={onExport}>
            导出报表
          </Button>
          <Button icon={<FileTextOutlined />} onClick={onGenerateMonthlyReport}>
            生成月报
          </Button>
          <Button icon={<InfoCircleOutlined />} onClick={onShowIndicatorInfo}>
            指标说明
          </Button>
        </div>
      </div>
    </section>
  )
}

export default StatisticsHero
