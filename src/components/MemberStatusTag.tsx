import type { MemberUnitStatus } from '../types/portal'
import styles from './MemberStatusTag.module.css'

interface MemberStatusTagProps {
  status: MemberUnitStatus
}

function MemberStatusTag({ status }: MemberStatusTagProps) {
  const label = status === '信息变更中' ? '信息处理中' : status
  const className =
    status === '正常'
      ? styles.normal
      : status === '待审核'
        ? styles.pending
        : status === '暂停'
          ? styles.paused
          : status === '退出'
            ? styles.exited
            : styles.changing

  return <span className={`${styles.tag} ${className}`}>{label}</span>
}

export default MemberStatusTag
