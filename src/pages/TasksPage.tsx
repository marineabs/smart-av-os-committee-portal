import {
  CheckCircleOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
import { App, Button, Progress, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import KnowledgeStatCard from '../components/KnowledgeStatCard'
import AppLayout from '../layouts/AppLayout'
import { demoTasks, taskKanbanSummary, taskStats, type DemoTaskRecord } from '../mock/tasks'
import styles from './TasksPage.module.css'

const iconMap = {
  task: <DashboardOutlined />,
  progress: <FieldTimeOutlined />,
  review: <FileSearchOutlined />,
  done: <CheckCircleOutlined />,
}

const priorityColorMap: Record<DemoTaskRecord['priority'], string> = {
  高: 'red',
  中: 'gold',
  低: 'blue',
}

const statusColorMap: Record<DemoTaskRecord['status'], string> = {
  进行中: 'processing',
  待反馈: 'gold',
  待评审: 'orange',
  已完成: 'success',
}

const columns: ColumnsType<DemoTaskRecord> = [
  { title: '任务名称', dataIndex: 'title', key: 'title', width: 220 },
  { title: '所属工作组', dataIndex: 'workgroup', key: 'workgroup', width: 150 },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 120 },
  { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 130 },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 160,
    render: (value: number) => <Progress percent={value} size="small" />,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100,
    render: (value: DemoTaskRecord['priority']) => <Tag color={priorityColorMap[value]}>{value}</Tag>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 110,
    render: (value: DemoTaskRecord['status']) => <Tag color={statusColorMap[value]}>{value}</Tag>,
  },
]

function TasksPage() {
  const { message } = App.useApp()

  return (
    <AppLayout
      contextLabel="工作台 / 任务管理"
      footerCaption="任务闭环演示"
      footerTitle="节点、反馈、评审可视化"
      searchPlaceholder="搜索任务名称、工作组、负责人"
      versionLabel="Demo Build"
    >
      <div className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>任务管理</span>
            <h1>专题事项、节点计划与执行反馈</h1>
            <p>当前页面用于演示工作组任务流转、状态管理和进度追踪，不接入真实流程引擎。</p>
          </div>
          <div className={styles.heroActions}>
            <Button type="primary" size="large" onClick={() => message.success('已模拟新建任务')}>
              新建任务
            </Button>
            <Button size="large" onClick={() => message.info('可继续扩展提醒、催办和导出能力')}>
              查看催办策略
            </Button>
          </div>
        </section>

        <section className={styles.statsGrid}>
          {taskStats.map((item) => (
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

        <section className={styles.kanbanRow}>
          {taskKanbanSummary.map((item) => (
            <article key={item.status} className={styles.kanbanCard}>
              <strong>{item.count}</strong>
              <span>{item.status}</span>
            </article>
          ))}
        </section>

        <section className={styles.tableCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>任务列表</h2>
              <p>通过本地 mock 数据覆盖标准编制、联调验证、场景汇报和资料归档流程。</p>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={demoTasks}
            pagination={false}
            rowKey="id"
            scroll={{ x: 990 }}
          />
        </section>
      </div>
    </AppLayout>
  )
}

export default TasksPage
