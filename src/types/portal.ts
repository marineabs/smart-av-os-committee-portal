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

export type UserRoleKey =
  | 'member'
  | 'workgroup_member'
  | 'organization_user'
  | 'workgroup_leader'
  | 'workgroup_deputy_leader'
  | 'workgroup_secretary'
  | 'committee_admin'
  | 'secretariat_admin'
  | 'platform_admin'

export interface UserProfile {
  name: string
  role: string
  avatarText: string
  roleKey?: UserRoleKey
  permissions?: string[]
  organizationName?: string
  currentWorkgroup?: string
  managementScope?: string
  tags?: string[]
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
  | '指定单位资料'
  | '秘书处资料'
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
  originalFileName?: string
  mimeType?: string
  fileSize?: number
  fileData?: string
  description?: string
  comments?: KnowledgeFileComment[]
  versionHistory?: KnowledgeFileVersion[]
}

export interface KnowledgeFileComment {
  id: string
  author: string
  organization?: string
  content: string
  createdAt: string
}

export interface KnowledgeFileVersion {
  id: string
  version: string
  updatedAt: string
  operator: string
  note: string
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

export type MemberUnitStatus = '正常' | '待审核' | '暂停' | '退出' | '信息变更中'
export type MemberQuickFilter =
  | 'all'
  | 'mine'
  | 'incomplete'
  | 'new'
  | 'contact'
  | 'standard'
  | 'pending'

export interface MemberStatItem {
  title: string
  value: string
  unit: string
  delta: string
  icon: ReactNode
  accent: string
}

export interface MemberCategoryDefinition {
  id: string
  label: string
  count: number
}

export interface MemberCapabilityDefinition {
  id: string
  label: string
  count: number
}

export interface MemberContact {
  id: string
  role: string
  name: string
  title: string
  phone: string
  email: string
  accountStatus: '已启用' | '待开通' | '暂停'
}

export interface MemberWorkgroupParticipation {
  id: string
  name: string
  role: string
  liaison: string
  joinedAt: string
  recentActivity: string
}

export interface MemberMeetingRecord {
  id: string
  title: string
  workgroup: string
  attendee: string
  time: string
  checkedIn: boolean
  minutes: string
}

export interface MemberFileRecord {
  id: string
  title: string
  type: '方案' | '标准草案' | '测试报告' | '纪要' | '说明材料'
  workgroup: string
  uploadedAt: string
  status: string
}

export interface MemberTaskRecord {
  id: string
  title: string
  owner: string
  deadline: string
  status: '进行中' | '待反馈' | '已完成' | '待确认'
  completion: number
}

export interface MemberAccountRecord {
  id: string
  accountName: string
  role: string
  enabled: boolean
  authorizedGroups: string[]
  scope: string
  temporaryAccess?: string
  lastChanged: string
}

export interface MemberChangeRecord {
  id: string
  type: string
  summary: string
  operator: string
  time: string
}

export interface MemberUnit {
  id: string
  name: string
  shortName: string
  logoText: string
  accent: string
  organizationType: string
  memberCategory: string
  memberCategoryId: string
  committee: string
  workgroups: string[]
  primaryContact: string
  primaryContactTitle: string
  status: MemberUnitStatus
  completeness: number
  recentParticipation: string
  capabilityTags: string[]
  accountEnabled: boolean
  ownedByCurrentUser: boolean
  addedThisMonth: boolean
  hasContactChange: boolean
  standardProjectParticipant: boolean
  description: string
  address: string
  website: string
  contacts: MemberContact[]
  participations: MemberWorkgroupParticipation[]
  meetings: MemberMeetingRecord[]
  files: MemberFileRecord[]
  tasks: MemberTaskRecord[]
  accounts: MemberAccountRecord[]
  changes: MemberChangeRecord[]
}

export interface MemberFilterOptions {
  memberCategories: string[]
  organizationTypes: string[]
  committees: string[]
  workgroups: string[]
  statuses: MemberUnitStatus[]
  capabilities: string[]
  accountStates: Array<'全部' | '已启用' | '未启用'>
  completenessLevels: Array<'全部' | '90%以上' | '70% - 89%' | '70%以下'>
}

export interface MemberPendingActionItem {
  id: string
  label: string
  count: number
}

export interface MemberRecentChangeItem {
  id: string
  title: string
  summary: string
  time: string
}

export interface MemberActiveUnitItem {
  id: string
  name: string
  score: number
  metrics: string
}

export interface MemberStatusGuideItem {
  status: MemberUnitStatus
  description: string
}

export interface MemberPermissionGuideItem {
  category: string
  description: string
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
