import type { MemberParticipationRank } from '../../types/statistics'
import styles from './StatisticsCenter.module.css'

interface MemberParticipationRankCardProps {
  data: MemberParticipationRank[]
}

function MemberParticipationRankCard({ data }: MemberParticipationRankCardProps) {
  return (
    <article className={styles.detailCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2>成员单位参与度排行</h2>
          <p>综合参会出勤、会议贡献、资料、意见反馈和任务承担情况。</p>
        </div>
      </div>
      <div className={styles.memberRankList}>
        {data.map((item) => (
          <div key={item.unit} className={styles.memberRankItem}>
            <span className={styles.rankNo}>{item.rank}</span>
            <div className={styles.rankMain}>
              <div className={styles.rankTitleRow}>
                <strong>{item.unit}</strong>
                <em>{item.score} 分</em>
              </div>
              <div className={styles.rankStats}>
                <span>参会 {item.meetings}</span>
                <span>会议贡献 {item.meetingContribution ?? item.score}</span>
                <span>出勤率 {item.attendanceRate ?? 0}%</span>
                <span>资料 {item.files}</span>
                <span>反馈 {item.feedback}</span>
                <span>任务 {item.tasks}</span>
              </div>
              <div className={styles.scoreTrack}>
                <i style={{ width: `${item.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default MemberParticipationRankCard
