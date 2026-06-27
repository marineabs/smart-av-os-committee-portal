import { App } from 'antd'
import { useEffect, useState } from 'react'
import FilePreviewModal from '../components/FilePreviewModal'
import KnowledgeFilterBar from '../components/KnowledgeFilterBar'
import type { KnowledgeFilterState } from '../components/KnowledgeFilterBar'
import KnowledgeFileTable from '../components/KnowledgeFileTable'
import KnowledgeHero from '../components/KnowledgeHero'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import PermissionInfoModal from '../components/PermissionInfoModal'
import UploadFileModal from '../components/UploadFileModal'
import AppLayout from '../layouts/AppLayout'
import {
  knowledgeCategories,
  knowledgeFilterOptions,
  knowledgeFiles as initialKnowledgeFiles,
  knowledgePermissionGuides,
  knowledgeStats,
} from '../mock/knowledgeCenter'
import { getActiveUser } from '../services/auth'
import type { KnowledgeFile, KnowledgeQuickFilter } from '../types/portal'
import {
  auditCollaborationRecord,
  createCollaborationRecord,
  deleteCollaborationRecord,
  fetchCollaborationRecords,
  updateCollaborationRecord,
} from '../services/collaborationApi'
import {
  canCreateFileCategory,
  canManageWorkgroupContent,
  canUploadFiles,
  getRoleScopeLabel,
  isAdminUser,
  isRegularUser,
  isWorkgroupManager,
} from '../utils/permissions'
import styles from './KnowledgeCenterPage.module.css'

function KnowledgeCenterPage() {
  const { message } = App.useApp()
  const currentUser = getActiveUser()
  const allowUpload = canUploadFiles(currentUser)
  const allowCreateCategory = canCreateFileCategory(currentUser)
  const userIsAdmin = isAdminUser(currentUser)
  const userIsRegular = isRegularUser(currentUser)
  const userIsWorkgroupManager = isWorkgroupManager(currentUser)
  const [committedKeyword, setCommittedKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [files, setFiles] = useState(initialKnowledgeFiles)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [previewFile, setPreviewFile] = useState<KnowledgeFile | null>(null)
  const [quickFilter, setQuickFilter] = useState<KnowledgeQuickFilter>('all')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const [filters, setFilters] = useState<KnowledgeFilterState>({
    categoryId: 'all',
    dateRange: null,
    permission: '全部',
    status: '全部',
    uploader: '全部',
    workgroup: '全部',
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [committedKeyword, filters, quickFilter])

  useEffect(() => {
    let active = true

    fetchCollaborationRecords<KnowledgeFile>('knowledge-files', initialKnowledgeFiles)
      .then((records) => {
        if (!active) {
          return
        }

        setFiles(records)
        setApiOnline(true)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setApiOnline(false)
        message.warning('文件中心 API 未连接，当前使用本地示例数据')
      })

    return () => {
      active = false
    }
  }, [message])

  const accessibleFiles = files.filter((file) => {
    if (userIsAdmin) {
      return true
    }

    if (userIsWorkgroupManager) {
      return file.workgroup === currentUser.currentWorkgroup || file.canView
    }

    return file.canView && file.permission !== '秘书处资料' && file.permission !== '指定单位资料'
  })

  const filteredFiles = accessibleFiles.filter((file) => {
    const keyword = committedKeyword.trim().toLowerCase()
    const matchesCategory = filters.categoryId === 'all' ? true : file.categoryId === filters.categoryId
    const matchesKeyword = keyword
      ? [file.title, file.fileCode, file.workgroup, file.uploader]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      : true
    const matchesWorkgroup = filters.workgroup === '全部' ? true : file.workgroup === filters.workgroup
    const matchesStatus = filters.status === '全部' ? true : file.status === filters.status
    const matchesPermission = filters.permission === '全部' ? true : file.permission === filters.permission
    const matchesUploader = filters.uploader === '全部' ? true : file.uploader === filters.uploader
    const matchesDate = filters.dateRange
      ? file.updatedAt.slice(0, 10) >= filters.dateRange[0] &&
        file.updatedAt.slice(0, 10) <= filters.dateRange[1]
      : true

    const matchesQuickFilter =
      quickFilter === 'all'
        ? true
        : quickFilter === 'visible'
          ? file.canView
          : quickFilter === 'favorite'
            ? file.isFavorite
            : quickFilter === 'recent'
              ? file.updatedThisMonth
              : quickFilter === 'review'
                ? file.status === '征求意见版'
                : quickFilter === 'comment'
                  ? file.needsComment
                  : file.hasNewVersion

    return (
      matchesCategory &&
      matchesKeyword &&
      matchesWorkgroup &&
      matchesStatus &&
      matchesPermission &&
      matchesUploader &&
      matchesDate &&
      matchesQuickFilter
    )
  })

  const pagedFiles = filteredFiles.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearch = () => {
    setCommittedKeyword(keywordDraft)
    message.success('已按当前条件筛选资料')
  }

  const handleReset = () => {
    setCommittedKeyword('')
    setKeywordDraft('')
    setQuickFilter('all')
    setFilters({
      categoryId: 'all',
      dateRange: null,
      permission: '全部',
      status: '全部',
      uploader: '全部',
      workgroup: '全部',
    })
  }

  const persistFile = async (file: KnowledgeFile) => {
    if (apiOnline) {
      return updateCollaborationRecord('knowledge-files', file)
    }

    return file
  }

  const handleUploadSubmit = async (
    nextFile: Omit<
      KnowledgeFile,
      'id' | 'isFavorite' | 'canView' | 'hasNewVersion' | 'needsComment' | 'needsReview' | 'updatedThisMonth'
    >,
  ) => {
    const createdFile: KnowledgeFile = {
      ...nextFile,
      id: `uploaded-${Date.now()}`,
      canView: true,
      isFavorite: false,
      hasNewVersion: false,
      needsComment: false,
      needsReview: false,
      updatedThisMonth: true,
      comments: [],
      versionHistory: [
        {
          id: `version-${Date.now()}`,
          version: nextFile.version,
          updatedAt: nextFile.updatedAt,
          operator: currentUser.name,
          note: '首次上传',
        },
      ],
    }

    const savedFile = apiOnline
      ? await createCollaborationRecord('knowledge-files', createdFile)
      : createdFile
    setFiles((current) => [savedFile, ...current])
    setShowUploadModal(false)
    message.success(apiOnline ? '资料已保存到文件中心' : '资料已加入本地示例列表')
  }

  const handleMoreAction = (file: KnowledgeFile, action: string) => {
    if (['delete', 'permission'].includes(action) && !canManageWorkgroupContent(currentUser, file.workgroup)) {
      message.warning('当前身份只能管理本组资料')
      return
    }

    if (action === 'favorite') {
      const nextFile = { ...file, isFavorite: !file.isFavorite }
      setFiles((current) => current.map((item) => (item.id === file.id ? nextFile : item)))
      void persistFile(nextFile).catch(() => message.warning('收藏状态暂未同步到后台'))
      return
    }

    if (action === 'delete') {
      setFiles((current) => current.filter((item) => item.id !== file.id))
      if (apiOnline) {
        void deleteCollaborationRecord<KnowledgeFile>('knowledge-files', file.id)
          .then(() => message.success(`已删除：${file.title}`))
          .catch(() => message.warning('后台删除失败，本地列表已移除'))
      }
      return
    }

    if (action === 'detail' || action === 'history') {
      setPreviewFile(file)
      if (apiOnline) {
        void auditCollaborationRecord('knowledge-files', file.id, {
          action: action === 'history' ? '查看历史版本' : '查看文件详情',
          target: file.title,
          detail: `${currentUser.name} 查看文件${action === 'history' ? '历史版本' : '详情'}`,
        })
      }
      return
    }

    message.info(`${file.title}：${action === 'delete' ? '已模拟删除操作' : `已打开${action}`}`)
  }

  const handleDownload = (file: KnowledgeFile) => {
    if (!file.fileData) {
      message.info(`示例资料暂无原始文件内容：${file.title}`)
      return
    }

    const byteCharacters = atob(file.fileData)
    const byteNumbers = Array.from(byteCharacters, (character) => character.charCodeAt(0))
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: file.mimeType ?? 'application/octet-stream',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.originalFileName ?? file.title
    link.click()
    URL.revokeObjectURL(url)
    if (apiOnline) {
      void auditCollaborationRecord('knowledge-files', file.id, {
        action: '文件下载',
        target: file.title,
        detail: `${currentUser.name} 下载文件 ${file.title}`,
      })
    }
  }

  const handleAddComment = async (file: KnowledgeFile, content: string) => {
    const nextFile: KnowledgeFile = {
      ...file,
      comments: [
        {
          id: `comment-${Date.now()}`,
          author: currentUser.name,
          organization: currentUser.organizationName,
          content,
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
        ...(file.comments ?? []),
      ],
      needsComment: false,
    }

    const savedFile = await persistFile(nextFile)
    setFiles((current) => current.map((item) => (item.id === file.id ? savedFile : item)))
    setPreviewFile(savedFile)
    message.success('评论已保存')
  }

  return (
    <AppLayout
      footerCaption="智慧视听生态"
      footerTitle="共建操作系统底座能力"
      versionLabel="V 1.0.0"
    >
      <div className={styles.page}>
        <KnowledgeHero
          canCreateCategory={allowCreateCategory}
          canUpload={allowUpload}
          onCreateCategory={() => message.info('当前为原型页面，可继续扩展分类创建流程')}
          onOpenPermission={() => setShowPermissionModal(true)}
          onUpload={() => {
            if (!allowUpload) {
              message.warning('普通用户仅支持浏览、下载和留言')
              return
            }
            setShowUploadModal(true)
          }}
          scopeLabel={getRoleScopeLabel(currentUser)}
        />

        <section className={styles.statsGrid}>
          {knowledgeStats.map((item) => (
            <KnowledgeStatCard
              key={item.title}
              className={styles.compactStatCard}
              iconClassName={styles.compactStatIcon}
              item={item}
              showDelta={false}
            />
          ))}
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <KnowledgeFilterBar
              activeKeyword={committedKeyword}
              activeQuickFilter={quickFilter}
              filters={filters}
              keywordValue={keywordDraft}
              options={knowledgeFilterOptions}
              onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              onKeywordChange={setKeywordDraft}
              onQuickFilterChange={setQuickFilter}
              onReset={handleReset}
              onSearch={handleSearch}
            />

            <KnowledgeFileTable
              canManageFile={(file) => canManageWorkgroupContent(currentUser, file.workgroup)}
              canManageFiles={userIsAdmin}
              canSetFilePermissions={(file) => canManageWorkgroupContent(currentUser, file.workgroup)}
              canSetPermissions={!userIsRegular}
              currentPage={currentPage}
              files={pagedFiles}
              onDownload={handleDownload}
              onMoreAction={handleMoreAction}
              onPageChange={(page, size) => {
                setCurrentPage(page)
                setPageSize(size)
              }}
              onPreview={setPreviewFile}
              onToggleFavorite={(fileId) =>
                setFiles((current) =>
                  current.map((item) => {
                    if (item.id !== fileId) {
                      return item
                    }

                    const nextFile = { ...item, isFavorite: !item.isFavorite }
                    void persistFile(nextFile).catch(() => message.warning('收藏状态暂未同步到后台'))
                    return nextFile
                  }),
                )
              }
              pageSize={pageSize}
              total={filteredFiles.length}
            />
          </div>
        </section>
      </div>

      <FilePreviewModal
        file={previewFile}
        onAddComment={handleAddComment}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />

      <UploadFileModal
        categories={knowledgeCategories}
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
        workgroups={
          userIsWorkgroupManager && currentUser.currentWorkgroup
            ? ['全部', currentUser.currentWorkgroup]
            : knowledgeFilterOptions.workgroups
        }
      />

      <PermissionInfoModal
        guides={knowledgePermissionGuides}
        open={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
      />
    </AppLayout>
  )
}

export default KnowledgeCenterPage
