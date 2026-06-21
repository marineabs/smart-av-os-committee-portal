import {
  FileExcelOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import type { FileKind } from '../types/portal'
import styles from './FileTypeIcon.module.css'

interface FileTypeIconProps {
  type: FileKind
}

const config: Record<
  FileKind,
  { label: string; icon: ReactNode; className: string }
> = {
  pdf: { label: 'PDF', icon: <FilePdfOutlined />, className: styles.pdf },
  word: { label: 'DOC', icon: <FileWordOutlined />, className: styles.word },
  excel: { label: 'XLS', icon: <FileExcelOutlined />, className: styles.excel },
  minutes: { label: '纪要', icon: <FileTextOutlined />, className: styles.minutes },
  ppt: { label: 'PPT', icon: <FilePptOutlined />, className: styles.ppt },
}

function FileTypeIcon({ type }: FileTypeIconProps) {
  const item = config[type]

  return (
    <span className={`${styles.badge} ${item.className}`}>
      {item.icon}
      {item.label}
    </span>
  )
}

export default FileTypeIcon
