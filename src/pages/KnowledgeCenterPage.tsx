import { App } from 'antd'
import { useEffect, useState } from 'react'
import FilePreviewModal from '../components/FilePreviewModal'
import HotFilesCard from '../components/HotFilesCard'
import KnowledgeCategoryPanel from '../components/KnowledgeCategoryPanel'
import KnowledgeFilterBar from '../components/KnowledgeFilterBar'
import type { KnowledgeFilterState } from '../components/KnowledgeFilterBar'
import KnowledgeFileTable from '../components/KnowledgeFileTable'
import KnowledgeHero from '../components/KnowledgeHero'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import PendingActionsCard from '../components/PendingActionsCard'
import PermissionGuideCard from '../components/PermissionGuideCard'
import PermissionInfoModal from '../components/PermissionInfoModal'
import RecentUpdatesCard from '../components/RecentUpdatesCard'
import UploadFileModal from '../components/UploadFileModal'
import AppLayout from '../layouts/AppLayout'
import {
  knowledgeCategories,
  knowledgeFilterOptions,
  knowledgeFiles as initialKnowledgeFiles,
  knowledgeHotFiles,
  knowledgePendingItems,
  knowledgePermissionGuides,
  knowledgeRecentUpdates,
  knowledgeStats,
  knowledgeTopics,
} from '../mock/knowledgeCenter'
import type {
  KnowledgeFile,
  KnowledgePendingItem,
  KnowledgeQuickFilter,
} from '../types/portal'
import styles from './KnowledgeCenterPage.module.css'

function KnowledgeCenterPage() {
  const { message } = App.useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [committedKeyword, setCommittedKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [files, setFiles] = useState(initialKnowledgeFiles)
  const [headerKeyword, setHeaderKeyword] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [previewFile, setPreviewFile] = useState<KnowledgeFile | null>(null)
  const [quickFilter, setQuickFilter] = useState<KnowledgeQuickFilter>('all')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
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
  }, [activeCategory, activeTopic, committedKeyword, filters, quickFilter])

  const filteredFiles = files.filter((file) => {
    const keyword = committedKeyword.trim().toLowerCase()
    const matchesCategory =
      activeCategory === 'all' && filters.categoryId === 'all'
        ? true
        : file.categoryId === (filters.categoryId === 'all' ? activeCategory : filters.categoryId)
    const matchesTopic = activeTopic ? file.topicIds.includes(activeTopic) : true
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
      matchesTopic &&
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
    setCommittedKeyword(headerKeyword)
    message.success('已按当前条件筛选资料')
  }

  const handleReset = () => {
    setActiveCategory('all')
    setActiveTopic(null)
    setCommittedKeyword('')
    setHeaderKeyword('')
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

  const handleUploadSubmit = (
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
    }

    setFiles((current) => [createdFile, ...current])
    setShowUploadModal(false)
    message.success('资料已加入本地 mock 列表')
  }

  const handleMoreAction = (file: KnowledgeFile, action: string) => {
    if (action === 'favorite') {
      setFiles((current) =>
        current.map((item) =>
          item.id === file.id ? { ...item, isFavorite: !item.isFavorite } : item,
        ),
      )
      return
    }

    message.info(`${file.title}：${action === 'delete' ? '已模拟删除操作' : `已打开${action}`}`)
  }

  const handlePendingClick = (item: KnowledgePendingItem) => {
    message.info(`${item.label}：${item.count}`)
  }

  return (
    <AppLayout
      contextLabel="工作台"
      footerCaption="智慧视听生态"
      footerTitle="共建操作系统底座能力"
      headerSearchValue={headerKeyword}
      onHeaderSearchChange={setHeaderKeyword}
      onHeaderSearchSubmit={setCommittedKeyword}
      searchPlaceholder="搜索文件名称、编号、工作组、上传单位等"
      versionLabel="V 1.0.0"
    >
      <div className={styles.page}>
        <KnowledgeHero
          onCreateCategory={() => message.info('当前为原型页面，可继续扩展分类创建流程')}
          onOpenPermission={() => setShowPermissionModal(true)}
          onUpload={() => setShowUploadModal(true)}
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
          <div className={styles.leftColumn}>
            <KnowledgeCategoryPanel
              activeCategory={activeCategory}
              activeTopic={activeTopic}
              categories={knowledgeCategories}
              topics={knowledgeTopics}
              onCategoryChange={(categoryId) => {
                setActiveCategory(categoryId)
                setFilters((current) => ({ ...current, categoryId }))
              }}
              onTopicChange={setActiveTopic}
            />
          </div>

          <div className={styles.mainColumn}>
            <KnowledgeFilterBar
              activeKeyword={committedKeyword}
              activeQuickFilter={quickFilter}
              filters={filters}
              options={knowledgeFilterOptions}
              onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              onQuickFilterChange={setQuickFilter}
              onReset={handleReset}
              onSearch={handleSearch}
            />

            <KnowledgeFileTable
              currentPage={currentPage}
              files={pagedFiles}
              onDownload={(file) => message.success(`已模拟下载：${file.title}`)}
              onMoreAction={handleMoreAction}
              onPageChange={(page, size) => {
                setCurrentPage(page)
                setPageSize(size)
              }}
              onPreview={setPreviewFile}
              onToggleFavorite={(fileId) =>
                setFiles((current) =>
                  current.map((item) =>
                    item.id === fileId ? { ...item, isFavorite: !item.isFavorite } : item,
                  ),
                )
              }
              pageSize={pageSize}
              total={filteredFiles.length}
            />
          </div>

          <aside className={styles.rightColumn}>
            <RecentUpdatesCard
              items={knowledgeRecentUpdates}
              onMore={() => message.info('可扩展为最近更新列表页')}
            />
            <PendingActionsCard
              items={knowledgePendingItems}
              onClickItem={handlePendingClick}
              onMore={() => message.info('可扩展为待办处理页')}
            />
            <HotFilesCard
              items={knowledgeHotFiles}
              onMore={() => message.info('可扩展为热门资料榜单页')}
            />
            <PermissionGuideCard
              items={knowledgePermissionGuides}
              onMore={() => setShowPermissionModal(true)}
            />
          </aside>
        </section>
      </div>

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={(file) => message.success(`已模拟下载：${file.title}`)}
      />

      <UploadFileModal
        categories={knowledgeCategories}
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
        workgroups={knowledgeFilterOptions.workgroups}
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
