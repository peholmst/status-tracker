import { useEffect, useState } from 'react'

export const LANGUAGES = ['fi', 'sv'] as const
export type Language = (typeof LANGUAGES)[number]

const STORAGE_KEY = 'statusTracker.language'

export const MESSAGES = {
  fi: {
    clear: 'TYHJENNÄ',
    confirmClear: 'PAINA UUDELLEEN TYHJENTÄÄKSESI',
    log: 'Loki',
    logEmpty: 'Ei tallennettuja aikaleimoja.',
    language: 'Kieli',
  },
  sv: {
    clear: 'RENSA',
    confirmClear: 'TRYCK IGEN FÖR ATT RENSA',
    log: 'Logg',
    logEmpty: 'Inga tidsstämplar registrerade.',
    language: 'Språk',
  },
} satisfies Record<Language, Record<string, string>>

function initialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fi' || stored === 'sv') return stored
  } catch {
    // Storage unavailable; fall back to the browser language.
  }
  return navigator.language.toLowerCase().startsWith('sv') ? 'sv' : 'fi'
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Ignore; the choice just won't persist.
    }
  }, [language])

  return { language, setLanguage, t: MESSAGES[language] }
}
