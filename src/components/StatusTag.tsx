import type { PropsWithChildren } from 'react'
import styles from './StatusTag.module.css'

interface StatusTagProps extends PropsWithChildren {
  soft?: boolean
}

function StatusTag({ children, soft = false }: StatusTagProps) {
  return <span className={`${styles.tag} ${soft ? styles.soft : ''}`}>{children}</span>
}

export default StatusTag
