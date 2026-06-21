import type { KnowledgeFileStatus } from '../types/portal'
import styles from './FileStatusTag.module.css'

interface FileStatusTagProps {
  status: KnowledgeFileStatus
}

const classMap: Record<KnowledgeFileStatus, string> = {
  草稿版: styles.draft,
  征求意见版: styles.review,
  会议讨论版: styles.meeting,
  定稿版: styles.final,
  发布版: styles.publish,
  归档版: styles.archive,
}

function FileStatusTag({ status }: FileStatusTagProps) {
  return <span className={`${styles.tag} ${classMap[status]}`}>{status}</span>
}

export default FileStatusTag
