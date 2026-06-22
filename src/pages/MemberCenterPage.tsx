import { App } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import ActiveMemberUnitsCard from '../components/ActiveMemberUnitsCard'
import AddMemberModal, { type MemberFormValues } from '../components/AddMemberModal'
import ImportMemberModal from '../components/ImportMemberModal'
import MemberAccessModal from '../components/MemberAccessModal'
import MemberCategoryPanel from '../components/MemberCategoryPanel'
import MemberContactsDrawer from '../components/MemberContactsDrawer'
import MemberDetailDrawer from '../components/MemberDetailDrawer'
import MemberFilterBar, { type MemberFilterState } from '../components/MemberFilterBar'
import MemberHero from '../components/MemberHero'
import MemberPermissionModal from '../components/MemberPermissionModal'
import MemberStatCard from '../components/MemberStatCard'
import MemberStatusGuideCard from '../components/MemberStatusGuideCard'
import MemberUnitTable from '../components/MemberUnitTable'
import PendingMemberActionsCard from '../components/PendingMemberActionsCard'
import RecentMemberChangesCard from '../components/RecentMemberChangesCard'
import AppLayout from '../layouts/AppLayout'
import {
  memberActiveUnits,
  memberCapabilityDefinitions,
  memberCategoryDefinitions,
  memberFilterOptions,
  memberPendingActions,
  memberPermissionGuides,
  memberRecentChanges,
  memberStatsBase,
  memberStatusGuides,
  memberUnits as initialMemberUnits,
} from '../mock/memberCenter'
import type {
  MemberCapabilityDefinition,
  MemberCategoryDefinition,
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
  capability: '全部',
  accountState: '全部',
  completeness: '全部',
}

const accentPalette = [
  'linear-gradient(135deg, #2f79ff 0%, #69acff 100%)',
  'linear-gradient(135deg, #5f6bff 0%, #8c9bff 100%)',
  'linear-gradient(135deg, #18b8c7 0%, #35d49c 100%)',
  'linear-gradient(135deg, #ff8f2f 0%, #ffb84d 100%)',
]

function resolveMemberCategoryId(memberCategory: string) {
  if (memberCategory === '主任委员单位') return 'chair'
  if (memberCategory === '副主任委员单位') return 'vice-chair'
  if (memberCategory === '观察员单位') return 'observer'
  if (memberCategory === '合作单位') return 'partner'
  return 'member'
}

function matchesLeftCategory(member: MemberUnit, categoryId: string) {
  if (categoryId === 'all') return true
  if (categoryId === 'pending') return member.status === '待审核'
  if (categoryId === 'paused') return member.status === '暂停' || member.status === '退出'
  return member.memberCategoryId === categoryId
}

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

function buildCategoryCounts(members: MemberUnit[]): MemberCategoryDefinition[] {
  const additions = members.slice(initialMemberUnits.length)
  const countMap = new Map(memberCategoryDefinitions.map((item) => [item.id, item.count]))

  additions.forEach((member) => {
    countMap.set('all', (countMap.get('all') ?? 0) + 1)
    countMap.set(member.memberCategoryId, (countMap.get(member.memberCategoryId) ?? 0) + 1)
    if (member.status === '待审核') {
      countMap.set('pending', (countMap.get('pending') ?? 0) + 1)
    }
    if (member.status === '暂停' || member.status === '退出') {
      countMap.set('paused', (countMap.get('paused') ?? 0) + 1)
    }
  })

  return memberCategoryDefinitions.map((item) => ({
    ...item,
    count: countMap.get(item.id) ?? item.count,
  }))
}

function buildCapabilityCounts(members: MemberUnit[]): MemberCapabilityDefinition[] {
  const additions = members.slice(initialMemberUnits.length)
  const countMap = new Map(memberCapabilityDefinitions.map((item) => [item.id, item.count]))

  additions.forEach((member) => {
    member.capabilityTags.forEach((tag) => {
      if (countMap.has(tag)) {
        countMap.set(tag, (countMap.get(tag) ?? 0) + 1)
      }
    })
  })

  return memberCapabilityDefinitions.map((item) => ({
    ...item,
    count: countMap.get(item.id) ?? item.count,
  }))
}

function createMemberFromValues(values: MemberFormValues, member?: MemberUnit | null): MemberUnit {
  const timestamp = Date.now()
  const memberCategoryId = resolveMemberCategoryId(values.memberCategory)
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
    memberCategoryId,
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
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeCapability, setActiveCapability] = useState<string | null>(null)
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
  const [showPermissionGuide, setShowPermissionGuide] = useState(false)
  const [submittedKeyword, setSubmittedKeyword] = useState('')

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCapability, activeCategory, filters, quickFilter, submittedKeyword])

  const stats = useMemo(() => buildMemberStats(members), [members])
  const categories = useMemo(() => buildCategoryCounts(members), [members])
  const capabilities = useMemo(() => buildCapabilityCounts(members), [members])

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

      const matchesCategory = matchesLeftCategory(member, activeCategory)
      const matchesCapability = activeCapability ? member.capabilityTags.includes(activeCapability) : true
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
      const matchesFilterCapability =
        filters.capability === '全部' ? true : member.capabilityTags.includes(filters.capability)
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
        matchesCategory &&
        matchesCapability &&
        matchesMemberCategory &&
        matchesOrganizationType &&
        matchesCommittee &&
        matchesWorkgroup &&
        matchesStatus &&
        matchesFilterCapability &&
        matchesAccountState &&
        matchesCompleteness &&
        matchesQuickFilter
      )
    })
  }, [activeCapability, activeCategory, filters, members, quickFilter, submittedKeyword])

  const pagedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateMember = (memberId: string, updater: (member: MemberUnit) => MemberUnit) => {
    setMembers((current) => current.map((member) => (member.id === memberId ? updater(member) : member)))
    setSelectedMember((current) => (current && current.id === memberId ? updater(current) : current))
    setContactMember((current) => (current && current.id === memberId ? updater(current) : current))
    setPermissionMember((current) => (current && current.id === memberId ? updater(current) : current))
  }

  return (
    <AppLayout
      contextLabel="工作台 / 会员管理中心"
      footerCaption="智慧视听生态"
      footerTitle="共建操作系统底座能力"
      headerSearchValue={headerKeyword}
      onHeaderSearchChange={setHeaderKeyword}
      onHeaderSearchSubmit={(value) => {
        setSubmittedKeyword(value)
        message.success('已按关键词筛选会员单位')
      }}
      searchPlaceholder="搜索单位名称、联系人、工作组、能力标签等"
      versionLabel="V 1.0.0"
    >
      <div className={styles.page}>
        <MemberHero
          onAdd={() => {
            setEditingMember(null)
            setShowAddModal(true)
          }}
          onExport={() => message.success('已模拟导出会员名册')}
          onImport={() => setShowImportModal(true)}
          onOpenPermissionGuide={() => setShowPermissionGuide(true)}
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
          <div className={styles.leftColumn}>
            <MemberCategoryPanel
              activeCapability={activeCapability}
              activeCategory={activeCategory}
              capabilities={capabilities}
              categories={categories}
              onCapabilityChange={setActiveCapability}
              onCategoryChange={setActiveCategory}
            />
          </div>

          <div className={styles.mainColumn}>
            <MemberFilterBar
              activeKeyword={submittedKeyword}
              activeQuickFilter={quickFilter}
              filters={filters}
              options={memberFilterOptions}
              onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              onQuickFilterChange={setQuickFilter}
              onReset={() => {
                setActiveCategory('all')
                setActiveCapability(null)
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

          <aside className={styles.rightColumn}>
            <PendingMemberActionsCard
              items={memberPendingActions}
              onClickItem={(item) => message.info(`${item.label}：${item.count}`)}
              onMore={() => message.info('可扩展为完整待处理页')}
            />
            <RecentMemberChangesCard
              items={memberRecentChanges}
              onMore={() => message.info('可扩展为最近变更列表页')}
            />
            <ActiveMemberUnitsCard
              items={memberActiveUnits}
              onMore={() => message.info('可扩展为活跃成员单位排行页')}
            />
            <MemberStatusGuideCard items={memberStatusGuides} />
          </aside>
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

      <MemberPermissionModal
        guides={memberPermissionGuides}
        open={showPermissionGuide}
        onClose={() => setShowPermissionGuide(false)}
      />
    </AppLayout>
  )
}

export default MemberCenterPage
