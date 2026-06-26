import { currentUser } from '../mock/portal'
import type { UserProfile } from '../types/portal'

const authTokenKey = 'smart-av-os-auth-token'
const authUserKey = 'smart-av-os-auth-user'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'
const demoPassword = 'demo-portal-2026'

export const demoUsers: Record<string, UserProfile> = {
  zhangwei: {
    name: '张伟',
    role: '秘书处管理员',
    avatarText: '张',
    roleKey: 'secretariat_admin',
    permissions: ['admin:center:view', 'workgroups:manage', 'admin:data:write', 'admin:settings:write'],
    organizationName: '专委会秘书处',
    currentWorkgroup: '秘书处',
    managementScope: '全平台',
    tags: ['演示账号', '管理员'],
  },
  sunhao: {
    name: '孙昊',
    role: '技术标准组组长',
    avatarText: '孙',
    roleKey: 'workgroup_leader',
    permissions: ['workgroup:content:manage', 'files:upload', 'members:view'],
    organizationName: '星河视研院',
    currentWorkgroup: '技术标准组',
    managementScope: '本组内容 / 本组资料 / 本组成员',
    tags: ['演示账号', '组长'],
  },
  wangmin: {
    name: '王敏',
    role: '普通用户',
    avatarText: '王',
    roleKey: 'member',
    permissions: [],
    organizationName: '华域视联',
    currentWorkgroup: '技术标准组',
    managementScope: '公开资料 / 授权资料 / 留言反馈',
    tags: ['演示账号', '普通用户'],
  },
}

export interface LoginPayload {
  account: string
  password: string
}

export interface LoginResult {
  fallback?: boolean
  token: string
  user: UserProfile
}

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey)
}

export function getActiveUser(): UserProfile {
  const rawUser = window.localStorage.getItem(authUserKey)
  if (!rawUser) {
    return currentUser
  }

  try {
    return JSON.parse(rawUser) as UserProfile
  } catch {
    return currentUser
  }
}

export function setAuthSession(session: LoginResult) {
  window.localStorage.setItem(authTokenKey, session.token)
  window.localStorage.setItem(authUserKey, JSON.stringify(session.user))
}

export function clearAuthSession() {
  window.localStorage.removeItem(authTokenKey)
  window.localStorage.removeItem(authUserKey)
}

function createLocalDevSession(): LoginResult {
  return {
    fallback: true,
    token: `local-dev-fallback-${Date.now()}`,
    user: currentUser,
  }
}

function createDemoSession(account: string): LoginResult | null {
  const demoUser = demoUsers[account]
  if (!demoUser) {
    return null
  }

  return {
    fallback: true,
    token: `local-demo-${account}-${Date.now()}`,
    user: demoUser,
  }
}

export async function login(payload: LoginPayload) {
  const account = payload.account.trim()
  const localDemoSession = payload.password === demoPassword ? createDemoSession(account) : null
  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    if (import.meta.env.DEV) {
      const session = localDemoSession ?? createLocalDevSession()
      setAuthSession(session)
      return session
    }

    throw new Error('后台认证服务未连接，请检查 API 服务是否启动')
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    if (import.meta.env.DEV && localDemoSession && response.status === 401) {
      setAuthSession(localDemoSession)
      return localDemoSession
    }

    if (import.meta.env.DEV && response.status >= 500) {
      const session = localDemoSession ?? createLocalDevSession()
      setAuthSession(session)
      return session
    }

    throw new Error(errorPayload?.error ?? '登录失败')
  }

  const session = await response.json() as LoginResult
  setAuthSession(session)
  return session
}
