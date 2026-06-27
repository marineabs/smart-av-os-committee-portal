import type { EChartsOption } from 'echarts'
import type { MonthValueDatum } from '../../types/statistics'
import EChartView from './EChartView'
import styles from './StatisticsCenter.module.css'

interface MeetingTrendChartProps {
  data: MonthValueDatum[]
}

function MeetingTrendChart({ data }: MeetingTrendChartProps) {
  const option: EChartsOption = {
    color: ['#18c2c8'],
    grid: { top: 24, right: 18, bottom: 28, left: 38 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>会议活动：{c} 场' },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.month),
      axisLabel: { color: '#7a8cab' },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#dfe8f6' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#7a8cab' },
      splitLine: { lineStyle: { color: '#edf2fb' } },
    },
    series: [
      {
        type: 'bar',
        barWidth: 22,
        data: data.map((item) => item.value),
        itemStyle: { borderRadius: [9, 9, 0, 0] },
      },
    ],
  }

  return (
    <article className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>会议活动趋势</h2>
          <p>观察各月份会议组织频次和协同热度。</p>
        </div>
      </div>
      <EChartView option={option} />
    </article>
  )
}

export default MeetingTrendChart
