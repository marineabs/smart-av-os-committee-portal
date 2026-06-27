import { Drawer, Progress, Tabs, Tag } from 'antd'
import type { MemberUnit } from '../types/portal'
import MemberStatusTag from './MemberStatusTag'
import styles from './MemberDetailDrawer.module.css'

interface MemberDetailDrawerProps {
  member: MemberUnit | null
  onClose: () => void
  open: boolean
}

function renderTableLike(
  headers: string[],
  rows: Array<Array<string | number | boolean>>,
  booleanLabel?: (value: boolean) => string,
) {
  return (
    <div className={styles.tableLike}>
      <div className={styles.tableHead}>
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      <div className={styles.tableBody}>
        {rows.map((row, rowIndex) => (
          <div key={`${rowIndex}-${String(row[0])}`} className={styles.tableRow}>
            {row.map((cell, cellIndex) => (
              <span key={`${rowIndex}-${cellIndex}`}>
                {typeof cell === 'boolean' && booleanLabel ? booleanLabel(cell) : cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function MemberDetailDrawer({ member, onClose, open }: MemberDetailDrawerProps) {
  const items = member
    ? [
        {
          key: 'overview',
          label: '单位概况',
          children: (
            <div className={styles.sectionStack}>
              <div className={styles.infoGrid}>
                <div>
                  <span>单位名称</span>
                  <strong>{member.name}</strong>
                </div>
                <div>
                  <span>单位类型</span>
                  <strong>{member.organizationType}</strong>
                </div>
                <div>
                  <span>会员类别</span>
                  <strong>{member.memberCategory}</strong>
                </div>
                <div>
                  <span>所属分委会</span>
                  <strong>{member.committee}</strong>
                </div>
                <div>
                  <span>联系地址</span>
                  <strong>{member.address}</strong>
                </div>
                <div>
                  <span>官网</span>
                  <strong>{member.website}</strong>
                </div>
              </div>
              <section className={styles.cardSection}>
                <h4>单位简介</h4>
                <p>{member.description}</p>
              </section>
              <section className={styles.cardSection}>
                <h4>能力标签</h4>
                <div className={styles.tagWrap}>
                  {member.capabilityTags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </section>
            </div>
          ),
        },
        {
          key: 'contacts',
          label: '联系人管理',
          children: (
            <div className={styles.listCards}>
              {member.contacts.map((contact) => (
                <article key={contact.id} className={styles.contactCard}>
                  <div className={styles.contactHeader}>
                    <strong>{contact.name}</strong>
                    <span>{contact.role}</span>
                  </div>
                  <div className={styles.contactMeta}>
                    <span>{contact.title}</span>
                    <span>{contact.phone}</span>
                    <span>{contact.email}</span>
                    <small>账号状态：{contact.accountStatus}</small>
                  </div>
                </article>
              ))}
            </div>
          ),
        },
        {
          key: 'workgroups',
          label: '参与工作组',
          children: renderTableLike(
            ['工作组名称', '组内角色', '对接联系人', '加入时间', '最近参与情况'],
            member.participations.map((item) => [
              item.name,
              item.role,
              item.liaison,
              item.joinedAt,
              item.recentActivity,
            ]),
          ),
        },
        {
          key: 'meetings',
          label: '参会记录',
          children: renderTableLike(
            ['会议名称', '所属工作组', '参会人员', '会议时间', '是否签到', '关联纪要'],
            member.meetings.map((item) => [
              item.title,
              item.workgroup,
              item.attendee,
              item.time,
              item.checkedIn,
              item.minutes,
            ]),
            (value) => (value ? '已签到' : '未签到'),
          ),
        },
        {
          key: 'files',
          label: '文件与资料',
          children: renderTableLike(
            ['文件名称', '文件类型', '所属工作组', '上传时间', '文件状态'],
            member.files.map((item) => [
              item.title,
              item.type,
              item.workgroup,
              item.uploadedAt,
              item.status,
            ]),
          ),
        },
        {
          key: 'tasks',
          label: '任务与反馈',
          children: (
            <div className={styles.listCards}>
              {member.tasks.map((task) => (
                <article key={task.id} className={styles.taskCard}>
                  <div className={styles.taskHeader}>
                    <strong>{task.title}</strong>
                    <span>{task.status}</span>
                  </div>
                  <div className={styles.taskMeta}>
                    <span>责任人：{task.owner}</span>
                    <span>截止时间：{task.deadline}</span>
                  </div>
                  <Progress percent={task.completion} size="small" showInfo={false} />
                </article>
              ))}
            </div>
          ),
        },
        {
          key: 'permissions',
          label: '权限与账号',
          children: (
            <div className={styles.listCards}>
              {member.accounts.map((account) => (
                <article key={account.id} className={styles.accountCard}>
                  <div className={styles.accountHeader}>
                    <strong>{account.accountName}</strong>
                    <span>{account.role}</span>
                  </div>
                  <div className={styles.accountMeta}>
                    <span>账号状态：{account.enabled ? '已启用' : '未启用'}</span>
                    <span>授权工作组：{account.authorizedGroups.join('、')}</span>
                    <span>可访问资料范围：{account.scope}</span>
                    <span>临时授权：{account.temporaryAccess || '无'}</span>
                    <small>最近变更：{account.lastChanged}</small>
                  </div>
                </article>
              ))}
            </div>
          ),
        },
        {
          key: 'changes',
          label: '变更记录',
          children: (
            <div className={styles.timeline}>
              {member.changes.map((item) => (
                <div key={item.id} className={styles.timelineItem}>
                  <span className={styles.timelineDot} />
                  <div className={styles.timelineBody}>
                    <strong>{item.type}</strong>
                    <p>{item.summary}</p>
                    <small>
                      {item.operator} · {item.time}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ]
    : []

  return (
    <Drawer
      open={open}
      title={member ? `${member.name} · 会员单位详情` : '会员单位详情'}
      size={860}
      onClose={onClose}
      className={styles.drawer}
    >
      {member ? (
        <div className={styles.body}>
          <section className={styles.heroCard}>
            <div className={styles.heroIdentity}>
              <span className={styles.logo} style={{ background: member.accent }}>
                {member.logoText}
              </span>
              <div>
                <h3>{member.name}</h3>
                <p>
                  {member.organizationType} · {member.memberCategory}
                </p>
              </div>
            </div>
            <div className={styles.heroMeta}>
              <MemberStatusTag status={member.status} />
              <div className={styles.completeness}>
                <span>信息完整度</span>
                <strong>{member.completeness}%</strong>
              </div>
            </div>
          </section>

          <Tabs items={items} />
        </div>
      ) : null}
    </Drawer>
  )
}

export default MemberDetailDrawer
