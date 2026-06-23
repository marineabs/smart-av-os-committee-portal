import { App } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import AddMemberModal, { type MemberFormValues } from '../components/AddMemberModal'
import ImportMemberModal from '../components/ImportMemberModal'
import MemberAccessModal from '../components/MemberAccessModal'
import MemberContactsDrawer from '../components/MemberContactsDrawer'
import MemberDetailDrawer from '../components/MemberDetailDrawer'
import MemberFilterBar, { type MemberFilterState } from '../components/MemberFilterBar'
import MemberHero from '../components/MemberHero'
import MemberStatCard from '../components/MemberStatCard'
import MemberUnitTable from '../components/MemberUnitTable'
import AppLayout from '../layouts/AppLayout'
import {
  memberFilterOptions,
  memberStatsBase,
  memberUnits as initialMemberUnits,
} from '../mock/memberCenter'
import type {
  MemberQuickFilter,
  MemberStatItem,
  MemberUnit,
} from '../types/portal'
import styles from './MemberCenterPage.module.css'

const initialFilterState: MemberFilterState = {
  memberCategory: '全部',
  organizationType: '全部',
  committee: '全部',
  workgroup: '全部',
  status: '全部',
  accountState: '全部',
  completeness: '全部',
}

const accentPalette = [
  'linear-gradient(135deg, #2f79ff 0%, #69acff 100%)',
  'linear-gradient(135deg, #5f6bff 0%, #8c9bff 100%)',
  'linear-gradient(135deg, #18b8c7 0%, #35d49c 100%)',
  'linear-gradient(135deg, #ff8f2f 0%, #ffb84d 100%)',
]

function buildMemberStats(members: MemberUnit[]): MemberStatItem[] {
  const additions = members.slice(initialMemberUnits.length)

  return memberStatsBase.map((item, index) => {
    if (index === 0) {
      return { ...item, value: String(128 + additions.length) }
    }

    if (index === 1) {
      const extraContacts = additions.reduce((sum, member) => sum + member.contacts.length, 0)
      return { ...item, value: String(342 + extraContacts) }
    }

    if (index === 3) {
      return {
        ...item,
        value: String(46 + additions.filter((member) => member.standardProjectParticipant).length),
      }
    }

    if (index === 5) {
      return {
        ...item,
        value: String(15 + additions.filter((member) => member.completeness < 90).length),
      }
    }

    return item
  })
}

function createMemberFromValues(values: MemberFormValues, member?: MemberUnit | null): MemberUnit {
  const timestamp = Date.now()
  const baseId = member?.id ?? `member-${timestamp}`
  const shortName = values.name.slice(0, 4)
  const primaryContactRecord = {
    id: `${baseId}-contact-1`,
    role: '主联系人',
    name: values.primaryContact,
    title: values.primaryContactTitle,
    phone: values.phone,
    email: values.email,
    accountStatus: values.status === '待审核' ? ('待开通' as const) : ('已启用' as const),
  }

  return {
    id: baseId,
    name: values.name,
    shortName,
    logoText: values.name.slice(0, 2),
    accent: member?.accent ?? accentPalette[timestamp % accentPalette.length],
    organizationType: values.organizationType,
    memberCategory: values.memberCategory,
    memberCategoryId:
      values.memberCategory === '主任委员单位'
        ? 'chair'
        : values.memberCategory === '副主任委员单位'
          ? 'vice-chair'
          : values.memberCategory === '观察员单位'
            ? 'observer'
            : values.memberCategory === '合作单位'
              ? 'partner'
              : 'member',
    committee: values.committee,
    workgroups: values.workgroups,
    primaryContact: values.primaryContact,
    primaryContactTitle: values.primaryContactTitle,
    status: values.status as MemberUnit['status'],
    completeness: member?.completeness ?? 86,
    recentParticipation: member?.recentParticipation ?? '本地新增成员单位，待补充参与记录',
    capabilityTags: values.capabilityTags,
    accountEnabled: values.status !== '待审核',
    ownedByCurrentUser: member?.ownedByCurrentUser ?? true,
    addedThisMonth: true,
    hasContactChange: member?.hasContactChange ?? false,
    standardProjectParticipant: member?.standardProjectParticipant ?? values.workgroups.includes('技术标准组'),
    description: values.description,
    address: member?.address ?? '待补充联系地址',
    website: member?.website ?? '待补充官网',
    contacts: member
      ? [
          primaryContactRecord,
          ...member.contacts.filter((contact) => contact.role !== '主联系人').map((contact, index) => ({
            ...contact,
            id: `${baseId}-contact-${index + 2}`,
          })),
        ]
      : [primaryContactRecord],
    participations:
      member?.participations.length
        ? member.participations.map((item) =>
            values.workgroups.includes(item.name)
              ? item
              : {
                  ...item,
                  recentActivity: '工作组范围已调整，等待同步后续记录',
                },
          )
        : values.workgroups.map((group, index) => ({
            id: `${baseId}-part-${index + 1}`,
            name: group,
            role: '成员单位',
            liaison: values.primaryContact,
            joinedAt: new Date().toISOString().slice(0, 10),
            recentActivity: '待补充参与记录',
          })),
    meetings: member?.meetings ?? [],
    files: member?.files ?? [],
    tasks: member?.tasks ?? [],
    accounts:
      member?.accounts.length
        ? member.accounts.map((account) => ({
            ...account,
            enabled: values.status !== '待审核',
            authorizedGroups: values.workgroups,
          }))
        : [
            {
              id: `${baseId}-account-1`,
              accountName: `${baseId}-admin`,
              role: '会员单位账户',
              enabled: values.status !== '待审核',
              authorizedGroups: values.workgroups,
              scope: '公开资料、授权工作组',
              temporaryAccess: '无',
              lastChanged: new Date().toISOString().slice(0, 10),
            },
          ],
    changes: [
      {
        id: `${baseId}-change-${timestamp}`,
        type: member ? '单位信息变更' : '新增会员单位',
        summary: member ? '已更新单位基础信息与联系人信息' : '秘书处新增会员单位至本地 mock 列表',
        operator: '秘书处管理员',
        time: new Date().toLocaleString('zh-CN', { hour12: false }),
      },
      ...(member?.changes ?? []),
    ],
  }
}

function MemberCenterPage() {
  const { message } = App.useApp()
  const [contactMember, setContactMember] = useState<MemberUnit | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingMember, setEditingMember] = useState<MemberUnit | null>(null)
  const [filters, setFilters] = useState<MemberFilterState>(initialFilterState)
  const [headerKeyword, setHeaderKeyword] = useState('')
  const [members, setMembers] = useState(initialMemberUnits)
  const [pageSize, setPageSize] = useState(10)
  const [permissionMember, setPermissionMember] = useState<MemberUnit | null>(null)
  const [quickFilter, setQuickFilter] = useState<MemberQuickFilter>('all')
  const [selectedMember, setSelectedMember] = useState<MemberUnit | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [submittedKeyword, setSubmittedKeyword] = useState('')

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, quickFilter, submittedKeyword])

  const stats = useMemo(() => buildMemberStats(members), [members])

  const filteredMembers = useMemo(() => {
    const keyword = submittedKeyword.trim().toLowerCase()

    return members.filter((member) => {
      const matchesKeyword = keyword
        ? [
            member.name,
            member.primaryContact,
            member.primaryContactTitle,
            member.committee,
            member.workgroups.join(' '),
            member.capabilityTags.join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        : true

      const matchesMemberCategory =
        filters.memberCategory === '全部' ? true : member.memberCategory === filters.memberCategory
      const matchesOrganizationType =
        filters.organizationType === '全部'
          ? true
          : member.organizationType === filters.organizationType
      const matchesCommittee = filters.committee === '全部' ? true : member.committee === filters.committee
      const matchesWorkgroup =
        filters.workgroup === '全部' ? true : member.workgroups.includes(filters.workgroup)
      const matchesStatus = filters.status === '全部' ? true : member.status === filters.status
      const matchesAccountState =
        filters.accountState === '全部'
          ? true
          : filters.accountState === '已启用'
            ? member.accountEnabled
            : !member.accountEnabled
      const matchesCompleteness =
        filters.completeness === '全部'
          ? true
          : filters.completeness === '90%以上'
            ? member.completeness >= 90
            : filters.completeness === '70% - 89%'
              ? member.completeness >= 70 && member.completeness < 90
              : member.completeness < 70

      const matchesQuickFilter =
        quickFilter === 'all'
          ? true
          : quickFilter === 'mine'
            ? member.ownedByCurrentUser
            : quickFilter === 'incomplete'
              ? member.completeness < 90
              : quickFilter === 'new'
                ? member.addedThisMonth
                : quickFilter === 'contact'
                  ? member.hasContactChange
                  : quickFilter === 'standard'
                    ? member.standardProjectParticipant
                    : member.status === '待审核'

      return (
        matchesKeyword &&
        matchesMemberCategory &&
        matchesOrganizationType &&
        matchesCommittee &&
        matchesWorkgroup &&
        matchesStatus &&
        matchesAccountState &&
        matchesCompleteness &&
        matchesQuickFilter
      )
    })
  }, [filters, members, quickFilter, submittedKeyword])

  const pagedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateMember = (memberId: string, updater: (member: MemberUnit) => MemberUnit) => {
    setMembers((current) => current.map((member) => (member.id === memberId ? updater(member) : member)))
    setSelectedMember((current) => (current && current.id === memberId ? updater(current) : current))
    setContactMember((current) => (current && current.id === memberId ? updater(current) : current))
    setPermissionMember((current) => (current && current.id === memberId ? updater(current) : current))
  }

  return (
    <AppLayout
      contextLabel="工作台 / 会员信息中心"
      footerCaption="智慧视听生态"
      footerTitle="共建操作系统底座能力"
      headerSearchValue={headerKeyword}
      onHeaderSearchChange={setHeaderKeyword}
      onHeaderSearchSubmit={(value) => {
        setSubmittedKeyword(value)
        message.success('已按关键词筛选会员单位')
      }}
      searchPlaceholder="搜索单位名称、联系人、工作组等"
      versionLabel="V 1.0.0"
    >
      <div className={styles.page}>
        <MemberHero
          onAdd={() => {
            setEditingMember(null)
            setShowAddModal(true)
          }}
          onImport={() => setShowImportModal(true)}
        />

        <section className={styles.statsGrid}>
          {stats.map((item) => (
            <MemberStatCard
              key={item.title}
              className={styles.compactStatCard}
              iconClassName={styles.compactStatIcon}
              item={item}
              showDelta={false}
            />
          ))}
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <MemberFilterBar
              activeKeyword={submittedKeyword}
              activeQuickFilter={quickFilter}
              filters={filters}
              options={memberFilterOptions}
              onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              onQuickFilterChange={setQuickFilter}
              onReset={() => {
                setFilters(initialFilterState)
                setHeaderKeyword('')
                setSubmittedKeyword('')
                setQuickFilter('all')
              }}
              onSearch={() => {
                setSubmittedKeyword(headerKeyword)
                message.success('已按当前条件筛选会员单位')
              }}
            />

            <MemberUnitTable
              columnWidthMembers={filteredMembers}
              currentPage={currentPage}
              members={pagedMembers}
              onContact={setContactMember}
              onEdit={(member) => {
                setEditingMember(member)
                setShowAddModal(true)
              }}
              onMoreAction={(member, action) => {
                if (action === 'freeze') {
                  updateMember(member.id, (current) => ({ ...current, accountEnabled: false }))
                  message.info(`${member.name} 账号已模拟冻结`)
                  return
                }

                if (action === 'archive') {
                  updateMember(member.id, (current) => ({ ...current, status: '退出' }))
                  message.info(`${member.name} 已模拟退出归档`)
                  return
                }

                if (action === 'export') {
                  message.success(`已模拟导出 ${member.name} 单位档案`)
                  return
                }

                if (action === 'records') {
                  setSelectedMember(member)
                  return
                }

                message.info(`${member.name}：已模拟${action === 'workgroup' ? '工作组调整' : '发送通知'}操作`)
              }}
              onPageChange={(page, size) => {
                setCurrentPage(page)
                setPageSize(size)
              }}
              onPermission={setPermissionMember}
              onView={setSelectedMember}
              pageSize={pageSize}
              total={filteredMembers.length}
            />
          </div>
        </section>
      </div>

      <MemberDetailDrawer
        member={selectedMember}
        open={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
      />

      <MemberContactsDrawer
        member={contactMember}
        open={Boolean(contactMember)}
        onClose={() => setContactMember(null)}
      />

      <MemberAccessModal
        member={permissionMember}
        open={Boolean(permissionMember)}
        onClose={() => setPermissionMember(null)}
        onSubmit={(memberId, values) => {
          updateMember(memberId, (member) => ({
            ...member,
            accountEnabled: values.enabled,
            accounts: member.accounts.map((account, index) =>
              index === 0
                ? {
                    ...account,
                    enabled: values.enabled,
                    authorizedGroups: values.groups,
                    scope: values.scope,
                  }
                : account,
            ),
          }))
          setPermissionMember(null)
          message.success('权限设置已更新到本地 mock 数据')
        }}
      />

      <AddMemberModal
        member={editingMember}
        open={showAddModal}
        onClose={() => {
          setEditingMember(null)
          setShowAddModal(false)
        }}
        onSubmit={(values) => {
          const nextMember = createMemberFromValues(values, editingMember)
          setMembers((current) => {
            if (editingMember) {
              return current.map((member) => (member.id === editingMember.id ? nextMember : member))
            }
            return [nextMember, ...current]
          })
          setEditingMember(null)
          setShowAddModal(false)
          message.success(editingMember ? '会员单位信息已更新' : '会员单位已加入本地 mock 列表')
        }}
      />

      <ImportMemberModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onConfirm={() => {
          setShowImportModal(false)
          message.success('已模拟批量导入流程')
        }}
      />
    </AppLayout>
  )
}

export default MemberCenterPage
