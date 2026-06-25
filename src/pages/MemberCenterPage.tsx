import { App } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import AddMemberModal, { type MemberFormValues } from '../components/AddMemberModal'
import ImportMemberModal from '../components/ImportMemberModal'
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
import { getActiveUser } from '../services/auth'
import {
  createCollaborationRecord,
  fetchCollaborationRecords,
  updateCollaborationRecord,
} from '../services/collaborationApi'
import type {
  MemberQuickFilter,
  MemberStatItem,
  MemberUnit,
} from '../types/portal'
import {
  canManageAllMemberInfo,
  canManageUserAccounts,
  getRoleScopeLabel,
  isAdminUser,
  isRegularUser,
  isWorkgroupManager,
} from '../utils/permissions'
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

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
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
        summary: member ? '已更新单位基础信息与联系人信息' : '秘书处新增会员单位至本地示例列表',
        operator: '秘书处管理员',
        time: new Date().toLocaleString('zh-CN', { hour12: false }),
      },
      ...(member?.changes ?? []),
    ],
  }
}

function MemberCenterPage() {
  const { message } = App.useApp()
  const currentUser = getActiveUser()
  const userIsAdmin = isAdminUser(currentUser)
  const userIsWorkgroupManager = isWorkgroupManager(currentUser)
  const userIsRegular = isRegularUser(currentUser)
  const allowManageAllMembers = canManageAllMemberInfo(currentUser)
  const allowManageAccounts = canManageUserAccounts(currentUser)
  const [contactMember, setContactMember] = useState<MemberUnit | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingMember, setEditingMember] = useState<MemberUnit | null>(null)
  const [filters, setFilters] = useState<MemberFilterState>(initialFilterState)
  const [headerKeyword, setHeaderKeyword] = useState('')
  const [members, setMembers] = useState(initialMemberUnits)
  const [pageSize, setPageSize] = useState(10)
  const [quickFilter, setQuickFilter] = useState<MemberQuickFilter>('all')
  const [selectedMember, setSelectedMember] = useState<MemberUnit | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, quickFilter, submittedKeyword])

  useEffect(() => {
    let active = true

    fetchCollaborationRecords<MemberUnit>('members', initialMemberUnits)
      .then((records) => {
        if (!active) {
          return
        }

        setMembers(records)
        setApiOnline(true)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setApiOnline(false)
        message.warning('成员中心 API 未连接，当前使用本地示例数据')
      })

    return () => {
      active = false
    }
  }, [message])

  const accessibleMembers = useMemo(() => {
    if (userIsAdmin) {
      return members
    }

    if (userIsWorkgroupManager) {
      return members.filter((member) => (
        currentUser.currentWorkgroup ? member.workgroups.includes(currentUser.currentWorkgroup) : false
      ))
    }

    return members.filter((member) => member.name === currentUser.organizationName)
  }, [currentUser.currentWorkgroup, currentUser.organizationName, members, userIsAdmin, userIsWorkgroupManager])

  const stats = useMemo(() => {
    const baseStats = buildMemberStats(userIsAdmin ? members : accessibleMembers)

    if (userIsAdmin) {
      return baseStats
    }

    return baseStats.map((item, index) => {
      if (index === 0) {
        return { ...item, value: String(accessibleMembers.length), delta: userIsRegular ? '我的单位' : '本组范围' }
      }

      if (index === 1) {
        const contactCount = accessibleMembers.reduce((total, member) => total + member.contacts.length, 0)
        return { ...item, value: String(contactCount), delta: '授权可见' }
      }

      return item
    })
  }, [accessibleMembers, members, userIsAdmin, userIsRegular])

  const filteredMembers = useMemo(() => {
    const keyword = submittedKeyword.trim().toLowerCase()

    return accessibleMembers.filter((member) => {
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
  }, [accessibleMembers, filters, quickFilter, submittedKeyword])

  const pagedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateMember = (memberId: string, updater: (member: MemberUnit) => MemberUnit) => {
    setMembers((current) => current.map((member) => (member.id === memberId ? updater(member) : member)))
    setSelectedMember((current) => (current && current.id === memberId ? updater(current) : current))
    setContactMember((current) => (current && current.id === memberId ? updater(current) : current))
  }

  const persistMember = async (member: MemberUnit, isCreate = false) => {
    if (!apiOnline) {
      return member
    }

    return isCreate
      ? createCollaborationRecord('members', member)
      : updateCollaborationRecord('members', member)
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
          canAdd={allowManageAllMembers}
          canImport={allowManageAllMembers}
          onAdd={() => {
            setEditingMember(null)
            setShowAddModal(true)
          }}
          onImport={() => setShowImportModal(true)}
          scopeLabel={getRoleScopeLabel(currentUser)}
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
              canManageAccounts={allowManageAccounts}
              canManageMembers={allowManageAllMembers}
              canNotifyMembers={!userIsRegular}
              columnWidthMembers={filteredMembers}
              currentPage={currentPage}
              members={pagedMembers}
              onContact={setContactMember}
              onMoreAction={(member, action) => {
                if (['freeze', 'archive', 'workgroup'].includes(action) && !allowManageAllMembers) {
                  message.warning('当前身份不能编辑其它用户信息')
                  return
                }

                if (action === 'freeze') {
                  const nextMember = { ...member, accountEnabled: false }
                  updateMember(member.id, () => nextMember)
                  void persistMember(nextMember).then(() => message.success(`${member.name} 账号已冻结`))
                  return
                }

                if (action === 'archive') {
                  const nextMember = { ...member, status: '退出' as MemberUnit['status'] }
                  updateMember(member.id, () => nextMember)
                  void persistMember(nextMember).then(() => message.success(`${member.name} 已退出归档`))
                  return
                }

                if (action === 'export') {
                  downloadJsonFile(`${member.name}-单位档案.json`, {
                    exportedAt: new Date().toISOString(),
                    member,
                  })
                  message.success(`已导出 ${member.name} 单位档案`)
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

      <AddMemberModal
        member={editingMember}
        open={showAddModal}
        onClose={() => {
          setEditingMember(null)
          setShowAddModal(false)
        }}
        onSubmit={async (values) => {
          const nextMember = createMemberFromValues(values, editingMember)
          const savedMember = await persistMember(nextMember, !editingMember)
          setMembers((current) => {
            if (editingMember) {
              return current.map((member) => (member.id === editingMember.id ? savedMember : member))
            }
            return [savedMember, ...current]
          })
          setEditingMember(null)
          setShowAddModal(false)
          message.success(editingMember ? '会员单位信息已更新' : apiOnline ? '会员单位已保存' : '会员单位已加入本地示例列表')
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
