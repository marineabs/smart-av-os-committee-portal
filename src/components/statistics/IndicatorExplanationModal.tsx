import { Modal } from 'antd'

interface IndicatorExplanationModalProps {
  open: boolean
  onClose: () => void
}

function IndicatorExplanationModal({ open, onClose }: IndicatorExplanationModalProps) {
  return (
    <Modal title="指标说明" open={open} footer={null} onCancel={onClose} width={680}>
      <p>统计分析中心的指标由后端统计接口基于当前业务记录聚合生成。</p>
      <p>
        工作组活跃度由会议次数、资料上传、任务完成、意见反馈等指标综合计算；成员单位参与度由参会次数、提交资料、反馈意见和承担任务综合评估。
      </p>
      <p>
        任务完成率、活跃成员占比、标准项目阶段分布等指标用于辅助秘书处掌握运行态势，不作为正式考核结果。
      </p>
    </Modal>
  )
}

export default IndicatorExplanationModal
