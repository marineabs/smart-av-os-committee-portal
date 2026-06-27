import type { EChartsOption } from 'echarts'
import type { NameValueDatum } from '../../types/statistics'
import EChartView from './EChartView'
import styles from './StatisticsCenter.module.css'

interface TaskStatusChartProps {
  data: NameValueDatum[]
}

function TaskStatusChart({ data }: TaskStatusChartProps) {
  const option: EChartsOption = {
    color: ['#0b4dff', '#18c2c8', '#ffb14a', '#ef5b5b'],
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 项，占比 {d}%' },
    legend: {
      orient: 'vertical',
      right: 12,
      top: 'middle',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#5e7296', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['38%', '52%'],
        label: { show: false },
        data,
      },
    ],
  }

  return (
    <article className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>任务状态分布</h2>
          <p>跟踪任务事项完成、推进和风险状态。</p>
        </div>
      </div>
      <EChartView option={option} />
    </article>
  )
}

export default TaskStatusChart
