import type { StatisticsFilterState, StatisticsSummaryPayload } from '../types/statistics'
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

export function fetchStatisticsSummary(filters: StatisticsFilterState) {
  return requestJson<StatisticsSummaryPayload>('/analytics/summary', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
}
