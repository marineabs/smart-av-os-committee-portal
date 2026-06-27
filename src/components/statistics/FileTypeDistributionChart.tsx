import type { EChartsOption } from 'echarts'
import type { NameValueDatum } from '../../types/statistics'
import EChartView from './EChartView'
import styles from './StatisticsCenter.module.css'

interface FileTypeDistributionChartProps {
  data: NameValueDatum[]
}

function FileTypeDistributionChart({ data }: FileTypeDistributionChartProps) {
  const option: EChartsOption = {
    color: ['#0b4dff', '#18c2c8', '#7b61ff', '#ff9f2f', '#4e83ff', '#38c78f', '#8fa8d9'],
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 份，占比 {d}%' },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#5e7296', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['46%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        label: { color: '#4d6388', formatter: '{b}' },
        labelLine: { lineStyle: { color: '#cad6e8' } },
        data,
      },
    ],
  }

  return (
    <article className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>资料类型分布</h2>
          <p>按资料业务类型统计当前沉淀结构。</p>
        </div>
      </div>
      <EChartView option={option} />
    </article>
  )
}

export default FileTypeDistributionChart
