import { getAuthToken } from './auth'

type AdminValue = string | number | boolean | string[] | undefined

export type AdminApiRecord = {
  key: string
  [key: string]: AdminValue
}

export type AdminApiTableRows = Record<string, AdminApiRecord[]>

export interface AdminApiSettings {
  platformName: string
  supportEmail: string
  supportPhone: string
  supportTeam: string
  demoTag: string
  modules: Record<string, boolean>
}

export interface AdminBootstrapPayload {
  settings: AdminApiSettings
  tableRows: AdminApiTableRows
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error ?? `API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function fetchAdminBootstrap() {
  return requestJson<AdminBootstrapPayload>('/admin/bootstrap')
}

export function createAdminRecord(section: string, record: AdminApiRecord) {
  return requestJson<AdminApiRecord>(`/admin/${section}`, {
    method: 'POST',
    body: JSON.stringify(record),
  })
}

export function updateAdminRecord(section: string, key: string, record: AdminApiRecord) {
  return requestJson<AdminApiRecord>(`/admin/${section}/${key}`, {
    method: 'PUT',
    body: JSON.stringify(record),
  })
}

export function patchAdminRecord(section: string, key: string, values: Record<string, AdminValue>) {
  return requestJson<AdminApiRecord>(`/admin/${section}/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteAdminRecord(section: string, key: string) {
  return requestJson<AdminApiRecord>(`/admin/${section}/${key}`, {
    method: 'DELETE',
  })
}

export function saveAdminSettings(settings: AdminApiSettings) {
  return requestJson<AdminApiSettings>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

export function resetAdminData() {
  return requestJson<AdminBootstrapPayload>('/admin/reset', {
    method: 'POST',
  })
}

export function fetchAdminBackup() {
  return requestJson<unknown>('/admin/backup')
}

export function restoreAdminBackup(payload: unknown) {
  return requestJson<AdminBootstrapPayload>('/admin/restore', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
