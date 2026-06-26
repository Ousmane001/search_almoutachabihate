import type { ApiError, ApiSuccess } from './types'

// Vide par défaut : les requêtes passent par le proxy Vite (même origine HTTPS),
// ce qui évite le blocage "contenu mixte" quand la page est servie en HTTPS
// (ex: test depuis un téléphone) alors que l'API tourne en HTTP en local.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export class ApiClientError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null

  if (!response.ok || !payload || payload.success === false || !('data' in payload)) {
    const message = payload && 'message' in payload ? payload.message : `Erreur HTTP ${response.status}`
    throw new ApiClientError(message, response.status)
  }

  return payload.data
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null

  if (!response.ok || !payload || payload.success === false || !('data' in payload)) {
    const message = payload && 'message' in payload ? payload.message : `Erreur HTTP ${response.status}`
    throw new ApiClientError(message, response.status)
  }

  return payload.data
}
