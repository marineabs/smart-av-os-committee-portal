import { MoreOutlined } from '@ant-design/icons'
import { Dropdown, Empty, InputNumber, Pagination, Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import type { MenuProps } from 'antd'
import type { MemberUnit } from '../types/portal'
import MemberCompletenessBar from './MemberCompletenessBar'
import MemberStatusTag from './MemberStatusTag'
import styles from './MemberUnitTable.module.css'

interface MemberUnitTableProps {
  canManageAccounts?: boolean
  canManageMembers?: boolean
  canNotifyMembers?: boolean
  allMembers: MemberUnit[]
  currentPage: number
  members: MemberUnit[]
  onContact: (member: MemberUnit) => void
  onMoreAction: (member: MemberUnit, action: string) => void
  onPageChange: (page: number, pageSize: number) => void
  onView: (member: MemberUnit) => void
  pageSize: number
  total: number
}

function MemberUnitTable({
  canManageAccounts = true,
  canManageMembers = true,
  canNotifyMembers = true,
  allMembers,
  currentPage,
  members,
  onContact,
  onMoreAction,
  onPageChange,
  onView,
  pageSize,
  total,
}: MemberUnitTableProps) {
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null)

  const activeMember = useMemo(
    () => allMembers.find((member) => member.id === activeMemberId) ?? null,
    [activeMemberId, allMembers],
  )

  useEffect(() => {
    if (!allMembers.length) {
      setActiveMemberId(null)
      return
    }

    if (!activeMemberId || !allMembers.some((member) => member.id === activeMemberId)) {
      setActiveMemberId(members[0]?.id ?? allMembers[0].id)
    }
  }, [activeMemberId, allMembers, members])

  const buildActionItems = (): MenuProps['items'] => [
    { key: 'view', label: '查看详情' },
    { key: 'contact', label: '联系人' },
    { key: 'records', label: '参与记录' },
    ...(canManageMembers ? [{ key: 'workgroup', label: '工作组调整' }] : []),
    ...(canNotifyMembers ? [{ key: 'notify', label: '发送通知' }] : []),
    { key: 'export', label: '导出单位档案' },
    ...(canManageAccounts ? [{ key: 'freeze', label: '冻结账号' }] : []),
    ...(canManageMembers ? [{ key: 'archive', label: '退出归档' }] : []),
  ]

  const handleMenuAction = (member: MemberUnit, key: string) => {
    if (key === 'view') {
      onView(member)
      return
    }

    if (key === 'contact') {
      onContact(member)
      return
    }

    onMoreAction(member, key)
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.board}>
        <aside className={styles.tabPanel}>
          <div className={styles.panelHeader}>
            <span>单位名称</span>
            <strong>{members.length} / {total}</strong>
          </div>

          <div className={styles.tabList} role="tablist" aria-label="会员单位列表">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                className={member.id === activeMemberId ? styles.activeTab : styles.unitTab}
                onClick={() => setActiveMemberId(member.id)}
                role="tab"
                aria-selected={member.id === activeMemberId}
              >
                <span className={styles.logoMark} style={{ background: member.accent }}>
                  {member.logoText}
                </span>
                <span className={styles.tabText}>
                  <strong>{member.name}</strong>
                  <small>{member.organizationType}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.detailPanel}>
          {activeMember ? (
            <>
              <div className={styles.detailHeader}>
                <div className={styles.memberTitle}>
                  <span className={styles.logoLarge} style={{ background: activeMember.accent }}>
                    {activeMember.logoText}
                  </span>
                  <div>
                    <h3>{activeMember.name}</h3>
                    <p>{activeMember.shortName} · {activeMember.memberCategory}</p>
                  </div>
                </div>

                <div className={styles.headerActions}>
                  {activeMember.status !== '正常' ? <MemberStatusTag status={activeMember.status} /> : null}
                  <Dropdown
                    menu={{
                      items: buildActionItems(),
                      onClick: ({ key }) => handleMenuAction(activeMember, key),
                    }}
                    trigger={['click']}
                  >
                    <button type="button" aria-label="更多操作" className={styles.moreButton}>
                      <span>操作处理</span>
                      <MoreOutlined />
                    </button>
                  </Dropdown>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span>单位类型</span>
                  <strong>{activeMember.organizationType}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>会员类别</span>
                  <strong>{activeMember.memberCategory}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>所属分院</span>
                  <strong>{activeMember.committee}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>账号状态</span>
                  <strong>{activeMember.accountEnabled ? '已启用' : '未启用'}</strong>
                </div>
              </div>

              <div className={styles.templateBlock}>
                <div className={styles.blockTitle}>
                  <span>信息完整度</span>
                  <strong>{activeMember.completeness}%</strong>
                </div>
                <MemberCompletenessBar value={activeMember.completeness} />
              </div>

              <div className={styles.templateBlock}>
                <div className={styles.blockTitle}>
                  <span>参与工作组</span>
                  <strong>{activeMember.workgroups.length} 个</strong>
                </div>
                <div className={styles.workgroupList}>
                  {activeMember.workgroups.map((group) => (
                    <span key={group}>{group}</span>
                  ))}
                </div>
              </div>

              <div className={styles.twoColumnGrid}>
                <div className={styles.templateBlock}>
                  <div className={styles.blockTitle}>
                    <span>主联系人</span>
                    <strong>{activeMember.primaryContact}</strong>
                  </div>
                  <div className={styles.contactCell}>
                    <strong>{activeMember.primaryContactTitle}</strong>
                    <small>{activeMember.contacts[0]?.phone ?? '待补充电话'}</small>
                    <small>{activeMember.contacts[0]?.email ?? '待补充邮箱'}</small>
                  </div>
                </div>

                <div className={styles.templateBlock}>
                  <div className={styles.blockTitle}>
                    <span>协同记录</span>
                    <strong>{activeMember.participations.length + activeMember.meetings.length} 条</strong>
                  </div>
                  <p className={styles.recentText}>{activeMember.recentParticipation}</p>
                </div>
              </div>

              <div className={styles.templateBlock}>
                <div className={styles.blockTitle}>
                  <span>能力标签</span>
                  <strong>{activeMember.capabilityTags.length} 项</strong>
                </div>
                <div className={styles.tagList}>
                  {activeMember.capabilityTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className={styles.templateBlock}>
                <div className={styles.blockTitle}>
                  <span>单位简介</span>
                  <strong>{activeMember.website}</strong>
                </div>
                <p className={styles.description}>{activeMember.description}</p>
                <p className={styles.address}>{activeMember.address}</p>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <Empty description="暂无符合条件的会员单位" />
            </div>
          )}
        </div>
      </div>

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
