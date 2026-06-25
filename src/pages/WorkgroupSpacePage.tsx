import { App, Tabs } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import NewWorkgroupDrawer from '../components/NewWorkgroupDrawer'
import WorkgroupCard from '../components/WorkgroupCard'
import WorkgroupHero from '../components/WorkgroupHero'
import AppLayout from '../layouts/AppLayout'
import {
  workgroupStats,
  workgroups,
} from '../mock/workgroups'
import { getActiveUser } from '../services/auth'
import type { WorkgroupCardItem, WorkgroupCategory } from '../types/portal'
import { canManageWorkgroups } from '../utils/permissions'
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

function WorkgroupSpacePage() {
  const { message } = App.useApp()
  const currentUser = getActiveUser()
  const navigate = useNavigate()
  const [activeCommittee, setActiveCommittee] = useState(committeeTabs[0].key)
  const [groupList, setGroupList] = useState(workgroups)
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)

  const allowWorkgroupManage = canManageWorkgroups(currentUser)
  const createButtonLabel = '新建工作组'
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

  const placeholderCount = useMemo(() => {
    if (filteredWorkgroups.length === 0) {
      return 3
    }

    return (3 - (filteredWorkgroups.length % 3)) % 3
  }, [filteredWorkgroups.length])

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
          canManageWorkgroups={allowWorkgroupManage}
          createButtonLabel={createButtonLabel}
          onCreateGroup={() => setShowCreateDrawer(true)}
          onManageWorkgroups={() => navigate('/admin/workgroups')}
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
              {Array.from({ length: placeholderCount }).map((_, index) => (
                <div
                  key={`workgroup-placeholder-${activeCommittee}-${index}`}
                  aria-hidden="true"
                  className={styles.cardPlaceholder}
                />
              ))}
            </div>
          </div>

        </section>
      </div>

      {allowWorkgroupManage ? (
        <NewWorkgroupDrawer
          creationMode="direct"
          onClose={() => setShowCreateDrawer(false)}
          onCreated={(group: WorkgroupCardItem) => {
            setGroupList((current) => [group, ...current])
            setShowCreateDrawer(false)
            message.success('工作组已创建并加入列表')
          }}
          open={showCreateDrawer}
        />
      ) : null}
    </AppLayout>
  )
}

export default WorkgroupSpacePage
