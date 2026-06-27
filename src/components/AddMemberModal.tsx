import { Form, Input, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import type { MemberUnit } from '../types/portal'
import { memberFilterOptions } from '../mock/memberCenter'

export interface MemberFormValues {
  name: string
  organizationType: string
  memberCategory: string
  committee: string
  workgroups: string[]
  primaryContact: string
  primaryContactTitle: string
  phone: string
  email: string
  capabilityTags: string[]
  status: string
  description: string
}

interface AddMemberModalProps {
  member?: MemberUnit | null
  onClose: () => void
  onSubmit: (values: MemberFormValues) => void | Promise<void>
  open: boolean
}

function AddMemberModal({ member, onClose, onSubmit, open }: AddMemberModalProps) {
  const [form] = Form.useForm<MemberFormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    if (!member) {
      form.resetFields()
      form.setFieldsValue({
        memberCategory: '委员单位',
        organizationType: '运营商',
        committee: '技术分委会',
        workgroups: [],
        capabilityTags: [],
        status: '正常',
      })
      return
    }

    form.setFieldsValue({
      name: member.name,
      organizationType: member.organizationType,
      memberCategory: member.memberCategory,
      committee: member.committee,
      workgroups: member.workgroups,
      primaryContact: member.primaryContact,
      primaryContactTitle: member.primaryContactTitle,
      phone: member.contacts[0]?.phone ?? '',
      email: member.contacts[0]?.email ?? '',
      capabilityTags: member.capabilityTags,
      status: member.status,
      description: member.description,
    })
  }, [form, member, open])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await onSubmit(values)
    } catch {
      // Ant Design has already rendered field-level validation messages.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={member ? `编辑会员单位 · ${member.name}` : '新增会员单位'}
      width={760}
      onCancel={onClose}
      onOk={() => void handleOk()}
      confirmLoading={submitting}
      okText={member ? '保存修改' : '确认新增'}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <Form.Item label="单位名称" name="name" rules={[{ required: true, message: '请输入单位名称' }]}>
            <Input placeholder="请输入单位名称" />
          </Form.Item>
          <Form.Item label="单位类型" name="organizationType" rules={[{ required: true, message: '请选择单位类型' }]}>
            <Select>
              {memberFilterOptions.organizationTypes.filter((item) => item !== '全部').map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="会员类别" name="memberCategory" rules={[{ required: true, message: '请选择会员类别' }]}>
            <Select>
              {memberFilterOptions.memberCategories.filter((item) => item !== '全部').map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="所属分委会" name="committee" rules={[{ required: true, message: '请选择所属分委会' }]}>
            <Select>
              {memberFilterOptions.committees.filter((item) => item !== '全部').map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="参与工作组" name="workgroups" rules={[{ required: true, message: '请选择参与工作组' }]}>
            <Select mode="multiple" placeholder="请选择参与工作组">
              {memberFilterOptions.workgroups.filter((item) => item !== '全部').map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="能力标签" name="capabilityTags" rules={[{ required: true, message: '请选择能力标签' }]}>
            <Select mode="multiple" placeholder="请选择能力标签">
              {memberFilterOptions.capabilities.filter((item) => item !== '全部').map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="主联系人" name="primaryContact" rules={[{ required: true, message: '请输入主联系人' }]}>
            <Input placeholder="请输入主联系人" />
          </Form.Item>
          <Form.Item label="联系人职务" name="primaryContactTitle" rules={[{ required: true, message: '请输入联系人职务' }]}>
            <Input placeholder="请输入联系人职务" />
          </Form.Item>
          <Form.Item label="手机" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="单位状态" name="status" rules={[{ required: true, message: '请选择单位状态' }]}>
            <Select>
              {memberFilterOptions.statuses.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <Form.Item label="单位简介" name="description" rules={[{ required: true, message: '请输入单位简介' }]}>
          <Input.TextArea rows={4} placeholder="请输入单位简介" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddMemberModal
