import { App, Tabs } from 'antd'
import { useMemo, useState } from 'react'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import NewWorkgroupDrawer from '../components/NewWorkgroupDrawer'
import WorkgroupActiveCard from '../components/WorkgroupActiveCard'
import WorkgroupCard from '../components/WorkgroupCard'
import WorkgroupDynamicsCard from '../components/WorkgroupDynamicsCard'
import WorkgroupHero from '../components/WorkgroupHero'
import WorkgroupProgressCard from '../components/WorkgroupProgressCard'
import AppLayout from '../layouts/AppLayout'
import { currentUser } from '../mock/portal'
import {
  workgroupActiveList,
  workgroupDynamics,
  workgroupStats,
  workgroupTaskProgress,
  workgroups,
} from '../mock/workgroups'
import type { WorkgroupCardItem, WorkgroupCategory } from '../types/portal'
import styles from './WorkgroupSpacePage.module.css'

type CommitteeWorkgroupCategory = Exclude<WorkgroupCategory, 'all'>

interface CommitteeTab {
  key: string
  label: string
  categories: CommitteeWorkgroupCategory[]
}

const committeeTabs: CommitteeTab[] = [
  {
    key: 'all',
    label: '全部工作组',
    categories: ['architecture', 'media', 'terminal', 'management', 'standards', 'testing', 'ecosystem'],
  },
  {
    key: 'tech-project',
    label: '技术与项目管理委员会',
    categories: ['architecture', 'media', 'terminal', 'management'],
  },
  {
    key: 'standard-certification',
    label: '标准与认证委员会',
    categories: ['standards', 'testing'],
  },
  {
    key: 'industry-development',
    label: '产业发展委员',
    categories: ['ecosystem'],
  },
]

function resolveCreationMode(role: string) {
  if (role.includes('秘书处管理员')) {
    return 'direct'
  }

  if (role.includes('分委会负责人')) {
    return 'application'
  }

  return 'viewer'
}

function WorkgroupSpacePage() {
  const { message } = App.useApp()
  const [activeCommittee, setActiveCommittee] = useState(committeeTabs[0].key)
  const [groupList, setGroupList] = useState(workgroups)
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)

  const creationMode = resolveCreationMode(currentUser.role)
  const canCreateGroup = creationMode !== 'viewer'
  const createButtonLabel = creationMode === 'application' ? '申请新建工作组' : '新建工作组'
  const statItems = useMemo(
    () =>
      workgroupStats.map((item, index) =>
        index === 0 ? { ...item, value: String(groupList.length) } : item,
      ),
    [groupList],
  )

  const filteredWorkgroups = useMemo(() => {
    const tab = committeeTabs.find((item) => item.key === activeCommittee) ?? committeeTabs[0]

    return groupList.filter((group) => {
      return group.category === 'all' ? false : tab.categories.includes(group.category)
    })
  }, [activeCommittee, groupList])

  const committeeCounts = useMemo(
    () =>
      new Map(
        committeeTabs.map((tab) => [
          tab.key,
          groupList.filter((group) => group.category !== 'all' && tab.categories.includes(group.category)).length,
        ]),
      ),
    [groupList],
  )

  return (
    <AppLayout
      contextLabel="工作台"
      footerCaption="智慧视听协作网络"
      footerTitle="共建操作系统专题能力"
      searchPlaceholder="搜索文件、会议、任务、工作组..."
      versionLabel="V 1.0.0"
    >
      <div className={styles.page}>
        <WorkgroupHero
          canCreateGroup={canCreateGroup}
          createButtonLabel={createButtonLabel}
          onCreateGroup={() => setShowCreateDrawer(true)}
          onManageMembers={() => message.info('当前为原型页，可继续扩展工作组管理流程')}
        />

        <section className={styles.statsGrid}>
          {statItems.map((item) => (
            <KnowledgeStatCard
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
            <div className={styles.summaryBar}>
              <Tabs
                activeKey={activeCommittee}
                className={styles.committeeTabs}
                items={committeeTabs.map((item) => ({
                  key: item.key,
                  label: `${item.label}（${committeeCounts.get(item.key) ?? 0}）`,
                }))}
                onChange={setActiveCommittee}
              />
            </div>

            <div className={styles.cardGrid}>
              {filteredWorkgroups.map((group) => (
                <WorkgroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>

          <aside className={styles.rightColumn}>
            <WorkgroupDynamicsCard
              items={workgroupDynamics}
              onMore={() => message.info('可扩展为完整工作组动态页')}
            />
            <WorkgroupProgressCard
              items={workgroupTaskProgress}
              onMore={() => message.info('可扩展为重点推进任务页')}
            />
            <WorkgroupActiveCard
              items={workgroupActiveList}
              onMore={() => message.info('可扩展为活跃工作组排行页')}
            />
          </aside>
        </section>
      </div>

      {canCreateGroup ? (
        <NewWorkgroupDrawer
          creationMode={creationMode === 'application' ? 'application' : 'direct'}
          onClose={() => setShowCreateDrawer(false)}
          onCreated={(group: WorkgroupCardItem) => {
            setGroupList((current) => [group, ...current])
            setShowCreateDrawer(false)
            message.success(
              creationMode === 'application'
                ? '工作组申请已提交，已加入列表等待审核'
                : '工作组已创建并加入列表',
            )
          }}
          open={showCreateDrawer}
        />
      ) : null}
    </AppLayout>
  )
}

export default WorkgroupSpacePage
