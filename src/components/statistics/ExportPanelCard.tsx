import { DownloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import styles from './StatisticsCenter.module.css'

interface ExportPanelCardProps {
  onExport: (name: string) => void
}

const exportItems = ['导出月度统计', '导出工作组报表', '导出成员单位参与度', '导出标准项目进度']

function ExportPanelCard({ onExport }: ExportPanelCardProps) {
  return (
    <article className={styles.sideCard}>
      <h3>快捷导出</h3>
      <div className={styles.exportList}>
        {exportItems.map((item) => (
          <Button key={item} block icon={<DownloadOutlined />} onClick={() => onExport(item)}>
            {item}
          </Button>
        ))}
      </div>
    </article>
  )
}

export default ExportPanelCard
