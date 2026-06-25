import { RightOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import { placeholderHighlights } from '../mock/portal'
import styles from './PlaceholderPage.module.css'

interface PlaceholderPageProps {
  title: string
  description: string
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AppLayout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>模块占位页</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <Link to="/portal" className={styles.backLink}>
            返回首页 <RightOutlined />
          </Link>
        </section>

        <section className={styles.panel}>
          <h2>后续可扩展内容</h2>
          <div className={styles.highlights}>
            {placeholderHighlights.map((item) => (
              <div key={item.label} className={styles.highlightItem}>
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default PlaceholderPage
