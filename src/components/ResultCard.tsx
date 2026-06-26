import type { SearchResult } from '../lib/types'

interface ResultCardProps {
  result: SearchResult
}

/**
 * Carte de résultat en lecture seule : pas de navigation, pas de clic — ce
 * mini-projet est volontairement limité à la recherche, sans renvoyer vers
 * le lecteur du Coran.
 */
export function ResultCard({ result }: ResultCardProps) {
  return (
    <div className="w-full text-right rounded-xl border border-gold/25 bg-cream/60 px-4 py-3">
      <p dir="rtl" className="font-arabic text-xl leading-relaxed text-ink">
        {result.textUthmani}
      </p>
      <p className="mt-1 text-xs text-meta">
        {result.surahName} · verset {result.ayahNumber} · page {result.pageNumber} · juz {result.juzNumber}
      </p>
    </div>
  )
}
