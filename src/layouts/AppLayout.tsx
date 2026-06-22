import type { PropsWithChildren } from 'react'
import SidebarMenu from '../components/SidebarMenu'
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
  footerCaption,
  footerTitle,
  versionLabel,
}: AppLayoutProps) {
  const collapsed = false

  return (
    <div className={styles.shell}>
      <SidebarMenu
        collapsed={collapsed}
        footerCaption={footerCaption}
        footerTitle={footerTitle}
        versionLabel={versionLabel}
      />
      <div className={styles.mainPane}>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
