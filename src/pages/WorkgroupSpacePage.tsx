import { App } from 'antd'
import { useMemo, useState } from 'react'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import NewWorkgroupDrawer from '../components/NewWorkgroupDrawer'
import WorkgroupActiveCard from '../components/WorkgroupActiveCard'
import WorkgroupCard from '../components/WorkgroupCard'
import WorkgroupDynamicsCard from '../components/WorkgroupDynamicsCard'
import WorkgroupFilterPanel from '../components/WorkgroupFilterPanel'
import WorkgroupHero from '../components/WorkgroupHero'
import WorkgroupProgressCard from '../components/WorkgroupProgressCard'
import AppLayout from '../layouts/AppLayout'
import { currentUser } from '../mock/portal'
import {
  workgroupActiveList,
  workgroupCategories,
  workgroupDirections,
  workgroupDynamics,
  workgroupStats,
  workgroupTaskProgress,
  workgroups,
} from '../mock/workgroups'
import type { WorkgroupCardItem } from '../types/portal'
import styles from './WorkgroupSpacePage.module.css'

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
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeDirection, setActiveDirection] = useState<string | null>(null)
  const [draftKeyword, setDraftKeyword] = useState('')
  const [groupList, setGroupList] = useState(workgroups)
  const [keyword, setKeyword] = useState('')
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
    const normalizedKeyword = keyword.trim().toLowerCase()

    return groupList.filter((group) => {
      const matchesCategory = activeCategory === 'all' ? true : group.category === activeCategory
      const matchesDirection = activeDirection ? group.directionIds.includes(activeDirection) : true
      const matchesKeyword = normalizedKeyword
        ? [group.name, group.leaderUnit, group.positioning, group.tags.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(normalizedKeyword)
        : true

      return matchesCategory && matchesDirection && matchesKeyword
    })
  }, [activeCategory, activeDirection, groupList, keyword])

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
          keyword={draftKeyword}
          onChangeKeyword={setDraftKeyword}
          onCreateGroup={() => setShowCreateDrawer(true)}
          onManageMembers={() => message.info('当前为原型页，可继续扩展工作组管理流程')}
          onSearch={() => setKeyword(draftKeyword)}
        />

        <section className={styles.statsGrid}>
          {statItems.map((item) => (
            <KnowledgeStatCard key={item.title} item={item} />
          ))}
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <WorkgroupFilterPanel
              activeCategory={activeCategory}
              activeDirection={activeDirection}
              categories={workgroupCategories}
              directions={workgroupDirections}
              onCategoryChange={setActiveCategory}
              onDirectionChange={setActiveDirection}
            />
          </div>

          <div className={styles.mainColumn}>
            <div className={styles.summaryBar}>
              <div>
                <h2>全部工作组</h2>
                <span>
                  当前展示 {filteredWorkgroups.length} 个工作组
                  {keyword ? `，关键词：${keyword}` : ''}
                </span>
              </div>
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
