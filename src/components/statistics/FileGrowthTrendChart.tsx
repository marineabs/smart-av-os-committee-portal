import type { EChartsOption } from 'echarts'
import type { MonthValueDatum } from '../../types/statistics'
import EChartView from './EChartView'
import styles from './StatisticsCenter.module.css'

interface FileGrowthTrendChartProps {
  data: MonthValueDatum[]
}

function FileGrowthTrendChart({ data }: FileGrowthTrendChartProps) {
  const option: EChartsOption = {
    color: ['#0b4dff'],
    grid: { top: 24, right: 18, bottom: 28, left: 44 },
    tooltip: { trigger: 'axis', formatter: '{b}<br/>文件资料：{c} 份' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
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
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: data.map((item) => item.value),
        areaStyle: { color: 'rgba(11, 77, 255, 0.1)' },
        lineStyle: { width: 3 },
      },
    ],
  }

  return (
    <article className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>文件资料增长趋势</h2>
          <p>展示资料沉淀规模随月份变化的累计趋势。</p>
        </div>
      </div>
      <EChartView option={option} />
    </article>
  )
}

export default FileGrowthTrendChart
