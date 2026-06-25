import type { NoticeItem } from '../types/portal'

export interface DemoNoticeRecord extends NoticeItem {
  id: string
  category: '公告通知' | '会议通知' | '征求意见' | '任务提醒'
  publisher: string
}

export const demoNotices: DemoNoticeRecord[] = [
  {
    id: 'notice-1',
    title: '关于召开技术标准组六月专题例会的演示通知',
    date: '06-22',
    category: '会议通知',
    publisher: '秘书处',
  },
  {
    id: 'notice-2',
    title: '智慧视听操作系统接口清单演示稿征求意见',
    date: '06-21',
    category: '征求意见',
    publisher: '技术标准组',
  },
  {
    id: 'notice-3',
    title: '测试验证组演示环境联调安排',
    date: '06-20',
    category: '公告通知',
    publisher: '测试验证组',
  },
  {
    id: 'notice-4',
    title: '产业推进组示范场景汇报材料提交通知',
    date: '06-19',
    category: '任务提醒',
    publisher: '产业推进组',
  },
  {
    id: 'notice-5',
    title: '专委会演示平台本地示例数据更新说明',
    date: '06-18',
    category: '公告通知',
    publisher: '系统管理中心',
  },
]

export const latestNotices: NoticeItem[] = demoNotices.map(({ title, date }) => ({ title, date }))
