import { InboxOutlined } from '@ant-design/icons'
import { Form, Input, Modal, Select, Upload, message } from 'antd'
import type { UploadFile } from 'antd'
import { useState } from 'react'
import type {
  KnowledgeCategory,
  KnowledgeFile,
  KnowledgeFileStatus,
  KnowledgePermissionLevel,
} from '../types/portal'

interface UploadFileModalProps {
  categories: KnowledgeCategory[]
  open: boolean
  onCancel: () => void
  onSubmit: (file: Omit<KnowledgeFile, 'id' | 'isFavorite' | 'canView' | 'hasNewVersion' | 'needsComment' | 'needsReview' | 'updatedThisMonth'>) => void | Promise<void>
  workgroups: string[]
}

interface UploadFormValues {
  categoryId: string
  description: string
  permission: KnowledgePermissionLevel
  status: KnowledgeFileStatus
  title: string
  uploader: string
  version: string
  workgroup: string
}

function readUploadFile(file?: UploadFile) {
  return new Promise<{ data: string; mimeType: string; name: string; size: number } | null>((resolve, reject) => {
    const rawFile = file?.originFileObj
    if (!rawFile) {
      resolve(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const [, data = result] = result.split(',')
      resolve({
        data,
        mimeType: rawFile.type || 'application/octet-stream',
        name: rawFile.name,
        size: rawFile.size,
      })
    }
    reader.onerror = () => reject(new Error('文件读取失败，请重新选择文件'))
    reader.readAsDataURL(rawFile)
  })
}

function UploadFileModal({ categories, open, onCancel, onSubmit, workgroups }: UploadFileModalProps) {
  const [form] = Form.useForm<UploadFormValues>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleFinish = async (values: UploadFormValues) => {
    const category = categories.find((item) => item.id === values.categoryId)
    const filename = fileList[0]?.name ?? values.title
    const extension = filename.split('.').pop()?.toLowerCase()
    const type =
      extension === 'xlsx'
        ? 'xlsx'
        : extension === 'ppt' || extension === 'pptx'
          ? 'pptx'
          : extension === 'pdf'
            ? 'pdf'
            : 'docx'

    try {
      setSubmitting(true)
      const uploadedFile = await readUploadFile(fileList[0])
      await onSubmit({
        title: values.title,
        type,
        categoryId: values.categoryId,
        categoryLabel: category?.label ?? '未分类',
        workgroup: values.workgroup,
        version: values.version,
        status: values.status,
        permission: values.permission,
        uploader: values.uploader,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        fileCode: `AVOS-UP-${Date.now().toString().slice(-6)}`,
        topicIds: [],
        originalFileName: uploadedFile?.name ?? filename,
        mimeType: uploadedFile?.mimeType,
        fileSize: uploadedFile?.size,
        fileData: uploadedFile?.data,
        description: values.description,
      })

      form.resetFields()
      setFileList([])
    } catch (error) {
      message.error(error instanceof Error ? error.message : '资料上传失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="上传资料"
      width={760}
      okText="确认上传"
      cancelText="取消"
      onCancel={() => {
        form.resetFields()
        setFileList([])
        onCancel()
      }}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="文件名称" name="title" rules={[{ required: true, message: '请输入文件名称' }]}>
          <Input placeholder="请输入文件名称" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Form.Item label="所属分类" name="categoryId" rules={[{ required: true }]}>
            <Select placeholder="请选择">
              {categories.filter((item) => item.id !== 'all').map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="所属工作组" name="workgroup" rules={[{ required: true }]}>
            <Select placeholder="请选择">
              {workgroups.filter((item) => item !== '全部').map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="文件状态" name="status" rules={[{ required: true }]}>
            <Select placeholder="请选择">
              <Select.Option value="草稿版">草稿版</Select.Option>
              <Select.Option value="征求意见版">征求意见版</Select.Option>
              <Select.Option value="会议讨论版">会议讨论版</Select.Option>
              <Select.Option value="定稿版">定稿版</Select.Option>
              <Select.Option value="发布版">发布版</Select.Option>
              <Select.Option value="归档版">归档版</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Form.Item label="权限级别" name="permission" rules={[{ required: true }]}>
            <Select placeholder="请选择">
              <Select.Option value="公开资料">公开资料</Select.Option>
              <Select.Option value="分委会资料">分委会资料</Select.Option>
              <Select.Option value="工作组资料">工作组资料</Select.Option>
              <Select.Option value="指定单位资料">指定单位资料</Select.Option>
              <Select.Option value="秘书处资料">秘书处资料</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="上传单位" name="uploader" rules={[{ required: true }]}>
            <Input placeholder="请输入上传单位" />
          </Form.Item>
          <Form.Item label="版本号" name="version" rules={[{ required: true }]}>
            <Input placeholder="例如 V1.0" />
          </Form.Item>
        </div>

        <Form.Item label="文件说明" name="description">
          <Input.TextArea rows={3} placeholder="请输入文件说明" />
        </Form.Item>

        <Form.Item label="文件上传">
          <Upload.Dragger
            multiple={false}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: nextFileList }) => setFileList(nextFileList.slice(-1))}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint">提交后会保存文件内容，可在列表中下载。</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UploadFileModal
