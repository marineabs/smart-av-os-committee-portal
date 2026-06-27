const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const taskStatusNames = ['已完成', '进行中', '未开始', '已逾期']
const standardStages = ['立项', '草案编制', '征求意见', '意见处理', '送审', '报批', '发布']
const accentCycle = ['blue', 'cyan', 'purple', 'orange']

function getList(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean)
  }

  return String(value ?? '')
    .split(/\n|\/|、|,|，/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseNumber(value) {
  const match = String(value ?? '').match(/\d+/)
  return match ? Number(match[0]) : 0
}

function parseRecordDate(record, keys) {
  for (const key of keys) {
    const rawValue = record?.[key]
    if (!rawValue) {
      continue
    }

    const date = new Date(String(rawValue).replace(' ', 'T'))
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return null
}

function isSameMonth(date, referenceDate) {
  return Boolean(date) && date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth()
}

function isSameYear(date, referenceDate) {
  return Boolean(date) && date.getFullYear() === referenceDate.getFullYear()
}

function isSameQuarter(date, referenceDate) {
  if (!date || date.getFullYear() !== referenceDate.getFullYear()) {
    return false
  }

  return Math.floor(date.getMonth() / 3) === Math.floor(referenceDate.getMonth() / 3)
}

function matchesTimeRange(record, filters, keys) {
  if (!filters?.timeRange || filters.timeRange === '自定义') {
    return true
  }

  const date = parseRecordDate(record, keys)
  if (!date) {
    return true
  }

  const referenceDate = new Date()
  if (filters.timeRange === '本月') {
    return isSameMonth(date, referenceDate)
  }
  if (filters.timeRange === '本季度') {
    return isSameQuarter(date, referenceDate)
  }
  if (filters.timeRange === '本年度') {
    return isSameYear(date, referenceDate)
  }

  return true
}

function normalizeCategory(label) {
  const text = String(label ?? '')
  if (text.includes('技术方案') || text.includes('方案')) return '技术方案'
  if (text.includes('会议')) return '会议资料'
  if (text.includes('标准')) return '标准规范'
  if (text.includes('接口')) return '接口规范'
  if (text.includes('测试') || text.includes('认证')) return '测试认证'
  if (text.includes('成果')) return '成果资料'
  if (text.includes('制度')) return '制度文件'
  return text || '未分类'
}

function countBy(items, getKey) {
  const counts = new Map()
  for (const item of items) {
    const key = getKey(item)
    if (!key) {
      continue
    }
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function mapCounts(counts) {
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function uniqueValues(values) {
  return Array.from(new Set(values.map(String).map((item) => item.trim()).filter(Boolean)))
}

function hasSelectedWorkgroup(record, selectedWorkgroup) {
  if (!selectedWorkgroup || selectedWorkgroup === '全部工作组') {
    return true
  }

  return [
    record?.workgroup,
    record?.group,
    record?.groupName,
    record?.name,
    ...getList(record?.workgroups),
  ].filter(Boolean).includes(selectedWorkgroup)
}

function hasSelectedMember(record, selectedMember) {
  if (!selectedMember || selectedMember === '全部成员单位') {
    return true
  }

  return [
    record?.name,
    record?.uploader,
    record?.ownerUnit,
    record?.unit,
    record?.leaderUnit,
    ...getList(record?.memberUnits),
    ...getList(record?.invitedOrganizations),
  ].filter(Boolean).includes(selectedMember)
}

function filterByScope(records, filters, dateKeys) {
  return records.filter((record) => (
    hasSelectedWorkgroup(record, filters.workgroup) &&
    hasSelectedMember(record, filters.memberUnit) &&
    matchesTimeRange(record, filters, dateKeys)
  ))
}

function buildFilterOptions({ workgroups, organizations, files, meetings, members }) {
  const committees = uniqueValues(workgroups.map((item) => item.committee))
  const workgroupNames = uniqueValues([
    ...workgroups.map((item) => item.name),
    ...files.map((item) => item.workgroup),
    ...meetings.map((item) => item.workgroup),
    ...members.flatMap((item) => getList(item.workgroups)),
  ])
  const memberUnits = uniqueValues([
    ...organizations.map((item) => item.name),
    ...members.map((item) => item.name),
    ...files.map((item) => item.uploader),
    ...meetings.map((item) => item.ownerUnit),
    ...meetings.flatMap((item) => getList(item.invitedOrganizations)),
    ...workgroups.flatMap((item) => getList(item.memberUnits)),
  ])

  return {
    timeRanges: ['本月', '本季度', '本年度', '自定义'],
    committees: ['全部分委会', ...committees],
    workgroups: ['全部工作组', ...workgroupNames],
    memberUnits: ['全部成员单位', ...memberUnits],
  }
}

function buildOverviewMetrics({ workgroups, organizations, files, meetings, supervision, archive }) {
  const uniqueMembers = uniqueValues([
    ...organizations.map((item) => item.name),
    ...files.map((item) => item.uploader),
    ...meetings.map((item) => item.ownerUnit),
    ...meetings.flatMap((item) => getList(item.invitedOrganizations)),
  ])
  const uniqueWorkgroups = uniqueValues([
    ...workgroups.map((item) => item.name),
    ...files.map((item) => item.workgroup),
    ...meetings.map((item) => item.workgroup),
  ])
  const overdueTasks = supervision.reduce((total, item) => total + (String(item.tasks ?? '').includes('逾期') ? parseNumber(item.tasks) : 0), 0)
  const taskTotal = supervision.reduce((total, item) => total + parseNumber(item.tasks), 0)
  const archivedResults = archive.filter((item) => String(item.status ?? '').includes('归档')).length
  const standardProjects = archive.filter((item) => String(item.category ?? item.item ?? '').includes('标准')).length
  const completedTasks = Math.max(taskTotal - overdueTasks, 0)
  const completionRate = taskTotal ? Math.round((completedTasks / taskTotal) * 100) : 0
  const activeMembers = uniqueValues([
    ...files.map((item) => item.uploader),
    ...meetings.map((item) => item.ownerUnit),
    ...meetings.flatMap((item) => getList(item.invitedOrganizations)),
  ]).length
  const activeRate = uniqueMembers.length ? Math.round((activeMembers / uniqueMembers.length) * 100) : 0

  return [
    { id: 'members', title: '成员单位总数', value: uniqueMembers.length, unit: '家', note: '来自成员与协同记录' },
    { id: 'workgroups', title: '工作组数量', value: uniqueWorkgroups.length, unit: '个', note: '来自工作组记录' },
    { id: 'files', title: '文件资料总数', value: files.length, unit: '份', note: '来自文件资料记录' },
    { id: 'meetings', title: '会议活动总数', value: meetings.length, unit: '场', note: '来自会议记录' },
    { id: 'tasks', title: '任务事项总数', value: taskTotal, unit: '项', note: `完成率 ${completionRate}%`, progress: completionRate },
    { id: 'standards', title: '标准项目数量', value: standardProjects, unit: '项', note: '来自归档/标准记录' },
    { id: 'achievements', title: '成果资料数量', value: archivedResults, unit: '项', note: '来自归档完成记录' },
    { id: 'activeMembers', title: '活跃成员单位', value: activeMembers, unit: '家', note: `占比 ${activeRate}%`, progress: activeRate },
  ].map((metric, index) => ({
    ...metric,
    value: metric.value.toLocaleString('zh-CN'),
    accent: accentCycle[index % accentCycle.length],
  }))
}

function buildMonthTrend(records, keys) {
  const counts = new Array(12).fill(0)
  for (const record of records) {
    const date = parseRecordDate(record, keys)
    if (date) {
      counts[date.getMonth()] += 1
    }
  }

  return monthLabels.map((month, index) => ({ month, value: counts[index] }))
}

function buildTaskStatus(supervision) {
  const overdue = supervision.reduce((total, item) => total + (String(item.tasks ?? '').includes('逾期') ? parseNumber(item.tasks) : 0), 0)
  const total = supervision.reduce((sum, item) => sum + parseNumber(item.tasks), 0)
  const inProgress = Math.max(total - overdue, 0)

  return [
    { name: '已完成', value: 0 },
    { name: '进行中', value: inProgress },
    { name: '未开始', value: 0 },
    { name: '已逾期', value: overdue },
  ].filter((item) => item.value > 0 || taskStatusNames.includes(item.name))
}

function buildStandardProgress(archive) {
  const counts = new Map(standardStages.map((stage) => [stage, 0]))
  for (const item of archive) {
    if (!String(item.category ?? item.item ?? '').includes('标准')) {
      continue
    }

    const status = String(item.status ?? '')
    const stage = status.includes('归档') || status.includes('发布')
      ? '发布'
      : status.includes('审核') || status.includes('送审')
        ? '送审'
        : status.includes('意见')
          ? '征求意见'
          : '立项'
    counts.set(stage, (counts.get(stage) ?? 0) + 1)
  }

  return standardStages.map((name) => ({ name, value: counts.get(name) ?? 0 }))
}

function buildMemberRanks({ organizations, members, files, meetings, supervision }) {
  const units = uniqueValues([
    ...organizations.map((item) => item.name),
    ...members.map((item) => item.name),
    ...files.map((item) => item.uploader),
    ...meetings.map((item) => item.ownerUnit),
    ...meetings.flatMap((item) => getList(item.invitedOrganizations)),
  ])

  return units.map((unit) => {
    const meetingCount = meetings.filter((item) => item.ownerUnit === unit || getList(item.invitedOrganizations).includes(unit)).length
    const fileCount = files.filter((item) => item.uploader === unit).length
    const feedbackCount = files.reduce((total, item) => total + (Array.isArray(item.comments) && item.uploader === unit ? item.comments.length : 0), 0)
    const taskCount = supervision.filter((item) => item.owner === unit || item.leader === unit).reduce((total, item) => total + parseNumber(item.tasks), 0)
    const score = Math.min(100, meetingCount * 8 + fileCount * 4 + feedbackCount * 2 + taskCount * 5)

    return { unit, meetings: meetingCount, files: fileCount, feedback: feedbackCount, tasks: taskCount, score }
  })
    .filter((item) => item.meetings || item.files || item.feedback || item.tasks || item.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

function buildHotFiles(files) {
  return files
    .map((file, index) => ({
      rank: index + 1,
      title: String(file.title ?? file.name ?? '未命名资料'),
      type: normalizeCategory(file.categoryLabel ?? file.category ?? file.type),
      workgroup: String(file.workgroup ?? ''),
      views: Number(file.views ?? file.viewCount ?? 0),
      downloads: Number(file.downloads ?? file.downloadCount ?? 0),
    }))
    .sort((a, b) => b.views + b.downloads - (a.views + a.downloads))
    .slice(0, 5)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

function buildOverdueTasks(supervision, workgroups) {
  const records = [...supervision, ...workgroups]
  return records
    .filter((item) => String(item.tasks ?? item.taskStatus ?? '').includes('逾期'))
    .slice(0, 4)
    .map((item, index) => ({
      id: String(item.key ?? item.id ?? `task-${index}`),
      title: `工作组任务提醒：${item.group ?? item.groupName ?? item.name ?? '未命名事项'}`,
      workgroup: String(item.group ?? item.groupName ?? item.name ?? ''),
      unit: String(item.owner ?? item.leaderUnit ?? item.leader ?? ''),
      deadline: String(item.updatedAt ?? item.updatedAtText ?? ''),
      status: '已逾期',
      detail: String(item.tasks ?? item.taskStatus ?? '存在逾期事项，请查看工作组监管记录。'),
    }))
}

export function buildAnalyticsSummary({
  filters = {},
  workgroups = [],
  organizations = [],
  supervision = [],
  archive = [],
  files = [],
  meetings = [],
  members = [],
} = {}) {
  const committeeWorkgroups = filters.committee && filters.committee !== '全部分委会'
    ? workgroups.filter((item) => item.committee === filters.committee).map((item) => item.name)
    : []
  const scopedWorkgroupFilter = committeeWorkgroups.length && (!filters.workgroup || filters.workgroup === '全部工作组')
    ? { ...filters, workgroup: undefined }
    : filters

  const scopedFiles = filterByScope(files, scopedWorkgroupFilter, ['updatedAt', 'createdAt'])
    .filter((item) => !committeeWorkgroups.length || committeeWorkgroups.includes(item.workgroup))
  const scopedMeetings = filterByScope(meetings, scopedWorkgroupFilter, ['time', 'updatedAt'])
    .filter((item) => !committeeWorkgroups.length || committeeWorkgroups.includes(item.workgroup))
  const scopedMembers = filterByScope(members, scopedWorkgroupFilter, ['updatedAt', 'joinedAt'])
  const scopedWorkgroups = filterByScope(workgroups, scopedWorkgroupFilter, ['updatedAt', 'updatedAtText'])
    .filter((item) => !filters.committee || filters.committee === '全部分委会' || item.committee === filters.committee)
  const scopedOrganizations = filterByScope(organizations, scopedWorkgroupFilter, ['joinedAt', 'updatedAt'])
  const scopedSupervision = filterByScope(supervision, scopedWorkgroupFilter, ['updatedAt', 'updatedAtText'])
  const scopedArchive = filterByScope(archive, scopedWorkgroupFilter, ['updatedAt', 'updatedAtText'])

  const workgroupCounts = countBy([
    ...scopedFiles,
    ...scopedMeetings,
    ...scopedMembers.flatMap((item) => getList(item.workgroups).map((workgroup) => ({ workgroup }))),
  ], (item) => item.workgroup)
  const categoryCounts = countBy(scopedFiles, (item) => normalizeCategory(item.categoryLabel ?? item.category ?? item.type))
  const monthlyFiles = scopedFiles.filter((item) => isSameMonth(parseRecordDate(item, ['updatedAt', 'createdAt']), new Date())).length
  const monthlyMeetings = scopedMeetings.filter((item) => isSameMonth(parseRecordDate(item, ['time', 'updatedAt']), new Date())).length
  const overdueTasks = buildOverdueTasks(scopedSupervision, scopedWorkgroups)
  const totalTasks = scopedSupervision.reduce((sum, item) => sum + parseNumber(item.tasks), 0)
  const completedTasks = Math.max(totalTasks - overdueTasks.length, 0)
  const standardProjects = scopedArchive.filter((item) => String(item.category ?? item.item ?? '').includes('标准')).length
  const activeMembers = uniqueValues([
    ...scopedFiles.map((item) => item.uploader),
    ...scopedMeetings.map((item) => item.ownerUnit),
    ...scopedMeetings.flatMap((item) => getList(item.invitedOrganizations)),
  ]).length

  return {
    filterOptions: buildFilterOptions({ workgroups, organizations, files, meetings, members }),
    overviewMetrics: buildOverviewMetrics({
      workgroups: scopedWorkgroups,
      organizations: scopedOrganizations,
      files: scopedFiles,
      meetings: scopedMeetings,
      supervision: scopedSupervision,
      archive: scopedArchive,
    }),
    workgroupActivityData: mapCounts(workgroupCounts),
    fileGrowthTrendData: buildMonthTrend(scopedFiles, ['updatedAt', 'createdAt']),
    fileTypeDistributionData: mapCounts(categoryCounts),
    taskStatusData: buildTaskStatus(scopedSupervision),
    meetingTrendData: buildMonthTrend(scopedMeetings, ['time', 'updatedAt']),
    standardProjectProgressData: buildStandardProgress(scopedArchive),
    memberParticipationRankData: buildMemberRanks({
      organizations: scopedOrganizations,
      members: scopedMembers,
      files: scopedFiles,
      meetings: scopedMeetings,
      supervision: scopedSupervision,
    }),
    hotFilesRankData: buildHotFiles(scopedFiles),
    overdueTasksData: overdueTasks,
    monthlySummaryItems: [
      `本月新增资料 ${monthlyFiles} 份`,
      `召开会议 ${monthlyMeetings} 场`,
      `完成任务 ${completedTasks} 项`,
      `新增标准项目 ${standardProjects} 项`,
      `活跃成员单位 ${activeMembers} 家`,
    ],
    focusIssueItems: [
      `有 ${overdueTasks.length} 项任务已逾期`,
      `${scopedOrganizations.filter((item) => String(item.status ?? '').includes('待')).length} 家单位信息待完善`,
      `${scopedArchive.filter((item) => String(item.status ?? '').includes('待')).length} 个标准项目进度滞后`,
      `${scopedWorkgroups.filter((group) => !scopedFiles.some((file) => file.workgroup === group.name)).length} 个工作组本月无资料更新`,
    ],
  }
}
