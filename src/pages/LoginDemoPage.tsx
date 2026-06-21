import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Input, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './LoginDemoPage.module.css'

function LoginDemoPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} />
      <Card className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>演示登录入口</span>
          <h1>智慧视听操作系统专委会协同工作平台</h1>
          <p>当前为在线测试部署版本。账号、角色和密码仅用于前端 UI 演示，不连接真实认证系统。</p>
        </div>

        <Space direction="vertical" size={14} className={styles.form}>
          <Input size="large" prefix={<UserOutlined />} placeholder="演示账号：demo-admin" value="demo-admin" readOnly />
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="演示密码：demo-portal-2026"
            value="demo-portal-2026"
            readOnly
          />
          <Button type="primary" size="large" block onClick={() => navigate('/')}>
            进入演示平台
          </Button>
          <Button size="large" block onClick={() => navigate('/system')}>
            查看部署说明
          </Button>
        </Space>

        <div className={styles.footer}>
          <strong>演示说明</strong>
          <ul>
            <li>所有页面数据均来自本地 mock 文件。</li>
            <li>不写入真实会员资料、真实文件内容或真实会议数据。</li>
            <li>适合直接导入 Vercel 做 UI 展示和流程测试。</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default LoginDemoPage
