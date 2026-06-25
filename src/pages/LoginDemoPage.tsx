import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Input, Space } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoUsers, login } from '../services/auth'
import { canViewAdminCenter, isWorkgroupManager } from '../utils/permissions'
import styles from './LoginDemoPage.module.css'

function LoginDemoPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [account, setAccount] = useState('zhangwei')
  const [password, setPassword] = useState('demo-portal-2026')
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    if (!account.trim() || !password.trim()) {
      message.warning('请输入账号和密码')
      return
    }

    setSubmitting(true)
    try {
      const session = await login({ account, password })
      if (session.fallback) {
        message.warning('后台认证服务未连接，已进入本地开发会话')
      } else {
        message.success('登录成功')
      }
      navigate(canViewAdminCenter(session.user) ? '/admin' : isWorkgroupManager(session.user) ? '/workgroups' : '/portal')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} />
      <Card className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>后台登录入口</span>
          <h1>智慧视听操作系统专委会协同工作平台</h1>
          <p>当前已接入后台认证接口。本地开发可直接使用轻量 SQLite 后台，生产部署可切换到 Express + Prisma + MySQL。</p>
        </div>

        <Space direction="vertical" size={14} className={styles.form}>
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="账号"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            onPressEnter={() => void handleLogin()}
          />
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onPressEnter={() => void handleLogin()}
          />
          <Button type="primary" size="large" block loading={submitting} onClick={() => void handleLogin()}>
            登录管理平台
          </Button>
          <Button size="large" block onClick={() => navigate('/system')}>
            查看部署说明
          </Button>
          <div className={styles.demoAccounts}>
            {Object.entries(demoUsers).map(([demoAccount, user]) => (
              <Button
                key={demoAccount}
                onClick={() => {
                  setAccount(demoAccount)
                  setPassword('demo-portal-2026')
                }}
              >
                {user.role}
              </Button>
            ))}
          </div>
        </Space>

        <div className={styles.footer}>
          <strong>演示说明</strong>
          <ul>
            <li>默认种子账号：zhangwei / demo-portal-2026。</li>
            <li>管理中心优先连接后台 API，未连接时仅在开发环境兜底本地会话。</li>
            <li>业务页面使用本地示例数据，不写入真实会员资料、文件正文或会议数据。</li>
            <li>适合做流程验收、后台联调和生产加固前测试。</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default LoginDemoPage
