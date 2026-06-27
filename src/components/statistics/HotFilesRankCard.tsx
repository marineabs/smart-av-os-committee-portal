import { DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import type { HotFileRank } from '../../types/statistics'
import styles from './StatisticsCenter.module.css'

interface HotFilesRankCardProps {
  data: HotFileRank[]
}

function HotFilesRankCard({ data }: HotFilesRankCardProps) {
  return (
    <article className={styles.detailCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>热门资料排行</h2>
          <p>按浏览和下载热度展示近期重点资料。</p>
        </div>
      </div>
      <div className={styles.hotFileList}>
        {data.map((item) => (
          <div key={item.title} className={styles.hotFileItem}>
            <span className={styles.fileRank}>{item.rank}</span>
            <div className={styles.fileInfo}>
              <strong>{item.title}</strong>
              <div className={styles.fileMeta}>
                <Tag color="blue">{item.type}</Tag>
                <span>{item.workgroup}</span>
                <span>
                  <EyeOutlined /> {item.views}
                </span>
                <span>
                  <DownloadOutlined /> {item.downloads}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default HotFilesRankCard
