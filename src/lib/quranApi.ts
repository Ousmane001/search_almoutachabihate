import { apiGetEnvelope, apiPost } from './apiClient'
import type { SearchResponse, SearchResult, TranscriptionResult } from './types'

export async function searchQuran(query: string): Promise<SearchResponse> {
  const response = await apiGetEnvelope<SearchResult[]>('/v1/search', { q: query })
  return {
    results: response.data,
    totalApproximate: typeof response.meta?.totalApproximate === 'number' ? response.meta.totalApproximate : response.data.length,
  }
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
