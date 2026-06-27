import type { EChartsOption } from 'echarts'
import type { NameValueDatum } from '../../types/statistics'
import EChartView from './EChartView'
import styles from './StatisticsCenter.module.css'

interface WorkgroupActivityChartProps {
  data: NameValueDatum[]
}

function WorkgroupActivityChart({ data }: WorkgroupActivityChartProps) {
  const option: EChartsOption = {
    grid: { top: 10, right: 18, bottom: 10, left: 92 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>活跃度：{c}' },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#7a8cab' },
      splitLine: { lineStyle: { color: '#edf2fb' } },
    },
    yAxis: {
      type: 'category',
      data: data.map((item) => item.name).reverse(),
      axisLabel: { color: '#3d5278' },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: data.map((item) => item.value).reverse(),
        barWidth: 12,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: '#0b4dff',
        },
      },
    ],
  }

  return (
    <article className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>工作组活跃度排行</h2>
          <p>活跃度由会议次数、资料上传、任务完成、意见反馈等指标综合计算。</p>
        </div>
      </div>
      <EChartView option={option} />
    </article>
  )
}

export default WorkgroupActivityChart
