import { Modal } from 'antd'
import type { KnowledgePermissionGuideItem } from '../types/portal'
import PermissionTag from './PermissionTag'
import styles from './PermissionInfoModal.module.css'

interface PermissionInfoModalProps {
  guides: KnowledgePermissionGuideItem[]
  open: boolean
  onClose: () => void
}

function PermissionInfoModal({ guides, open, onClose }: PermissionInfoModalProps) {
  return (
    <Modal open={open} title="权限说明" footer={null} width={720} onCancel={onClose} destroyOnHidden>
      <div className={styles.content}>
        {guides.map((guide) => (
          <div key={guide.level} className={styles.item}>
            <PermissionTag level={guide.level} />
            <span>{guide.description}</span>
          </div>
        ))}
        <p className={styles.note}>
          文件访问权限由组织权限、角色权限和文件权限共同决定，用户只能查看和检索已授权范围内的资料。
        </p>
      </div>
    </Modal>
  )
}

export default PermissionInfoModal
