import HeroBanner from '../components/HeroBanner'
import InfoListCard from '../components/InfoListCard'
import QuickEntryGrid from '../components/QuickEntryGrid'
import StatisticCard from '../components/StatisticCard'
import AppLayout from '../layouts/AppLayout'
import {
  latestDocuments,
  latestNotices,
  quickEntries,
  statistics,
  workgroupActivities,
} from '../mock/portal'
import styles from './HomePortalPage.module.css'

function HomePortalPage() {
  return (
    <AppLayout>
      <div className={styles.page}>
        <HeroBanner />

        <section className={styles.statsGrid}>
          {statistics.map((item) => (
            <StatisticCard
              key={item.title}
              className={styles.compactStatCard}
              iconClassName={styles.compactStatIcon}
              item={item}
              showTrend={false}
            />
          ))}
        </section>

        <section className={styles.infoGrid}>
          <InfoListCard title="最新通知" morePath="/notices" variant="notice" items={latestNotices} />
          <InfoListCard title="最新资料" morePath="/documents" variant="document" items={latestDocuments} />
          <InfoListCard
            title="工作组动态"
            morePath="/activities"
            variant="activity"
            items={workgroupActivities}
          />
        </section>

        <QuickEntryGrid items={quickEntries} />
      </div>
    </AppLayout>
  )
}

export default HomePortalPage
