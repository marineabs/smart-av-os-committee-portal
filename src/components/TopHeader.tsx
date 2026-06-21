import {
  BellOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Input } from 'antd'
import type { ChangeEvent } from 'react'
import { currentUser } from '../mock/portal'
import styles from './TopHeader.module.css'

interface TopHeaderProps {
  collapsed: boolean
  contextLabel?: string
  headerSearchValue?: string
  onToggle: () => void
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (value: string) => void
  searchPlaceholder?: string
}

function TopHeader({
  collapsed,
  contextLabel,
  headerSearchValue,
  onToggle,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = '全局搜索：请输入关键词',
}: TopHeaderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value)
  }

  return (
    <header className={styles.header}>
      <div className={styles.leftArea}>
        <button className={styles.toggleButton} type="button" onClick={onToggle} aria-label="切换菜单">
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
        {contextLabel ? <span className={styles.contextLabel}>{contextLabel}</span> : null}
      </div>

      <div className={styles.searchWrap}>
        <Input
          size="large"
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined className={styles.searchIcon} />}
          className={styles.searchInput}
          value={headerSearchValue}
          onChange={handleChange}
          onPressEnter={(event) => onSearchSubmit?.(event.currentTarget.value)}
        />
      </div>

      <div className={styles.actions}>
        <Badge count={12} size="small">
          <button className={styles.iconButton} type="button" aria-label="通知">
            <BellOutlined />
          </button>
        </Badge>
        <Badge count={5} size="small">
          <button className={styles.iconButton} type="button" aria-label="消息">
            <MessageOutlined />
          </button>
        </Badge>
        <button className={styles.iconButton} type="button" aria-label="帮助">
          <QuestionCircleOutlined />
        </button>

        <button className={styles.userButton} type="button">
          <Avatar className={styles.avatar}>{currentUser.avatarText}</Avatar>
          <span className={styles.userMeta}>
            <strong>{currentUser.name}</strong>
            <small>{currentUser.role}</small>
          </span>
          <DownOutlined className={styles.arrow} />
        </button>
      </div>
    </header>
  )
}

export default TopHeader
