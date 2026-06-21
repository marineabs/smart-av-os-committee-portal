import {
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { App, Dropdown, InputNumber, Pagination, Select, Table } from 'antd'
import type { MenuProps, TableProps } from 'antd'
import type { MemberUnit } from '../types/portal'
import MemberCompletenessBar from './MemberCompletenessBar'
import MemberStatusTag from './MemberStatusTag'
import styles from './MemberUnitTable.module.css'

interface MemberUnitTableProps {
  currentPage: number
  members: MemberUnit[]
  onContact: (member: MemberUnit) => void
  onEdit: (member: MemberUnit) => void
  onMoreAction: (member: MemberUnit, action: string) => void
  onPageChange: (page: number, pageSize: number) => void
  onPermission: (member: MemberUnit) => void
  onView: (member: MemberUnit) => void
  pageSize: number
  total: number
}

function MemberUnitTable({
  currentPage,
  members,
  onContact,
  onEdit,
  onMoreAction,
  onPageChange,
  onPermission,
  onView,
  pageSize,
  total,
}: MemberUnitTableProps) {
  const { message } = App.useApp()

  const columns: TableProps<MemberUnit>['columns'] = [
    {
      title: '单位名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      render: (_, member) => (
        <div className={styles.memberCell}>
          <span className={styles.memberLogo} style={{ background: member.accent }}>
            {member.logoText}
          </span>
          <div className={styles.memberBody}>
            <strong>{member.name}</strong>
            <div className={styles.memberTags}>
              {member.capabilityTags.slice(0, 2).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '单位类型',
      dataIndex: 'organizationType',
      key: 'organizationType',
      width: 118,
    },
    {
      title: '会员类别',
      dataIndex: 'memberCategory',
      key: 'memberCategory',
      width: 118,
    },
    {
      title: '所属分委会',
      dataIndex: 'committee',
      key: 'committee',
      width: 132,
    },
    {
      title: '参与工作组',
      dataIndex: 'workgroups',
      key: 'workgroups',
      width: 198,
      render: (_, member) => (
        <div className={styles.workgroupList}>
          {member.workgroups.map((group) => (
            <span key={group}>{group}</span>
          ))}
        </div>
      ),
    },
    {
      title: '主联系人',
      key: 'contact',
      width: 142,
      render: (_, member) => (
        <div className={styles.contactCell}>
          <strong>{member.primaryContact}</strong>
          <small>{member.primaryContactTitle}</small>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 116,
      render: (_, member) => <MemberStatusTag status={member.status} />,
    },
    {
      title: '信息完整度',
      dataIndex: 'completeness',
      key: 'completeness',
      width: 128,
      render: (value: number) => <MemberCompletenessBar value={value} />,
    },
    {
      title: '最近参与',
      dataIndex: 'recentParticipation',
      key: 'recentParticipation',
      width: 162,
      render: (value: string) => <span className={styles.recentText}>{value}</span>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 158,
      fixed: 'right',
      render: (_, member) => {
        const items: MenuProps['items'] = [
          { key: 'records', label: '参与记录' },
          { key: 'workgroup', label: '工作组调整' },
          { key: 'notify', label: '发送通知' },
          { key: 'export', label: '导出单位档案' },
          { key: 'freeze', label: '冻结账号' },
          { key: 'archive', label: '退出归档' },
        ]

        return (
          <div className={styles.actionCell}>
            <button type="button" onClick={() => onView(member)} aria-label="查看">
              <EyeOutlined />
            </button>
            <button type="button" onClick={() => onEdit(member)} aria-label="编辑">
              <EditOutlined />
            </button>
            <button type="button" onClick={() => onContact(member)} aria-label="联系人">
              <TeamOutlined />
            </button>
            <button type="button" onClick={() => onPermission(member)} aria-label="权限">
              <SafetyCertificateOutlined />
            </button>
            <Dropdown
              menu={{
                items,
                onClick: ({ key }) => onMoreAction(member, key),
              }}
              trigger={['click']}
            >
              <button type="button" aria-label="更多">
                <MoreOutlined />
              </button>
            </Dropdown>
          </div>
        )
      },
    },
  ]

  return (
    <section className={styles.wrapper}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={members}
        pagination={false}
        scroll={{ x: 1420 }}
        size="middle"
        rowSelection={{
          columnWidth: 42,
          onChange: (_, rows) => {
            if (rows.length) {
              message.info(`已选择 ${rows.length} 个会员单位`)
            }
          },
        }}
      />

      <div className={styles.footer}>
        <div className={styles.footerMeta}>
          <span>共 {total} 条</span>
          <Select value={pageSize} onChange={(value) => onPageChange(1, value)} style={{ width: 110 }}>
            <Select.Option value={10}>10 条/页</Select.Option>
            <Select.Option value={20}>20 条/页</Select.Option>
            <Select.Option value={30}>30 条/页</Select.Option>
          </Select>
        </div>

        <div className={styles.paginationWrap}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showLessItems
          />
          <div className={styles.quickJump}>
            <span>跳至</span>
            <InputNumber min={1} max={Math.max(1, Math.ceil(total / pageSize))} size="small" />
            <span>页</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MemberUnitTable
