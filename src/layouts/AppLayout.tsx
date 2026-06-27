import type { PropsWithChildren } from 'react'
import SidebarMenu from '../components/SidebarMenu'
import styles from './AppLayout.module.css'

interface AppLayoutProps extends PropsWithChildren {
  footerCaption?: string
  footerTitle?: string
  versionLabel?: string
}

function AppLayout({
  children,
  footerCaption,
  footerTitle,
  versionLabel,
}: AppLayoutProps) {
  return (
    <div className={styles.shell}>
      <SidebarMenu
        collapsed={false}
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
