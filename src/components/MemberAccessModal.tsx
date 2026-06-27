import { Form, Input, Modal, Select } from 'antd'
import { useEffect } from 'react'
import type { MemberUnit } from '../types/portal'

interface MemberAccessModalProps {
  member: MemberUnit | null
  onClose: () => void
  onSubmit: (memberId: string, values: { scope: string; groups: string[]; enabled: boolean }) => void
  open: boolean
}

function MemberAccessModal({ member, onClose, onSubmit, open }: MemberAccessModalProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (!open) {
      return
    }

    if (!member) {
      form.resetFields()
      return
    }

    form.setFieldsValue({
      enabled: member.accountEnabled ? '已启用' : '未启用',
      groups: member.workgroups,
      scope: member.accounts[0]?.scope ?? '公开资料',
    })
  }, [form, member, open])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (member) {
        onSubmit(member.id, {
          enabled: values.enabled === '已启用',
          groups: values.groups,
          scope: values.scope,
        })
      }
    } catch {
      // Ant Design has already rendered field-level validation messages.
    }
  }

  return (
    <Modal
      open={open}
      title={member ? `${member.name} · 权限设置` : '权限设置'}
      width={640}
      onCancel={onClose}
      onOk={() => void handleOk()}
      okText="保存设置"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label="账号状态" name="enabled" rules={[{ required: true, message: '请选择账号状态' }]}>
          <Select>
            <Select.Option value="已启用">已启用</Select.Option>
            <Select.Option value="未启用">未启用</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="授权工作组" name="groups" rules={[{ required: true, message: '请选择授权工作组' }]}>
          <Select mode="multiple" placeholder="请选择授权工作组">
            {member?.workgroups.map((group) => (
              <Select.Option key={group} value={group}>
                {group}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="可访问资料范围" name="scope" rules={[{ required: true, message: '请输入可访问资料范围' }]}>
          <Input.TextArea rows={3} placeholder="例如：公开资料、技术分委会、技术标准组" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default MemberAccessModal
