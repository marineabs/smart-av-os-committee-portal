import {
  FileTextOutlined,
  NotificationOutlined,
  RightOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import type { ActivityItem, DocumentItem, NoticeItem } from '../types/portal'
import FileTypeIcon from './FileTypeIcon'
import styles from './InfoListCard.module.css'

type InfoVariant = 'notice' | 'document' | 'activity'

interface InfoListCardProps {
  title: string
  morePath: string
  variant: InfoVariant
  items: NoticeItem[] | DocumentItem[] | ActivityItem[]
}

function InfoListCard({ title, morePath, variant, items }: InfoListCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={`${styles.leadingIcon} ${variant === 'document' ? styles.document : variant === 'activity' ? styles.activity : styles.notice}`}>
            {variant === 'document' ? <FileTextOutlined /> : variant === 'activity' ? <TeamOutlined /> : <NotificationOutlined />}
          </span>
          <h2>{title}</h2>
        </div>
        <Link to={morePath} className={styles.moreLink}>
          更多 <RightOutlined />
        </Link>
      </header>

      <div className={styles.list}>
        {variant === 'notice' &&
          (items as NoticeItem[]).map((item) => (
            <Link key={`${item.title}-${item.date}`} to={morePath} className={styles.noticeItem}>
              <span className={styles.dot} />
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemDate}>{item.date}</span>
            </Link>
          ))}

        {variant === 'document' &&
          (items as DocumentItem[]).map((item) => (
            <Link key={`${item.title}-${item.date}`} to={morePath} className={styles.documentItem}>
              <FileTypeIcon type={item.type} />
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemDate}>{item.date}</span>
            </Link>
          ))}

        {variant === 'activity' &&
          (items as ActivityItem[]).map((item) => (
            <Link key={`${item.group}-${item.time}`} to={morePath} className={styles.activityItem}>
              <span className={styles.groupAvatar} style={{ background: `${item.accent}16`, color: item.accent }}>
                <TeamOutlined />
              </span>
              <div className={styles.activityBody}>
                <strong>{item.group}</strong>
                <span>{item.summary}</span>
              </div>
              <span className={styles.itemDate}>{item.time}</span>
            </Link>
          ))}
      </div>
    </section>
  )
}

export default InfoListCard
