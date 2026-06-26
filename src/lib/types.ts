export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success?: false
  error: string
  message: string
  statusCode: number
}

export interface SearchResultWord {
  id: number
  ayah_id: number
  position: number
  text_uthmani: string
  text_normalized: string
  line_number: number
  char_type: string
  transliteration: string | null
  translation_fr: string | null
  translation_en: string | null
}

export interface SearchResult {
  ayahId: number
  surahId: number
  surahName: string
  surahNameEnglish: string
  ayahNumber: number
  pageNumber: number
  juzNumber: number
  hizbNumber: number
  textUthmani: string
  textSimple: string
  textNormalized: string
  score: number
  matchedWords: number[]
  nextAyahText: string | null
  words: SearchResultWord[]
}

export interface TranscriptionResult {
  text: string
  confidence: number
  engine: 'local' | 'remote'
}
