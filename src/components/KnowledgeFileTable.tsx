import { MoreOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import { App, Dropdown, InputNumber, Pagination, Select, Table } from 'antd'
import type { MenuProps, TableProps } from 'antd'
import type { KnowledgeFile, KnowledgeFileType } from '../types/portal'
import FileTypeIcon from './FileTypeIcon'
import PermissionTag from './PermissionTag'
import styles from './KnowledgeFileTable.module.css'

const fileTypeMap: Record<KnowledgeFileType, 'pdf' | 'word' | 'excel' | 'ppt'> = {
  pdf: 'pdf',
  docx: 'word',
  xlsx: 'excel',
  pptx: 'ppt',
}

interface KnowledgeFileTableProps {
  canManageFiles?: boolean
  canManageFile?: (file: KnowledgeFile) => boolean
  canSetPermissions?: boolean
  canSetFilePermissions?: (file: KnowledgeFile) => boolean
  currentPage: number
  files: KnowledgeFile[]
  onDownload: (file: KnowledgeFile) => void
  onMoreAction: (file: KnowledgeFile, action: string) => void
  onPreview: (file: KnowledgeFile) => void
  onToggleFavorite: (fileId: string) => void
  onPageChange: (page: number, pageSize: number) => void
  pageSize: number
  total: number
}

function KnowledgeFileTable({
  canManageFiles = true,
  canManageFile,
  canSetPermissions = true,
  canSetFilePermissions,
  currentPage,
  files,
  onDownload,
  onMoreAction,
  onPageChange,
  onPreview,
  onToggleFavorite,
  pageSize,
  total,
}: KnowledgeFileTableProps) {
  const { message } = App.useApp()

  const columns: TableProps<KnowledgeFile>['columns'] = [
    {
      title: '',
      dataIndex: 'favorite',
      key: 'favorite',
      width: 54,
      render: (_, file) => (
        <button
          className={styles.starButton}
          type="button"
          onClick={() => onToggleFavorite(file.id)}
          aria-label="收藏文件"
        >
          {file.isFavorite ? <StarFilled className={styles.starActive} /> : <StarOutlined />}
        </button>
      ),
    },
    {
      title: '文件名称',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (_, file) => (
        <div className={styles.nameCell}>
          <strong>{file.title}</strong>
          <small>{file.fileCode}</small>
        </div>
      ),
    },
    {
      title: '文件类型',
      dataIndex: 'type',
      key: 'type',
      width: 96,
      render: (value: KnowledgeFileType) => <FileTypeIcon type={fileTypeMap[value]} />,
    },
    {
      title: '所属分类',
      dataIndex: 'categoryLabel',
      key: 'categoryLabel',
      width: 110,
    },
    {
      title: '所属工作组',
      dataIndex: 'workgroup',
      key: 'workgroup',
      width: 126,
    },
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '权限级别',
      dataIndex: 'permission',
      key: 'permission',
      width: 108,
      render: (_, file) => <PermissionTag level={file.permission} />,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 142,
    },
    {
      title: '操作',
      key: 'actions',
      width: 84,
      align: 'center',
      render: (_, file) => {
        const allowManageFile = canManageFile ? canManageFile(file) : canManageFiles
        const allowSetFilePermissions = canSetFilePermissions ? canSetFilePermissions(file) : canSetPermissions
        const items: MenuProps['items'] = [
          { key: 'preview', label: '预览' },
          { key: 'download', label: '下载' },
          { key: 'detail', label: '查看详情' },
          { key: 'history', label: '历史版本' },
          { key: 'favorite', label: file.isFavorite ? '取消收藏' : '添加收藏' },
          ...(allowSetFilePermissions ? [{ key: 'permission', label: '权限设置' }] : []),
          ...(allowManageFile ? [{ key: 'delete', label: '删除' }] : []),
        ]

        return (
          <div className={styles.actionCell}>
            <Dropdown
              menu={{
                items,
                onClick: ({ key }) => {
                  if (key === 'preview') {
                    onPreview(file)
                    return
                  }

                  if (key === 'download') {
                    onDownload(file)
                    return
                  }

                  onMoreAction(file, key)
                },
              }}
              trigger={['click']}
            >
              <button type="button" aria-label="更多">
                <MoreOutlined />
              </button>
            </Dropdown>
          </div>
        )
      },
    },
  ]

  return (
    <section className={styles.wrapper}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={files}
        pagination={false}
        size="middle"
        scroll={{ x: 1120 }}
        rowSelection={
          canManageFiles
            ? {
                columnWidth: 42,
                onChange: (_, rows) => {
                  if (rows.length) {
                    message.info(`已选择 ${rows.length} 份资料`)
                  }
                },
              }
            : undefined
        }
      />

      <div className={styles.footer}>
        <div className={styles.footerMeta}>
          <span>共 {total} 条</span>
          <Select value={pageSize} onChange={(value) => onPageChange(1, value)} style={{ width: 110 }}>
            <Select.Option value={10}>10 条/页</Select.Option>
            <Select.Option value={20}>20 条/页</Select.Option>
            <Select.Option value={30}>30 条/页</Select.Option>
          </Select>
        </div>

        <div className={styles.paginationWrap}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showLessItems
          />
          <div className={styles.quickJump}>
            <span>跳至</span>
            <InputNumber min={1} max={Math.ceil(total / pageSize)} size="small" />
            <span>页</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default KnowledgeFileTable
