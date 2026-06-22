import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { App, Button, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import AppLayout from '../layouts/AppLayout'
import { meetingFocusList, demoMeetings, meetingStats, type DemoMeetingRecord } from '../mock/meetings'
import styles from './MeetingsPage.module.css'

const iconMap = {
  calendar: <CalendarOutlined />,
  team: <TeamOutlined />,
  clock: <ClockCircleOutlined />,
  file: <FileDoneOutlined />,
}

const statusColorMap: Record<DemoMeetingRecord['status'], string> = {
  即将开始: 'blue',
  报名中: 'gold',
  已结束: 'green',
}

const columns: ColumnsType<DemoMeetingRecord> = [
  { title: '会议名称', dataIndex: 'title', key: 'title', width: 230 },
  { title: '工作组', dataIndex: 'workgroup', key: 'workgroup', width: 150 },
  { title: '牵头单位', dataIndex: 'ownerUnit', key: 'ownerUnit', width: 170 },
  { title: '时间', dataIndex: 'time', key: 'time', width: 170 },
  { title: '地点', dataIndex: 'location', key: 'location', width: 150 },
  {
    title: '参会单位',
    dataIndex: 'attendees',
    key: 'attendees',
    width: 110,
    render: (value: number) => `${value} 家`,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 110,
    render: (value: DemoMeetingRecord['status']) => <Tag color={statusColorMap[value]}>{value}</Tag>,
  },
]

function MeetingsPage() {
  const { message } = App.useApp()

  return (
    <AppLayout
      contextLabel="工作台 / 会议管理"
      footerCaption="会议协同演示"
      footerTitle="通知、议程、纪要一体化"
      searchPlaceholder="搜索会议名称、工作组、牵头单位"
      versionLabel="Demo Build"
    >
      <div className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>会议管理</span>
            <h1>专委会会议组织与纪要归档演示</h1>
            <p>聚焦例会通知、议程排期、联调复盘和纪要沉淀，全程使用本地 mock 数据。</p>
          </div>
          <div className={styles.heroActions}>
            <Button type="primary" size="large" onClick={() => message.success('已模拟创建会议流程')}>
              新建会议
            </Button>
            <Button size="large" onClick={() => message.info('可继续扩展签到、提醒和纪要导出流程')}>
              查看纪要流程
            </Button>
          </div>
        </section>

        <section className={styles.statsGrid}>
          {meetingStats.map((item) => (
            <KnowledgeStatCard
              className={styles.compactStatCard}
              iconClassName={styles.compactStatIcon}
              key={item.id}
              item={{
                title: item.title,
                value: item.value,
                unit: item.unit,
                delta: item.delta,
                icon: iconMap[item.icon],
                accent: item.accent,
              }}
              showDelta={false}
            />
          ))}
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.mainCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>会议列表</h2>
                <p>覆盖技术标准组、产业推进组、测试验证组等典型流程。</p>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={demoMeetings}
              pagination={false}
              rowKey="id"
              scroll={{ x: 1090 }}
              expandable={{
                expandedRowRender: (record) => <p className={styles.expanded}>{record.summary}</p>,
              }}
            />
          </div>

          <aside className={styles.sideCard}>
            <h2>演示重点</h2>
            <ul className={styles.sideList}>
              {meetingFocusList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </AppLayout>
  )
}

export default MeetingsPage
