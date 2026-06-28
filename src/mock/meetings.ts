export interface DemoMeetingStat {
  id: string
  title: string
  value: string
  unit: string
  delta: string
  accent: string
  icon: 'calendar' | 'team' | 'clock' | 'file'
}

export interface DemoMeetingParticipant {
  id: string
  unit: string
  representative: string
  role: '主持' | '汇报' | '参会' | '列席'
  attended: boolean
  speakCount: number
  materials: number
  actionItems: number
  contributionScore: number
  notes: string
}

export interface DemoMeetingRecord {
  id: string
  title: string
  workgroup: string
  ownerUnit: string
  time: string
  location: string
  status: '即将开始' | '报名中' | '已结束'
  visibility: 'public' | 'workgroup' | 'invited' | 'management'
  invitedOrganizations: string[]
  agendaCount: number
  attendees: number
  minutesStatus: '待整理' | '已归档' | '无需纪要'
  minutesSummary: string
  decisions: string[]
  actionItems: string[]
  summary: string
  participants?: DemoMeetingParticipant[]
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
    visibility: 'workgroup',
    invitedOrganizations: ['星河视研院', '华域视联', '智芯微电子'],
    agendaCount: 5,
    attendees: 18,
    minutesStatus: '待整理',
    minutesSummary: '会议纪要正在由技术标准组秘书整理，完成后将同步到会议中心和资料归档。',
    decisions: ['接口能力清单按模块拆分评审', '术语表需与标准草案保持一致'],
    actionItems: ['华域视联补充终端侧接口示例', '星河视研院汇总版本发布依赖'],
    summary: '讨论接口能力清单、术语口径和版本发布节奏。',
    participants: [
      { id: 'mp-1-1', unit: '华域视联', representative: '李工', role: '汇报', attended: true, speakCount: 4, materials: 2, actionItems: 1, contributionScore: 88, notes: '补充终端侧接口示例' },
      { id: 'mp-1-2', unit: '星河视研院', representative: '周老师', role: '主持', attended: true, speakCount: 5, materials: 1, actionItems: 1, contributionScore: 92, notes: '统筹术语表和版本依赖' },
      { id: 'mp-1-3', unit: '智芯微电子', representative: '王经理', role: '参会', attended: true, speakCount: 2, materials: 0, actionItems: 0, contributionScore: 68, notes: '反馈芯片侧适配问题' },
    ],
  },
  {
    id: 'meeting-2',
    title: '测试验证组联调复盘会',
    workgroup: '测试验证组',
    ownerUnit: '玄盾测评',
    time: '2026-06-23 10:00',
    location: '联合测试间',
    status: '报名中',
    visibility: 'invited',
    invitedOrganizations: ['玄盾测评', '星河视研院', '华域视联'],
    agendaCount: 4,
    attendees: 12,
    minutesStatus: '待整理',
    minutesSummary: '联调复盘纪要待测试验证组确认问题闭环责任人后归档。',
    decisions: ['下一轮联调优先覆盖样机兼容性问题', '测试报告按问题等级补充分组说明'],
    actionItems: ['玄盾测评提交问题闭环清单', '星河视研院同步联调环境变更说明'],
    summary: '同步样机问题闭环、兼容结果与下一轮测试计划。',
    participants: [
      { id: 'mp-2-1', unit: '玄盾测评', representative: '赵晨', role: '主持', attended: true, speakCount: 5, materials: 2, actionItems: 1, contributionScore: 90, notes: '输出问题闭环清单' },
      { id: 'mp-2-2', unit: '星河视研院', representative: '周老师', role: '汇报', attended: true, speakCount: 3, materials: 1, actionItems: 1, contributionScore: 82, notes: '同步联调环境变更' },
      { id: 'mp-2-3', unit: '华域视联', representative: '李工', role: '参会', attended: false, speakCount: 0, materials: 0, actionItems: 0, contributionScore: 0, notes: '请假，待补充书面意见' },
    ],
  },
  {
    id: 'meeting-3',
    title: '产业推进组示范场景研讨会',
    workgroup: '产业推进组',
    ownerUnit: '灵境智能',
    time: '2026-06-20 15:30',
    location: '成果展示厅',
    status: '已结束',
    visibility: 'public',
    invitedOrganizations: ['灵境智能', '星瀚内容', '华域视联'],
    agendaCount: 3,
    attendees: 16,
    minutesStatus: '已归档',
    minutesSummary: '会议确认示范场景分为家庭视听、车载协同和公共服务三类，并要求各试点单位按统一模板补充成果材料。',
    decisions: ['试点演示路线采用“三类场景、两阶段交付”方案', '成果汇报材料统一使用秘书处模板'],
    actionItems: ['灵境智能完善场景演示脚本', '星瀚内容补充内容生态合作清单'],
    summary: '审阅试点场景演示路线和成果汇报材料结构。',
    participants: [
      { id: 'mp-3-1', unit: '灵境智能', representative: '陈璐', role: '主持', attended: true, speakCount: 4, materials: 2, actionItems: 1, contributionScore: 91, notes: '完善场景演示脚本' },
      { id: 'mp-3-2', unit: '星瀚内容', representative: '何然', role: '汇报', attended: true, speakCount: 3, materials: 1, actionItems: 1, contributionScore: 80, notes: '补充内容生态合作清单' },
      { id: 'mp-3-3', unit: '华域视联', representative: '李工', role: '参会', attended: true, speakCount: 1, materials: 0, actionItems: 0, contributionScore: 55, notes: '参与场景路线讨论' },
    ],
  },
  {
    id: 'meeting-4',
    title: '架构与内核组方案评审会',
    workgroup: '架构与内核组',
    ownerUnit: '星河视研院',
    time: '2026-06-18 09:30',
    location: '线上会议室 B',
    status: '已结束',
    visibility: 'workgroup',
    invitedOrganizations: ['星河视研院', '华域视联'],
    agendaCount: 6,
    attendees: 20,
    minutesStatus: '已归档',
    minutesSummary: '会议明确总体架构分层、核心模块边界和联调依赖关系，要求各责任单位在下一轮评审前补齐接口说明。',
    decisions: ['总体架构按基础层、能力层、应用层展开', '内核能力边界以当前演示版本为基准冻结'],
    actionItems: ['星河视研院输出架构图修订版', '华域视联补充跨模块调用说明'],
    summary: '确认总体演示架构、模块边界和联调依赖。',
    participants: [
      { id: 'mp-4-1', unit: '星河视研院', representative: '孙昊', role: '主持', attended: true, speakCount: 6, materials: 2, actionItems: 1, contributionScore: 95, notes: '输出架构图修订版' },
      { id: 'mp-4-2', unit: '华域视联', representative: '李工', role: '汇报', attended: true, speakCount: 4, materials: 1, actionItems: 1, contributionScore: 86, notes: '补充跨模块调用说明' },
    ],
  },
  {
    id: 'meeting-5',
    title: '秘书处月度会议统筹会',
    workgroup: '秘书处',
    ownerUnit: '专委会秘书处',
    time: '2026-06-26 09:30',
    location: '秘书处会议室',
    status: '即将开始',
    visibility: 'management',
    invitedOrganizations: ['专委会秘书处'],
    agendaCount: 7,
    attendees: 9,
    minutesStatus: '待整理',
    minutesSummary: '秘书处会议纪要待内部复核后发布，仅管理员可查看完整管理会议。',
    decisions: ['建立跨组会议窗口周报机制', '本月纪要归档进度纳入后台巡检'],
    actionItems: ['秘书处汇总各组会议计划', '平台运维组补充归档提醒配置'],
    summary: '统筹各工作组会议窗口、纪要归档进度和跨组协同事项。',
    participants: [
      { id: 'mp-5-1', unit: '专委会秘书处', representative: '张伟', role: '主持', attended: true, speakCount: 5, materials: 1, actionItems: 1, contributionScore: 90, notes: '汇总各组会议计划' },
      { id: 'mp-5-2', unit: '平台运维组', representative: '吴越', role: '参会', attended: true, speakCount: 2, materials: 0, actionItems: 1, contributionScore: 72, notes: '补充归档提醒配置' },
    ],
  },
  {
    id: 'meeting-6',
    title: '技术标准组接口草案评审会',
    workgroup: '技术标准组',
    ownerUnit: '星河视研院',
    time: '2026-06-27 15:00',
    location: '线上会议室 C',
    status: '报名中',
    visibility: 'invited',
    invitedOrganizations: ['星河视研院', '华域视联', '云帧研究院'],
    agendaCount: 4,
    attendees: 14,
    minutesStatus: '无需纪要',
    minutesSummary: '本场为草案沟通会，仅沉淀议程记录和评审意见清单，不单独生成正式纪要。',
    decisions: ['接口草案评审意见直接回填到标准草案修订表'],
    actionItems: ['云帧研究院提交 AI 能力接口意见', '星河视研院合并章节批注'],
    summary: '邀请标准草案核心编写单位确认接口章节修改意见。',
    participants: [
      { id: 'mp-6-1', unit: '云帧研究院', representative: '林博士', role: '汇报', attended: true, speakCount: 4, materials: 1, actionItems: 1, contributionScore: 86, notes: '提交 AI 能力接口意见' },
      { id: 'mp-6-2', unit: '星河视研院', representative: '周老师', role: '主持', attended: true, speakCount: 5, materials: 1, actionItems: 1, contributionScore: 90, notes: '合并章节批注' },
      { id: 'mp-6-3', unit: '华域视联', representative: '李工', role: '参会', attended: true, speakCount: 2, materials: 0, actionItems: 0, contributionScore: 62, notes: '确认终端侧修改影响' },
    ],
  },
]

export const meetingFocusList = [
  '管理员可查看全平台会议，工作组负责人查看本组和公开会议',
  '普通用户仅查看公开会议、本组会议以及本单位受邀会议',
  '会议统计、筛选条件和操作按钮会随当前用户权限自动收敛',
]
