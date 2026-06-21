import { CloudUploadOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'
import styles from './ImportMemberModal.module.css'

interface ImportMemberModalProps {
  onClose: () => void
  onConfirm: () => void
  open: boolean
}

function ImportMemberModal({ onClose, onConfirm, open }: ImportMemberModalProps) {
  return (
    <Modal
      open={open}
      title="批量导入会员单位"
      width={700}
      onCancel={onClose}
      footer={[
        <Button key="template" icon={<DownloadOutlined />} onClick={onConfirm}>
          下载导入模板
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="confirm" type="primary" icon={<CloudUploadOutlined />} onClick={onConfirm}>
          确认导入
        </Button>,
      ]}
    >
      <div className={styles.body}>
        <section className={styles.uploadBox}>
          <CloudUploadOutlined />
          <strong>上传 Excel 模板</strong>
          <span>当前阶段为前端交互原型，点击“确认导入”后仅给出本地提示。</span>
        </section>

        <section className={styles.noteCard}>
          <h4>
            <FileTextOutlined />
            导入说明
          </h4>
          <ul>
            <li>模板字段建议包含单位名称、会员类别、所属分委会、参与工作组、联系人和能力标签。</li>
            <li>导入前请确认联系人手机号与邮箱格式正确，避免秘书处重复维护。</li>
            <li>待审核单位导入后默认进入“待审核”状态，可由秘书处统一复核。</li>
          </ul>
        </section>
      </div>
    </Modal>
  )
}

export default ImportMemberModal
