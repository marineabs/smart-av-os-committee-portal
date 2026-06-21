import styles from './MemberCompletenessBar.module.css'

interface MemberCompletenessBarProps {
  value: number
}

function MemberCompletenessBar({ value }: MemberCompletenessBarProps) {
  const tone =
    value >= 90 ? styles.high : value >= 70 ? styles.medium : styles.low

  return (
    <div className={styles.wrap}>
      <strong>{value}%</strong>
      <div className={styles.track}>
        <span className={`${styles.fill} ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default MemberCompletenessBar
