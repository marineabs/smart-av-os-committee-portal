import {
  ApartmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { App, Button } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import AppLayout from '../layouts/AppLayout'
import { knowledgeFiles } from '../mock/knowledgeCenter'
import { demoMeetings, type DemoMeetingRecord } from '../mock/meetings'
import { memberUnits } from '../mock/memberCenter'
import { fetchCollaborationRecords } from '../services/collaborationApi'
import type { KnowledgeFile, MemberUnit } from '../types/portal'
import styles from './AnalyticsCenterPage.module.css'

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function topCounts(values: string[]) {
  const counts = new Map<string, number>()
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }))
}

function AnalyticsCenterPage() {
  const { message } = App.useApp()
  const [files, setFiles] = useState<KnowledgeFile[]>(knowledgeFiles)
  const [meetings, setMeetings] = useState<DemoMeetingRecord[]>(demoMeetings)
  const [members, setMembers] = useState<MemberUnit[]>(memberUnits)

  const refreshData = () => {
    Promise.all([
      fetchCollaborationRecords<KnowledgeFile>('knowledge-files', knowledgeFiles),
      fetchCollaborationRecords<DemoMeetingRecord>('meetings', demoMeetings),
      fetchCollaborationRecords<MemberUnit>('members', memberUnits),
    ])
      .then(([nextFiles, nextMeetings, nextMembers]) => {
        setFiles(nextFiles)
        setMeetings(nextMeetings)
        setMembers(nextMembers)
        message.success('统计数据已刷新')
      })
      .catch(() => message.warning('统计分析 API 未连接，当前使用本地示例数据'))
  }

  useEffect(() => {
    refreshData()
  }, [])

  const metrics = useMemo(() => {
    const downloadReadyFiles = files.filter((file) => file.fileData).length
    const pendingMinutes = meetings.filter((meeting) => meeting.minutesStatus === '待整理').length
    const archivedMinutes = meetings.filter((meeting) => meeting.minutesStatus === '已归档').length
    const activeMembers = members.filter((member) => member.status === '正常').length
    return [
      { label: '文件数量', value: files.length, unit: '份' },
      { label: '可下载原文', value: downloadReadyFiles, unit: '份' },
      { label: '会议数量', value: meetings.length, unit: '场' },
      { label: '待纪要整理', value: pendingMinutes, unit: '份' },
      { label: '已归档纪要', value: archivedMinutes, unit: '份' },
      { label: '成员单位数量', value: members.length, unit: '家' },
      { label: '正常成员单位', value: activeMembers, unit: '家' },
      { label: '工作组活跃度样本', value: new Set(files.map((file) => file.workgroup)).size, unit: '组' },
    ]
  }, [files, meetings, members])

  const metricCards = useMemo(() => {
    const icons = [
      <FileTextOutlined key="files" />,
      <DownloadOutlined key="download-ready" />,
      <CalendarOutlined key="meetings" />,
      <ClockCircleOutlined key="pending-minutes" />,
      <FileDoneOutlined key="archived-minutes" />,
      <TeamOutlined key="members" />,
      <CheckCircleOutlined key="active-members" />,
      <ApartmentOutlined key="workgroups" />,
    ]
    const accents = [
      'linear-gradient(135deg, #2d75ff 0%, #5aa1ff 100%)',
      'linear-gradient(135deg, #18c2c8 0%, #3cd6a4 100%)',
      'linear-gradient(135deg, #ff982e 0%, #ffc04d 100%)',
      'linear-gradient(135deg, #6f58ff 0%, #9a82ff 100%)',
    ]

    return metrics.map((item, index) => ({
      title: item.label,
      value: String(item.value),
      unit: item.unit,
      delta: '',
      icon: icons[index],
      accent: accents[index % accents.length],
    }))
  }, [metrics])

  const fileCategories = useMemo(() => topCounts(files.map((file) => file.categoryLabel)), [files])
  const workgroupActivity = useMemo(() => topCounts([
    ...files.map((file) => file.workgroup),
    ...meetings.map((meeting) => meeting.workgroup),
    ...members.flatMap((member) => member.workgroups),
  ]), [files, meetings, members])

  const exportReport = () => {
    downloadJsonFile(`smart-av-analytics-${new Date().toISOString().slice(0, 10)}.json`, {
      exportedAt: new Date().toISOString(),
      metrics,
      fileCategories,
      workgroupActivity,
    })
    message.success('统计报表已导出')
  }

  return (
    <AppLayout contextLabel="工作台 / 统计分析中心" footerCaption="运行统计" footerTitle="协同数据与报表导出">
      <div className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>统计分析中心</span>
            <h1>统计分析中心</h1>
            <p>基于当前后台协同数据生成统计指标，支持导出报表用于阶段验收、秘书处周报和运行巡检。</p>
          </div>
          <div className={styles.heroActions}>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>刷新数据</Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportReport}>导出统计报表</Button>
          </div>
        </section>

        <section className={styles.statsGrid}>
          {metricCards.map((item) => (
            <KnowledgeStatCard
              key={item.title}
              className={styles.compactStatCard}
              iconClassName={styles.compactStatIcon}
              item={item}
              showDelta={false}
            />
          ))}
        </section>

        <section className={styles.gridTwo}>
          <div className={styles.panel}>
            <h2>文件分类分布</h2>
            <div className={styles.list}>
              {fileCategories.map((item) => (
                <div key={item.label} className={styles.listItem}>
                  <strong>{item.label}</strong>
                  <span>{item.count} 份</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <h2>工作组活跃度</h2>
            <div className={styles.list}>
              {workgroupActivity.map((item) => (
                <div key={item.label} className={styles.listItem}>
                  <strong>{item.label}</strong>
                  <span>{item.count} 条活动</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default AnalyticsCenterPage
