import { App, Tabs } from 'antd'
import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import PermissionGuideCard from '../components/PermissionGuideCard'
import WorkgroupDetailHero from '../components/WorkgroupDetailHero'
import AppLayout from '../layouts/AppLayout'
import { knowledgePermissionGuides } from '../mock/knowledgeCenter'
import { technicalStandardDetail, workgroups } from '../mock/workgroups'
import { getActiveUser } from '../services/auth'
import type { WorkgroupCardItem, WorkgroupDetailData } from '../types/portal'
import { canManageWorkgroupContent, isAdminUser, isWorkgroupManager } from '../utils/permissions'
import styles from './WorkgroupDetailPage.module.css'

function createDetailData(group: WorkgroupCardItem): WorkgroupDetailData {
  if (group.id === 'technical-standard') {
    return technicalStandardDetail
  }

  return {
    bannerDescription: `${group.name}面向专委会专题协同，围绕${group.tags.join('、')}持续推进跨单位资料沉淀、会议组织和任务闭环。`,
    contacts: [
      { name: '张伟', org: '秘书处', role: '协同管理员', phone: '010-6888 1023' },
      { name: '项目联络人', org: group.leaderUnit, role: '工作组联络人', phone: '010-6888 2046' },
    ],
    currentStatus: `当前重点推进：${group.latestUpdate}`,
    dutyItems: [
      `围绕${group.tags.join('、')}形成工作组专题协同机制`,
      '统一管理工作组公告、文件资料、会议纪要和任务事项',
      '支撑跨单位技术攻关与专题成果沉淀',
    ],
    permissionNote: '工作组资料默认遵循工作组协同权限与角色权限控制。',
    projectLinks: [`${group.name}阶段任务包`, `${group.name}成果资料`, `${group.name}会议纪要`],
    quickNotices: [
      `${group.name}近期专题会安排`,
      `${group.name}资料更新说明`,
      `${group.name}任务推进提醒`,
    ],
    sideTodos: ['待确认事项 1 项', '待评论资料 1 项', '待同步版本 1 项'],
    sideUpdates: [
      { id: `${group.id}-u1`, group: group.name, summary: group.latestUpdate, time: '2小时前', accent: '#2d73ff' },
      { id: `${group.id}-u2`, group: group.name, summary: '会议纪要已归档', time: '昨天 16:20', accent: '#18be98' },
    ],
    stats: [
      {
        title: '成员单位',
        value: String(group.memberUnitCount),
        unit: '家',
        delta: '较上月 +1',
        icon: group.icon,
        accent: group.accent,
      },
      {
        title: '组内成员',
        value: String(group.memberUnitCount * 2),
        unit: '人',
        delta: '较上月 +2',
        icon: group.icon,
        accent: group.accent,
      },
      {
        title: '文件资料',
        value: String(group.fileCount),
        unit: '份',
        delta: '较上月 +6',
        icon: group.icon,
        accent: group.accent,
      },
      {
        title: '会议记录',
        value: String(group.meetingCount * 6),
        unit: '场',
        delta: '较上月 +1',
        icon: group.icon,
        accent: group.accent,
      },
      {
        title: '进行中任务',
        value: String(group.taskCount),
        unit: '项',
        delta: '较上月 +1',
        icon: group.icon,
        accent: group.accent,
      },
      {
        title: '成果资料',
        value: String(Math.max(12, Math.round(group.fileCount / 3))),
        unit: '份',
        delta: '较上月 +2',
        icon: group.icon,
        accent: group.accent,
      },
    ],
    tabs: [
      {
        id: 'overview',
        title: '工作组概况',
        items: ['工作组职责说明', `${group.name}阶段目标`, `近期重点：${group.latestUpdate}`],
      },
      {
        id: 'notice',
        title: '公告通知',
        items: [`${group.name}近期公告 1`, `${group.name}近期公告 2`, `${group.name}近期公告 3`],
      },
      {
        id: 'files',
        title: '文件资料',
        items: [`${group.name}文件资料 A`, `${group.name}文件资料 B`, `${group.name}文件资料 C`],
      },
      {
        id: 'meetings',
        title: '会议资料',
        items: [`${group.name}会议纪要`, `${group.name}专题评审材料`, `${group.name}签到与议程`],
      },
      {
        id: 'tasks',
        title: '任务事项',
        items: ['推进专题任务闭环', '组织跨单位协同评审', '整理成果资料归档'],
      },
      {
        id: 'results',
        title: '成果资料',
        items: [`${group.name}阶段成果`, `${group.name}发布材料`, `${group.name}专题摘要`],
      },
      {
        id: 'members',
        title: '成员信息',
        items: [`组长单位：${group.leaderUnit}`, `副组长单位：${group.deputyUnits.join(' / ')}`, `成员单位数量：${group.memberUnitCount} 家`],
      },
      {
        id: 'logs',
        title: '操作日志',
        items: ['05-20 发布专题资料', '05-18 归档会议纪要', '05-15 更新任务进展'],
      },
    ],
  }
}

function WorkgroupDetailPage() {
  const { message } = App.useApp()
  const currentUser = getActiveUser()
  const params = useParams<{ groupId: string }>()
  const group = workgroups.find((item) => item.id === params.groupId)

  const detail = useMemo(() => (group ? createDetailData(group) : null), [group])

  if (!group || !detail) {
    return <Navigate to="/workgroups" replace />
  }

  const canManageThisGroup = canManageWorkgroupContent(currentUser, group.name)
  const canViewInternalTabs = isAdminUser(currentUser) || (isWorkgroupManager(currentUser) && canManageThisGroup)
  const visibleTabs = detail.tabs.filter((tab) => {
    if (tab.id === 'logs') {
      return canViewInternalTabs
    }

    if (tab.id === 'members') {
      return canViewInternalTabs
    }

    return true
  })

  return (
    <AppLayout
      contextLabel={`工作台 / 工作组空间 / ${group.name}`}
      footerCaption="智慧视听协作网络"
      footerTitle="共建操作系统专题能力"
      searchPlaceholder="搜索文件、会议、任务、工作组..."
      versionLabel="V 1.0.0"
    >
      <div className={styles.page}>
        <div className={styles.backRow}>
          <Link to="/workgroups">返回工作组空间</Link>
        </div>

        <WorkgroupDetailHero
          canManageContent={canManageThisGroup}
          detail={detail}
          group={group}
          onAction={(label) => message.info(`${label}流程可继续扩展`)}
        />

        <section className={styles.statsGrid}>
          {detail.stats.map((item) => (
            <KnowledgeStatCard key={item.title} item={item} />
          ))}
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <div className={styles.tabsWrap}>
              <Tabs
                items={visibleTabs.map((tab) => ({
                  key: tab.id,
                  label: tab.title,
                  children: (
                    <div className={styles.tabPanel}>
                      <div className={styles.sectionCard}>
                        <h3>{tab.title}</h3>
                        <ul>
                          {tab.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {tab.id === 'overview' ? (
                        <div className={styles.sectionCard}>
                          <h3>工作组职责</h3>
                          <ul>
                            {detail.dutyItems.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ),
                }))}
              />
            </div>
          </div>

          <aside className={styles.rightColumn}>
            <section className={styles.sideCard}>
              <h3>工作组联系人</h3>
              <div className={styles.contactList}>
                {detail.contacts.map((item) => (
                  <div key={`${item.name}-${item.role}`} className={styles.contactItem}>
                    <strong>{item.name}</strong>
                    <span>{item.org} · {item.role}</span>
                    <small>{item.phone}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.sideCard}>
              <h3>近期动态</h3>
              <div className={styles.dynamicList}>
                {detail.sideUpdates.map((item) => (
                  <div key={item.id} className={styles.dynamicItem}>
                    <span className={styles.dot} style={{ background: item.accent }} />
                    <div>
                      <strong>{item.group}</strong>
                      <p>{item.summary}</p>
                      <small>{item.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.sideCard}>
              <h3>待办提醒</h3>
              <ul className={styles.sideList}>
                {detail.sideTodos.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className={styles.sideCard}>
              <h3>关联标准项目</h3>
              <ul className={styles.sideList}>
                {detail.projectLinks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <PermissionGuideCard
              items={knowledgePermissionGuides}
              onMore={() => message.info(detail.permissionNote)}
            />
          </aside>
        </section>
      </div>
    </AppLayout>
  )
}

export default WorkgroupDetailPage
