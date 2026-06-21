export interface DemoTaskStat {
  id: string
  title: string
  value: string
  unit: string
  delta: string
  accent: string
  icon: 'task' | 'progress' | 'review' | 'done'
}

export interface DemoTaskRecord {
  id: string
  title: string
  workgroup: string
  owner: string
  deadline: string
  progress: number
  status: '进行中' | '待反馈' | '待评审' | '已完成'
  priority: '高' | '中' | '低'
}

export const taskStats: DemoTaskStat[] = [
  { id: 'ts-1', title: '进行中任务', value: '18', unit: '项', delta: '较上周 +4', accent: 'linear-gradient(135deg, #2d75ff 0%, #5aa1ff 100%)', icon: 'task' },
  { id: 'ts-2', title: '平均进度', value: '68', unit: '%', delta: '较上周 +9%', accent: 'linear-gradient(135deg, #18c2c8 0%, #35d59f 100%)', icon: 'progress' },
  { id: 'ts-3', title: '待评审事项', value: '6', unit: '项', delta: '较上周 -2', accent: 'linear-gradient(135deg, #ff982e 0%, #ffc34f 100%)', icon: 'review' },
  { id: 'ts-4', title: '已闭环任务', value: '24', unit: '项', delta: '较上周 +5', accent: 'linear-gradient(135deg, #6f58ff 0%, #9b84ff 100%)', icon: 'done' },
]

export const demoTasks: DemoTaskRecord[] = [
  {
    id: 'task-1',
    title: '整理接口能力清单演示版',
    workgroup: '技术标准组',
    owner: '李明',
    deadline: '2026-06-27',
    progress: 82,
    status: '进行中',
    priority: '高',
  },
  {
    id: 'task-2',
    title: '输出终端联调问题归类表',
    workgroup: '测试验证组',
    owner: '周航',
    deadline: '2026-06-25',
    progress: 64,
    status: '待反馈',
    priority: '高',
  },
  {
    id: 'task-3',
    title: '完善示范场景汇报提纲',
    workgroup: '产业推进组',
    owner: '高宁',
    deadline: '2026-06-26',
    progress: 56,
    status: '待评审',
    priority: '中',
  },
  {
    id: 'task-4',
    title: '归档六月会议纪要模板',
    workgroup: '秘书处',
    owner: '张伟',
    deadline: '2026-06-22',
    progress: 100,
    status: '已完成',
    priority: '低',
  },
]

export const taskKanbanSummary = [
  { status: '进行中', count: 8 },
  { status: '待反馈', count: 5 },
  { status: '待评审', count: 6 },
  { status: '已完成', count: 11 },
]
