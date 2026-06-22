import {
  AppstoreOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  SearchOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import { NavLink } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import userAvatarFemale from '../assets/user-avatar-female.png'
import userAvatarMale from '../assets/user-avatar-male.png'
import { currentUser, navItems } from '../mock/portal'
import type { NavIconKey } from '../types/portal'
import styles from './SidebarMenu.module.css'

const iconMap: Record<NavIconKey, ReactNode> = {
  home: <HomeOutlined />,
  groups: <AppstoreOutlined />,
  knowledge: <FolderOpenOutlined />,
  members: <UsergroupAddOutlined />,
  meetings: <CalendarOutlined />,
  tasks: <CheckSquareOutlined />,
  standards: <FileSearchOutlined />,
  search: <SearchOutlined />,
  analytics: <BarChartOutlined />,
  settings: <SettingOutlined />,
}

interface SidebarMenuProps {
  collapsed: boolean
  footerCaption?: string
  footerTitle?: string
  versionLabel?: string
}

function SidebarMenu({
  collapsed,
  footerCaption = '智慧视听操作系统',
  footerTitle = '专委会协同平台',
  versionLabel = 'V 1.0.0',
}: SidebarMenuProps) {
  const [avatarMode, setAvatarMode] = useState<'male' | 'female'>('male')
  const avatarSrc = avatarMode === 'male' ? userAvatarMale : userAvatarFemale

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        <button
          aria-label="切换用户头像"
          className={styles.avatarButton}
          onClick={() => setAvatarMode((current) => (current === 'male' ? 'female' : 'male'))}
          title="点击切换头像"
          type="button"
        >
          <img alt={`${currentUser.name}头像`} className={styles.avatar} src={avatarSrc} />
        </button>
        {!collapsed && (
          <div className={styles.brandContent}>
            <div className={styles.userInfo}>
              <div className={styles.userNameRow}>
                <strong>{currentUser.name}</strong>
                <span className={styles.userStatus}>在线</span>
              </div>
              <span className={styles.userRole}>{currentUser.role}</span>
            </div>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <span className={styles.navIcon}>{iconMap[item.icon]}</span>
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className={styles.navMeta}>
          <strong>{footerCaption}</strong>
          <span>{footerTitle}</span>
          <small>{versionLabel}</small>
          <NavLink to="/login" className={styles.demoLink}>
            演示登录入口
          </NavLink>
        </div>
      )}
    </aside>
  )
}

export default SidebarMenu
