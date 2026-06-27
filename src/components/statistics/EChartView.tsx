import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'
import styles from './StatisticsCenter.module.css'

interface EChartViewProps {
  option: EChartsOption
}

function EChartView({ option }: EChartViewProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chartRef.current) {
      return undefined
    }

    const chart = echarts.init(chartRef.current)
    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }, [option])

  return <div ref={chartRef} className={styles.chartCanvas} />
}

export default EChartView
