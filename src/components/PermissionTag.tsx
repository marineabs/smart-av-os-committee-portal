import type { KnowledgePermissionLevel } from '../types/portal'
import styles from './PermissionTag.module.css'

interface PermissionTagProps {
  level: KnowledgePermissionLevel
}

const classMap: Record<KnowledgePermissionLevel, string> = {
  公开资料: styles.public,
  分委会资料: styles.committee,
  工作组资料: styles.workgroup,
  指定单位资料: styles.assigned,
  秘书处资料: styles.secretariat,
}

function PermissionTag({ level }: PermissionTagProps) {
  return <span className={`${styles.tag} ${classMap[level]}`}>{level}</span>
}

export default PermissionTag
