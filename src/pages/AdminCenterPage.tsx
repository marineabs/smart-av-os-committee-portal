import {
  ApartmentOutlined,
  AuditOutlined,
  BookOutlined,
  ControlOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FilterOutlined,
  NotificationOutlined,
  ReloadOutlined,
  RestOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UploadOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tabs,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import {
  createAdminRecord,
  deleteAdminRecord,
  fetchAdminBackup,
  fetchAdminBootstrap,
  patchAdminRecord,
  resetAdminData,
  restoreAdminBackup,
  saveAdminSettings,
  updateAdminRecord,
  type AdminApiSettings,
  type AdminApiTableRows,
} from '../services/adminApi'
import { getActiveUser, getAuthToken } from '../services/auth'
import { canViewAdminCenter } from '../utils/permissions'
import styles from './AdminCenterPage.module.css'

export type AdminSectionKey =
  | 'overview'
  | 'workgroups'
  | 'organizations'
  | 'users'
  | 'content'
  | 'archive'
  | 'supervision'
  | 'settings'
  | 'logs'

type TableSectionKey = Exclude<AdminSectionKey, 'overview' | 'settings'>
type EditableSectionKey = 'workgroups' | 'organizations' | 'users' | 'content' | 'archive'
type AdminValue = string | number | boolean | string[] | undefined

type AdminRecord = {
  key: string
  [key: string]: AdminValue
}

interface AdminSection {
  key: AdminSectionKey
  label: string
  path: string
  description: string
  icon: ReactNode
}

interface SectionMetric {
  label: string
  value: string
  hint: string
}

interface OverviewProgressItem {
  label: string
  percent: number
  hint: string
}

interface SectionConfig {
  summaryTitle: string
  summaryDescription: string
  emptyDescription: string
  primaryActionLabel: string
  quickActionLabel: string
  filterKey: string
  searchKeys: string[]
  fieldLabels: Record<string, string>
  columns: ColumnsType<AdminRecord>
}

interface EditorField {
  name: string
  label: string
  type: 'input' | 'select' | 'textarea'
  options?: string[]
  placeholder?: string
}

interface EditorState {
  mode: 'create' | 'edit'
  sectionKey: EditableSectionKey
  record?: AdminRecord
}

const adminSections: AdminSection[] = [
  { key: 'overview', label: '平台概览', path: '/admin', description: '汇总查看平台运行态势、待办事项和管理风险点。', icon: <ControlOutlined /> },
  { key: 'workgroups', label: '工作组管理', path: '/admin/workgroups', description: '维护工作组基础信息、展示策略和运行状态。', icon: <TeamOutlined /> },
  { key: 'organizations', label: '成员单位管理', path: '/admin/organizations', description: '维护成员单位、联系人和参与情况。', icon: <ApartmentOutlined /> },
  { key: 'users', label: '用户权限管理', path: '/admin/users', description: '维护账号角色、权限范围和启停状态。', icon: <UserSwitchOutlined /> },
  { key: 'content', label: '内容发布管理', path: '/admin/content', description: '维护首页通知、动态、公告和专题内容。', icon: <FileTextOutlined /> },
  { key: 'archive', label: '资料归档管理', path: '/admin/archive', description: '维护文件分类、成果目录和会议资料沉淀。', icon: <BookOutlined /> },
  { key: 'supervision', label: '会议与任务监管', path: '/admin/supervision', description: '汇总查看各工作组会议、任务和逾期风险。', icon: <AuditOutlined /> },
  { key: 'settings', label: '系统设置', path: '/admin/settings', description: '维护平台名称、展示模块和系统信息。', icon: <SettingOutlined /> },
  { key: 'logs', label: '操作日志', path: '/admin/logs', description: '查看信息变更、内容发布和权限调整记录。', icon: <FileProtectOutlined /> },
]

const overviewStats = [
  { label: '工作组总数', value: '13', hint: '运行中 11 个' },
  { label: '成员单位数', value: '128', hint: '本月新增 6 家' },
  { label: '注册用户数', value: '356', hint: '启用账号 341 个' },
  { label: '待归档会议', value: '9', hint: '涉及 5 个工作组' },
  { label: '待审核成果', value: '14', hint: '标准草案 5 份' },
  { label: '权限申请', value: '7', hint: '2 项待平台管理员处理' },
]

const overviewProgress: OverviewProgressItem[] = [
  { label: '会议纪要归档率', percent: 73, hint: '距离本月目标 80% 还差 7%' },
  { label: '成果审核完成率', percent: 61, hint: '重点集中在标准草案和测试报告' },
  { label: '权限申请闭环率', percent: 82, hint: '委员会管理员处理速度较高' },
]

const adminStorageVersion = 1
const adminTableRowsStorageKey = 'smart-av-os-admin-table-rows'
const adminSettingsStorageKey = 'smart-av-os-admin-settings'

const initialTableRows: Record<TableSectionKey, AdminRecord[]> = {
  workgroups: [
    {
      key: 'wg-1',
      name: '技术需求与接口规范组',
      committee: '技术与项目管理委员会',
      leader: '华域视联',
      deputy: '星河视研院 / 智芯微电子',
      members: 18,
      status: '运行中',
      sort: 1,
      homepage: '已展示',
      updatedAt: '2026-06-24 17:10',
      secretary: '孙昊',
      leaderUnit: '华域视联',
      deputyUnits: ['星河视研院', '智芯微电子'],
      memberUnits: ['华域视联', '星河视研院', '智芯微电子', '云帆终端', '中视实验室', '未来视界'],
      focus: '牵头推进接口规范草案、能力开放目录和跨单位需求收敛。',
      meetingStatus: '本月 2 场会议，1 份纪要待补签字版',
      taskStatus: '6 项任务进行中，其中 1 项本周需回填进展',
      archiveStatus: '标准草案和评审意见已纳入本月重点归档清单',
    },
    {
      key: 'wg-2',
      name: '测试认证组',
      committee: '标准与认证委员会',
      leader: '信通检测院',
      deputy: '云帆终端 / 中视实验室',
      members: 12,
      status: '重点推进',
      sort: 2,
      homepage: '已展示',
      updatedAt: '2026-06-24 11:22',
      secretary: '赵晨',
      leaderUnit: '信通检测院',
      deputyUnits: ['云帆终端', '中视实验室'],
      memberUnits: ['信通检测院', '云帆终端', '中视实验室', '华域视联', '星河视研院'],
      focus: '聚焦终端兼容性测试、认证流程模板和联调结果复核。',
      meetingStatus: '联调例会已完成，待上传一份会议纪要',
      taskStatus: '测试任务节奏平稳，暂无逾期事项',
      archiveStatus: '已归档 1 份测试报告，2 份附件待补全',
    },
    {
      key: 'wg-3',
      name: '产业推广组',
      committee: '产业发展委员会',
      leader: '未来视界',
      deputy: '智媒联合体 / 鸿翼生态',
      members: 16,
      status: '筹备中',
      sort: 3,
      homepage: '待展示',
      updatedAt: '2026-06-23 18:20',
      secretary: '许倩',
      leaderUnit: '未来视界',
      deputyUnits: ['智媒联合体', '鸿翼生态'],
      memberUnits: ['未来视界', '智媒联合体', '鸿翼生态', '华域视联'],
      focus: '推进产业推广方案、案例沉淀与外部协同展示材料准备。',
      meetingStatus: '暂无待归档会议，下一场月度例会待排期',
      taskStatus: '2 项推广任务逾期，需协调责任单位补录计划',
      archiveStatus: '会议纪要已建档，成果附件仍需补充',
    },
  ],
  organizations: [
    {
      key: 'org-1',
      name: '华域视联',
      type: '副理事长单位',
      liaison: '李工',
      phone: '13800001234',
      groups: 3,
      status: '已加入',
      participation: '技术需求与接口规范组 / 测试认证组 / AI 智能体组',
      joinedAt: '2025-12-18',
    },
    {
      key: 'org-2',
      name: '星河视研院',
      type: '成员单位',
      liaison: '周老师',
      phone: '13900004567',
      groups: 2,
      status: '已加入',
      participation: '技术需求与接口规范组 / 产业推广组',
      joinedAt: '2026-01-08',
    },
    {
      key: 'org-3',
      name: '智芯微电子',
      type: '成员单位',
      liaison: '王经理',
      phone: '13600007890',
      groups: 1,
      status: '待扩权',
      participation: '技术需求与接口规范组',
      joinedAt: '2026-03-16',
    },
  ],
  users: [
    {
      key: 'user-1',
      account: 'zhangwei',
      name: '张伟',
      role: '秘书处管理员',
      scope: '全平台',
      unit: '专委会秘书处',
      status: '启用',
      group: '秘书处',
      lastLogin: '2026-06-25 09:12',
    },
    {
      key: 'user-2',
      account: 'liuting',
      name: '刘婷',
      role: '委员会管理员',
      scope: '技术与项目管理委员会',
      unit: '华域视联',
      status: '启用',
      group: '技术需求与接口规范组',
      lastLogin: '2026-06-24 18:26',
    },
    {
      key: 'user-3',
      account: 'sunhao',
      name: '孙昊',
      role: '工作组秘书',
      scope: '技术需求与接口规范组',
      unit: '星河视研院',
      status: '受限',
      group: '技术需求与接口规范组',
      lastLogin: '2026-06-24 14:08',
    },
  ],
  content: [
    {
      key: 'content-1',
      column: '首页通知',
      title: '关于 6 月工作组协同安排的通知',
      owner: '秘书处',
      updatedAt: '2026-06-24 16:30',
      status: '已发布',
      audience: '全体成员',
      priority: '高',
      summary: '明确 6 月各工作组协同节奏、会议窗口和材料回填要求。',
    },
    {
      key: 'content-2',
      column: '工作组动态',
      title: '接口规范组发布草案 V0.9',
      owner: '委员会管理员',
      updatedAt: '2026-06-24 10:10',
      status: '待复核',
      audience: '相关工作组',
      priority: '中',
      summary: '同步接口规范组草案版本更新，等待委员会管理员复核后发布。',
    },
    {
      key: 'content-3',
      column: '平台公告',
      title: '演示环境维护窗口说明',
      owner: '平台管理员',
      updatedAt: '2026-06-23 18:40',
      status: '草稿',
      audience: '全体成员',
      priority: '中',
      summary: '说明演示环境维护窗口、影响范围和恢复时间。',
    },
  ],
  archive: [
    {
      key: 'archive-1',
      category: '标准草案',
      item: '《接口能力开放规范（草案）》',
      group: '技术需求与接口规范组',
      retention: '长期',
      status: '待归档',
      owner: '孙昊',
      updatedAt: '2026-06-24',
      notes: '待补秘书处审核意见与签字版附件。',
    },
    {
      key: 'archive-2',
      category: '测试报告',
      item: '终端适配兼容性测试报告',
      group: '测试认证组',
      retention: '长期',
      status: '已归档',
      owner: '赵晨',
      updatedAt: '2026-06-22',
      notes: '归档材料完整，已完成目录登记。',
    },
    {
      key: 'archive-3',
      category: '会议材料',
      item: '产业发展委员会月度会议纪要',
      group: '产业推广组',
      retention: '五年',
      status: '待补附件',
      owner: '许倩',
      updatedAt: '2026-06-21',
      notes: '缺少签到表扫描件和议程附件。',
    },
  ],
  supervision: [
    {
      key: 'supervision-1',
      group: '技术需求与接口规范组',
      committee: '技术与项目管理委员会',
      meetings: '2 场待归档',
      tasks: '1 项逾期',
      result: '2 份待提交',
      risk: '中',
      owner: '孙昊',
    },
    {
      key: 'supervision-2',
      group: '测试认证组',
      committee: '标准与认证委员会',
      meetings: '1 场待上传纪要',
      tasks: '0 项逾期',
      result: '1 份待审核',
      risk: '低',
      owner: '赵晨',
    },
    {
      key: 'supervision-3',
      group: '产业推广组',
      committee: '产业发展委员会',
      meetings: '0',
      tasks: '2 项逾期',
      result: '1 份待立项',
      risk: '高',
      owner: '许倩',
    },
  ],
  logs: [
    {
      key: 'log-1',
      action: '工作组信息更新',
      operator: '张伟',
      target: '技术需求与接口规范组',
      time: '2026-06-24 17:10',
      result: '成功',
      detail: '调整首页展示顺序、更新组长单位信息',
    },
    {
      key: 'log-2',
      action: '权限角色调整',
      operator: '平台管理员',
      target: 'liuting / 委员会管理员',
      time: '2026-06-24 15:42',
      result: '成功',
      detail: '新增内容发布复核权限',
    },
    {
      key: 'log-3',
      action: '内容发布撤回',
      operator: '刘婷',
      target: '首页通知 / 协同安排',
      time: '2026-06-24 11:03',
      result: '已撤回',
      detail: '因发布时间需要调整而撤回',
    },
  ],
}

const initialSettingsState = {
  platformName: '智慧视听操作系统专委会协同工作平台',
  supportEmail: 'support@abs.cn',
  supportPhone: '010-8888 8888',
  supportTeam: '专委会平台运维组',
  demoTag: '生产预览',
  modules: {
    portal: true,
    workgroups: true,
    files: true,
    members: true,
    meetings: true,
    dynamics: true,
  },
}

type AdminSettingsState = typeof initialSettingsState

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJsonFromStorage<T>(key: string): T | null {
  if (!canUseBrowserStorage()) {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : null
  } catch {
    return null
  }
}

function writeJsonToStorage(key: string, value: unknown) {
  if (!canUseBrowserStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function loadTableRowsFromStorage() {
  const stored = readJsonFromStorage<{
    rows?: Partial<Record<TableSectionKey, AdminRecord[]>>
    version?: number
  }>(adminTableRowsStorageKey)

  if (!stored?.rows || stored.version !== adminStorageVersion) {
    return initialTableRows
  }

  return Object.keys(initialTableRows).reduce((rows, key) => {
    const sectionKey = key as TableSectionKey
    return {
      ...rows,
      [sectionKey]: Array.isArray(stored.rows?.[sectionKey])
        ? stored.rows[sectionKey]
        : initialTableRows[sectionKey],
    }
  }, {} as Record<TableSectionKey, AdminRecord[]>)
}

function loadSettingsFromStorage() {
  const stored = readJsonFromStorage<{
    settings?: Partial<AdminSettingsState>
    version?: number
  }>(adminSettingsStorageKey)

  if (!stored?.settings || stored.version !== adminStorageVersion) {
    return initialSettingsState
  }

  return {
    ...initialSettingsState,
    ...stored.settings,
    modules: {
      ...initialSettingsState.modules,
      ...stored.settings.modules,
    },
  }
}

function normalizeTableRows(rows?: AdminApiTableRows | null) {
  return Object.keys(initialTableRows).reduce((result, key) => {
    const sectionKey = key as TableSectionKey
    return {
      ...result,
      [sectionKey]: Array.isArray(rows?.[sectionKey])
        ? rows[sectionKey] as AdminRecord[]
        : initialTableRows[sectionKey],
    }
  }, {} as Record<TableSectionKey, AdminRecord[]>)
}

function normalizeSettings(settings?: AdminApiSettings | null): AdminSettingsState {
  if (!settings) {
    return initialSettingsState
  }

  return {
    ...initialSettingsState,
    ...settings,
    modules: {
      ...initialSettingsState.modules,
      ...settings.modules,
    },
  }
}

function downloadJsonFile(filename: string, payload: unknown) {
  if (typeof document === 'undefined') {
    return
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const sectionConfigs: Record<TableSectionKey, SectionConfig> = {
  workgroups: {
    summaryTitle: '工作组运行台账',
    summaryDescription: '支持按委员会和状态快速筛选，演示工作组启停与展示管理流程。',
    emptyDescription: '暂无匹配的工作组数据。',
    primaryActionLabel: '新增工作组',
    quickActionLabel: '推进状态',
    filterKey: 'status',
    searchKeys: ['name', 'committee', 'leader', 'deputy'],
    fieldLabels: {
      name: '工作组',
      committee: '所属委员会',
      leader: '组长单位',
      deputy: '副组长单位',
      members: '成员单位数',
      status: '状态',
      sort: '排序',
      homepage: '首页展示',
      updatedAt: '最近更新',
      secretary: '工作组秘书',
    },
    columns: [
      { title: '工作组', dataIndex: 'name', key: 'name' },
      { title: '所属委员会', dataIndex: 'committee', key: 'committee' },
      { title: '组长单位', dataIndex: 'leader', key: 'leader' },
      { title: '副组长单位', dataIndex: 'deputy', key: 'deputy' },
      { title: '成员单位', dataIndex: 'members', key: 'members' },
      { title: '状态', dataIndex: 'status', key: 'status' },
    ],
  },
  organizations: {
    summaryTitle: '成员单位参与情况',
    summaryDescription: '展示成员单位当前加入状态、联系人与参与工作组情况。',
    emptyDescription: '暂无匹配的成员单位数据。',
    primaryActionLabel: '新增成员单位',
    quickActionLabel: '审批状态',
    filterKey: 'status',
    searchKeys: ['name', 'liaison', 'participation', 'type'],
    fieldLabels: {
      name: '成员单位',
      type: '单位类型',
      liaison: '联系人',
      phone: '联系电话',
      groups: '参与工作组数',
      status: '加入状态',
      participation: '参与工作组',
      joinedAt: '加入时间',
    },
    columns: [
      { title: '成员单位', dataIndex: 'name', key: 'name' },
      { title: '单位类型', dataIndex: 'type', key: 'type' },
      { title: '联系人', dataIndex: 'liaison', key: 'liaison' },
      { title: '参与工作组', dataIndex: 'groups', key: 'groups' },
      { title: '加入状态', dataIndex: 'status', key: 'status' },
    ],
  },
  users: {
    summaryTitle: '账号与权限治理',
    summaryDescription: '支持按角色和状态巡检账号启停、管理范围与最近登录情况。',
    emptyDescription: '暂无匹配的用户权限数据。',
    primaryActionLabel: '新增管理账号',
    quickActionLabel: '调整状态',
    filterKey: 'role',
    searchKeys: ['account', 'name', 'role', 'unit', 'scope'],
    fieldLabels: {
      account: '账号',
      name: '姓名',
      role: '角色',
      scope: '管理范围',
      unit: '所属单位',
      status: '状态',
      group: '所属工作组',
      lastLogin: '最近登录',
    },
    columns: [
      { title: '账号', dataIndex: 'account', key: 'account' },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '角色', dataIndex: 'role', key: 'role' },
      { title: '所属单位', dataIndex: 'unit', key: 'unit' },
      { title: '管理范围', dataIndex: 'scope', key: 'scope' },
      { title: '状态', dataIndex: 'status', key: 'status' },
    ],
  },
  content: {
    summaryTitle: '内容发布与复核',
    summaryDescription: '支持按栏目和发布状态快速定位内容，模拟草稿到发布的流程。',
    emptyDescription: '暂无匹配的内容发布数据。',
    primaryActionLabel: '新建发布内容',
    quickActionLabel: '推进发布',
    filterKey: 'status',
    searchKeys: ['column', 'title', 'owner', 'audience'],
    fieldLabels: {
      column: '栏目',
      title: '内容标题',
      owner: '责任人',
      updatedAt: '更新时间',
      status: '状态',
      audience: '可见范围',
      priority: '优先级',
      summary: '内容摘要',
    },
    columns: [
      { title: '栏目', dataIndex: 'column', key: 'column' },
      { title: '内容标题', dataIndex: 'title', key: 'title' },
      { title: '责任人', dataIndex: 'owner', key: 'owner' },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
      { title: '状态', dataIndex: 'status', key: 'status' },
    ],
  },
  archive: {
    summaryTitle: '资料归档进度',
    summaryDescription: '支持按归档状态快速排查待归档、待补附件和已归档资料。',
    emptyDescription: '暂无匹配的归档数据。',
    primaryActionLabel: '创建归档任务',
    quickActionLabel: '推进归档',
    filterKey: 'status',
    searchKeys: ['category', 'item', 'group', 'owner'],
    fieldLabels: {
      category: '资料分类',
      item: '资料名称',
      group: '所属工作组',
      retention: '保管期限',
      status: '归档状态',
      owner: '责任人',
      updatedAt: '最近更新',
      notes: '归档说明',
    },
    columns: [
      { title: '资料分类', dataIndex: 'category', key: 'category' },
      { title: '资料名称', dataIndex: 'item', key: 'item' },
      { title: '所属工作组', dataIndex: 'group', key: 'group' },
      { title: '保管期限', dataIndex: 'retention', key: 'retention' },
      { title: '归档状态', dataIndex: 'status', key: 'status' },
    ],
  },
  supervision: {
    summaryTitle: '会议与任务监管台账',
    summaryDescription: '按风险等级快速查看会议归档、任务逾期和成果提交情况。',
    emptyDescription: '暂无匹配的监管数据。',
    primaryActionLabel: '导出监管清单',
    quickActionLabel: '降低风险',
    filterKey: 'risk',
    searchKeys: ['group', 'committee', 'meetings', 'tasks', 'result'],
    fieldLabels: {
      group: '工作组',
      committee: '所属委员会',
      meetings: '会议状态',
      tasks: '任务状态',
      result: '成果状态',
      risk: '风险等级',
      owner: '责任人',
    },
    columns: [
      { title: '工作组', dataIndex: 'group', key: 'group' },
      { title: '所属委员会', dataIndex: 'committee', key: 'committee' },
      { title: '会议状态', dataIndex: 'meetings', key: 'meetings' },
      { title: '任务状态', dataIndex: 'tasks', key: 'tasks' },
      { title: '成果状态', dataIndex: 'result', key: 'result' },
      { title: '风险等级', dataIndex: 'risk', key: 'risk' },
    ],
  },
  logs: {
    summaryTitle: '关键操作留痕',
    summaryDescription: '按结果和操作对象快速检索工作组信息、权限和内容发布变更记录。',
    emptyDescription: '暂无匹配的日志数据。',
    primaryActionLabel: '导出操作日志',
    quickActionLabel: '标记已读',
    filterKey: 'result',
    searchKeys: ['action', 'operator', 'target', 'detail'],
    fieldLabels: {
      action: '操作事项',
      operator: '操作人',
      target: '对象',
      time: '时间',
      result: '结果',
      detail: '操作详情',
    },
    columns: [
      { title: '操作事项', dataIndex: 'action', key: 'action' },
      { title: '操作人', dataIndex: 'operator', key: 'operator' },
      { title: '对象', dataIndex: 'target', key: 'target' },
      { title: '时间', dataIndex: 'time', key: 'time' },
      { title: '结果', dataIndex: 'result', key: 'result' },
    ],
  },
}

const editableSectionFields: Record<EditorState['sectionKey'], EditorField[]> = {
  workgroups: [
    { name: 'name', label: '工作组名称', type: 'input', placeholder: '请输入工作组名称' },
    { name: 'committee', label: '所属委员会', type: 'select', options: ['技术与项目管理委员会', '标准与认证委员会', '产业发展委员会'] },
    { name: 'leaderUnit', label: '组长单位', type: 'input', placeholder: '请输入组长单位' },
    { name: 'deputyUnitsText', label: '副组长单位', type: 'textarea', placeholder: '请输入副组长单位，支持换行或 / 分隔' },
    { name: 'memberUnitsText', label: '成员单位', type: 'textarea', placeholder: '请输入成员单位，支持换行或 / 分隔' },
    { name: 'secretary', label: '工作组秘书', type: 'input', placeholder: '请输入工作组秘书' },
    { name: 'sort', label: '排序', type: 'input', placeholder: '请输入排序号' },
    { name: 'homepage', label: '首页展示', type: 'select', options: ['已展示', '待展示'] },
    { name: 'status', label: '状态', type: 'select', options: ['筹备中', '运行中', '重点推进'] },
    { name: 'focus', label: '当前重点', type: 'textarea', placeholder: '请输入当前重点推进事项' },
  ],
  organizations: [
    { name: 'name', label: '成员单位名称', type: 'input', placeholder: '请输入成员单位名称' },
    { name: 'type', label: '单位类型', type: 'select', options: ['理事长单位', '副理事长单位', '成员单位'] },
    { name: 'liaison', label: '联系人', type: 'input', placeholder: '请输入联系人' },
    { name: 'phone', label: '联系电话', type: 'input', placeholder: '请输入联系电话' },
    { name: 'participation', label: '参与工作组', type: 'textarea', placeholder: '请输入参与工作组，多个用 / 分隔' },
    { name: 'joinedAt', label: '加入时间', type: 'input', placeholder: '如 2026-06-25' },
    { name: 'status', label: '加入状态', type: 'select', options: ['已加入', '待扩权'] },
  ],
  users: [
    { name: 'account', label: '账号', type: 'input', placeholder: '请输入账号' },
    { name: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名' },
    { name: 'role', label: '角色', type: 'select', options: ['平台管理员', '秘书处管理员', '委员会管理员', '工作组秘书', '工作组成员'] },
    { name: 'unit', label: '所属单位', type: 'input', placeholder: '请输入所属单位' },
    { name: 'group', label: '所属工作组', type: 'input', placeholder: '请输入所属工作组' },
    { name: 'scope', label: '管理范围', type: 'input', placeholder: '请输入管理范围' },
    { name: 'status', label: '状态', type: 'select', options: ['启用', '受限', '停用'] },
    { name: 'lastLogin', label: '最近登录', type: 'input', placeholder: '如 2026-06-25 10:30' },
  ],
  content: [
    { name: 'column', label: '栏目', type: 'select', options: ['首页通知', '工作组动态', '平台公告', '专题内容'] },
    { name: 'title', label: '内容标题', type: 'input', placeholder: '请输入内容标题' },
    { name: 'owner', label: '责任人', type: 'input', placeholder: '请输入责任人' },
    { name: 'audience', label: '可见范围', type: 'select', options: ['全体成员', '相关工作组', '秘书处', '指定工作组'] },
    { name: 'priority', label: '优先级', type: 'select', options: ['高', '中', '低'] },
    { name: 'status', label: '发布状态', type: 'select', options: ['草稿', '待复核', '已发布'] },
    { name: 'summary', label: '内容摘要', type: 'textarea', placeholder: '请输入内容摘要或发布说明' },
  ],
  archive: [
    { name: 'category', label: '资料分类', type: 'select', options: ['标准草案', '测试报告', '会议材料', '成果资料'] },
    { name: 'item', label: '资料名称', type: 'input', placeholder: '请输入资料名称' },
    { name: 'group', label: '所属工作组', type: 'input', placeholder: '请输入所属工作组' },
    { name: 'retention', label: '保管期限', type: 'select', options: ['长期', '十年', '五年'] },
    { name: 'owner', label: '责任人', type: 'input', placeholder: '请输入责任人' },
    { name: 'status', label: '归档状态', type: 'select', options: ['待补附件', '待归档', '已归档'] },
    { name: 'notes', label: '归档说明', type: 'textarea', placeholder: '请输入归档说明或缺失附件备注' },
  ],
}

function splitTextValues(value: string) {
  return value
    .split(/\n|\/|、|,|，/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getStringList(value: AdminValue) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return splitTextValues(value)
  }

  return []
}

function getEditableSectionLabel(sectionKey: EditableSectionKey) {
  switch (sectionKey) {
    case 'workgroups':
      return '工作组'
    case 'organizations':
      return '成员单位'
    case 'users':
      return '用户账号'
    case 'content':
      return '发布内容'
    case 'archive':
      return '归档资料'
  }
}

function isEditableSection(sectionKey: TableSectionKey): sectionKey is EditableSectionKey {
  return ['workgroups', 'organizations', 'users', 'content', 'archive'].includes(sectionKey)
}

function getRecordDisplayName(record: AdminRecord) {
  return String(record.name ?? record.title ?? record.item ?? record.account ?? record.key)
}

function renderStatusTag(value: ReactNode) {
  const text = String(value)

  if (text.includes('高') || text.includes('逾期') || text.includes('待归档') || text.includes('待复核') || text.includes('待扩权')) {
    return <Tag color="gold">{text}</Tag>
  }

  if (text.includes('成功') || text.includes('启用') || text.includes('运行中') || text.includes('已发布') || text.includes('已归档') || text.includes('已加入') || text.includes('低')) {
    return <Tag color="blue">{text}</Tag>
  }

  if (text.includes('受限') || text.includes('草稿') || text.includes('筹备中') || text.includes('已撤回')) {
    return <Tag color="default">{text}</Tag>
  }

  return <Tag color="processing">{text}</Tag>
}

function getSectionMetrics(sectionKey: TableSectionKey, rows: AdminRecord[]): SectionMetric[] {
  switch (sectionKey) {
    case 'workgroups': {
      const running = rows.filter((row) => row.status === '运行中').length
      const homepage = rows.filter((row) => row.homepage === '已展示').length
      const members = rows.reduce((total, row) => total + Number(row.members ?? 0), 0)
      return [
        { label: '工作组总数', value: String(rows.length), hint: `运行中 ${running} 个` },
        { label: '首页展示数', value: String(homepage), hint: '可直接出现在工作组空间首页' },
        { label: '覆盖成员单位', value: String(members), hint: '按当前录入成员单位数统计' },
      ]
    }
    case 'organizations': {
      const joined = rows.filter((row) => row.status === '已加入').length
      const groups = rows.reduce((total, row) => total + Number(row.groups ?? 0), 0)
      return [
        { label: '成员单位总数', value: String(rows.length), hint: `已加入 ${joined} 家` },
        { label: '参与工作组数', value: String(groups), hint: '按成员单位参与次数累计' },
        { label: '待扩权单位', value: String(rows.filter((row) => row.status === '待扩权').length), hint: '待秘书处或平台管理员复核' },
      ]
    }
    case 'users': {
      return [
        { label: '账号总数', value: String(rows.length), hint: `启用 ${rows.filter((row) => row.status === '启用').length} 个` },
        { label: '高权限账号', value: String(rows.filter((row) => String(row.role).includes('管理员')).length), hint: '秘书处 / 委员会 / 平台管理员' },
        { label: '受限账号', value: String(rows.filter((row) => row.status === '受限').length), hint: '建议复核其资料访问范围' },
      ]
    }
    case 'content': {
      return [
        { label: '内容条目', value: String(rows.length), hint: `已发布 ${rows.filter((row) => row.status === '已发布').length} 条` },
        { label: '待复核', value: String(rows.filter((row) => row.status === '待复核').length), hint: '建议今日内完成复核' },
        { label: '草稿数量', value: String(rows.filter((row) => row.status === '草稿').length), hint: '适合继续编辑完善' },
      ]
    }
    case 'archive': {
      return [
        { label: '归档任务', value: String(rows.length), hint: `已归档 ${rows.filter((row) => row.status === '已归档').length} 项` },
        { label: '待归档', value: String(rows.filter((row) => row.status === '待归档').length), hint: '建议优先处理标准草案' },
        { label: '待补附件', value: String(rows.filter((row) => row.status === '待补附件').length), hint: '需要补齐会议材料或签字版' },
      ]
    }
    case 'supervision': {
      return [
        { label: '监管工作组', value: String(rows.length), hint: `高风险 ${rows.filter((row) => row.risk === '高').length} 个` },
        { label: '逾期事项', value: String(rows.filter((row) => String(row.tasks).includes('逾期')).length), hint: '建议逐项催办' },
        { label: '待归档会议', value: String(rows.filter((row) => !String(row.meetings).startsWith('0')).length), hint: '需补上传纪要或归档材料' },
      ]
    }
    case 'logs': {
      return [
        { label: '日志记录', value: String(rows.length), hint: `成功 ${rows.filter((row) => row.result === '成功').length} 条` },
        { label: '内容相关', value: String(rows.filter((row) => String(row.action).includes('内容')).length), hint: '发布与撤回都纳入追踪' },
        { label: '权限相关', value: String(rows.filter((row) => String(row.action).includes('权限')).length), hint: '建议纳入定期审计' },
      ]
    }
  }
}

function getNextQuickValue(sectionKey: TableSectionKey, row: AdminRecord) {
  if (sectionKey === 'workgroups') {
    if (row.status === '筹备中') return '运行中'
    if (row.status === '运行中') return '重点推进'
    return '运行中'
  }

  if (sectionKey === 'organizations') {
    return row.status === '待扩权' ? '已加入' : '待扩权'
  }

  if (sectionKey === 'users') {
    if (row.status === '启用') return '受限'
    if (row.status === '受限') return '停用'
    return '启用'
  }

  if (sectionKey === 'content') {
    if (row.status === '草稿') return '待复核'
    if (row.status === '待复核') return '已发布'
    return '已发布'
  }

  if (sectionKey === 'archive') {
    if (row.status === '待补附件') return '待归档'
    if (row.status === '待归档') return '已归档'
    return '已归档'
  }

  if (sectionKey === 'supervision') {
    if (row.risk === '高') return '中'
    if (row.risk === '中') return '低'
    return '低'
  }

  return '成功'
}

function getActionNotice(sectionKey: TableSectionKey, row: AdminRecord, nextValue: string) {
  switch (sectionKey) {
    case 'workgroups':
      return `${row.name} 已调整为「${nextValue}」`
    case 'organizations':
      return `${row.name} 的加入状态已更新为「${nextValue}」`
    case 'users':
      return `${row.name} 的账号状态已调整为「${nextValue}」`
    case 'content':
      return `内容《${row.title}》已推进到「${nextValue}」`
    case 'archive':
      return `资料《${row.item}》已推进到「${nextValue}」`
    case 'supervision':
      return `${row.group} 的风险等级已调整为「${nextValue}」`
    case 'logs':
      return `日志「${row.action}」已标记为已读`
  }
}

function AdminCenterPage({ sectionKey }: { sectionKey: AdminSectionKey }) {
  const { message } = App.useApp()
  const currentUser = getActiveUser()
  const authToken = getAuthToken()
  const [editorForm] = Form.useForm()
  const [workgroupDrawerForm] = Form.useForm()
  const [keyword, setKeyword] = useState('')
  const [filterValue, setFilterValue] = useState('全部')
  const [tableRows, setTableRows] = useState(initialTableRows)
  const [drawerState, setDrawerState] = useState<{ sectionKey: TableSectionKey; record: AdminRecord } | null>(null)
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [settingsState, setSettingsState] = useState(initialSettingsState)
  const [apiOnline, setApiOnline] = useState(false)

  const applyBootstrapPayload = (payload: { tableRows?: AdminApiTableRows | null; settings?: AdminApiSettings | null }) => {
    setTableRows(normalizeTableRows(payload.tableRows))
    setSettingsState(normalizeSettings(payload.settings))
  }

  const refreshAdminData = async () => {
    const payload = await fetchAdminBootstrap()
    applyBootstrapPayload(payload)
    setApiOnline(true)
  }

  useEffect(() => {
    setKeyword('')
    setFilterValue('全部')
  }, [sectionKey])

  useEffect(() => {
    let active = true

    fetchAdminBootstrap()
      .then((payload) => {
        if (!active) {
          return
        }

        applyBootstrapPayload(payload)
        setApiOnline(true)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setTableRows(loadTableRowsFromStorage())
        setSettingsState(loadSettingsFromStorage())
        setApiOnline(false)
        message.warning('后台 API 未连接，当前使用本地缓存数据')
      })

    return () => {
      active = false
    }
  }, [message])

  useEffect(() => {
    writeJsonToStorage(adminTableRowsStorageKey, {
      rows: tableRows,
      updatedAt: new Date().toISOString(),
      version: adminStorageVersion,
    })
  }, [tableRows])

  useEffect(() => {
    writeJsonToStorage(adminSettingsStorageKey, {
      settings: settingsState,
      updatedAt: new Date().toISOString(),
      version: adminStorageVersion,
    })
  }, [settingsState])

  useEffect(() => {
    if (!editorState) {
      editorForm.resetFields()
      return
    }

    if (editorState.mode === 'edit' && editorState.record) {
      if (editorState.sectionKey === 'workgroups') {
        editorForm.setFieldsValue({
          ...editorState.record,
          leaderUnit: String(editorState.record.leaderUnit ?? editorState.record.leader ?? ''),
          deputyUnitsText: getStringList(editorState.record.deputyUnits ?? editorState.record.deputy).join('\n'),
          memberUnitsText: getStringList(editorState.record.memberUnits).join('\n'),
        })
        return
      }

      editorForm.setFieldsValue(editorState.record)
      return
    }

    editorForm.setFieldsValue(
      editorState.sectionKey === 'workgroups'
        ? {
            homepage: '待展示',
            status: '筹备中',
          }
        : {},
    )
  }, [editorForm, editorState])

  if (!authToken) {
    return <Navigate to="/login" replace />
  }

  if (!canViewAdminCenter(currentUser)) {
    return <Navigate to="/portal" replace />
  }

  const activeSection = adminSections.find((item) => item.key === sectionKey) ?? adminSections[0]
  const activeTableSection = sectionKey === 'overview' || sectionKey === 'settings' ? null : sectionKey
  const activeConfig = activeTableSection ? sectionConfigs[activeTableSection] : null
  const currentRows = activeTableSection ? tableRows[activeTableSection] : []
  const activeDrawerRecord = useMemo(() => {
    if (!drawerState) {
      return null
    }

    return tableRows[drawerState.sectionKey].find((item) => item.key === drawerState.record.key) ?? drawerState.record
  }, [drawerState, tableRows])
  const organizationUnitOptions = useMemo(() => {
    const unitNames = new Set<string>()

    tableRows.organizations.forEach((row) => {
      if (row.name) {
        unitNames.add(String(row.name))
      }
    })

    tableRows.workgroups.forEach((row) => {
      const leaderUnit = String(row.leaderUnit ?? row.leader ?? '').trim()
      if (leaderUnit) {
        unitNames.add(leaderUnit)
      }

      getStringList(row.deputyUnits ?? row.deputy).forEach((item) => unitNames.add(item))
      getStringList(row.memberUnits).forEach((item) => unitNames.add(item))
    })

    return Array.from(unitNames).map((item) => ({
      label: item,
      value: item,
    }))
  }, [tableRows])

  const filterOptions = useMemo(() => {
    if (!activeTableSection || !activeConfig) {
      return ['全部']
    }

    const values = new Set<string>()
    currentRows.forEach((row) => {
      const value = row[activeConfig.filterKey]
      if (value !== undefined) {
        values.add(String(value))
      }
    })

    return ['全部', ...Array.from(values)]
  }, [activeConfig, activeTableSection, currentRows])

  const filteredRows = useMemo(() => {
    if (!activeTableSection || !activeConfig) {
      return []
    }

    return currentRows.filter((row) => {
      const matchesKeyword =
        !keyword.trim() ||
        activeConfig.searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(keyword.trim().toLowerCase()))

      const matchesFilter =
        filterValue === '全部' ||
        String(row[activeConfig.filterKey] ?? '') === filterValue

      return matchesKeyword && matchesFilter
    })
  }, [activeConfig, activeTableSection, currentRows, filterValue, keyword])

  const sectionMetrics = useMemo(
    () => (activeTableSection ? getSectionMetrics(activeTableSection, currentRows) : []),
    [activeTableSection, currentRows],
  )

  const handleDeleteRecord = (section: EditableSectionKey, record: AdminRecord, closeDrawer = false) => {
    const sectionLabel = getEditableSectionLabel(section)
    const targetName = getRecordDisplayName(record)

    Modal.confirm({
      title: `删除${sectionLabel}`,
      content: `确认删除「${targetName}」吗？删除后将从当前管理列表移除，并写入操作日志。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (apiOnline) {
          await deleteAdminRecord(section, String(record.key))
          await refreshAdminData()
          if (closeDrawer) {
            setDrawerState(null)
          }
          message.success(`${targetName} 已删除`)
          return
        }

        setTableRows((current) => {
          const nextLog: AdminRecord = {
            key: `log-${Date.now()}`,
            action: `${sectionLabel}删除`,
            operator: currentUser.name,
            target: targetName,
            time: '2026-06-25 10:30',
            result: '成功',
            detail: `通过平台管理中心删除${sectionLabel}记录`,
          }

          return {
            ...current,
            [section]: current[section].filter((item) => item.key !== record.key),
            logs: [nextLog, ...current.logs],
          }
        })

        if (closeDrawer) {
          setDrawerState(null)
        }

        message.success(`${targetName} 已删除`)
      },
    })
  }

  const tableColumns = useMemo(() => {
    if (!activeTableSection || !activeConfig) {
      return []
    }

    const decoratedColumns = activeConfig.columns.map((column) =>
      'dataIndex' in column &&
      (column.dataIndex === 'status' || column.dataIndex === 'risk' || column.dataIndex === 'result')
        ? {
            ...column,
            render: (value: ReactNode) => renderStatusTag(value),
          }
        : column,
    )

    return [
      ...decoratedColumns,
      {
        title: '操作',
        key: 'actions',
        fixed: 'right' as const,
        width: isEditableSection(activeTableSection) ? 236 : 176,
        render: (_: unknown, record: AdminRecord) => (
          <Space size="small">
            <Button
              type="link"
              className={styles.inlineButton}
              icon={<EyeOutlined />}
              onClick={() => setDrawerState({ sectionKey: activeTableSection, record })}
            >
              详情
            </Button>
            {isEditableSection(activeTableSection) ? (
              <Button
                type="link"
                className={styles.inlineButton}
                onClick={() =>
                  setEditorState({
                    mode: 'edit',
                    sectionKey: activeTableSection,
                    record,
                  })
                }
              >
                编辑
              </Button>
            ) : null}
            {isEditableSection(activeTableSection) ? (
              <Button
                danger
                type="link"
                className={styles.inlineButton}
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteRecord(activeTableSection, record)}
              >
                删除
              </Button>
            ) : null}
            <Button
              type="link"
              className={styles.inlineButton}
              icon={<ReloadOutlined />}
              onClick={async () => {
                const nextValue = getNextQuickValue(activeTableSection, record)
                const patchValues =
                  activeTableSection === 'supervision'
                    ? { risk: nextValue }
                    : activeTableSection === 'logs'
                      ? { result: nextValue }
                      : { status: nextValue }

                if (apiOnline) {
                  await patchAdminRecord(activeTableSection, String(record.key), patchValues)
                  await refreshAdminData()
                  message.success(getActionNotice(activeTableSection, record, nextValue))
                  return
                }

                setTableRows((current) => ({
                  ...current,
                  [activeTableSection]: current[activeTableSection].map((item) =>
                    item.key !== record.key
                      ? item
                      : activeTableSection === 'supervision'
                        ? { ...item, risk: nextValue }
                        : activeTableSection === 'logs'
                          ? { ...item, result: nextValue }
                          : { ...item, status: nextValue },
                  ),
                }))
                message.success(getActionNotice(activeTableSection, record, nextValue))
              }}
            >
              {activeConfig.quickActionLabel}
            </Button>
          </Space>
        ),
      },
    ]
  }, [activeConfig, activeTableSection, message])

  const drawerItems = useMemo(() => {
    if (!drawerState || !activeDrawerRecord) {
      return []
    }

    const labels = sectionConfigs[drawerState.sectionKey].fieldLabels

    return Object.entries(activeDrawerRecord).map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      children:
        key === 'status' || key === 'risk' || key === 'result'
          ? renderStatusTag(value)
          : Array.isArray(value)
            ? value.join(' / ')
            : String(value),
    }))
  }, [activeDrawerRecord, drawerState])

  useEffect(() => {
    if (drawerState?.sectionKey !== 'workgroups' || !activeDrawerRecord) {
      workgroupDrawerForm.resetFields()
      return
    }

    workgroupDrawerForm.setFieldsValue({
      name: activeDrawerRecord.name,
      committee: activeDrawerRecord.committee,
      status: activeDrawerRecord.status,
      homepage: activeDrawerRecord.homepage,
      secretary: activeDrawerRecord.secretary,
      sort: activeDrawerRecord.sort,
      leaderUnit: String(activeDrawerRecord.leaderUnit ?? activeDrawerRecord.leader ?? ''),
      deputyUnits: getStringList(activeDrawerRecord.deputyUnits ?? activeDrawerRecord.deputy),
      memberUnits: getStringList(activeDrawerRecord.memberUnits),
      focus: activeDrawerRecord.focus,
      meetingStatus: activeDrawerRecord.meetingStatus,
      taskStatus: activeDrawerRecord.taskStatus,
      archiveStatus: activeDrawerRecord.archiveStatus,
    })
  }, [activeDrawerRecord, drawerState, workgroupDrawerForm])

  const appendLogRecord = (action: string, target: string, detail: string) => {
    const nextLog: AdminRecord = {
      key: `log-${Date.now()}`,
      action,
      operator: currentUser.name,
      target,
      time: '2026-06-25 10:30',
      result: '成功',
      detail,
    }

    setTableRows((current) => ({
      ...current,
      logs: [nextLog, ...current.logs],
    }))
  }

  const handleEditorSubmit = async () => {
    if (!editorState) {
      return
    }

    const values = (await editorForm.validateFields()) as Record<string, string>
    const section = editorState.sectionKey

    let normalizedValues: Record<string, AdminValue> = {
      ...values,
    }

    if (section === 'workgroups') {
      const deputyUnits = splitTextValues(values.deputyUnitsText ?? '')
      const memberUnits = splitTextValues(values.memberUnitsText ?? '')

      normalizedValues = {
        ...normalizedValues,
        leader: values.leaderUnit,
        leaderUnit: values.leaderUnit,
        deputy: deputyUnits.join(' / '),
        deputyUnits,
        memberUnits,
        members: memberUnits.length,
        sort: Number(values.sort || 0),
        updatedAt: '2026-06-25 10:30',
      }
    }

    if (section === 'organizations') {
      normalizedValues = {
        ...normalizedValues,
        groups: values.participation
          ? values.participation
              .split('/')
              .map((item) => item.trim())
              .filter(Boolean).length
          : 0,
      }
    }

    if (section === 'content') {
      normalizedValues = {
        ...normalizedValues,
        updatedAt: '2026-06-25 10:30',
      }
    }

    if (section === 'archive') {
      normalizedValues = {
        ...normalizedValues,
        updatedAt: '2026-06-25',
      }
    }

    if (editorState.mode === 'create') {
      const nextRecord: AdminRecord = {
        key: `${section}-${Date.now()}`,
        ...normalizedValues,
      }

      if (apiOnline) {
        await createAdminRecord(section, nextRecord)
        await refreshAdminData()
        message.success(`${sectionConfigs[section].primaryActionLabel}已保存到后台数据库`)
        setEditorState(null)
        return
      }

      setTableRows((current) => ({
        ...current,
        [section]: [nextRecord, ...current[section]],
      }))
      appendLogRecord(
        section === 'workgroups'
          ? '工作组新增'
          : section === 'organizations'
            ? '成员单位新增'
            : section === 'users'
              ? '用户账号新增'
              : section === 'content'
                ? '内容发布新增'
                : '归档任务新增',
        getRecordDisplayName(nextRecord),
        `通过平台管理中心新增${getEditableSectionLabel(section)}`,
      )
      message.success(`${sectionConfigs[section].primaryActionLabel}已保存到本地数据`)
    } else if (editorState.record) {
      const targetName = getRecordDisplayName(editorState.record)

      if (apiOnline) {
        await updateAdminRecord(section, String(editorState.record.key), {
          ...editorState.record,
          ...normalizedValues,
        })
        await refreshAdminData()
        message.success(`${targetName} 已更新`)
        setEditorState(null)
        return
      }

      setTableRows((current) => ({
        ...current,
        [section]: current[section].map((item) =>
          item.key === editorState.record?.key
            ? {
                ...item,
                ...normalizedValues,
              }
            : item,
        ),
      }))
      appendLogRecord(
        section === 'workgroups'
          ? '工作组信息编辑'
          : section === 'organizations'
            ? '成员单位信息编辑'
            : section === 'users'
              ? '用户权限编辑'
              : section === 'content'
                ? '内容发布编辑'
                : '归档资料编辑',
        targetName,
        `通过平台管理中心编辑${getEditableSectionLabel(section)}信息`,
      )
      message.success(`${targetName} 已更新`)
    }

    setEditorState(null)
  }

  const watchedLeaderUnit = String(Form.useWatch('leaderUnit', workgroupDrawerForm) ?? '')
  const watchedDeputyUnits = (Form.useWatch('deputyUnits', workgroupDrawerForm) as string[] | undefined) ?? []
  const watchedMemberUnits = (Form.useWatch('memberUnits', workgroupDrawerForm) as string[] | undefined) ?? []

  const handleWorkgroupDrawerSubmit = async () => {
    if (!activeDrawerRecord) {
      return
    }

    const values = (await workgroupDrawerForm.validateFields()) as Record<string, string | string[]>
    const deputyUnits = getStringList(values.deputyUnits as AdminValue)
    const memberUnits = getStringList(values.memberUnits as AdminValue)
    const targetName = String(values.name ?? activeDrawerRecord.name ?? activeDrawerRecord.key)
    const nextRecord: AdminRecord = {
      ...activeDrawerRecord,
      name: String(values.name ?? ''),
      committee: String(values.committee ?? ''),
      status: String(values.status ?? ''),
      homepage: String(values.homepage ?? ''),
      secretary: String(values.secretary ?? ''),
      sort: Number(values.sort ?? 0),
      leader: String(values.leaderUnit ?? ''),
      leaderUnit: String(values.leaderUnit ?? ''),
      deputy: deputyUnits.join(' / '),
      deputyUnits,
      memberUnits,
      members: memberUnits.length,
      focus: String(values.focus ?? ''),
      meetingStatus: String(values.meetingStatus ?? ''),
      taskStatus: String(values.taskStatus ?? ''),
      archiveStatus: String(values.archiveStatus ?? ''),
      updatedAt: '2026-06-25 10:30',
    }

    if (apiOnline) {
      await updateAdminRecord('workgroups', String(activeDrawerRecord.key), nextRecord)
      await refreshAdminData()
      message.success(`${targetName} 的详情信息已更新`)
      return
    }

    setTableRows((current) => ({
      ...current,
      workgroups: current.workgroups.map((item) =>
        item.key === activeDrawerRecord.key
          ? nextRecord
          : item,
      ),
    }))
    appendLogRecord('工作组详情维护', targetName, '通过工作组详情抽屉维护组长单位、副组长单位和成员单位信息')
    message.success(`${targetName} 的详情信息已更新`)
  }

  const handleExportAdminData = () => {
    downloadJsonFile('admin-center-data.json', {
      exportedAt: new Date().toISOString(),
      settings: settingsState,
      tableRows,
      version: adminStorageVersion,
    })
    message.success('管理中心运行数据已导出')
  }

  const handleExportFullBackup = async () => {
    if (!apiOnline) {
      handleExportAdminData()
      message.warning('后台 API 未连接，已导出当前浏览器中的管理中心数据')
      return
    }

    const backup = await fetchAdminBackup()
    downloadJsonFile(`smart-av-platform-backup-${new Date().toISOString().slice(0, 10)}.json`, backup)
    message.success('完整备份已导出')
  }

  const handleRestoreFullBackup = () => {
    if (!apiOnline) {
      message.warning('恢复备份需要连接后台 API')
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const payload = JSON.parse(String(reader.result ?? '{}'))
          Modal.confirm({
            title: '恢复平台备份',
            content: '这会覆盖当前协同业务数据和系统设置，请确认备份文件来源可靠。',
            okText: '确认恢复',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
              const restored = await restoreAdminBackup(payload)
              applyBootstrapPayload(restored)
              message.success('平台备份已恢复')
            },
          })
        } catch {
          message.error('备份文件格式不正确')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleSaveSettings = async () => {
    if (apiOnline) {
      const savedSettings = await saveAdminSettings(settingsState)
      setSettingsState(normalizeSettings(savedSettings))
      await refreshAdminData()
      message.success('系统设置已保存到后台数据库')
      return
    }

    message.success('系统设置已保存到本地持久化状态')
  }

  const handleResetAdminData = () => {
    Modal.confirm({
      title: '恢复管理中心初始数据',
      content: '这会清除当前浏览器中保存的管理中心变更，并恢复到内置初始数据。',
      okText: '恢复初始数据',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (apiOnline) {
          const payload = await resetAdminData()
          applyBootstrapPayload(payload)
          message.success('后台数据已恢复到初始状态')
          return
        }

        setTableRows(initialTableRows)
        setSettingsState(initialSettingsState)
        message.success('管理中心数据已恢复到初始状态')
      },
    })
  }
  const drawerEditableSection = drawerState && isEditableSection(drawerState.sectionKey) ? drawerState.sectionKey : null

  return (
    <AppLayout footerCaption="平台治理协同" footerTitle="管理控制台" versionLabel="Admin Console">
      <div className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>平台管理中心</span>
            <h1>{activeSection.label}</h1>
            <p>{activeSection.description}</p>
          </div>
          <div className={styles.heroMeta}>
            <Tag color="blue">管理员可见</Tag>
            <Tag color="cyan">蓝白协同控制台</Tag>
            <Tag color="geekblue">{currentUser.role}</Tag>
          </div>
        </section>

        <section className={styles.subnav}>
          {adminSections.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`${styles.subnavItem} ${item.key === activeSection.key ? styles.subnavItemActive : ''}`}
            >
              <span className={styles.subnavIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </section>

        {sectionKey === 'overview' ? (
          <>
            <section className={styles.statGrid}>
              {overviewStats.map((item) => (
                <Card key={item.label} className={styles.statCard} bordered={false}>
                  <span className={styles.statLabel}>{item.label}</span>
                  <strong className={styles.statValue}>{item.value}</strong>
                  <span className={styles.statHint}>{item.hint}</span>
                </Card>
              ))}
            </section>

            <section className={styles.panelGrid}>
              <Card className={styles.panelCard} title="待办提醒" bordered={false}>
                <ul className={styles.list}>
                  <li>3 个工作组首页展示顺序待确认。</li>
                  <li>2 份标准草案缺少评审意见归档。</li>
                  <li>7 条权限申请待秘书处或平台管理员处理。</li>
                </ul>
              </Card>
              <Card className={styles.panelCard} title="运行关注" bordered={false}>
                <ul className={styles.list}>
                  <li>产业推广组有 2 项任务逾期未回填。</li>
                  <li>6 月会议纪要归档率当前为 73%。</li>
                  <li>成员单位活跃度前 3：华域视联、星河视研院、未来视界。</li>
                </ul>
              </Card>
              <Card className={styles.panelCard} title="权限动态" bordered={false}>
                <ul className={styles.list}>
                  <li>本周新增委员会管理员 1 人。</li>
                  <li>2 个工作组秘书申请扩大文件查看范围。</li>
                  <li>平台管理员已完成 1 项系统配置调整。</li>
                </ul>
              </Card>
            </section>

            <section className={styles.progressGrid}>
              {overviewProgress.map((item) => (
                <Card key={item.label} className={styles.progressCard} bordered={false}>
                  <div className={styles.progressHeader}>
                    <strong>{item.label}</strong>
                    <span>{item.percent}%</span>
                  </div>
                  <Progress percent={item.percent} showInfo={false} strokeColor="#2563ff" />
                  <p>{item.hint}</p>
                </Card>
              ))}
            </section>
          </>
        ) : sectionKey === 'settings' ? (
          <>
            <section className={styles.panelGrid}>
              <Card className={styles.panelCard} title="平台基础信息" bordered={false}>
                <div className={styles.settingList}>
                  <label className={styles.settingItem}>
                    <span className={styles.settingLabel}>平台名称</span>
                    <Input
                      value={settingsState.platformName}
                      onChange={(event) => setSettingsState((current) => ({ ...current, platformName: event.target.value }))}
                    />
                  </label>
                  <label className={styles.settingItem}>
                    <span className={styles.settingLabel}>演示环境标识</span>
                    <Input
                      value={settingsState.demoTag}
                      onChange={(event) => setSettingsState((current) => ({ ...current, demoTag: event.target.value }))}
                    />
                  </label>
                </div>
              </Card>
              <Card className={styles.panelCard} title="技术支持信息" bordered={false}>
                <div className={styles.settingList}>
                  <label className={styles.settingItem}>
                    <span className={styles.settingLabel}>支持团队</span>
                    <Input
                      value={settingsState.supportTeam}
                      onChange={(event) => setSettingsState((current) => ({ ...current, supportTeam: event.target.value }))}
                    />
                  </label>
                  <label className={styles.settingItem}>
                    <span className={styles.settingLabel}>支持邮箱</span>
                    <Input
                      value={settingsState.supportEmail}
                      onChange={(event) => setSettingsState((current) => ({ ...current, supportEmail: event.target.value }))}
                    />
                  </label>
                  <label className={styles.settingItem}>
                    <span className={styles.settingLabel}>支持电话</span>
                    <Input
                      value={settingsState.supportPhone}
                      onChange={(event) => setSettingsState((current) => ({ ...current, supportPhone: event.target.value }))}
                    />
                  </label>
                </div>
              </Card>
              <Card className={styles.panelCard} title="首页模块开关" bordered={false}>
                <div className={styles.moduleList}>
                  {[
                    ['portal', '首页门户'],
                    ['workgroups', '工作组空间'],
                    ['files', '文件与知识中心'],
                    ['members', '会员信息中心'],
                    ['meetings', '会议中心'],
                    ['dynamics', '工作组动态'],
                  ].map(([key, label]) => (
                    <div key={key} className={styles.moduleItem}>
                      <div>
                        <strong>{label}</strong>
                        <p>控制该模块是否在演示环境中展示。</p>
                      </div>
                      <Switch
                        checked={settingsState.modules[key as keyof typeof settingsState.modules]}
                        onChange={(checked) =>
                          setSettingsState((current) => ({
                            ...current,
                            modules: {
                              ...current.modules,
                              [key]: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <div className={styles.saveRow}>
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => void handleSaveSettings()}
              >
                保存系统设置
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportAdminData}>
                导出运行数据
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => void handleExportFullBackup()}>
                导出完整备份
              </Button>
              <Button icon={<UploadOutlined />} onClick={handleRestoreFullBackup}>
                恢复备份文件
              </Button>
              <Button danger icon={<RestOutlined />} onClick={handleResetAdminData}>
                恢复初始数据
              </Button>
              <span className={styles.saveHint}>
                {apiOnline ? '当前已连接后台 API，数据变更会持久化保存。' : '后台 API 未连接，当前使用浏览器本地持久化兜底。'}
              </span>
            </div>
          </>
        ) : (
          <>
            <section className={styles.metricGrid}>
              {sectionMetrics.map((item) => (
                <Card key={item.label} className={styles.metricCard} bordered={false}>
                  <span className={styles.metricLabel}>{item.label}</span>
                  <strong className={styles.metricValue}>{item.value}</strong>
                  <span className={styles.metricHint}>{item.hint}</span>
                </Card>
              ))}
            </section>

            <Card className={styles.tableCard} bordered={false}>
              <div className={styles.tableHeader}>
                <div>
                  <h2>{activeConfig?.summaryTitle}</h2>
                  <p>{activeConfig?.summaryDescription}</p>
                </div>
                <Tag color={apiOnline ? 'green' : 'blue'}>{apiOnline ? '后台 API' : '本地持久化'}</Tag>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.toolbarMain}>
                  <Input
                    allowClear
                    value={keyword}
                    prefix={<SearchOutlined />}
                    placeholder={`搜索${activeSection.label}关键词`}
                    className={styles.searchInput}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                  <Select
                    value={filterValue}
                    suffixIcon={<FilterOutlined />}
                    className={styles.filterSelect}
                    options={filterOptions.map((item) => ({ label: item, value: item }))}
                    onChange={setFilterValue}
                  />
                </div>
                <div className={styles.toolbarAside}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setKeyword('')
                      setFilterValue('全部')
                    }}
                  >
                    重置筛选
                  </Button>
                  <Button
                    type="primary"
                    icon={
                      activeTableSection === 'workgroups'
                        ? <TeamOutlined />
                        : activeTableSection === 'organizations'
                          ? <ApartmentOutlined />
                          : activeTableSection === 'users'
                            ? <UserSwitchOutlined />
                            : activeTableSection === 'content'
                              ? <NotificationOutlined />
                              : activeTableSection === 'archive'
                                ? <BookOutlined />
                                : activeTableSection === 'supervision'
                                  ? <AuditOutlined />
                                  : <FileProtectOutlined />
                    }
                    onClick={() => {
                      if (
                        activeTableSection === 'workgroups' ||
                        activeTableSection === 'organizations' ||
                        activeTableSection === 'users' ||
                        activeTableSection === 'content' ||
                        activeTableSection === 'archive'
                      ) {
                        setEditorState({
                          mode: 'create',
                          sectionKey: activeTableSection,
                        })
                        return
                      }

                      message.success(`${activeConfig?.primaryActionLabel}功能已进入前端演示流程`)
                    }}
                  >
                    {activeConfig?.primaryActionLabel}
                  </Button>
                </div>
              </div>

              {filteredRows.length ? (
                <Table
                  columns={tableColumns}
                  dataSource={filteredRows}
                  pagination={{ pageSize: 6, showSizeChanger: false }}
                  rowKey="key"
                  scroll={{ x: 1080 }}
                />
              ) : (
                <div className={styles.emptyWrap}>
                  <Empty description={activeConfig?.emptyDescription} />
                </div>
              )}
            </Card>
          </>
        )}

        <section className={styles.quickLinks}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} xl={8}>
              <Card className={styles.quickCard} bordered={false}>
                <span className={styles.quickIcon}><TeamOutlined /></span>
                <div>
                  <h3>工作组快捷治理</h3>
                  <p>从工作组空间顶部“工作组管理”按钮可直接跳到本控制台的工作组管理模块。</p>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <Card className={styles.quickCard} bordered={false}>
                <span className={styles.quickIcon}><DeploymentUnitOutlined /></span>
                <div>
                  <h3>角色与入口隔离</h3>
                  <p>普通成员仅看到协同业务导航，平台管理入口只对管理员角色显示。</p>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <Card className={styles.quickCard} bordered={false}>
                <span className={styles.quickIcon}><AuditOutlined /></span>
                <div>
                  <h3>全局运行监管</h3>
                  <p>会议、任务、成果、归档和权限申请可以在此集中巡检。</p>
                </div>
              </Card>
            </Col>
          </Row>
        </section>
      </div>

      <Drawer
        title={
          drawerState
            ? drawerState.sectionKey === 'workgroups'
              ? `${String(activeDrawerRecord?.name ?? drawerState.record.name ?? '工作组')} · 详情维护`
              : `${adminSections.find((item) => item.key === drawerState.sectionKey)?.label}详情`
            : '详情'
        }
        open={Boolean(drawerState)}
        width={drawerState?.sectionKey === 'workgroups' ? 760 : 520}
        onClose={() => setDrawerState(null)}
        extra={
          drawerEditableSection && activeDrawerRecord ? (
            <Space>
              <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteRecord(drawerEditableSection, activeDrawerRecord, true)}>
                删除{getEditableSectionLabel(drawerEditableSection)}
              </Button>
              {drawerEditableSection === 'workgroups' ? (
                <Button type="primary" onClick={() => void handleWorkgroupDrawerSubmit()}>
                  保存维护
                </Button>
              ) : null}
            </Space>
          ) : null
        }
      >
        {drawerState && activeDrawerRecord ? (
          drawerState.sectionKey === 'workgroups' ? (
            <div className={styles.workgroupDrawer}>
              <section className={styles.workgroupHero}>
                <div>
                  <span className={styles.eyebrow}>工作组详情维护</span>
                  <h3>{String(activeDrawerRecord.name ?? '')}</h3>
                  <p>{String(activeDrawerRecord.focus ?? '可在此维护工作组基础信息、单位构成和运行状态。')}</p>
                </div>
                <div className={styles.heroMeta}>
                  <Tag color="blue">{String(activeDrawerRecord.status ?? '')}</Tag>
                  <Tag color="cyan">{String(activeDrawerRecord.homepage ?? '')}</Tag>
                  <Tag color="geekblue">{String(activeDrawerRecord.committee ?? '')}</Tag>
                </div>
              </section>

              <Form form={workgroupDrawerForm} layout="vertical" className={styles.workgroupDrawerForm}>
                <Tabs
                  items={[
                    {
                      key: 'overview',
                      label: '基础信息',
                      children: (
                        <div className={styles.drawerPanel}>
                          <div className={styles.formGrid}>
                            <Form.Item label="工作组名称" name="name" rules={[{ required: true, message: '请输入工作组名称' }]}>
                              <Input placeholder="请输入工作组名称" />
                            </Form.Item>
                            <Form.Item label="所属委员会" name="committee" rules={[{ required: true, message: '请选择所属委员会' }]}>
                              <Select
                                options={['技术与项目管理委员会', '标准与认证委员会', '产业发展委员会'].map((item) => ({
                                  label: item,
                                  value: item,
                                }))}
                              />
                            </Form.Item>
                            <Form.Item label="工作组秘书" name="secretary" rules={[{ required: true, message: '请输入工作组秘书' }]}>
                              <Input placeholder="请输入工作组秘书" />
                            </Form.Item>
                            <Form.Item label="排序" name="sort" rules={[{ required: true, message: '请输入排序号' }]}>
                              <Input placeholder="请输入排序号" />
                            </Form.Item>
                            <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
                              <Select options={['筹备中', '运行中', '重点推进'].map((item) => ({ label: item, value: item }))} />
                            </Form.Item>
                            <Form.Item label="首页展示" name="homepage" rules={[{ required: true, message: '请选择首页展示状态' }]}>
                              <Select options={['已展示', '待展示'].map((item) => ({ label: item, value: item }))} />
                            </Form.Item>
                          </div>
                          <Form.Item label="当前重点" name="focus" rules={[{ required: true, message: '请输入当前重点' }]}>
                            <Input.TextArea rows={4} placeholder="请输入当前重点推进事项" />
                          </Form.Item>
                        </div>
                      ),
                    },
                    {
                      key: 'units',
                      label: '单位维护',
                      children: (
                        <div className={styles.drawerPanel}>
                          <div className={styles.unitStats}>
                            <article className={styles.unitStatCard}>
                              <span>组长单位</span>
                              <strong>{watchedLeaderUnit || '待设置'}</strong>
                            </article>
                            <article className={styles.unitStatCard}>
                              <span>副组长单位</span>
                              <strong>{watchedDeputyUnits.length} 家</strong>
                            </article>
                            <article className={styles.unitStatCard}>
                              <span>成员单位</span>
                              <strong>{watchedMemberUnits.length} 家</strong>
                            </article>
                          </div>
                          <Form.Item label="组长单位" name="leaderUnit" rules={[{ required: true, message: '请选择组长单位' }]}>
                            <Select
                              showSearch
                              placeholder="请选择组长单位"
                              options={organizationUnitOptions}
                            />
                          </Form.Item>
                          <Form.Item label="副组长单位" name="deputyUnits" rules={[{ required: true, message: '请至少选择一个副组长单位' }]}>
                            <Select
                              mode="multiple"
                              allowClear
                              showSearch
                              placeholder="请选择副组长单位"
                              options={organizationUnitOptions}
                            />
                          </Form.Item>
                          <Form.Item label="成员单位" name="memberUnits" rules={[{ required: true, message: '请至少选择一个成员单位' }]}>
                            <Select
                              mode="multiple"
                              allowClear
                              showSearch
                              placeholder="请选择成员单位"
                              options={organizationUnitOptions}
                            />
                          </Form.Item>
                          <p className={styles.unitHint}>这里会自动同步表格中的组长单位、副组长单位展示和成员单位数量。</p>
                        </div>
                      ),
                    },
                    {
                      key: 'operations',
                      label: '运行概览',
                      children: (
                        <div className={styles.drawerPanel}>
                          <Form.Item label="会议进展" name="meetingStatus" rules={[{ required: true, message: '请输入会议进展' }]}>
                            <Input.TextArea rows={3} placeholder="请输入会议进展" />
                          </Form.Item>
                          <Form.Item label="任务进展" name="taskStatus" rules={[{ required: true, message: '请输入任务进展' }]}>
                            <Input.TextArea rows={3} placeholder="请输入任务进展" />
                          </Form.Item>
                          <Form.Item label="归档进展" name="archiveStatus" rules={[{ required: true, message: '请输入归档进展' }]}>
                            <Input.TextArea rows={3} placeholder="请输入归档进展" />
                          </Form.Item>
                          <div className={styles.timeline}>
                            <div className={styles.timelineItem}>
                              <span className={styles.timelineDot} />
                              <div className={styles.timelineBody}>
                                <strong>最近更新</strong>
                                <p>{String(activeDrawerRecord.updatedAt ?? '')}</p>
                              </div>
                            </div>
                            <div className={styles.timelineItem}>
                              <span className={styles.timelineDot} />
                              <div className={styles.timelineBody}>
                                <strong>当前责任秘书</strong>
                                <p>{String(activeDrawerRecord.secretary ?? '')}</p>
                              </div>
                            </div>
                            <div className={styles.timelineItem}>
                              <span className={styles.timelineDot} />
                              <div className={styles.timelineBody}>
                                <strong>展示状态</strong>
                                <p>{String(activeDrawerRecord.homepage ?? '')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              </Form>
            </div>
          ) : (
            <div className={styles.drawerContent}>
              <Descriptions
                column={1}
                items={drawerItems}
                labelStyle={{ width: '9rem', color: '#66789f' }}
                contentStyle={{ color: '#17305f' }}
              />
            </div>
          )
        ) : null}
      </Drawer>

      <Modal
        open={Boolean(editorState)}
        title={
          editorState
            ? `${editorState.mode === 'create' ? '新增' : '编辑'}${getEditableSectionLabel(editorState.sectionKey)}`
            : '编辑'
        }
        width={640}
        destroyOnHidden
        onCancel={() => setEditorState(null)}
        onOk={() => void handleEditorSubmit()}
      >
        {editorState ? (
          <Form form={editorForm} layout="vertical" className={styles.editorForm}>
            {editableSectionFields[editorState.sectionKey].map((field) => (
              <Form.Item
                key={field.name}
                label={field.label}
                name={field.name}
                rules={[{ required: true, message: `请输入${field.label}` }]}
              >
                {field.type === 'select' ? (
                  <Select
                    options={(field.options ?? []).map((item) => ({ label: item, value: item }))}
                    placeholder={field.placeholder ?? `请选择${field.label}`}
                  />
                ) : field.type === 'textarea' ? (
                  <Input.TextArea rows={4} placeholder={field.placeholder ?? `请输入${field.label}`} />
                ) : (
                  <Input placeholder={field.placeholder ?? `请输入${field.label}`} />
                )}
              </Form.Item>
            ))}
          </Form>
        ) : null}
      </Modal>
    </AppLayout>
  )
}

export default AdminCenterPage
