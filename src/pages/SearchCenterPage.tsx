import { ApartmentOutlined, CalendarOutlined, FileSearchOutlined, FileTextOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { App, Button, Empty, Input, Select, Tag } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import AppLayout from '../layouts/AppLayout'
import { knowledgeFiles } from '../mock/knowledgeCenter'
import { demoMeetings, type DemoMeetingRecord } from '../mock/meetings'
import { memberUnits } from '../mock/memberCenter'
import { workgroups } from '../mock/workgroups'
import {
  fetchCollaborationRecords,
  searchPortalRecords,
  type PortalSearchResponse,
  type PortalSearchResult,
  type PortalSearchScope,
} from '../services/collaborationApi'
import type { KnowledgeFile, MemberUnit, WorkgroupCardItem } from '../types/portal'
import styles from './SearchCenterPage.module.css'

type SearchScope = '全部' | PortalSearchScope

const searchScopeOptions: SearchScope[] = ['全部', '工作组', '文件', '会议', '成员']

function buildLocalSearchResults(
  searchWorkgroups: WorkgroupCardItem[],
  files: KnowledgeFile[],
  meetings: DemoMeetingRecord[],
  members: MemberUnit[],
) {
  return [
    ...searchWorkgroups.map<PortalSearchResult>((group) => ({
      id: `workgroup-${group.id}`,
      scope: '工作组',
      title: group.name,
      summary: group.positioning || group.latestUpdate,
      meta: [
        group.leaderUnit,
        group.deputyUnits.join('、'),
        group.status,
        group.latestUpdate,
        ...group.tags,
      ].filter(Boolean),
    })),
    ...files.map<PortalSearchResult>((file) => ({
      id: `file-${file.id}`,
      scope: '文件',
      title: file.title,
      summary: `${file.categoryLabel} / ${file.status} / ${file.permission}`,
      meta: [file.workgroup, file.uploader, file.version, file.updatedAt, file.description ?? ''].filter(Boolean),
    })),
    ...meetings.map<PortalSearchResult>((meeting) => ({
      id: `meeting-${meeting.id}`,
      scope: '会议',
      title: meeting.title,
      summary: meeting.summary,
      meta: [meeting.workgroup, meeting.ownerUnit, meeting.time, meeting.minutesStatus].filter(Boolean),
    })),
    ...members.map<PortalSearchResult>((member) => ({
      id: `member-${member.id}`,
      scope: '成员',
      title: member.name,
      summary: member.description,
      meta: [member.committee, member.workgroups.join('、'), member.primaryContact, member.status].filter(Boolean),
    })),
  ]
}

function filterLocalSearchResults(allResults: PortalSearchResult[], scope: SearchScope, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const keywordTerms = normalizedKeyword ? normalizedKeyword.split(/\s+/).filter(Boolean) : []

  return allResults.filter((item) => {
    const matchesScope = scope === '全部' ? true : item.scope === scope
    if (!matchesScope) {
      return false
    }

    if (!keywordTerms.length) {
      return true
    }

    const haystack = [item.title, item.summary, item.meta.join(' ')].join(' ').toLowerCase()
    return keywordTerms.every((term) => haystack.includes(term))
  })
}

function buildLocalTotals(allResults: PortalSearchResult[]): PortalSearchResponse['totals'] {
  return {
    all: allResults.length,
    workgroups: allResults.filter((item) => item.scope === '工作组').length,
    files: allResults.filter((item) => item.scope === '文件').length,
    meetings: allResults.filter((item) => item.scope === '会议').length,
    members: allResults.filter((item) => item.scope === '成员').length,
  }
}

function SearchCenterPage() {
  const { message } = App.useApp()
  const [files, setFiles] = useState<KnowledgeFile[]>(knowledgeFiles)
  const [meetings, setMeetings] = useState<DemoMeetingRecord[]>(demoMeetings)
  const [members, setMembers] = useState<MemberUnit[]>(memberUnits)
  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [scope, setScope] = useState<SearchScope>('全部')
  const [bootstrapReady, setBootstrapReady] = useState(false)
  const searchWarningShownRef = useRef(false)

  const localSearchIndex = useMemo(
    () => buildLocalSearchResults(workgroups, files, meetings, members),
    [files, meetings, members],
  )

  const localTotals = useMemo(() => buildLocalTotals(localSearchIndex), [localSearchIndex])
  const [searchResults, setSearchResults] = useState<PortalSearchResult[]>(() => localSearchIndex)
  const [totals, setTotals] = useState<PortalSearchResponse['totals']>(() => localTotals)

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
      .finally(() => {
        if (active) {
          setBootstrapReady(true)
        }
      })

    return () => {
      active = false
    }
  }, [message])

  const fallbackResults = useMemo(
    () => filterLocalSearchResults(localSearchIndex, scope, submittedKeyword),
    [localSearchIndex, scope, submittedKeyword],
  )

  useEffect(() => {
    if (!bootstrapReady) {
      setSearchResults(fallbackResults)
      setTotals(localTotals)
      return
    }

    let active = true

    searchPortalRecords({
      keyword: submittedKeyword,
      scope,
      limit: 120,
    })
      .then((response) => {
        if (!active) {
          return
        }

        setSearchResults(response.results)
        setTotals(response.totals)
        searchWarningShownRef.current = false
      })
      .catch(() => {
        if (!active) {
          return
        }

        setSearchResults(fallbackResults)
        setTotals(localTotals)

        if (!searchWarningShownRef.current) {
          message.warning('搜索后端暂不可用，当前回退到本地筛选结果')
          searchWarningShownRef.current = true
        }
      })

    return () => {
      active = false
    }
  }, [bootstrapReady, fallbackResults, localTotals, message, scope, submittedKeyword])

  const statItems = useMemo(() => ([
    {
      title: '工作组索引',
      value: String(totals.workgroups),
      unit: '个',
      delta: '',
      icon: <TeamOutlined />,
      accent: 'linear-gradient(135deg, #5c6cff 0%, #8b97ff 100%)',
    },
    {
      title: '文件索引',
      value: String(totals.files),
      unit: '份',
      delta: '',
      icon: <FileTextOutlined />,
      accent: 'linear-gradient(135deg, #2d75ff 0%, #5aa1ff 100%)',
    },
    {
      title: '会议索引',
      value: String(totals.meetings),
      unit: '场',
      delta: '',
      icon: <CalendarOutlined />,
      accent: 'linear-gradient(135deg, #18c2c8 0%, #3cd6a4 100%)',
    },
    {
      title: '成员索引',
      value: String(totals.members),
      unit: '家',
      delta: '',
      icon: <ApartmentOutlined />,
      accent: 'linear-gradient(135deg, #ff982e 0%, #ffc04d 100%)',
    },
  ]), [totals])

  return (
    <AppLayout footerCaption="统一检索" footerTitle="工作组、文件、会议、成员一站式查找">
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>统一搜索入口</span>
            <h1>搜索中心</h1>
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
                {searchScopeOptions.map((item) => (
                  <Select.Option key={item} value={item}>{item}</Select.Option>
                ))}
              </Select>
              <Button size="large" type="primary" icon={<FileSearchOutlined />} onClick={() => setSubmittedKeyword(keyword)}>
                搜索
              </Button>
            </div>
          </div>
        </section>

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

        <section className={styles.panel}>
          <h2>搜索结果（{searchResults.length}）</h2>
          <div className={styles.resultList}>
            {searchResults.length ? searchResults.slice(0, 80).map((item) => (
              <article key={item.id} className={styles.resultItem}>
                <div className={styles.resultHeader}>
                  <h3>{item.title}</h3>
                  <Tag color={
                    item.scope === '工作组'
                      ? 'geekblue'
                      : item.scope === '文件'
                        ? 'blue'
                        : item.scope === '会议'
                          ? 'green'
                          : 'purple'
                  }
                  >
                    {item.scope}
                  </Tag>
                </div>
                <p>{item.summary}</p>
                <div className={styles.metaRow}>
                  {item.meta.filter(Boolean).map((meta, index) => <span key={`${item.id}-meta-${index}`}>{meta}</span>)}
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
