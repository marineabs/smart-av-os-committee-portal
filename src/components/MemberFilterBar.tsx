import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Select } from 'antd'
import type { MemberFilterOptions, MemberQuickFilter } from '../types/portal'
import styles from './MemberFilterBar.module.css'

export interface MemberFilterState {
  memberCategory: string
  organizationType: string
  committee: string
  workgroup: string
  status: string
  capability: string
  accountState: '全部' | '已启用' | '未启用'
  completeness: '全部' | '90%以上' | '70% - 89%' | '70%以下'
}

interface MemberFilterBarProps {
  activeKeyword: string
  activeQuickFilter: MemberQuickFilter
  filters: MemberFilterState
  options: MemberFilterOptions
  onChange: (patch: Partial<MemberFilterState>) => void
  onQuickFilterChange: (value: MemberQuickFilter) => void
  onReset: () => void
  onSearch: () => void
}

const quickFilters: Array<{ key: MemberQuickFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'mine', label: '我负责维护' },
  { key: 'incomplete', label: '信息待完善' },
  { key: 'new', label: '本月新增' },
  { key: 'contact', label: '联系人变更' },
  { key: 'standard', label: '参与标准项目' },
  { key: 'pending', label: '待审核' },
]

function MemberFilterBar({
  activeKeyword,
  activeQuickFilter,
  filters,
  options,
  onChange,
  onQuickFilterChange,
  onReset,
  onSearch,
}: MemberFilterBarProps) {
  return (
    <section className={styles.bar}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <label>会员类别</label>
          <Select value={filters.memberCategory} onChange={(value) => onChange({ memberCategory: value })}>
            {options.memberCategories.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>单位类型</label>
          <Select
            value={filters.organizationType}
            onChange={(value) => onChange({ organizationType: value })}
          >
            {options.organizationTypes.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>所属分委会</label>
          <Select value={filters.committee} onChange={(value) => onChange({ committee: value })}>
            {options.committees.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>参与工作组</label>
          <Select value={filters.workgroup} onChange={(value) => onChange({ workgroup: value })}>
            {options.workgroups.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>单位状态</label>
          <Select value={filters.status} onChange={(value) => onChange({ status: value })}>
            <Select.Option value="全部">全部</Select.Option>
            {options.statuses.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>能力标签</label>
          <Select value={filters.capability} onChange={(value) => onChange({ capability: value })}>
            {options.capabilities.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>是否启用账号</label>
          <Select value={filters.accountState} onChange={(value) => onChange({ accountState: value })}>
            {options.accountStates.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>信息完整度</label>
          <Select value={filters.completeness} onChange={(value) => onChange({ completeness: value })}>
            {options.completenessLevels.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.quickFilters}>
          {quickFilters.map((item) => (
            <button
              key={item.key}
              className={`${styles.quickFilter} ${activeQuickFilter === item.key ? styles.quickFilterActive : ''}`}
              type="button"
              onClick={() => onQuickFilterChange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {activeKeyword ? <span className={styles.keywordTip}>当前搜索：{activeKeyword}</span> : null}
          <Button icon={<ReloadOutlined />} onClick={onReset}>
            重置
          </Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
            搜索
          </Button>
        </div>
      </div>
    </section>
  )
}

export default MemberFilterBar
