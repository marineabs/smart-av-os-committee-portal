import { Button, Modal } from 'antd'
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

interface FilePreviewModalProps {
  file: KnowledgeFile | null
  onClose: () => void
  onDownload: (file: KnowledgeFile) => void
}

function FilePreviewModal({ file, onClose, onDownload }: FilePreviewModalProps) {
  return (
    <Modal
      open={Boolean(file)}
      title="文件预览"
      width={860}
      footer={null}
      onCancel={onClose}
      destroyOnClose
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
          </div>

          <div className={styles.previewBox}>
            文件在线预览区域，后续可接入 Office/PDF 预览服务。
          </div>

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
