import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, DatePicker, Input, Select } from 'antd'
import type { KnowledgeFilterOptions, KnowledgeQuickFilter } from '../types/portal'
import styles from './KnowledgeFilterBar.module.css'

const { RangePicker } = DatePicker

export interface KnowledgeFilterState {
  categoryId: string
  dateRange: [string, string] | null
  permission: string
  status: string
  uploader: string
  workgroup: string
}

interface KnowledgeFilterBarProps {
  activeKeyword: string
  activeQuickFilter: KnowledgeQuickFilter
  filters: KnowledgeFilterState
  keywordValue: string
  options: KnowledgeFilterOptions
  onChange: (patch: Partial<KnowledgeFilterState>) => void
  onKeywordChange: (value: string) => void
  onQuickFilterChange: (value: KnowledgeQuickFilter) => void
  onReset: () => void
  onSearch: () => void
}

const quickFilters: Array<{ key: KnowledgeQuickFilter; label: string }> = [
  { key: 'all', label: '全部（1362）' },
  { key: 'visible', label: '我可查看' },
  { key: 'favorite', label: '我收藏的' },
  { key: 'recent', label: '本月更新' },
  { key: 'review', label: '征求意见中' },
  { key: 'comment', label: '待我评论' },
  { key: 'version', label: '有新版本' },
]

function KnowledgeFilterBar({
  activeKeyword,
  activeQuickFilter,
  filters,
  keywordValue,
  options,
  onChange,
  onKeywordChange,
  onQuickFilterChange,
  onReset,
  onSearch,
}: KnowledgeFilterBarProps) {
  return (
    <section className={styles.bar}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <label>关键词</label>
          <Input
            allowClear
            value={keywordValue}
            onChange={(event) => onKeywordChange(event.target.value)}
            onPressEnter={onSearch}
            placeholder="文件名称、编号、工作组、上传单位"
          />
        </div>

        <div className={styles.control}>
          <label>所属分类</label>
          <Select value={filters.categoryId} onChange={(value) => onChange({ categoryId: value })}>
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="policy">制度文件库</Select.Option>
            <Select.Option value="meeting">会议资料库</Select.Option>
            <Select.Option value="requirement">需求文档库</Select.Option>
            <Select.Option value="solution">技术方案库</Select.Option>
            <Select.Option value="standard">标准规范库</Select.Option>
            <Select.Option value="interface">接口规范库</Select.Option>
            <Select.Option value="testing">测试认证库</Select.Option>
            <Select.Option value="achievement">成果资料库</Select.Option>
          </Select>
        </div>

        <div className={styles.control}>
          <label>所属工作组</label>
          <Select value={filters.workgroup} onChange={(value) => onChange({ workgroup: value })}>
            {options.workgroups.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>文件状态</label>
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
          <label>权限级别</label>
          <Select value={filters.permission} onChange={(value) => onChange({ permission: value })}>
            <Select.Option value="全部">全部</Select.Option>
            {options.permissions.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>上传单位</label>
          <Select value={filters.uploader} onChange={(value) => onChange({ uploader: value })}>
            {options.uploaders.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.control}>
          <label>时间范围</label>
          <RangePicker
            value={undefined}
            onChange={(_, dateStrings) =>
              onChange({
                dateRange:
                  dateStrings[0] && dateStrings[1]
                    ? [dateStrings[0], dateStrings[1]]
                    : null,
              })
            }
          />
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

export default KnowledgeFilterBar
