import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import SidebarMenu from '../components/SidebarMenu'
import TopHeader from '../components/TopHeader'
import styles from './AppLayout.module.css'

interface AppLayoutProps extends PropsWithChildren {
  contextLabel?: string
  footerCaption?: string
  footerTitle?: string
  headerSearchValue?: string
  onHeaderSearchChange?: (value: string) => void
  onHeaderSearchSubmit?: (value: string) => void
  searchPlaceholder?: string
  versionLabel?: string
}

function AppLayout({
  children,
  contextLabel,
  footerCaption,
  footerTitle,
  headerSearchValue,
  onHeaderSearchChange,
  onHeaderSearchSubmit,
  searchPlaceholder,
  versionLabel,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={styles.shell}>
      <SidebarMenu
        collapsed={collapsed}
        footerCaption={footerCaption}
        footerTitle={footerTitle}
        versionLabel={versionLabel}
      />
      <div className={styles.mainPane}>
        <TopHeader
          collapsed={collapsed}
          contextLabel={contextLabel}
          headerSearchValue={headerSearchValue}
          onToggle={() => setCollapsed((value) => !value)}
          onSearchChange={onHeaderSearchChange}
          onSearchSubmit={onHeaderSearchSubmit}
          searchPlaceholder={searchPlaceholder}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
