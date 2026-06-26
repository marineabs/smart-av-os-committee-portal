import { Button, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'
import type { KnowledgeFile, KnowledgeFileType } from '../types/portal'
import FileStatusTag from './FileStatusTag'
import FileTypeIcon from './FileTypeIcon'
import PermissionTag from './PermissionTag'
import styles from './FilePreviewModal.module.css'

const fileTypeMap: Record<KnowledgeFileType, 'pdf' | 'word' | 'excel' | 'ppt'> = {
  pdf: 'pdf',
  docx: 'word',
  xlsx: 'excel',
  pptx: 'ppt',
}

function formatFileSize(size?: number) {
  if (!size) {
    return '暂无原始文件'
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

interface FilePreviewModalProps {
  file: KnowledgeFile | null
  onAddComment?: (file: KnowledgeFile, content: string) => void | Promise<void>
  onClose: () => void
  onDownload: (file: KnowledgeFile) => void
}

function FilePreviewModal({ file, onAddComment, onClose, onDownload }: FilePreviewModalProps) {
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    setCommentText('')
  }, [file?.id])

  return (
    <Modal
      open={Boolean(file)}
      title="文件预览"
      width={860}
      footer={null}
      onCancel={onClose}
      destroyOnHidden
    >
      {file ? (
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h3>{file.title}</h3>
              <div className={styles.metaRow}>
                <FileTypeIcon type={fileTypeMap[file.type]} />
                <span>{file.version}</span>
                <PermissionTag level={file.permission} />
                <FileStatusTag status={file.status} />
              </div>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div>
              <span>所属分类</span>
              <strong>{file.categoryLabel}</strong>
            </div>
            <div>
              <span>所属工作组</span>
              <strong>{file.workgroup}</strong>
            </div>
            <div>
              <span>上传单位</span>
              <strong>{file.uploader}</strong>
            </div>
            <div>
              <span>更新时间</span>
              <strong>{file.updatedAt}</strong>
            </div>
            <div>
              <span>原始文件</span>
              <strong>{file.originalFileName ?? '示例资料'}</strong>
            </div>
            <div>
              <span>文件大小</span>
              <strong>{formatFileSize(file.fileSize)}</strong>
            </div>
          </div>

          <div className={styles.previewBox}>
            {file.description || '已保存资料元数据。Office/PDF 在线渲染服务可在此区域继续接入。'}
          </div>

          <section className={styles.section}>
            <h4>历史版本</h4>
            <div className={styles.versionList}>
              {(file.versionHistory?.length ? file.versionHistory : [
                {
                  id: `${file.id}-current`,
                  version: file.version,
                  updatedAt: file.updatedAt,
                  operator: file.uploader,
                  note: '当前版本',
                },
              ]).map((item) => (
                <div key={item.id} className={styles.versionItem}>
                  <strong>{item.version}</strong>
                  <span>{item.updatedAt}</span>
                  <small>{item.operator} · {item.note}</small>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h4>文件评论</h4>
            <div className={styles.commentList}>
              {file.comments?.length ? file.comments.map((item) => (
                <div key={item.id} className={styles.commentItem}>
                  <strong>{item.author}</strong>
                  <p>{item.content}</p>
                  <small>{item.organization ? `${item.organization} · ` : ''}{item.createdAt}</small>
                </div>
              )) : <span className={styles.emptyText}>暂无评论</span>}
            </div>
            {onAddComment ? (
              <div className={styles.commentEditor}>
                <Input.TextArea
                  rows={3}
                  placeholder="请输入意见留言或技术讨论内容"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <Button
                  type="primary"
                  disabled={!commentText.trim()}
                  onClick={() => {
                    void onAddComment(file, commentText.trim())
                    setCommentText('')
                  }}
                >
                  发表评论
                </Button>
              </div>
            ) : null}
          </section>

          <div className={styles.actions}>
            <Button onClick={() => onDownload(file)}>下载</Button>
            <Button type="primary">查看详情</Button>
            <Button onClick={onClose}>关闭</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default FilePreviewModal
