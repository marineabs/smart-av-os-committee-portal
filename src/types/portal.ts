import type { ReactNode } from 'react'

export type NavIconKey =
  | 'home'
  | 'groups'
  | 'knowledge'
  | 'members'
  | 'meetings'
  | 'tasks'
  | 'standards'
  | 'search'
  | 'analytics'
  | 'settings'

export type QuickIconKey =
  | 'architecture'
  | 'interface'
  | 'terminal'
  | 'testing'
  | 'project'
  | 'ai'
  | 'media'
  | 'promotion'

export type TrendDirection = 'up' | 'down' | 'flat'
export type FileKind = 'pdf' | 'word' | 'excel' | 'minutes' | 'ppt'

export interface NavItem {
  key: string
  label: string
  path: string
  icon: NavIconKey
}

export interface UserProfile {
  name: string
  role: string
  avatarText: string
}

export interface HeroAction {
  label: string
  icon: ReactNode
}

export interface HeroFloatingTag {
  label: string
  top: string
  left?: string
  right?: string
}

export interface StatisticItem {
  title: string
  value: string
  unit: string
  trendText: string
  trendDirection: TrendDirection
  icon: ReactNode
  accent: string
}

export interface NoticeItem {
  title: string
  date: string
}

export interface DocumentItem {
  title: string
  date: string
  type: FileKind
}

export interface ActivityItem {
  group: string
  summary: string
  time: string
  accent: string
}

export interface QuickEntryItem {
  title: string
  path: string
  icon: QuickIconKey
  accent: string
}

export interface PlaceholderPageItem {
  path: string
  title: string
  description: string
}

export type KnowledgeFileType = 'pdf' | 'docx' | 'xlsx' | 'pptx'
export type KnowledgeFileStatus =
  | '草稿版'
  | '征求意见版'
  | '会议讨论版'
  | '定稿版'
  | '发布版'
  | '归档版'
export type KnowledgePermissionLevel =
  | '公开资料'
  | '分委会资料'
  | '工作组资料'
  | '秘书处资料'
  | '敏感资料'
export type KnowledgeQuickFilter =
  | 'all'
  | 'visible'
  | 'favorite'
  | 'recent'
  | 'review'
  | 'comment'
  | 'version'

export interface KnowledgeStatItem {
  title: string
  value: string
  unit: string
  delta: string
  icon: ReactNode
  accent: string
}

export interface KnowledgeCategory {
  id: string
  label: string
  count: number
}

export interface KnowledgeTopic {
  id: string
  label: string
}

export interface KnowledgeFile {
  id: string
  title: string
  type: KnowledgeFileType
  categoryId: string
  categoryLabel: string
  workgroup: string
  version: string
  status: KnowledgeFileStatus
  permission: KnowledgePermissionLevel
  uploader: string
  updatedAt: string
  fileCode: string
  topicIds: string[]
  canView: boolean
  isFavorite: boolean
  hasNewVersion: boolean
  needsComment: boolean
  needsReview: boolean
  updatedThisMonth: boolean
}

export interface KnowledgeFilterOptions {
  workgroups: string[]
  uploaders: string[]
  statuses: KnowledgeFileStatus[]
  permissions: KnowledgePermissionLevel[]
}

export interface KnowledgeRecentItem {
  title: string
  uploader: string
  date: string
  type: KnowledgeFileType
}

export interface KnowledgePendingItem {
  id: string
  label: string
  count: number
}

export interface KnowledgeHotItem {
  id: string
  title: string
}

export interface KnowledgePermissionGuideItem {
  level: KnowledgePermissionLevel
  description: string
}

export type WorkgroupStatus = '活跃' | '重点推进' | '筹备中' | '待秘书处审核'
export type WorkgroupCategory =
  | 'all'
  | 'architecture'
  | 'media'
  | 'terminal'
  | 'standards'
  | 'testing'
  | 'ecosystem'
  | 'management'

export interface WorkgroupStatItem {
  title: string
  value: string
  unit: string
  delta: string
  icon: ReactNode
  accent: string
}

export interface WorkgroupFilterCategory {
  id: WorkgroupCategory
  label: string
}

export interface WorkgroupDirection {
  id: string
  label: string
}

export interface WorkgroupCardItem {
  id: string
  name: string
  positioning: string
  category: WorkgroupCategory
  directionIds: string[]
  tags: string[]
  leaderUnit: string
  deputyUnits: string[]
  memberUnitCount: number
  fileCount: number
  meetingCount: number
  taskCount: number
  latestUpdate: string
  status: WorkgroupStatus
  icon: ReactNode
  accent: string
}

export interface WorkgroupDynamicItem {
  id: string
  group: string
  summary: string
  time: string
  accent: string
}

export interface WorkgroupTaskProgressItem {
  id: string
  title: string
  progress: number
  status: '重点推进' | '进行中'
  accent: string
}

export interface WorkgroupActiveItem {
  id: string
  name: string
  score: string
  hint: string
}

export interface WorkgroupUnitOption {
  capabilities: string[]
  label: string
}

export interface WorkgroupContact {
  name: string
  org: string
  role: string
  phone: string
}

export interface WorkgroupTabItem {
  id: string
  items: string[]
  title: string
}

export interface WorkgroupDetailData {
  bannerDescription: string
  contacts: WorkgroupContact[]
  currentStatus: string
  dutyItems: string[]
  permissionNote: string
  projectLinks: string[]
  quickNotices: string[]
  sideTodos: string[]
  sideUpdates: WorkgroupDynamicItem[]
  stats: WorkgroupStatItem[]
  tabs: WorkgroupTabItem[]
}
