export interface DemoMeetingStat {
  id: string
  title: string
  value: string
  unit: string
  delta: string
  accent: string
  icon: 'calendar' | 'team' | 'clock' | 'file'
}

export interface DemoMeetingRecord {
  id: string
  title: string
  workgroup: string
  ownerUnit: string
  time: string
  location: string
  status: '即将开始' | '报名中' | '已结束'
  attendees: number
  summary: string
}

export const meetingStats: DemoMeetingStat[] = [
  { id: 'ms-1', title: '本月会议', value: '12', unit: '场', delta: '较上月 +3', accent: 'linear-gradient(135deg, #2d75ff 0%, #5aa1ff 100%)', icon: 'calendar' },
  { id: 'ms-2', title: '参会单位', value: '46', unit: '家', delta: '较上月 +8', accent: 'linear-gradient(135deg, #18c2c8 0%, #3cd6a4 100%)', icon: 'team' },
  { id: 'ms-3', title: '待纪要整理', value: '4', unit: '份', delta: '较上月 -1', accent: 'linear-gradient(135deg, #ff982e 0%, #ffc04d 100%)', icon: 'clock' },
  { id: 'ms-4', title: '已归档纪要', value: '28', unit: '份', delta: '较上月 +6', accent: 'linear-gradient(135deg, #6f58ff 0%, #9a82ff 100%)', icon: 'file' },
]

export const demoMeetings: DemoMeetingRecord[] = [
  {
    id: 'meeting-1',
    title: '技术标准组六月专题例会',
    workgroup: '技术标准组',
    ownerUnit: '华域视联',
    time: '2026-06-24 14:00',
    location: '线上会议室 A',
    status: '即将开始',
    attendees: 18,
    summary: '讨论接口能力清单、术语口径和版本发布节奏。',
  },
  {
    id: 'meeting-2',
    title: '测试验证组联调复盘会',
    workgroup: '测试验证组',
    ownerUnit: '玄盾测评',
    time: '2026-06-23 10:00',
    location: '联合测试间',
    status: '报名中',
    attendees: 12,
    summary: '同步样机问题闭环、兼容结果与下一轮测试计划。',
  },
  {
    id: 'meeting-3',
    title: '产业推进组示范场景研讨会',
    workgroup: '产业推进组',
    ownerUnit: '灵境智能',
    time: '2026-06-20 15:30',
    location: '成果展示厅',
    status: '已结束',
    attendees: 16,
    summary: '审阅试点场景演示路线和成果汇报材料结构。',
  },
  {
    id: 'meeting-4',
    title: '架构与内核组方案评审会',
    workgroup: '架构与内核组',
    ownerUnit: '星河视研院',
    time: '2026-06-18 09:30',
    location: '线上会议室 B',
    status: '已结束',
    attendees: 20,
    summary: '确认总体演示架构、模块边界和联调依赖。',
  },
]

export const meetingFocusList = [
  '统一会议通知、议程、签到和纪要归档的演示流程',
  '覆盖技术标准组、产业推进组、测试验证组三类典型协同场景',
  '全部数据来源于本地 mock，不依赖真实会议系统或外部接口',
]
