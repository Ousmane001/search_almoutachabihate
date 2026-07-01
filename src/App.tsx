import { useEffect, useRef, useState } from 'react'
import { MicButton } from './components/MicButton'
import { ResultCard } from './components/ResultCard'
import { ApiClientError } from './lib/apiClient'
import { searchQuran } from './lib/quranApi'
import type { SearchResult } from './lib/types'
import { isVoiceSearchSupported, VoiceSearchRecorder } from './services/voiceSearch'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const recorderRef = useRef<VoiceSearchRecorder | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setResultCount(null)
      setSearchError(null)
      return
    }

    let cancelled = false
    setIsSearching(true)
    setSearchError(null)

    const timer = setTimeout(() => {
      searchQuran(trimmed)
        .then((response) => {
          if (!cancelled) {
            setResults(response.results)
            setResultCount(response.totalApproximate)
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) setSearchError(err instanceof ApiClientError ? err.message : 'Recherche indisponible')
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false)
        })
    }, 280)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const handleMicPress = async () => {
    if (isTranscribing) return

    if (!isRecording) {
      try {
        const recorder = new VoiceSearchRecorder()
        await recorder.start()
        recorderRef.current = recorder
        setIsRecording(true)
        setMicError(null)
      } catch (err) {
        setMicError(err instanceof Error ? err.message : 'Microphone indisponible')
      }
      return
    }

    setIsRecording(false)
    const recorder = recorderRef.current
    recorderRef.current = null
    if (!recorder) return

    setIsTranscribing(true)
    try {
      const transcript = await recorder.stopAndTranscribe()
      if (transcript) setQuery(transcript)
      else setMicError('Aucune parole détectée, réessayez.')
    } catch (err) {
      setMicError(err instanceof Error ? err.message : 'Transcription indisponible')
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen items-center px-4 py-10">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-primary-darker">Recherche vocale du Coran</h1>
        <p className="mt-1 text-sm text-meta">Récitez un verset, on retrouve l'occurrence.</p>
      </header>

      <div className="flex flex-col items-center gap-4 mb-8">
        {isVoiceSearchSupported() ? (
          <MicButton isRecording={isRecording} isTranscribing={isTranscribing} onPress={handleMicPress} />
        ) : (
          <p className="text-sm text-red-700 max-w-xs text-center">
            Ce navigateur ne supporte pas la capture micro (MediaRecorder).
          </p>
        )}
        {isRecording && <p className="text-sm text-red-600">Enregistrement… appuyez à nouveau pour arrêter</p>}
        {isTranscribing && <p className="text-sm text-meta">Transcription en cours…</p>}
        {micError && <p className="text-sm text-red-700 max-w-xs text-center">{micError}</p>}
      </div>

      <div className="w-full max-w-2xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Le texte détecté apparaît ici — modifiable…"
          dir="rtl"
          className="w-full rounded-2xl bg-cream px-4 py-3 text-lg font-arabic outline-none placeholder:font-sans placeholder:text-sm placeholder:text-meta text-ink shadow-[0_2px_6px_rgba(184,150,10,0.18)]"
        />
      </div>

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-2">
        {!isSearching && !searchError && query.trim().length >= 2 && resultCount !== null && (
          <p className="text-center text-meta text-sm py-2">
            {resultCount} occurrence{resultCount > 1 ? 's' : ''} trouvée{resultCount > 1 ? 's' : ''}
          </p>
        )}
        {isSearching && <p className="text-center text-meta text-sm py-4">Recherche en cours…</p>}
        {searchError && <p className="text-center text-red-700 text-sm py-4">{searchError}</p>}
        {!isSearching && !searchError && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-center text-meta text-sm py-4">Aucun résultat pour « {query} ».</p>
        )}
        {results.map((result) => (
          <ResultCard key={result.ayahId} result={result} />
        ))}
      </div>
    </div>
  )
}

export default App
