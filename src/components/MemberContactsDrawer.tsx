import { Drawer } from 'antd'
import type { MemberUnit } from '../types/portal'
import styles from './MemberContactsDrawer.module.css'

interface MemberContactsDrawerProps {
  member: MemberUnit | null
  onClose: () => void
  open: boolean
}

function MemberContactsDrawer({ member, onClose, open }: MemberContactsDrawerProps) {
  return (
    <Drawer
      open={open}
      title={member ? `${member.name} · 联系人管理` : '联系人管理'}
      width={520}
      onClose={onClose}
    >
      <div className={styles.list}>
        {member?.contacts.map((contact) => (
          <article key={contact.id} className={styles.card}>
            <div className={styles.header}>
              <strong>{contact.name}</strong>
              <span>{contact.role}</span>
            </div>
            <div className={styles.meta}>
              <span>{contact.title}</span>
              <span>{contact.phone}</span>
              <span>{contact.email}</span>
              <small>账号状态：{contact.accountStatus}</small>
            </div>
          </article>
        ))}
      </div>
    </Drawer>
  )
}

export default MemberContactsDrawer
