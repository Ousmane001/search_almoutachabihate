import { apiGet, apiPost } from './apiClient'
import type { SearchResult, TranscriptionResult } from './types'

export function searchQuran(query: string): Promise<SearchResult[]> {
  return apiGet<SearchResult[]>('/v1/search', { q: query })
}

/**
 * Transcrit un clip audio sans chercher de correspondance verset/mot — utilisé
 * pour la recherche vocale (dicter une requête au lieu de la taper).
 */
export function transcribeAudio(payload: {
  audioBase64: string
  mimeType: string
  language?: string
}): Promise<TranscriptionResult> {
  return apiPost<TranscriptionResult>('/v1/tarteel/transcribe', payload)
}
