import {
  CloudUploadOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Tag } from 'antd'
import AppLayout from '../layouts/AppLayout'
import styles from './SystemCenterPage.module.css'

const deploymentCards = [
  {
    title: 'Vercel 部署',
    icon: <CloudUploadOutlined />,
    points: ['前端 Framework Preset 选择 Vite', 'Build Command 使用 npm run build', 'Output Directory 指向 dist'],
  },
  {
    title: '后台与数据库',
    icon: <DatabaseOutlined />,
    points: ['本地开发内置 Express + SQLite 轻量后台', '生产部署使用 Express + Prisma 7 + MySQL', '管理中心新增、编辑、删除、状态推进均调用后台 API'],
  },
  {
    title: '系统配置',
    icon: <SettingOutlined />,
    points: ['后台登录使用 JWT 会话', '默认种子账号为 zhangwei / demo-portal-2026', '路由刷新通过 rewrites 和 404 fallback 处理'],
  },
  {
    title: '风险控制',
    icon: <SafetyCertificateOutlined />,
    points: ['生产环境需配置 VITE_API_BASE_URL 指向后台 API', 'DATABASE_URL 和 JWT_SECRET 只放在后台环境变量中', '上线前请更换默认密码和 JWT_SECRET'],
  },
]

function SystemCenterPage() {
  return (
    <AppLayout
      footerCaption="部署演示管理"
      footerTitle="配置、资源、路由统一整理"
      versionLabel="Demo Build"
    >
      <div className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>系统管理中心</span>
            <h1>面向在线部署的管理配置总览</h1>
            <p>本页聚焦前端部署、后台接口、MySQL 数据库和发布注意事项，适合作为内部验收与后续生产加固说明入口。</p>
          </div>
          <div className={styles.tagRow}>
            <Tag color="blue">Vercel Ready</Tag>
            <Tag color="green">Express API</Tag>
            <Tag color="gold">MySQL / SQLite Ready</Tag>
          </div>
        </section>

        <Row gutter={[18, 18]}>
          {deploymentCards.map((card) => (
            <Col key={card.title} xs={24} md={12}>
              <Card className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.iconWrap}>{card.icon}</span>
                  <h2>{card.title}</h2>
                </div>
                <ul className={styles.list}>
                  {card.points.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </AppLayout>
  )
}

export default SystemCenterPage
