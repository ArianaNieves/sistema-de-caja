import type { ApiResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL as string
const API_KEY  = import.meta.env.VITE_API_KEY  as string

if (!BASE_URL) {
  console.warn('[API] VITE_API_URL no configurada. Copiá .env.example a .env.local')
}

async function request<T>(
  action: string,
  params: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'GET'
): Promise<T> {
  const url = new URL(BASE_URL)
  url.searchParams.set('action', action)
  url.searchParams.set('apiKey', API_KEY)

  const options: RequestInit =
    method === 'GET'
      ? { method: 'GET' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        }

  if (method === 'GET') {
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    )
  }

  const res = await fetch(url.toString(), options)

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  const json: ApiResponse<T> = await res.json()

  if (!json.ok) {
    throw new Error(json.error ?? 'Error desconocido del servidor')
  }

  return json.data
}

export const api = {
  get:  <T>(action: string, params?: Record<string, unknown>) =>
    request<T>(action, params, 'GET'),
  post: <T>(action: string, body: Record<string, unknown>) =>
    request<T>(action, body, 'POST'),
}
