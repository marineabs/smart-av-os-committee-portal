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
    points: ['Framework Preset 选择 Vite', 'Build Command 使用 npm run build', 'Output Directory 指向 dist'],
  },
  {
    title: '本地 mock 策略',
    icon: <DatabaseOutlined />,
    points: ['工作组、会员、会议、任务、文件、公告均走本地数据', '不接入真实后端，不依赖远程 API', '演示内容避免真实单位资料和真实文件正文'],
  },
  {
    title: '系统配置',
    icon: <SettingOutlined />,
    points: ['支持首页、工作组、文件中心、会员中心、会议、任务、系统页', '路由刷新通过 rewrites 和 404 fallback 处理', '资源走本地静态打包，不依赖 CDN'],
  },
  {
    title: '风险控制',
    icon: <SafetyCertificateOutlined />,
    points: ['Vercel 无需额外环境变量', 'GitHub Pages 仅在子路径部署时需要设置 base', '当前为 UI 演示版本，不包含真实数据写入'],
  },
]

function SystemCenterPage() {
  return (
    <AppLayout
      contextLabel="工作台 / 系统管理中心"
      footerCaption="部署演示管理"
      footerTitle="配置、资源、路由统一整理"
      searchPlaceholder="搜索系统模块、配置项、部署说明"
      versionLabel="Demo Build"
    >
      <div className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>系统管理中心</span>
            <h1>面向在线测试部署的演示版本整理</h1>
            <p>本页聚焦部署配置、演示数据、权限范围和发布注意事项，适合作为内部验收与联调说明入口。</p>
          </div>
          <div className={styles.tagRow}>
            <Tag color="blue">Vercel Ready</Tag>
            <Tag color="green">Mock Data Only</Tag>
            <Tag color="gold">No Backend</Tag>
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
