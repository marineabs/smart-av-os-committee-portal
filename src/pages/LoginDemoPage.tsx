import {
  ArrowRightOutlined,
  FileTextOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { App, Button, Checkbox, Input } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import sideVisual from '../assets/login-side-visual-new.png'
import { demoUsers, login } from '../services/auth'
import { canViewAdminCenter, isWorkgroupManager } from '../utils/permissions'
import styles from './LoginDemoPage.module.css'

const LOGIN_CANVAS_WIDTH = 1920
const LOGIN_CANVAS_HEIGHT = 1080

function getViewportScale() {
  if (typeof window === 'undefined') {
    return 1
  }

  return Math.min(window.innerWidth / LOGIN_CANVAS_WIDTH, window.innerHeight / LOGIN_CANVAS_HEIGHT)
}

const accountLabelMap: Record<string, string> = {
  sunhao: '工作组组长',
}

function LoginDemoPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [account, setAccount] = useState('zhangwei')
  const [password, setPassword] = useState('demo-portal-2026')
  const [rememberAccount, setRememberAccount] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [viewportScale, setViewportScale] = useState(getViewportScale)

  useEffect(() => {
    const handleResize = () => {
      setViewportScale(getViewportScale())
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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

  const handleForgotPassword = () => {
    message.info('请联系专委会平台运维组重置密码')
  }

  return (
    <div className={styles.page}>
      <div
        className={styles.shellViewport}
        style={{
          width: LOGIN_CANVAS_WIDTH * viewportScale,
          height: LOGIN_CANVAS_HEIGHT * viewportScale,
        }}
      >
        <main className={styles.shell} style={{ transform: `scale(${viewportScale})` }}>
          <section className={styles.visualPane} aria-label="智慧视听操作系统建设愿景">
            <div className={styles.visualCard}>
              <img className={styles.sideVisual} src={sideVisual} alt="" />
            </div>
            <footer className={styles.pageFooter}>
              <SafetyCertificateOutlined />
              <span>智慧视听操作系统专委会</span>
              <span>© 2026 版权所有</span>
            </footer>
          </section>

          <section className={styles.loginPane}>
            <aside className={styles.loginCard} aria-label="登录协同平台">
              <div className={styles.loginHeader}>
                <h2>协同创新平台</h2>
                <p>请输入您的账号信息</p>
              </div>

              <div className={styles.form}>
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="请输入账号"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  onPressEnter={() => void handleLogin()}
                />
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onPressEnter={() => void handleLogin()}
                />

                <div className={styles.formMeta}>
                  <Checkbox checked={rememberAccount} onChange={(event) => setRememberAccount(event.target.checked)}>
                    记住我
                  </Checkbox>
                  <button type="button" onClick={handleForgotPassword}>
                    忘记密码？
                  </button>
                </div>

                <Button
                  className={styles.loginButton}
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={() => void handleLogin()}
                >
                  进入协同平台
                  <span className={styles.buttonArrow}>
                    <ArrowRightOutlined />
                  </span>
                </Button>

                <Button className={styles.guideButton} size="large" block onClick={() => navigate('/system')}>
                  <FileTextOutlined />
                  查看平台说明
                </Button>
              </div>

              <div className={styles.demoArea}>
                <div className={styles.demoTitle}>
                  <span />
                  <strong>演示账号</strong>
                  <span />
                </div>
                <div className={styles.demoAccounts}>
                  {Object.entries(demoUsers).map(([demoAccount, user]) => (
                    <Button
                      key={demoAccount}
                      onClick={() => {
                        setAccount(demoAccount)
                        setPassword('demo-portal-2026')
                      }}
                    >
                      {accountLabelMap[demoAccount] ?? user.role}
                    </Button>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

export default LoginDemoPage
