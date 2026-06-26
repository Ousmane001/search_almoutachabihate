import { transcribeAudio } from '../lib/quranApi'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result.split(',')[1] ?? '')
      } else {
        reject(new Error("Impossible de lire l'enregistrement audio"))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error("Impossible de lire l'enregistrement audio"))
    reader.readAsDataURL(blob)
  })
}

function pickSupportedMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  for (const candidate of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(candidate)) {
      return candidate
    }
  }
  return 'audio/webm'
}

export function isVoiceSearchSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined'
}

/**
 * Capture vocale ponctuelle (un seul clip) : enregistre jusqu'à l'appel de
 * `stopAndTranscribe()`, puis transcrit via l'API.
 */
export class VoiceSearchRecorder {
  private stream: MediaStream | null = null
  private recorder: MediaRecorder | null = null
  private chunks: BlobPart[] = []
  private readonly mimeType = pickSupportedMimeType()

  async start(): Promise<void> {
    if (!isVoiceSearchSupported()) {
      throw new Error('La recherche vocale nécessite un navigateur avec accès au microphone.')
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
    })
    this.chunks = []

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(this.stream, { mimeType: this.mimeType })
    } catch {
      recorder = new MediaRecorder(this.stream)
    }
    this.recorder = recorder
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data)
    }
    recorder.start()
  }

  /** Arrête l'enregistrement, transcrit le clip, et retourne le texte détecté (ou null). */
  async stopAndTranscribe(): Promise<string | null> {
    const recorder = this.recorder
    if (!recorder) return null

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(this.chunks, { type: recorder.mimeType || this.mimeType }))
      if (recorder.state !== 'inactive') recorder.stop()
      else resolve(new Blob(this.chunks, { type: recorder.mimeType || this.mimeType }))
    })

    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.recorder = null

    if (blob.size < 2_000) return null

    const audioBase64 = await blobToBase64(blob)
    const result = await transcribeAudio({
      audioBase64,
      mimeType: blob.type || this.mimeType,
      language: 'ar',
    })
    return result.text?.trim() || null
  }

  cancel(): void {
    try {
      if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop()
    } catch {
      /* déjà arrêté */
    }
    this.recorder = null
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
  }
}
