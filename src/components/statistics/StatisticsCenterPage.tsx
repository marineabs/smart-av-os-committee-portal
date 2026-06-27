import { Alert, App, Modal } from 'antd'
import { useEffect, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import {
  defaultStatisticsFilters,
  emptyStatisticsSummary,
  type OverdueTask,
  type StatisticsFilterState,
  type StatisticsSummaryPayload,
} from '../../types/statistics'
import { fallbackStatisticsSummary } from '../../mock/statisticsFallback'
import { fetchStatisticsSummary } from '../../services/statisticsApi'
import DataDescriptionCard from './DataDescriptionCard'
import ExportPanelCard from './ExportPanelCard'
import FileGrowthTrendChart from './FileGrowthTrendChart'
import FileTypeDistributionChart from './FileTypeDistributionChart'
import FocusIssuesCard from './FocusIssuesCard'
import HotFilesRankCard from './HotFilesRankCard'
import IndicatorExplanationModal from './IndicatorExplanationModal'
import MeetingTrendChart from './MeetingTrendChart'
import MemberParticipationRankCard from './MemberParticipationRankCard'
import MonthlySummaryCard from './MonthlySummaryCard'
import OverviewMetricCard from './OverviewMetricCard'
import OverdueTasksCard from './OverdueTasksCard'
import StandardProjectProgressCard from './StandardProjectProgressCard'
import StatisticsFilterBar from './StatisticsFilterBar'
import StatisticsHero from './StatisticsHero'
import styles from './StatisticsCenter.module.css'
import TaskStatusChart from './TaskStatusChart'
import WorkgroupActivityChart from './WorkgroupActivityChart'

function StatisticsCenterPage() {
  const { message } = App.useApp()
  const [filters, setFilters] = useState<StatisticsFilterState>(defaultStatisticsFilters)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<StatisticsSummaryPayload>(emptyStatisticsSummary)
  const [indicatorOpen, setIndicatorOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<OverdueTask | null>(null)
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  const loadSummary = async (nextFilters: StatisticsFilterState, options?: { quiet?: boolean }) => {
    setLoading(true)
    try {
      const payload = await fetchStatisticsSummary(nextFilters)
      setSummary(payload)
      setUsingFallbackData(false)
      if (!options?.quiet) {
        message.success('已按当前统计范围刷新数据')
      }
    } catch {
      setSummary(fallbackStatisticsSummary)
      setUsingFallbackData(true)
      if (!options?.quiet) {
        message.warning('后台 API 连接不上，当前使用本地数据')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSummary(defaultStatisticsFilters, { quiet: true })
  }, [])

  const handleQuery = () => {
    void loadSummary(filters)
  }

  const handleReset = () => {
    setFilters(defaultStatisticsFilters)
    void loadSummary(defaultStatisticsFilters)
  }

  const handleExport = (name = '统计报表') => {
    message.success(`${name}已生成`)
  }

  return (
    <AppLayout footerCaption="运行统计" footerTitle="协同数据与报表导出">
      <div className={styles.page}>
        <StatisticsHero
          onExport={() => handleExport('统计报表')}
          onGenerateMonthlyReport={() => message.success('月报已生成')}
          onShowIndicatorInfo={() => setIndicatorOpen(true)}
        />

        <StatisticsFilterBar
          filters={filters}
          loading={loading}
          options={summary.filterOptions}
          onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onQuery={handleQuery}
          onReset={handleReset}
        />

        {usingFallbackData ? (
          <Alert
            className={styles.dataStatusAlert}
            type="warning"
            showIcon
            message="后台 API 连接不上，当前使用本地数据"
            description="统计分析中心已自动切换为本地模拟数据，页面浏览与交互不受影响。"
          />
        ) : null}

        <div className={styles.contentLayout}>
          <main className={styles.mainColumn}>
            <section className={styles.metricGrid}>
              {summary.overviewMetrics.map((metric) => (
                <OverviewMetricCard key={metric.id} metric={metric} />
              ))}
            </section>

            <section className={styles.chartGrid}>
              <WorkgroupActivityChart data={summary.workgroupActivityData} />
              <FileGrowthTrendChart data={summary.fileGrowthTrendData} />
              <FileTypeDistributionChart data={summary.fileTypeDistributionData} />
              <TaskStatusChart data={summary.taskStatusData} />
              <MeetingTrendChart data={summary.meetingTrendData} />
              <StandardProjectProgressCard data={summary.standardProjectProgressData} />
            </section>

            <section className={styles.detailGrid}>
              <MemberParticipationRankCard data={summary.memberParticipationRankData} />
              <HotFilesRankCard data={summary.hotFilesRankData} />
              <OverdueTasksCard data={summary.overdueTasksData} onTaskClick={setSelectedTask} />
            </section>
          </main>

          <aside className={styles.sideColumn}>
            <MonthlySummaryCard items={summary.monthlySummaryItems} />
            <FocusIssuesCard items={summary.focusIssueItems} />
            <DataDescriptionCard />
            <ExportPanelCard onExport={handleExport} />
          </aside>
        </div>

        <IndicatorExplanationModal open={indicatorOpen} onClose={() => setIndicatorOpen(false)} />
        <Modal
          title="任务详情"
          open={Boolean(selectedTask)}
          footer={null}
          onCancel={() => setSelectedTask(null)}
          width={560}
        >
          {selectedTask ? (
            <div className={styles.taskModalBody}>
              <h3>{selectedTask.title}</h3>
              <p>{selectedTask.detail}</p>
              <dl>
                <div>
                  <dt>责任工作组</dt>
                  <dd>{selectedTask.workgroup}</dd>
                </div>
                <div>
                  <dt>责任单位</dt>
                  <dd>{selectedTask.unit}</dd>
                </div>
                <div>
                  <dt>截止时间</dt>
                  <dd>{selectedTask.deadline}</dd>
                </div>
                <div>
                  <dt>状态</dt>
                  <dd>{selectedTask.status}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </Modal>
      </div>
    </AppLayout>
  )
}

export default StatisticsCenterPage
