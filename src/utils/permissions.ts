import type { UserProfile, UserRoleKey } from '../types/portal'

const ADMIN_ROLE_SET = new Set<UserRoleKey>([
  'secretariat_admin',
  'committee_admin',
  'platform_admin',
])

const WORKGROUP_MANAGER_ROLE_SET = new Set<UserRoleKey>([
  'workgroup_leader',
  'workgroup_deputy_leader',
  'workgroup_secretary',
])

function getPermissionSet(user: UserProfile) {
  return new Set(user.permissions ?? [])
}

export function getUserRoleKey(user: UserProfile): UserRoleKey {
  return user.roleKey ?? 'member'
}

export function isAdminUser(user: UserProfile) {
  const roleKey = getUserRoleKey(user)
  return ADMIN_ROLE_SET.has(roleKey)
}

export function isWorkgroupManager(user: UserProfile) {
  const roleKey = getUserRoleKey(user)
  const permissions = getPermissionSet(user)

  return WORKGROUP_MANAGER_ROLE_SET.has(roleKey) || permissions.has('workgroup:content:manage')
}

export function isRegularUser(user: UserProfile) {
  return !isAdminUser(user) && !isWorkgroupManager(user)
}

export function canViewAdminCenter(user: UserProfile) {
  const roleKey = getUserRoleKey(user)
  const permissions = getPermissionSet(user)

  return ADMIN_ROLE_SET.has(roleKey) || permissions.has('admin:center:view')
}

export function canManageWorkgroups(user: UserProfile) {
  const roleKey = getUserRoleKey(user)
  const permissions = getPermissionSet(user)

  return ADMIN_ROLE_SET.has(roleKey) || permissions.has('workgroups:manage')
}

export function canViewMemberCenter(user: UserProfile) {
  const permissions = getPermissionSet(user)

  return isAdminUser(user) || isWorkgroupManager(user) || permissions.has('members:view')
}

export function canUploadFiles(user: UserProfile) {
  const permissions = getPermissionSet(user)

  return isAdminUser(user) || isWorkgroupManager(user) || permissions.has('files:upload')
}

export function canCreateFileCategory(user: UserProfile) {
  const permissions = getPermissionSet(user)

  return isAdminUser(user) || permissions.has('files:category:manage')
}

export function canManageAllMemberInfo(user: UserProfile) {
  const permissions = getPermissionSet(user)

  return isAdminUser(user) || permissions.has('members:manage')
}

export function canManageUserAccounts(user: UserProfile) {
  const permissions = getPermissionSet(user)

  return isAdminUser(user) || permissions.has('users:manage')
}

export function canManageWorkgroupContent(user: UserProfile, workgroup?: string) {
  if (isAdminUser(user)) {
    return true
  }

  if (!isWorkgroupManager(user)) {
    return false
  }

  return !workgroup || user.currentWorkgroup === workgroup
}

export function getRoleScopeLabel(user: UserProfile) {
  if (isAdminUser(user)) {
    return '管理员视图：全平台管理'
  }

  if (isWorkgroupManager(user)) {
    return `组长视图：${user.currentWorkgroup ?? '本组'}`
  }

  return '普通用户视图：浏览与留言'
}
