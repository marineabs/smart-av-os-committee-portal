import { MoreOutlined } from '@ant-design/icons'
import { App, Dropdown, InputNumber, Pagination, Select, Table } from 'antd'
import type { MenuProps, TableProps } from 'antd'
import type { MemberUnit } from '../types/portal'
import MemberCompletenessBar from './MemberCompletenessBar'
import MemberStatusTag from './MemberStatusTag'
import styles from './MemberUnitTable.module.css'

interface MemberUnitTableProps {
  canManageAccounts?: boolean
  canManageMembers?: boolean
  canNotifyMembers?: boolean
  columnWidthMembers: MemberUnit[]
  currentPage: number
  members: MemberUnit[]
  onContact: (member: MemberUnit) => void
  onMoreAction: (member: MemberUnit, action: string) => void
  onPageChange: (page: number, pageSize: number) => void
  onView: (member: MemberUnit) => void
  pageSize: number
  total: number
}

function estimateNameWidth(name: string) {
  return Array.from(name).reduce((width, char) => width + (/[\u4e00-\u9fff]/u.test(char) ? 14 : 8), 0)
}

function MemberUnitTable({
  canManageAccounts = true,
  canManageMembers = true,
  canNotifyMembers = true,
  columnWidthMembers,
  currentPage,
  members,
  onContact,
  onMoreAction,
  onPageChange,
  onView,
  pageSize,
  total,
}: MemberUnitTableProps) {
  const { message } = App.useApp()
  const nameColumnWidth = Math.max(
    160,
    ...columnWidthMembers.map((member) => estimateNameWidth(member.name) + 24),
  )

  const columns: TableProps<MemberUnit>['columns'] = [
    {
      title: '单位名称',
      dataIndex: 'name',
      key: 'name',
      width: nameColumnWidth,
      fixed: 'left',
      render: (_, member) => (
        <div className={styles.memberCell}>
          <strong>{member.name}</strong>
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
      width: 84,
      fixed: 'right',
      align: 'center',
      render: (_, member) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: '查看详情' },
          { key: 'contact', label: '联系人' },
          { key: 'records', label: '参与记录' },
          ...(canManageMembers ? [{ key: 'workgroup', label: '工作组调整' }] : []),
          ...(canNotifyMembers ? [{ key: 'notify', label: '发送通知' }] : []),
          { key: 'export', label: '导出单位档案' },
          ...(canManageAccounts ? [{ key: 'freeze', label: '冻结账号' }] : []),
          ...(canManageMembers ? [{ key: 'archive', label: '退出归档' }] : []),
        ]

        return (
          <div className={styles.actionCell}>
            {items.length ? (
              <Dropdown
                menu={{
                  items,
                  onClick: ({ key }) => {
                    if (key === 'view') {
                      onView(member)
                      return
                    }

                    if (key === 'contact') {
                      onContact(member)
                      return
                    }

                    onMoreAction(member, key)
                  },
                }}
                trigger={['click']}
              >
                <button type="button" aria-label="更多">
                  <MoreOutlined />
                </button>
              </Dropdown>
            ) : null}
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
        rowSelection={
          canManageMembers
            ? {
                columnWidth: 42,
                onChange: (_, rows) => {
                  if (rows.length) {
                    message.info(`已选择 ${rows.length} 个会员单位`)
                  }
                },
              }
            : undefined
        }
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
