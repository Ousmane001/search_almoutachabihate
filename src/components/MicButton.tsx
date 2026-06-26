interface MicButtonProps {
  isRecording: boolean
  isTranscribing: boolean
  onPress: () => void
}

export function MicButton({ isRecording, isTranscribing, onPress }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={isTranscribing}
      aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement vocal'}
      className={`relative flex items-center justify-center w-28 h-28 rounded-full shadow-lg transition-colors duration-200 ${
        isRecording ? 'bg-red-600' : 'bg-primary hover:bg-primary-dark'
      } ${isTranscribing ? 'opacity-60 cursor-wait' : ''}`}
    >
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
      )}
      {isTranscribing ? (
        <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="relative h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
    </button>
  )
}
