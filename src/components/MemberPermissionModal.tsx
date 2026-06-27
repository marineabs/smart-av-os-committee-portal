import { Modal } from 'antd'
import type { MemberPermissionGuideItem } from '../types/portal'
import styles from './MemberPermissionModal.module.css'

interface MemberPermissionModalProps {
  guides: MemberPermissionGuideItem[]
  onClose: () => void
  open: boolean
}

function MemberPermissionModal({ guides, onClose, open }: MemberPermissionModalProps) {
  return (
    <Modal
      open={open}
      title="会员权限说明"
      width={760}
      onCancel={onClose}
      onOk={onClose}
      okText="我知道了"
      cancelButtonProps={{ style: { display: 'none' } }}
      destroyOnHidden
    >
      <div className={styles.list}>
        {guides.map((item) => (
          <section key={item.category} className={styles.item}>
            <strong>{item.category}</strong>
            <p>{item.description}</p>
          </section>
        ))}
      </div>
    </Modal>
  )
}

export default MemberPermissionModal
