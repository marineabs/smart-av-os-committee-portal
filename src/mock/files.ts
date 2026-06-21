import type { DocumentItem, KnowledgeFileStatus, KnowledgePermissionLevel, KnowledgeFileType } from '../types/portal'

export interface DemoFileRecord {
  id: string
  title: string
  type: KnowledgeFileType
  workgroup: string
  uploader: string
  version: string
  status: KnowledgeFileStatus
  permission: KnowledgePermissionLevel
  updatedAt: string
  summary: string
}

export const demoFiles: DemoFileRecord[] = [
  {
    id: 'file-1',
    title: '智慧视听操作系统总体演示架构说明',
    type: 'pdf',
    workgroup: '架构与内核组',
    uploader: '星河视研院',
    version: 'V1.0',
    status: '定稿版',
    permission: '工作组资料',
    updatedAt: '2026-06-22 09:30',
    summary: '用于演示整体能力结构、模块边界与协同链路。',
  },
  {
    id: 'file-2',
    title: '接口能力清单演示稿',
    type: 'docx',
    workgroup: '技术标准组',
    uploader: '华域视联',
    version: 'V0.9',
    status: '征求意见版',
    permission: '分委会资料',
    updatedAt: '2026-06-21 16:10',
    summary: '展示标准能力分类、接口分层与意见征集流程。',
  },
  {
    id: 'file-3',
    title: '终端兼容性测试演示报告',
    type: 'xlsx',
    workgroup: '测试验证组',
    uploader: '玄盾测评',
    version: 'V1.0',
    status: '归档版',
    permission: '秘书处资料',
    updatedAt: '2026-06-20 14:05',
    summary: '沉淀样机覆盖、问题归类和测试结论模板。',
  },
  {
    id: 'file-4',
    title: '产业试点场景说明材料',
    type: 'pptx',
    workgroup: '产业推进组',
    uploader: '灵境智能',
    version: 'V0.6',
    status: '会议讨论版',
    permission: '公开资料',
    updatedAt: '2026-06-19 11:40',
    summary: '概述演示应用场景、合作角色和阶段成果展示结构。',
  },
  {
    id: 'file-5',
    title: '工作组例会纪要模板',
    type: 'docx',
    workgroup: '秘书处',
    uploader: '秘书处',
    version: 'V1.2',
    status: '发布版',
    permission: '公开资料',
    updatedAt: '2026-06-18 10:20',
    summary: '统一会议纪要记录、事项跟踪和归档格式。',
  },
]

export const latestDocuments: DocumentItem[] = demoFiles.slice(0, 5).map((item) => ({
  title: item.title,
  date: item.updatedAt.slice(5, 10),
  type:
    item.type === 'docx'
      ? 'word'
      : item.type === 'xlsx'
        ? 'excel'
        : item.type === 'pptx'
          ? 'ppt'
          : 'pdf',
}))
