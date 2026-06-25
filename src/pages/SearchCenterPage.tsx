import { FileSearchOutlined, SearchOutlined } from '@ant-design/icons'
import { App, Button, Empty, Input, Select, Tag } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { knowledgeFiles } from '../mock/knowledgeCenter'
import { demoMeetings, type DemoMeetingRecord } from '../mock/meetings'
import { memberUnits } from '../mock/memberCenter'
import { fetchCollaborationRecords } from '../services/collaborationApi'
import type { KnowledgeFile, MemberUnit } from '../types/portal'
import styles from './SearchCenterPage.module.css'

type SearchScope = '全部' | '文件' | '会议' | '成员'

interface SearchResult {
  id: string
  scope: Exclude<SearchScope, '全部'>
  title: string
  summary: string
  meta: string[]
}

function SearchCenterPage() {
  const { message } = App.useApp()
  const [files, setFiles] = useState<KnowledgeFile[]>(knowledgeFiles)
  const [meetings, setMeetings] = useState<DemoMeetingRecord[]>(demoMeetings)
  const [members, setMembers] = useState<MemberUnit[]>(memberUnits)
  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [scope, setScope] = useState<SearchScope>('全部')

  useEffect(() => {
    let active = true

    Promise.all([
      fetchCollaborationRecords<KnowledgeFile>('knowledge-files', knowledgeFiles),
      fetchCollaborationRecords<DemoMeetingRecord>('meetings', demoMeetings),
      fetchCollaborationRecords<MemberUnit>('members', memberUnits),
    ])
      .then(([nextFiles, nextMeetings, nextMembers]) => {
        if (!active) {
          return
        }
        setFiles(nextFiles)
        setMeetings(nextMeetings)
        setMembers(nextMembers)
      })
      .catch(() => {
        if (active) {
          message.warning('搜索中心 API 未连接，当前使用本地示例数据')
        }
      })

    return () => {
      active = false
    }
  }, [message])

  const allResults = useMemo<SearchResult[]>(() => [
    ...files.map((file) => ({
      id: `file-${file.id}`,
      scope: '文件' as const,
      title: file.title,
      summary: `${file.categoryLabel} / ${file.status} / ${file.permission}`,
      meta: [file.workgroup, file.uploader, file.version, file.updatedAt],
    })),
    ...meetings.map((meeting) => ({
      id: `meeting-${meeting.id}`,
      scope: '会议' as const,
      title: meeting.title,
      summary: meeting.summary,
      meta: [meeting.workgroup, meeting.ownerUnit, meeting.time, meeting.minutesStatus],
    })),
    ...members.map((member) => ({
      id: `member-${member.id}`,
      scope: '成员' as const,
      title: member.name,
      summary: member.description,
      meta: [member.committee, member.workgroups.join('、'), member.primaryContact, member.status],
    })),
  ], [files, meetings, members])

  const filteredResults = useMemo(() => {
    const normalizedKeyword = submittedKeyword.trim().toLowerCase()
    return allResults.filter((item) => {
      const matchesScope = scope === '全部' ? true : item.scope === scope
      const matchesKeyword = normalizedKeyword
        ? [item.title, item.summary, item.meta.join(' ')].join(' ').toLowerCase().includes(normalizedKeyword)
        : true
      return matchesScope && matchesKeyword
    })
  }, [allResults, scope, submittedKeyword])

  const scopeCounts = useMemo(() => ({
    文件: allResults.filter((item) => item.scope === '文件').length,
    会议: allResults.filter((item) => item.scope === '会议').length,
    成员: allResults.filter((item) => item.scope === '成员').length,
  }), [allResults])

  return (
    <AppLayout contextLabel="工作台 / 搜索中心" footerCaption="统一检索" footerTitle="文件、会议、成员一站式查找">
      <div className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>统一搜索入口</span>
          <h1>跨资料、会议和成员单位检索</h1>
          <p>输入关键词后，可按文件、会议、成员范围收敛结果，用于快速定位历史资料、会议档案、工作组和成员单位信息。</p>
          <div className={styles.searchRow}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索文件名、全文摘要、标签、工作组、单位、时间"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onPressEnter={() => setSubmittedKeyword(keyword)}
            />
            <Select size="large" value={scope} onChange={setScope}>
              {(['全部', '文件', '会议', '成员'] as SearchScope[]).map((item) => (
                <Select.Option key={item} value={item}>{item}</Select.Option>
              ))}
            </Select>
            <Button size="large" type="primary" icon={<FileSearchOutlined />} onClick={() => setSubmittedKeyword(keyword)}>
              搜索
            </Button>
          </div>
        </section>

        <section className={styles.statGrid}>
          {Object.entries(scopeCounts).map(([label, count]) => (
            <article key={label} className={styles.statCard}>
              <span>{label}索引</span>
              <strong>{count}</strong>
            </article>
          ))}
        </section>

        <section className={styles.panel}>
          <h2>搜索结果（{filteredResults.length}）</h2>
          <div className={styles.resultList}>
            {filteredResults.length ? filteredResults.slice(0, 80).map((item) => (
              <article key={item.id} className={styles.resultItem}>
                <div className={styles.resultHeader}>
                  <h3>{item.title}</h3>
                  <Tag color={item.scope === '文件' ? 'blue' : item.scope === '会议' ? 'green' : 'purple'}>{item.scope}</Tag>
                </div>
                <p>{item.summary}</p>
                <div className={styles.metaRow}>
                  {item.meta.filter(Boolean).map((meta) => <span key={meta}>{meta}</span>)}
                </div>
              </article>
            )) : <Empty description="暂无匹配结果" />}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default SearchCenterPage
