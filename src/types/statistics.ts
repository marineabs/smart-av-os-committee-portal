export type StatisticsTimeRange = '本月' | '本季度' | '本年度' | '自定义'

export interface StatisticsFilterState {
  timeRange: StatisticsTimeRange
  committee: string
  workgroup: string
  memberUnit: string
}

export interface OverviewMetric {
  id: string
  title: string
  value: string
  unit?: string
  note: string
  progress?: number
  accent: 'blue' | 'cyan' | 'purple' | 'orange'
}

export interface NameValueDatum {
  name: string
  value: number
}

export interface MonthValueDatum {
  month: string
  value: number
}

export interface MemberParticipationRank {
  rank: number
  unit: string
  meetings: number
  meetingContribution?: number
  attendanceRate?: number
  files: number
  feedback: number
  tasks: number
  score: number
}

export interface HotFileRank {
  rank: number
  title: string
  type: string
  workgroup: string
  views: number
  downloads: number
}

export interface OverdueTask {
  id: string
  title: string
  workgroup: string
  unit: string
  deadline: string
  status: '已逾期' | '临期'
  detail: string
}

export interface StatisticsFilterOptions {
  timeRanges: StatisticsTimeRange[]
  committees: string[]
  workgroups: string[]
  memberUnits: string[]
}

export interface StatisticsSummaryPayload {
  filterOptions: StatisticsFilterOptions
  overviewMetrics: OverviewMetric[]
  workgroupActivityData: NameValueDatum[]
  fileGrowthTrendData: MonthValueDatum[]
  fileTypeDistributionData: NameValueDatum[]
  taskStatusData: NameValueDatum[]
  meetingTrendData: MonthValueDatum[]
  standardProjectProgressData: NameValueDatum[]
  memberParticipationRankData: MemberParticipationRank[]
  hotFilesRankData: HotFileRank[]
  overdueTasksData: OverdueTask[]
  monthlySummaryItems: string[]
  focusIssueItems: string[]
}

export const statisticsFilterOptions: StatisticsFilterOptions = {
  timeRanges: ['本月', '本季度', '本年度', '自定义'],
  committees: ['全部分委会'],
  workgroups: ['全部工作组'],
  memberUnits: ['全部成员单位'],
}

export const defaultStatisticsFilters: StatisticsFilterState = {
  timeRange: '本月',
  committee: '全部分委会',
  workgroup: '全部工作组',
  memberUnit: '全部成员单位',
}

export const emptyStatisticsSummary: StatisticsSummaryPayload = {
  filterOptions: statisticsFilterOptions,
  overviewMetrics: [],
  workgroupActivityData: [],
  fileGrowthTrendData: [],
  fileTypeDistributionData: [],
  taskStatusData: [],
  meetingTrendData: [],
  standardProjectProgressData: [],
  memberParticipationRankData: [],
  hotFilesRankData: [],
  overdueTasksData: [],
  monthlySummaryItems: [],
  focusIssueItems: [],
}
