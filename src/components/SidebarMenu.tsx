import {
  AppstoreFilled,
  AppstoreOutlined,
  BankOutlined,
  CalendarFilled,
  CheckSquareFilled,
  CompassFilled,
  ContactsFilled,
  BarChartOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  FileTextFilled,
  FileSearchOutlined,
  FolderFilled,
  FolderOpenOutlined,
  FundFilled,
  HomeFilled,
  HomeOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingFilled,
  SettingOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import { Input, Modal, message } from 'antd'
import { NavLink } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import userAvatarFemale from '../assets/user-avatar-female.png'
import userAvatarMale from '../assets/user-avatar-male.png'
import { adminNavItems, businessNavItems } from '../mock/portal'
import { getActiveUser } from '../services/auth'
import type { NavIconKey } from '../types/portal'
import { canViewAdminCenter, canViewMemberCenter } from '../utils/permissions'
import styles from './SidebarMenu.module.css'

const inactiveIconMap: Record<NavIconKey, ReactNode> = {
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

const activeIconMap: Record<NavIconKey, ReactNode> = {
  home: <HomeFilled />,
  groups: <AppstoreFilled />,
  knowledge: <FolderFilled />,
  members: <ContactsFilled />,
  meetings: <CalendarFilled />,
  tasks: <CheckSquareFilled />,
  standards: <FileTextFilled />,
  search: <CompassFilled />,
  analytics: <FundFilled />,
  settings: <SettingFilled />,
}

interface SidebarMenuProps {
  collapsed: boolean
  footerCaption?: string
  footerTitle?: string
  versionLabel?: string
}

function SidebarMenu({ collapsed }: SidebarMenuProps) {
  const currentUser = getActiveUser()
  const [avatarMode, setAvatarMode] = useState<'male' | 'female'>('male')
  const [feedbackContact, setFeedbackContact] = useState('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const avatarSrc = avatarMode === 'male' ? userAvatarMale : userAvatarFemale
  const showAdminCenter = canViewAdminCenter(currentUser)
  const visibleBusinessNavItems = businessNavItems.filter((item) => (
    item.key === 'members' ? canViewMemberCenter(currentUser) : true
  ))
  const userDetails = [
    {
      key: 'organization',
      icon: <BankOutlined />,
      label: '所属组织：',
      value: currentUser.organizationName ?? '智慧视听操作系统专委会',
    },
    {
      key: 'workgroup',
      icon: <TeamOutlined />,
      label: '当前工作组：',
      value: currentUser.currentWorkgroup ?? '未加入工作组',
    },
    {
      key: 'scope',
      icon: <SafetyCertificateOutlined />,
      label: showAdminCenter ? '管理范围：' : '协同范围：',
      value: currentUser.managementScope ?? '通知 / 文件 / 会议',
    },
  ]
  const userTags = currentUser.tags ?? []

  const handleSubmitFeedback = () => {
    if (!feedbackContact.trim() || !feedbackText.trim()) {
      return
    }

    message.success('问题反馈已提交')
    setFeedbackContact('')
    setFeedbackText('')
    setFeedbackOpen(false)
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.userCard}>
        <div className={styles.userCardHeader}>
          <button
            aria-label="切换用户头像"
            className={styles.avatarButton}
            onClick={() => setAvatarMode((current) => (current === 'male' ? 'female' : 'male'))}
            title="点击切换头像"
            type="button"
          >
            <img alt={`${currentUser.name}头像`} className={styles.avatar} src={avatarSrc} />
          </button>
          {!collapsed && (
            <div className={styles.userSummary}>
              <div className={styles.userNameRow}>
                <strong>{currentUser.name}</strong>
                <span className={styles.userStatus}>
                  <span className={styles.statusDot} />
                  在线
                </span>
              </div>
              <span className={styles.userRole}>{currentUser.role}</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            <div className={styles.userDetails}>
              {userDetails.map((item) => (
                <div key={item.key} className={styles.detailItem}>
                  <span className={styles.detailIcon}>{item.icon}</span>
                  <span className={styles.detailLabel}>{item.label}</span>
                  <span className={styles.detailValue}>{item.value}</span>
                </div>
              ))}
            </div>

            {userTags.length ? (
              <div className={styles.userTags}>
                {userTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      {!collapsed && <div className={styles.sectionDivider} />}

      <div className={styles.sidebarBodyCard}>
        <div className={styles.navSection}>
          {!collapsed ? <div className={styles.navSectionTitle}>业务导航</div> : null}
          <nav className={styles.nav}>
            {visibleBusinessNavItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === '/portal'}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={styles.navIcon}>{isActive ? activeIconMap[item.icon] : inactiveIconMap[item.icon]}</span>
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {showAdminCenter ? (
          <div className={styles.navSection}>
            {!collapsed ? (
              <>
                <div className={styles.navSectionDivider} />
                <div className={styles.navSectionTitle}>管理入口</div>
              </>
            ) : null}
            <nav className={styles.nav}>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      <span className={styles.navIcon}>{isActive ? activeIconMap[item.icon] : inactiveIconMap[item.icon]}</span>
                      {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : null}

        {!collapsed && (
          <div className={styles.brandPanel}>
            <div className={styles.brandPanelHeader}>
              <span>帮助与支持</span>
            </div>
            <div className={styles.brandPanelList}>
              <div className={styles.brandPanelItem}>
                <span className={styles.brandPanelIcon}>
                  <CustomerServiceOutlined />
                </span>
                <span>技术支持：专委会平台运维组</span>
              </div>
              <div className={styles.brandPanelItem}>
                <span className={styles.brandPanelIcon}>
                  <TeamOutlined />
                </span>
                <span>联系人：张老师</span>
              </div>
              <div className={styles.brandPanelItem}>
                <span className={styles.brandPanelIcon}>
                  <PhoneOutlined />
                </span>
                <span>电话：010-8888 8888</span>
              </div>
              <div className={styles.brandPanelItem}>
                <span className={styles.brandPanelIcon}>
                  <MailOutlined />
                </span>
                <span>联系邮箱：support@abs.cn</span>
              </div>
              <div className={styles.brandPanelItem}>
                <span className={styles.brandPanelIcon}>
                  <ClockCircleOutlined />
                </span>
                <span>服务时间：工作日 09:00-18:00</span>
              </div>
            </div>
            <div className={styles.brandPanelFooter}>
              <button className={styles.feedbackButton} type="button" onClick={() => setFeedbackOpen(true)}>
                <MessageOutlined />
                问题反馈
              </button>
              <NavLink to="/login" className={styles.demoLink}>
                <LoginOutlined />
                演示登录入口
              </NavLink>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={feedbackOpen}
        title="问题反馈"
        footer={null}
        width={460}
        onCancel={() => setFeedbackOpen(false)}
        destroyOnClose={false}
      >
        <div className={styles.feedbackModalBody}>
          <div className={styles.feedbackModalHint}>
            <InfoCircleOutlined />
            <span>请简要描述您遇到的问题或建议内容，我们会尽快处理。</span>
          </div>
          <div className={styles.feedbackField}>
            <span className={styles.feedbackFieldLabel}>联系方式</span>
            <Input
              value={feedbackContact}
              maxLength={60}
              placeholder="请输入电话或邮箱，便于我们联系您"
              className={styles.feedbackInput}
              onChange={(event) => setFeedbackContact(event.target.value)}
            />
          </div>
          <div className={styles.feedbackField}>
            <span className={styles.feedbackFieldLabel}>反馈内容</span>
          <Input.TextArea
            value={feedbackText}
            rows={6}
            maxLength={300}
            placeholder="请输入反馈内容"
            className={styles.feedbackTextarea}
            onChange={(event) => setFeedbackText(event.target.value)}
          />
          </div>
          <div className={styles.feedbackModalFooter}>
            <button className={styles.feedbackSecondaryButton} type="button" onClick={() => setFeedbackOpen(false)}>
              取消
            </button>
            <button
              className={styles.feedbackPrimaryButton}
              type="button"
              disabled={!feedbackContact.trim() || !feedbackText.trim()}
              onClick={handleSubmitFeedback}
            >
              提交
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  )
}

export default SidebarMenu
