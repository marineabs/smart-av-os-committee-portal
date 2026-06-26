import {
  CheckCircleFilled,
  LeftOutlined,
  SaveOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  Radio,
  Result,
  Select,
  Space,
  Steps,
  Switch,
  Tag,
} from 'antd'
import type { Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import {
  workgroupCapabilityTags,
  workgroupCategories,
  workgroupDirections,
  workgroupUnitOptions,
} from '../mock/workgroups'
import type { WorkgroupCardItem, WorkgroupCategory, WorkgroupStatus } from '../types/portal'
import styles from './NewWorkgroupDrawer.module.css'

type CreationMode = 'direct' | 'application'

interface NewWorkgroupDrawerProps {
  creationMode: CreationMode
  open: boolean
  onClose: () => void
  onCreated: (group: WorkgroupCardItem) => void
}

interface WorkgroupFormValues {
  category: Exclude<WorkgroupCategory, 'all'>
  commentsEnabled: boolean
  deputyUnits: string[]
  establishedAt: Dayjs
  fileLibraryEnabled: boolean
  fileReviewEnabled: boolean
  fileUploadEnabled: boolean
  fullName: string
  groupContact: string
  homepageEnabled: boolean
  initializationModules: string[]
  leaderUnit: string
  materialCategories: string[]
  materialLibraryEnabled: boolean
  memberUnits: string[]
  meetingLibraryEnabled: boolean
  observerUnits: string[]
  noticesEnabled: boolean
  permissionTemplate: 'standard-collaboration' | 'standard-compilation' | 'sensitive-data'
  resultLibraryEnabled: boolean
  secretaryContact: string
  shortName: string
  status: Exclude<WorkgroupStatus, '待秘书处审核'>
  summary: string
  tasksEnabled: boolean
  technicalDirection: string
}

const stepFields: Array<Array<keyof WorkgroupFormValues>> = [
  ['fullName', 'shortName', 'category', 'technicalDirection', 'status', 'establishedAt', 'summary'],
  ['leaderUnit', 'deputyUnits', 'secretaryContact', 'groupContact', 'memberUnits', 'observerUnits'],
  [
    'permissionTemplate',
    'noticesEnabled',
    'fileLibraryEnabled',
    'meetingLibraryEnabled',
    'tasksEnabled',
    'resultLibraryEnabled',
    'commentsEnabled',
    'fileUploadEnabled',
    'fileReviewEnabled',
  ],
  ['initializationModules', 'materialCategories', 'homepageEnabled'],
]

const capabilityPresets: Record<string, string> = {
  'standard-collaboration': '标准协同模板',
  'standard-compilation': '标准编制模板',
  'sensitive-data': '敏感资料模板',
}

const defaultMaterialCategories = [
  '工作组制度',
  '会议材料',
  '技术方案',
  '接口规范',
  '测试认证',
  '意见反馈',
  '成果归档',
]

function slugifyWorkgroupName(name: string) {
  const normalized = name
    .toLowerCase()
    .replace(/工作组/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || `workgroup-${Date.now()}`
}

function resolveAccent(category: Exclude<WorkgroupCategory, 'all'>) {
  const map: Record<Exclude<WorkgroupCategory, 'all'>, string> = {
    architecture: 'linear-gradient(135deg, #7b61ff, #a08bff)',
    media: 'linear-gradient(135deg, #20b8d4, #65d9c4)',
    terminal: 'linear-gradient(135deg, #18be98, #4ad3a9)',
    standards: 'linear-gradient(135deg, #2d75ff, #5fa2ff)',
    testing: 'linear-gradient(135deg, #ff9b2f, #ffc453)',
    ecosystem: 'linear-gradient(135deg, #4f8cff, #79b4ff)',
    management: 'linear-gradient(135deg, #8a6bff, #b18cff)',
  }

  return map[category]
}

function buildTemplateValues(template: WorkgroupFormValues['permissionTemplate']) {
  if (template === 'standard-compilation') {
    return {
      commentsEnabled: true,
      fileLibraryEnabled: true,
      fileReviewEnabled: true,
      fileUploadEnabled: true,
      materialLibraryEnabled: true,
      meetingLibraryEnabled: true,
      noticesEnabled: true,
      resultLibraryEnabled: true,
      tasksEnabled: true,
    }
  }

  if (template === 'sensitive-data') {
    return {
      commentsEnabled: false,
      fileLibraryEnabled: true,
      fileReviewEnabled: true,
      fileUploadEnabled: false,
      materialLibraryEnabled: true,
      meetingLibraryEnabled: true,
      noticesEnabled: true,
      resultLibraryEnabled: false,
      tasksEnabled: true,
    }
  }

  return {
    commentsEnabled: true,
    fileLibraryEnabled: true,
    fileReviewEnabled: false,
    fileUploadEnabled: true,
    materialLibraryEnabled: true,
    meetingLibraryEnabled: true,
    noticesEnabled: true,
    resultLibraryEnabled: true,
    tasksEnabled: true,
  }
}

function NewWorkgroupDrawer({ creationMode, open, onClose, onCreated }: NewWorkgroupDrawerProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<WorkgroupFormValues>()
  const [activeStep, setActiveStep] = useState(0)
  const [activeCapabilityFilter, setActiveCapabilityFilter] = useState<string[]>([])
  const [createdGroup, setCreatedGroup] = useState<WorkgroupCardItem | null>(null)

  const unitOptions = useMemo(() => {
    if (activeCapabilityFilter.length === 0) {
      return workgroupUnitOptions
    }

    return workgroupUnitOptions.filter((item) =>
      activeCapabilityFilter.some((tag) => item.capabilities.includes(tag)),
    )
  }, [activeCapabilityFilter])

  const resetDrawer = () => {
    setActiveStep(0)
    setActiveCapabilityFilter([])
    setCreatedGroup(null)
    form.resetFields()
  }

  const handleClose = () => {
    resetDrawer()
    onClose()
  }

  const handleTemplateChange = (template: WorkgroupFormValues['permissionTemplate']) => {
    form.setFieldsValue(buildTemplateValues(template))
  }

  const handleNext = async () => {
    await form.validateFields(stepFields[activeStep])
    setActiveStep((current) => Math.min(current + 1, 3))
  }

  const handleSaveDraft = async () => {
    await form.validateFields(stepFields[Math.min(activeStep, 1)])
    message.success('草稿已保存到当前会话，可继续补充后创建')
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    const finalStatus: WorkgroupStatus =
      creationMode === 'application' ? '待秘书处审核' : values.status

    const newGroup: WorkgroupCardItem = {
      id: slugifyWorkgroupName(values.shortName || values.fullName),
      name: values.fullName,
      positioning: values.summary,
      category: values.category,
      directionIds: [values.technicalDirection],
      tags: [
        workgroupDirections.find((item) => item.id === values.technicalDirection)?.label ?? values.technicalDirection,
        capabilityPresets[values.permissionTemplate],
        creationMode === 'application' ? '待审核' : '已建档',
      ],
      leaderUnit: values.leaderUnit,
      deputyUnits: values.deputyUnits,
      memberUnitCount: values.memberUnits.length,
      fileCount: values.materialCategories.length,
      meetingCount: values.meetingLibraryEnabled ? 1 : 0,
      taskCount: values.tasksEnabled ? 1 : 0,
      latestUpdate:
        creationMode === 'application'
          ? '已提交新建申请，等待秘书处审核'
          : '工作组空间初始化完成',
      status: finalStatus,
      icon: <TeamOutlined />,
      accent: resolveAccent(values.category),
    }

    onCreated(newGroup)
    setCreatedGroup(newGroup)
  }

  const initialValues: Partial<WorkgroupFormValues> = {
    commentsEnabled: true,
    deputyUnits: [],
    fileLibraryEnabled: true,
    fileReviewEnabled: false,
    fileUploadEnabled: true,
    homepageEnabled: true,
    initializationModules: ['notice', 'files', 'meetings', 'tasks', 'results', 'homepage'],
    materialCategories: defaultMaterialCategories,
    materialLibraryEnabled: true,
    meetingLibraryEnabled: true,
    memberUnits: [],
    noticesEnabled: true,
    observerUnits: [],
    permissionTemplate: 'standard-collaboration',
    resultLibraryEnabled: true,
    status: '筹备中',
    tasksEnabled: true,
  }

  return (
    <Drawer
      className={styles.drawer}
      destroyOnHidden
      extra={<span className={styles.subtext}>建立专题工作组空间，配置组长单位、成员范围、协同权限和初始资料</span>}
      footer={
        createdGroup ? null : (
          <div className={styles.footer}>
            <Button onClick={handleClose}>取消</Button>
            <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>
              保存草稿
            </Button>
            {activeStep > 0 ? (
              <Button icon={<LeftOutlined />} onClick={() => setActiveStep((current) => current - 1)}>
                上一步
              </Button>
            ) : null}
            {activeStep < 3 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type="primary" onClick={handleCreate}>
                {creationMode === 'application' ? '提交申请' : '创建工作组'}
              </Button>
            )}
          </div>
        )
      }
      styles={{ footer: { padding: '16px 24px', borderTop: '1px solid rgba(67,109,211,0.08)' } }}
      onClose={handleClose}
      open={open}
      placement="right"
      title="新建工作组"
      size={760}
    >
      {createdGroup ? (
        <Result
          icon={<CheckCircleFilled style={{ color: '#18be68' }} />}
          subTitle={
            creationMode === 'application'
              ? '工作组申请已提交，状态为“待秘书处审核”。'
              : '工作组空间已建档完成，可以立即进入协同空间继续完善内容。'
          }
          title={creationMode === 'application' ? '已提交新建申请' : '工作组创建成功'}
          extra={[
            <Button key="enter" type="primary" href={`/workgroups/${createdGroup.id}`}>
              进入工作组空间
            </Button>,
            <Button
              key="continue"
              onClick={() => {
                resetDrawer()
              }}
            >
              继续新建
            </Button>,
          ]}
        />
      ) : (
        <div className={styles.content}>
          <Steps
            current={activeStep}
            items={[
              { title: '基本信息' },
              { title: '组织成员' },
              { title: '协同配置' },
              { title: '初始化内容' },
            ]}
            size="small"
          />

          <Form className={styles.form} form={form} initialValues={initialValues} layout="vertical">
            {activeStep === 0 ? (
              <div className={styles.stepSection}>
                <div className={styles.gridTwo}>
                  <Form.Item label="工作组名称" name="fullName" rules={[{ required: true, message: '请输入工作组名称' }]}>
                    <Input placeholder="例如：技术需求与接口规范组" />
                  </Form.Item>
                  <Form.Item label="工作组简称" name="shortName" rules={[{ required: true, message: '请输入工作组简称' }]}>
                    <Input placeholder="例如：接口规范组" />
                  </Form.Item>
                </div>

                <div className={styles.gridThree}>
                  <Form.Item label="工作组分类" name="category" rules={[{ required: true, message: '请选择工作组分类' }]}>
                    <Select placeholder="请选择">
                      {workgroupCategories
                        .filter((item) => item.id !== 'all')
                        .map((item) => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.label}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="技术方向" name="technicalDirection" rules={[{ required: true, message: '请选择技术方向' }]}>
                    <Select placeholder="请选择">
                      {workgroupDirections.map((item) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="工作组状态" name="status" rules={[{ required: true, message: '请选择工作组状态' }]}>
                    <Select placeholder="请选择">
                      <Select.Option value="活跃">活跃</Select.Option>
                      <Select.Option value="重点推进">重点推进</Select.Option>
                      <Select.Option value="筹备中">筹备中</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <div className={styles.gridTwo}>
                  <Form.Item label="成立时间" name="establishedAt" rules={[{ required: true, message: '请选择成立时间' }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <div className={styles.tipCard}>
                    <strong>建档说明</strong>
                    <span>
                      {creationMode === 'direct'
                        ? '当前身份为秘书处管理员，创建后可直接生成工作组空间。'
                        : '当前身份为分委会负责人，创建后将进入秘书处审核流程。'}
                    </span>
                  </div>
                </div>

                <Form.Item label="工作组说明" name="summary" rules={[{ required: true, message: '请输入工作组说明' }]}>
                  <Input.TextArea rows={4} placeholder="说明工作组定位、协同职责、重点方向和预期成果。" />
                </Form.Item>
              </div>
            ) : null}

            {activeStep === 1 ? (
              <div className={styles.stepSection}>
                <div className={styles.gridTwo}>
                  <Form.Item label="组长单位" name="leaderUnit" rules={[{ required: true, message: '请选择组长单位' }]}>
                    <Select placeholder="请选择">
                      {workgroupUnitOptions.map((item) => (
                        <Select.Option key={item.label} value={item.label}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="副组长单位" name="deputyUnits" rules={[{ required: true, message: '请选择副组长单位' }]}>
                    <Select mode="multiple" placeholder="可选择多个">
                      {workgroupUnitOptions.map((item) => (
                        <Select.Option key={item.label} value={item.label}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className={styles.gridTwo}>
                  <Form.Item label="秘书处联系人" name="secretaryContact" rules={[{ required: true, message: '请输入秘书处联系人' }]}>
                    <Input placeholder="例如：张伟 / 010-6888 1023" />
                  </Form.Item>
                  <Form.Item label="工作组联系人" name="groupContact" rules={[{ required: true, message: '请输入工作组联系人' }]}>
                    <Input placeholder="例如：王晨 / 星河视研院" />
                  </Form.Item>
                </div>

                <div className={styles.capabilityPanel}>
                  <strong>按能力标签筛选成员单位</strong>
                  <Space size={[8, 8]} wrap>
                    {workgroupCapabilityTags.map((tag) => {
                      const active = activeCapabilityFilter.includes(tag)
                      return (
                        <Tag.CheckableTag
                          key={tag}
                          checked={active}
                          onChange={(checked) =>
                            setActiveCapabilityFilter((current) =>
                              checked ? [...current, tag] : current.filter((item) => item !== tag),
                            )
                          }
                        >
                          {tag}
                        </Tag.CheckableTag>
                      )
                    })}
                  </Space>
                </div>

                <Form.Item label="成员单位" name="memberUnits" rules={[{ required: true, message: '请选择成员单位' }]}>
                  <Select mode="multiple" placeholder="请选择成员单位">
                    {unitOptions.map((item) => (
                      <Select.Option key={item.label} value={item.label}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="观察单位" name="observerUnits">
                  <Select mode="multiple" placeholder="可选">
                    {unitOptions.map((item) => (
                      <Select.Option key={item.label} value={item.label}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            ) : null}

            {activeStep === 2 ? (
              <div className={styles.stepSection}>
                <Form.Item label="权限模板" name="permissionTemplate">
                  <Radio.Group onChange={(event) => handleTemplateChange(event.target.value)}>
                    <Space direction="vertical">
                      <Radio value="standard-collaboration">标准协同模板</Radio>
                      <Radio value="standard-compilation">标准编制模板</Radio>
                      <Radio value="sensitive-data">敏感资料模板</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <div className={styles.switchGrid}>
                  <Form.Item label="公告区" name="noticesEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="文件库" name="fileLibraryEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="会议资料" name="meetingLibraryEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="任务事项" name="tasksEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="成果资料" name="resultLibraryEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="成员评论" name="commentsEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="成员上传" name="fileUploadEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="秘书处审核" name="fileReviewEnabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            ) : null}

            {activeStep === 3 ? (
              <div className={styles.stepSection}>
                <Form.Item label="初始化模块" name="initializationModules">
                  <Checkbox.Group
                    options={[
                      { label: '创建公告栏目', value: 'notice' },
                      { label: '创建文件分类', value: 'files' },
                      { label: '创建会议资料目录', value: 'meetings' },
                      { label: '创建任务看板', value: 'tasks' },
                      { label: '创建成果资料库', value: 'results' },
                      { label: '生成工作组首页', value: 'homepage' },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="默认文件分类" name="materialCategories">
                  <Checkbox.Group options={defaultMaterialCategories} />
                </Form.Item>

                <Form.Item extra="创建后将生成工作组首页门户、统计概览和协同导航。" label="生成工作组首页" name="homepageEnabled" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </div>
            ) : null}
          </Form>
        </div>
      )}
    </Drawer>
  )
}

export default NewWorkgroupDrawer
