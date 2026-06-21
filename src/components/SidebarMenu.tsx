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
import type { ReactNode } from 'react'
import sidebarFooterIllustration from '../assets/sidebar-footer-illustration.png'
import { navItems, platformSubtitle, platformTitle } from '../mock/portal'
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
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        {!collapsed && (
          <div className={styles.brandText}>
            <strong>{platformTitle}</strong>
            <span>{platformSubtitle}</span>
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

      <div className={styles.footerCard}>
        <div className={styles.footerIllustration}>
          <img src={sidebarFooterIllustration} alt="" />
        </div>
        {!collapsed && (
          <>
            <strong>{footerCaption}</strong>
            <span>{footerTitle}</span>
            <small>{versionLabel}</small>
            <NavLink to="/login" className={styles.demoLink}>
              演示登录入口
            </NavLink>
          </>
        )}
      </div>
    </aside>
  )
}

export default SidebarMenu
