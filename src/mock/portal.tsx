import {
  ApiOutlined,
  ApartmentOutlined,
  AuditOutlined,
  BookOutlined,
  ClusterOutlined,
  CloudOutlined,
  DeploymentUnitOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FormOutlined,
  FundProjectionScreenOutlined,
  NotificationOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type {
  ActivityItem,
  DocumentItem,
  HeroAction,
  HeroFloatingTag,
  NavItem,
  PlaceholderPageItem,
  QuickEntryItem,
  StatisticItem,
  UserProfile,
} from '../types/portal'

export const platformTitle = '智慧视听操作系统专委会'
export const platformSubtitle = '协同工作平台'

export const currentUser: UserProfile = {
  name: '张伟',
  role: '秘书处管理员',
  avatarText: '张',
}

export const navItems: NavItem[] = [
  { key: 'home', label: '首页门户', path: '/', icon: 'home' },
  { key: 'workspace', label: '工作组空间', path: '/workgroups', icon: 'groups' },
  { key: 'knowledge', label: '文件与知识中心', path: '/knowledge-center', icon: 'knowledge' },
  { key: 'members', label: '会员管理中心', path: '/members', icon: 'members' },
  { key: 'meetings', label: '会议中心', path: '/meetings', icon: 'meetings' },
  { key: 'tasks', label: '任务与事项中心', path: '/tasks', icon: 'tasks' },
  { key: 'standards', label: '标准与规范协同', path: '/standards', icon: 'standards' },
  { key: 'search', label: '搜索中心', path: '/search-center', icon: 'search' },
  { key: 'analytics', label: '统计分析中心', path: '/analytics', icon: 'analytics' },
  { key: 'settings', label: '系统管理中心', path: '/system', icon: 'settings' },
]

export const heroActions: HeroAction[] = [
  { label: '开放协同', icon: <DeploymentUnitOutlined /> },
  { label: '标准引领', icon: <AuditOutlined /> },
  { label: '技术共建', icon: <ApiOutlined /> },
  { label: '生态共赢', icon: <CloudOutlined /> },
]

export const heroFeatureTags = ['视听终端', '媒体框架', '接口规范', '测试认证', 'AI 智能体']

export const heroFloatingTags: HeroFloatingTag[] = [
  { label: '媒体框架', top: '18%', left: '18%' },
  { label: '接口规范', top: '45%', left: '24%' },
  { label: '测试认证', top: '63%', right: '4%' },
  { label: 'AI 智能体', top: '16%', right: '18%' },
]

export const statistics: StatisticItem[] = [
  {
    title: '成员单位数量',
    value: '128',
    unit: '家',
    trendText: '较上月 ↑12',
    trendDirection: 'up',
    icon: <TeamOutlined />,
    accent: 'linear-gradient(135deg, #2d75ff 0%, #4fa8ff 100%)',
  },
  {
    title: '工作组数量',
    value: '13',
    unit: '个',
    trendText: '较上月持平',
    trendDirection: 'flat',
    icon: <ClusterOutlined />,
    accent: 'linear-gradient(135deg, #725cff 0%, #9a6fff 100%)',
  },
  {
    title: '技术资料数量',
    value: '1,362',
    unit: '份',
    trendText: '较上月 ↑86',
    trendDirection: 'up',
    icon: <FolderOpenOutlined />,
    accent: 'linear-gradient(135deg, #18c3c8 0%, #2ed39e 100%)',
  },
  {
    title: '本月会议数量',
    value: '18',
    unit: '场',
    trendText: '较上月 ↑3',
    trendDirection: 'up',
    icon: <ScheduleOutlined />,
    accent: 'linear-gradient(135deg, #ff9b2f 0%, #ffc04a 100%)',
  },
  {
    title: '待办事项数量',
    value: '32',
    unit: '项',
    trendText: '较上月 ↓5',
    trendDirection: 'down',
    icon: <FormOutlined />,
    accent: 'linear-gradient(135deg, #3173ff 0%, #63a0ff 100%)',
  },
  {
    title: '标准项目数量',
    value: '27',
    unit: '项',
    trendText: '较上月 ↑2',
    trendDirection: 'up',
    icon: <ReadOutlined />,
    accent: 'linear-gradient(135deg, #14b864 0%, #42d58d 100%)',
  },
]

export const latestNotices = [
  { title: '关于召开技术标准组第五次工作会议的通知', date: '05-19' },
  { title: '智慧视听操作系统接口规范草案（V0.5）征求意见通知', date: '05-18' },
  { title: '关于组织开展2025年测试认证方案评审的通知', date: '05-16' },
  { title: '专委会2025年上半年工作总结和下半年计划', date: '05-15' },
  { title: '关于补充征集标准项目建议的通知', date: '05-14' },
]

export const latestDocuments: DocumentItem[] = [
  { title: '智慧视听操作系统总体架构方案 V1.0', date: '05-20', type: 'pdf' },
  { title: '接口规范草案 V0.5', date: '05-19', type: 'word' },
  { title: '一体化电视终端适配技术方案', date: '05-18', type: 'pdf' },
  { title: '测试认证报告（2025Q1）', date: '05-16', type: 'excel' },
  { title: '技术标准组第四次工作会议纪要', date: '05-14', type: 'minutes' },
]

export const workgroupActivities: ActivityItem[] = [
  {
    group: '技术标准组',
    summary: '发布了《接口规范草案 V0.5》',
    time: '2小时前',
    accent: '#2a70ff',
  },
  {
    group: '测试认证组',
    summary: '更新了《测试认证计划（2025版）》',
    time: '5小时前',
    accent: '#18be98',
  },
  {
    group: 'AI与智能体组',
    summary: '创建了新任务《智能体能力框架调研》',
    time: '昨天 15:30',
    accent: '#7b61ff',
  },
  {
    group: '架构与内核组',
    summary: '更新了文档《内核模块解耦方案》',
    time: '昨天 10:20',
    accent: '#ff9a2f',
  },
  {
    group: '安全可信组',
    summary: '发布了新通知《安全评估流程说明》',
    time: '05-18',
    accent: '#12b5d0',
  },
]

export const quickEntries: QuickEntryItem[] = [
  { title: '总体架构', path: '/overview/architecture', icon: 'architecture', accent: 'linear-gradient(135deg, #3c7cff 0%, #5ea8ff 100%)' },
  { title: '接口规范', path: '/overview/interface', icon: 'interface', accent: 'linear-gradient(135deg, #16b7d8 0%, #3fd6b1 100%)' },
  { title: '终端适配', path: '/overview/terminal', icon: 'terminal', accent: 'linear-gradient(135deg, #6f56ff 0%, #9e7dff 100%)' },
  { title: '测试认证', path: '/overview/testing', icon: 'testing', accent: 'linear-gradient(135deg, #2f73ff 0%, #5f9dff 100%)' },
  { title: '标准项目', path: '/overview/projects', icon: 'project', accent: 'linear-gradient(135deg, #ff982e 0%, #ffbc47 100%)' },
  { title: 'AI智能体', path: '/overview/ai-agent', icon: 'ai', accent: 'linear-gradient(135deg, #7a5dff 0%, #a084ff 100%)' },
  { title: '媒体框架', path: '/overview/media-framework', icon: 'media', accent: 'linear-gradient(135deg, #17c5c7 0%, #3edb9e 100%)' },
  { title: '产业推广', path: '/overview/promotion', icon: 'promotion', accent: 'linear-gradient(135deg, #12b5d0 0%, #1fd3c0 100%)' },
]

export const placeholderPages: PlaceholderPageItem[] = [
  {
    path: '/workgroups',
    title: '工作组空间',
    description: '按工作组组织协同任务、资料沉淀、通知共享与专题推进。',
  },
  {
    path: '/knowledge-center',
    title: '文件与知识中心',
    description: '统一管理方案文档、规范草案、测试报告、会议纪要与知识资产。',
  },
  {
    path: '/members',
    title: '会员管理中心',
    description: '维护成员单位、联系人、参与角色与协同权限信息。',
  },
  {
    path: '/meetings',
    title: '会议中心',
    description: '展示会议通知、议程安排、会议纪要和历史归档。',
  },
  {
    path: '/tasks',
    title: '任务与事项中心',
    description: '用于跟踪专题事项、责任分工、节点计划和执行反馈。',
  },
  {
    path: '/standards',
    title: '标准与规范协同',
    description: '聚合标准项目、接口规范、评审状态和意见征集流程。',
  },
  {
    path: '/search-center',
    title: '搜索中心',
    description: '提供跨通知、资料、会议、成员和工作组的统一搜索入口。',
  },
  {
    path: '/analytics',
    title: '统计分析中心',
    description: '通过统计看板分析资料沉淀、协作活跃度和专题推进情况。',
  },
  {
    path: '/system',
    title: '系统管理中心',
    description: '配置平台基础信息、菜单权限、消息规则和系统参数。',
  },
  {
    path: '/notices',
    title: '通知公告',
    description: '查看平台全部通知公告和征求意见信息。',
  },
  {
    path: '/documents',
    title: '技术资料',
    description: '浏览最新上传的技术资料、报告、纪要和规范文档。',
  },
  {
    path: '/activities',
    title: '工作组动态',
    description: '查看各工作组发布、更新与任务协同的最新动态。',
  },
  {
    path: '/overview/architecture',
    title: '总体架构',
    description: '展示智慧视听操作系统总体架构、关键能力和演进路线。',
  },
  {
    path: '/overview/interface',
    title: '接口规范',
    description: '汇总接口规范草案、评审意见和版本发布信息。',
  },
  {
    path: '/overview/terminal',
    title: '终端适配',
    description: '管理不同终端的适配方案、兼容性要求和落地实践。',
  },
  {
    path: '/overview/testing',
    title: '测试认证',
    description: '归档测试计划、认证流程、测试报告和能力验证结果。',
  },
  {
    path: '/overview/projects',
    title: '标准项目',
    description: '跟踪标准项目立项、编制、评审和发布全流程。',
  },
  {
    path: '/overview/ai-agent',
    title: 'AI智能体',
    description: '沉淀智能体能力框架、协同应用和实验性专题研究。',
  },
  {
    path: '/overview/media-framework',
    title: '媒体框架',
    description: '汇总媒体框架能力、播放器特性和底层接口策略。',
  },
  {
    path: '/overview/promotion',
    title: '产业推广',
    description: '记录生态合作、试点推广、宣贯培训和成果展示内容。',
  },
]

export const placeholderHighlights = [
  { label: '统一门户', icon: <ApartmentOutlined /> },
  { label: '协同治理', icon: <TeamOutlined /> },
  { label: '资料沉淀', icon: <BookOutlined /> },
  { label: '搜索联动', icon: <FileSearchOutlined /> },
  { label: '通知触达', icon: <NotificationOutlined /> },
  { label: '成果展示', icon: <FundProjectionScreenOutlined /> },
  { label: '测试认证', icon: <SafetyCertificateOutlined /> },
]
