import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Select } from 'antd'
import {
  type StatisticsFilterOptions,
  type StatisticsFilterState,
  type StatisticsTimeRange,
} from '../../types/statistics'
import styles from './StatisticsCenter.module.css'

interface StatisticsFilterBarProps {
  filters: StatisticsFilterState
  loading?: boolean
  options: StatisticsFilterOptions
  onChange: (patch: Partial<StatisticsFilterState>) => void
  onQuery: () => void
  onReset: () => void
}

function StatisticsFilterBar({ filters, loading = false, options, onChange, onQuery, onReset }: StatisticsFilterBarProps) {
  return (
    <section className={styles.filterBar}>
      <div className={styles.filterGrid}>
        <label className={styles.filterItem}>
          <span>时间范围</span>
          <Select
            value={filters.timeRange}
            onChange={(value: StatisticsTimeRange) => onChange({ timeRange: value })}
            options={options.timeRanges.map((value) => ({ value, label: value }))}
          />
        </label>
        <label className={styles.filterItem}>
          <span>所属分委会</span>
          <Select
            value={filters.committee}
            onChange={(value) => onChange({ committee: value })}
            options={options.committees.map((value) => ({ value, label: value }))}
          />
        </label>
        <label className={styles.filterItem}>
          <span>工作组</span>
          <Select
            value={filters.workgroup}
            onChange={(value) => onChange({ workgroup: value })}
            options={options.workgroups.map((value) => ({ value, label: value }))}
          />
        </label>
        <label className={styles.filterItem}>
          <span>成员单位</span>
          <Select
            value={filters.memberUnit}
            onChange={(value) => onChange({ memberUnit: value })}
            options={options.memberUnits.map((value) => ({ value, label: value }))}
          />
        </label>
      </div>
      <div className={styles.filterActions}>
        <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={onQuery}>
          查询
        </Button>
        <Button icon={<ReloadOutlined />} disabled={loading} onClick={onReset}>
          重置
        </Button>
      </div>
    </section>
  )
}

export default StatisticsFilterBar
