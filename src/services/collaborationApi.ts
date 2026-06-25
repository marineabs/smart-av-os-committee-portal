import { getAuthToken } from './auth'

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

export function fetchCollaborationRecords<T>(section: string, fallbackRecords: T[]) {
  return requestJson<T[]>(`/collab/${section}/bootstrap`, {
    method: 'POST',
    body: JSON.stringify({ records: fallbackRecords }),
  })
}

export function createCollaborationRecord<T extends { id: string }>(section: string, record: T) {
  return requestJson<T>(`/collab/${section}`, {
    method: 'POST',
    body: JSON.stringify(record),
  })
}

export function updateCollaborationRecord<T extends { id: string }>(section: string, record: T) {
  return requestJson<T>(`/collab/${section}/${encodeURIComponent(record.id)}`, {
    method: 'PUT',
    body: JSON.stringify(record),
  })
}

export function deleteCollaborationRecord<T>(section: string, key: string) {
  return requestJson<T>(`/collab/${section}/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })
}

export function auditCollaborationRecord(
  section: string,
  key: string,
  payload: { action: string; detail: string; target?: string },
) {
  return requestJson<{ ok: boolean }>(`/collab/${section}/${encodeURIComponent(key)}/audit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
