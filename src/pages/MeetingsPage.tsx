import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { App, Button, Empty, Form, Input, InputNumber, Modal, Select, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import AppLayout from '../layouts/AppLayout'
import { demoMeetings, type DemoMeetingRecord, type DemoMeetingStat } from '../mock/meetings'
import { getActiveUser } from '../services/auth'
import {
  createCollaborationRecord,
  fetchCollaborationRecords,
  updateCollaborationRecord,
} from '../services/collaborationApi'
import type { UserProfile } from '../types/portal'
import { canManageWorkgroupContent, getRoleScopeLabel, isAdminUser, isWorkgroupManager } from '../utils/permissions'
import styles from './MeetingsPage.module.css'

const iconMap = {
  calendar: <CalendarOutlined />,
  team: <TeamOutlined />,
  clock: <ClockCircleOutlined />,
  file: <FileDoneOutlined />,
}

const statusColorMap: Record<DemoMeetingRecord['status'], string> = {
  即将开始: 'blue',
  报名中: 'gold',
  已结束: 'green',
}

const visibilityLabelMap: Record<DemoMeetingRecord['visibility'], string> = {
  public: '公开',
  workgroup: '本组',
  invited: '定向',
  management: '管理',
}

const visibilityColorMap: Record<DemoMeetingRecord['visibility'], string> = {
  public: 'green',
  workgroup: 'blue',
  invited: 'purple',
  management: 'red',
}

const minutesColorMap: Record<DemoMeetingRecord['minutesStatus'], string> = {
  待整理: 'orange',
  已归档: 'green',
  无需纪要: 'default',
}

interface MeetingFormValues {
  title: string
  workgroup: string
  ownerUnit: string
  time: string
  location: string
  status: DemoMeetingRecord['status']
  visibility: DemoMeetingRecord['visibility']
  agendaCount: number
  attendees: number
  invitedOrganizations?: string[]
  summary: string
}

function canViewMeeting(user: UserProfile, meeting: DemoMeetingRecord) {
  if (isAdminUser(user)) {
    return true
  }

  const sameWorkgroup = user.currentWorkgroup ? meeting.workgroup === user.currentWorkgroup : false
  const invitedOrganization = user.organizationName
    ? meeting.invitedOrganizations.includes(user.organizationName)
    : false

  if (meeting.visibility === 'public') {
    return true
  }

  if (meeting.visibility === 'management') {
    return false
  }

  if (isWorkgroupManager(user)) {
    return sameWorkgroup || invitedOrganization
  }

  return sameWorkgroup || invitedOrganization
}

function buildScopedStats(meetings: DemoMeetingRecord[], user: UserProfile): DemoMeetingStat[] {
  const upcomingCount = meetings.filter((item) => item.status !== '已结束').length
  const attendeeCount = meetings.reduce((total, item) => total + item.attendees, 0)
  const pendingMinutesCount = meetings.filter((item) => item.minutesStatus === '待整理').length
  const archivedMinutesCount = meetings.filter((item) => item.minutesStatus === '已归档').length
  const delta = isAdminUser(user) ? '全平台范围' : '授权可见'

  return [
    { id: 'ms-1', title: '可见会议', value: String(meetings.length), unit: '场', delta, accent: 'linear-gradient(135deg, #2d75ff 0%, #5aa1ff 100%)', icon: 'calendar' },
    { id: 'ms-2', title: '参会单位', value: String(attendeeCount), unit: '家次', delta, accent: 'linear-gradient(135deg, #18c2c8 0%, #3cd6a4 100%)', icon: 'team' },
    { id: 'ms-3', title: '待纪要整理', value: String(pendingMinutesCount), unit: '份', delta: `${upcomingCount} 场未结束`, accent: 'linear-gradient(135deg, #ff982e 0%, #ffc04d 100%)', icon: 'clock' },
    { id: 'ms-4', title: '已归档纪要', value: String(archivedMinutesCount), unit: '份', delta, accent: 'linear-gradient(135deg, #6f58ff 0%, #9a82ff 100%)', icon: 'file' },
  ]
}

function MeetingsPage() {
  const { message } = App.useApp()
  const [createForm] = Form.useForm<MeetingFormValues>()
  const currentUser = getActiveUser()
  const [meetings, setMeetings] = useState(demoMeetings)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全部' | DemoMeetingRecord['status']>('全部')
  const [visibilityFilter, setVisibilityFilter] = useState<'全部' | DemoMeetingRecord['visibility']>('全部')
  const [workgroupFilter, setWorkgroupFilter] = useState('全部')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [minutesMeeting, setMinutesMeeting] = useState<DemoMeetingRecord | null>(null)
  const [minutesLedgerOpen, setMinutesLedgerOpen] = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const allowCreateMeeting = isAdminUser(currentUser) || isWorkgroupManager(currentUser)

  useEffect(() => {
    let active = true

    fetchCollaborationRecords<DemoMeetingRecord>('meetings', demoMeetings)
      .then((records) => {
        if (!active) {
          return
        }

        setMeetings(records)
        setApiOnline(true)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setApiOnline(false)
        message.warning('会议中心 API 未连接，当前使用本地示例数据')
      })

    return () => {
      active = false
    }
  }, [message])

  const accessibleMeetings = useMemo(
    () => meetings.filter((meeting) => canViewMeeting(currentUser, meeting)),
    [currentUser, meetings],
  )

  const visibleWorkgroups = useMemo(() => {
    const workgroups = Array.from(new Set(accessibleMeetings.map((meeting) => meeting.workgroup)))
    return ['全部', ...workgroups]
  }, [accessibleMeetings])

  const creatableWorkgroups = useMemo(() => {
    if (isAdminUser(currentUser)) {
      return visibleWorkgroups.filter((item) => item !== '全部')
    }

    return currentUser.currentWorkgroup ? [currentUser.currentWorkgroup] : []
  }, [currentUser, visibleWorkgroups])

  const filteredMeetings = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return accessibleMeetings.filter((meeting) => {
      const matchesKeyword = normalizedKeyword
        ? [
            meeting.title,
            meeting.workgroup,
            meeting.ownerUnit,
            meeting.location,
            meeting.summary,
            meeting.invitedOrganizations.join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedKeyword)
        : true
      const matchesStatus = statusFilter === '全部' ? true : meeting.status === statusFilter
      const matchesVisibility = visibilityFilter === '全部' ? true : meeting.visibility === visibilityFilter
      const matchesWorkgroup = workgroupFilter === '全部' ? true : meeting.workgroup === workgroupFilter

      return matchesKeyword && matchesStatus && matchesVisibility && matchesWorkgroup
    })
  }, [accessibleMeetings, keyword, statusFilter, visibilityFilter, workgroupFilter])

  const scopedStats = useMemo(() => buildScopedStats(accessibleMeetings, currentUser), [accessibleMeetings, currentUser])

  const openCreateModal = () => {
    if (!allowCreateMeeting) {
      message.warning('当前身份只能查看授权范围内会议')
      return
    }

    const defaultWorkgroup = creatableWorkgroups[0] ?? currentUser.currentWorkgroup ?? ''
    createForm.setFieldsValue({
      agendaCount: 3,
      attendees: 1,
      invitedOrganizations: currentUser.organizationName ? [currentUser.organizationName] : [],
      location: '线上会议室',
      ownerUnit: currentUser.organizationName ?? '',
      status: '即将开始',
      visibility: isAdminUser(currentUser) ? 'public' : 'workgroup',
      workgroup: defaultWorkgroup,
    })
    setCreateModalOpen(true)
  }

  const handleCreateMeeting = async () => {
    const values = await createForm.validateFields()
    const createdMeeting: DemoMeetingRecord = {
      id: `meeting-created-${Date.now()}`,
      title: values.title,
      workgroup: values.workgroup,
      ownerUnit: values.ownerUnit,
      time: values.time,
      location: values.location,
      status: values.status,
      visibility: values.visibility,
      invitedOrganizations: values.invitedOrganizations?.length
        ? values.invitedOrganizations
        : [values.ownerUnit],
      agendaCount: values.agendaCount,
      attendees: values.attendees,
      minutesStatus: '待整理',
      minutesSummary: '会议已创建，纪要将在会后由负责人整理并同步到会议中心。',
      decisions: ['会议议题待召开后确认'],
      actionItems: ['会议负责人会后补充纪要和待办事项'],
      summary: values.summary,
    }

    const savedMeeting = apiOnline
      ? await createCollaborationRecord('meetings', createdMeeting)
      : createdMeeting
    setMeetings((current) => [savedMeeting, ...current])
    setCreateModalOpen(false)
    createForm.resetFields()
    message.success(apiOnline ? '会议已保存到会议中心' : '会议已加入当前会议列表')
  }

  const handleArchiveMinutes = async () => {
    if (!minutesMeeting) {
      return
    }

    const archivedMeeting: DemoMeetingRecord = {
      ...minutesMeeting,
      minutesStatus: '已归档',
      minutesSummary: `${minutesMeeting.minutesSummary} 纪要已完成整理并进入归档状态。`,
    }

    const savedMeeting = apiOnline
      ? await updateCollaborationRecord('meetings', archivedMeeting)
      : archivedMeeting
    setMeetings((current) => current.map((meeting) => (
      meeting.id === archivedMeeting.id ? archivedMeeting : meeting
    )))
    setMinutesMeeting(savedMeeting)
    message.success(`已归档纪要：${savedMeeting.title}`)
  }

  const columns: ColumnsType<DemoMeetingRecord> = [
    {
      title: '会议名称',
      dataIndex: 'title',
      key: 'title',
      width: 260,
      render: (value: string, record) => (
        <div className={styles.meetingTitle}>
          <strong>{value}</strong>
          <span>
            <Tag color={visibilityColorMap[record.visibility]}>{visibilityLabelMap[record.visibility]}</Tag>
            <Tag color={minutesColorMap[record.minutesStatus]}>{record.minutesStatus}</Tag>
          </span>
        </div>
      ),
    },
    { title: '工作组', dataIndex: 'workgroup', key: 'workgroup', width: 150 },
    { title: '牵头单位', dataIndex: 'ownerUnit', key: 'ownerUnit', width: 150 },
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '地点', dataIndex: 'location', key: 'location', width: 140 },
    {
      title: '议程',
      dataIndex: 'agendaCount',
      key: 'agendaCount',
      width: 90,
      render: (value: number) => `${value} 项`,
    },
    {
      title: '参会单位',
      dataIndex: 'attendees',
      key: 'attendees',
      width: 100,
      render: (value: number) => `${value} 家`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: DemoMeetingRecord['status']) => <Tag color={statusColorMap[value]}>{value}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => {
        const canManage = canManageWorkgroupContent(currentUser, record.workgroup)

        return (
          <Space size={8}>
            <Button type="link" size="small" onClick={() => message.info(`已打开会议详情：${record.title}`)}>
              查看
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setMinutesMeeting(record)
                if (record.minutesStatus === '待整理' && !canManage) {
                  message.info('纪要正在整理中，可先查看会议摘要和已确认事项')
                }
              }}
            >
              纪要
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <AppLayout
      contextLabel="工作台 / 会议管理"
      footerCaption="会议协同演示"
      footerTitle="通知、议程、纪要一体化"
      searchPlaceholder="搜索会议名称、工作组、牵头单位"
      versionLabel="Demo Build"
    >
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>{getRoleScopeLabel(currentUser)}</span>
            <h1>会议中心</h1>
            <div className={styles.heroActions}>
              <Button
                type="primary"
                disabled={!allowCreateMeeting}
                onClick={openCreateModal}
              >
                新建会议
              </Button>
              <Button onClick={() => setMinutesLedgerOpen(true)}>
                纪要台账
              </Button>
            </div>
            <p>
              当前账号为 {currentUser.name}（{currentUser.role}），会议列表已按权限、所在工作组和受邀单位自动收敛。
            </p>
          </div>
        </section>

        <section className={styles.statsGrid}>
          {scopedStats.map((item) => (
            <KnowledgeStatCard
              className={styles.compactStatCard}
              iconClassName={styles.compactStatIcon}
              key={item.id}
              item={{
                title: item.title,
                value: item.value,
                unit: item.unit,
                delta: item.delta,
                icon: iconMap[item.icon],
                accent: item.accent,
              }}
              showDelta={false}
            />
          ))}
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.mainCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>会议列表</h2>
                <p>当前可见 {accessibleMeetings.length} 场，筛选后显示 {filteredMeetings.length} 场。</p>
              </div>
              <div className={styles.filterBar}>
                <Input
                  allowClear
                  className={styles.keywordInput}
                  placeholder="搜索会议、工作组、单位"
                  prefix={<SearchOutlined />}
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
                <Select value={workgroupFilter} onChange={setWorkgroupFilter} className={styles.filterSelect}>
                  {visibleWorkgroups.map((item) => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
                <Select value={statusFilter} onChange={setStatusFilter} className={styles.filterSelect}>
                  {(['全部', '即将开始', '报名中', '已结束'] as const).map((item) => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
                <Select value={visibilityFilter} onChange={setVisibilityFilter} className={styles.filterSelect}>
                  <Select.Option value="全部">全部范围</Select.Option>
                  {Object.entries(visibilityLabelMap).map(([value, label]) => (
                    <Select.Option key={value} value={value}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  onClick={() => {
                    setKeyword('')
                    setStatusFilter('全部')
                    setVisibilityFilter('全部')
                    setWorkgroupFilter('全部')
                  }}
                >
                  重置
                </Button>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={filteredMeetings}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="当前权限和筛选条件下暂无可见会议"
                  />
                ),
              }}
              pagination={false}
              rowKey="id"
              scroll={{ x: 1300 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div className={styles.expanded}>
                    <p>{record.summary}</p>
                    <span>受邀单位：{record.invitedOrganizations.join('、')}</span>
                  </div>
                ),
              }}
            />
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(minutesMeeting)}
        title={minutesMeeting ? `${minutesMeeting.title}纪要` : '会议纪要'}
        width={720}
        onCancel={() => setMinutesMeeting(null)}
        footer={[
          <Button key="close" onClick={() => setMinutesMeeting(null)}>
            关闭
          </Button>,
          minutesMeeting?.minutesStatus === '待整理' && canManageWorkgroupContent(currentUser, minutesMeeting.workgroup) ? (
            <Button
              key="archive"
              type="primary"
              onClick={handleArchiveMinutes}
            >
              标记已整理
            </Button>
          ) : null,
        ]}
      >
        {minutesMeeting ? (
          <div className={styles.minutesModal}>
            <div className={styles.minutesMeta}>
              <Tag color={minutesColorMap[minutesMeeting.minutesStatus]}>{minutesMeeting.minutesStatus}</Tag>
              <span>{minutesMeeting.workgroup}</span>
              <span>{minutesMeeting.time}</span>
              <span>{minutesMeeting.location}</span>
            </div>

            <section>
              <h3>纪要摘要</h3>
              <p>{minutesMeeting.minutesSummary}</p>
            </section>

            <section>
              <h3>会议决议</h3>
              <ul>
                {minutesMeeting.decisions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3>后续待办</h3>
              <ul>
                {minutesMeeting.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={createModalOpen}
        title="新建会议"
        width={720}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => void handleCreateMeeting()}
        okText="保存会议"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" className={styles.createForm}>
          <Form.Item label="会议名称" name="title" rules={[{ required: true, message: '请输入会议名称' }]}>
            <Input placeholder="请输入会议名称" />
          </Form.Item>
          <div className={styles.formGrid}>
            <Form.Item label="所属工作组" name="workgroup" rules={[{ required: true, message: '请选择工作组' }]}>
              <Select>
                {creatableWorkgroups.map((item) => (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="牵头单位" name="ownerUnit" rules={[{ required: true, message: '请输入牵头单位' }]}>
              <Input placeholder="请输入牵头单位" />
            </Form.Item>
            <Form.Item label="会议时间" name="time" rules={[{ required: true, message: '请输入会议时间' }]}>
              <Input placeholder="例如：2026-06-30 14:00" />
            </Form.Item>
            <Form.Item label="会议地点" name="location" rules={[{ required: true, message: '请输入会议地点' }]}>
              <Input placeholder="请输入会议地点" />
            </Form.Item>
            <Form.Item label="会议状态" name="status" rules={[{ required: true, message: '请选择会议状态' }]}>
              <Select>
                {(['即将开始', '报名中', '已结束'] as const).map((item) => (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="可见范围" name="visibility" rules={[{ required: true, message: '请选择可见范围' }]}>
              <Select>
                {(Object.keys(visibilityLabelMap) as DemoMeetingRecord['visibility'][]).map((item) => (
                  <Select.Option key={item} value={item}>
                    {visibilityLabelMap[item]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="议程数量" name="agendaCount" rules={[{ required: true, message: '请输入议程数量' }]}>
              <InputNumber min={1} max={20} className={styles.fullWidthControl} />
            </Form.Item>
            <Form.Item label="参会单位数" name="attendees" rules={[{ required: true, message: '请输入参会单位数' }]}>
              <InputNumber min={1} max={200} className={styles.fullWidthControl} />
            </Form.Item>
          </div>
          <Form.Item label="受邀单位" name="invitedOrganizations">
            <Select mode="tags" placeholder="输入单位名称后回车" />
          </Form.Item>
          <Form.Item label="会议摘要" name="summary" rules={[{ required: true, message: '请输入会议摘要' }]}>
            <Input.TextArea rows={3} placeholder="请输入会议摘要" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={minutesLedgerOpen}
        title="纪要台账"
        width={760}
        footer={<Button onClick={() => setMinutesLedgerOpen(false)}>关闭</Button>}
        onCancel={() => setMinutesLedgerOpen(false)}
        destroyOnHidden
      >
        <div className={styles.minutesLedger}>
          {accessibleMeetings.map((meeting) => (
            <button
              key={meeting.id}
              className={styles.ledgerItem}
              type="button"
              onClick={() => {
                setMinutesLedgerOpen(false)
                setMinutesMeeting(meeting)
              }}
            >
              <span>
                <strong>{meeting.title}</strong>
                <small>{meeting.workgroup} / {meeting.time}</small>
              </span>
              <Tag color={minutesColorMap[meeting.minutesStatus]}>{meeting.minutesStatus}</Tag>
            </button>
          ))}
        </div>
      </Modal>
    </AppLayout>
  )
}

export default MeetingsPage
