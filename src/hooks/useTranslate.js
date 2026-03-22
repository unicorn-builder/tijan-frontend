// useTranslate.js — Traduction à la volée via Claude API
import { useState, useEffect, useRef } from 'react'
import { BACKEND } from '../constants'

const cache = {}

export function useTranslate() {
  const [lang, setLang] = useState(localStorage.getItem('tijan_lang') || 'fr')
  const [translations, setTranslations] = useState({})
  const pendingRef = useRef(new Set())
  const timerRef = useRef(null)

  useEffect(() => {
    const handler = () => {
      const newLang = localStorage.getItem('tijan_lang') || 'fr'
      setLang(newLang)
      if (newLang === 'fr') setTranslations({})
    }
    window.addEventListener('tijan_lang_change', handler)
    return () => window.removeEventListener('tijan_lang_change', handler)
  }, [])

  const batchTranslate = async (texts) => {
    // Filter out already cached
    const toTranslate = texts.filter(t => t && !cache[t])
    if (toTranslate.length === 0) return

    try {
      const res = await fetch(BACKEND + '/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: toTranslate, lang: 'en' }),
      })
      const data = await res.json()
      if (data.ok && data.translations) {
        const newCache = {}
        toTranslate.forEach((t, i) => {
          cache[t] = data.translations[i] || t
          newCache[t] = cache[t]
        })
        setTranslations(prev => ({ ...prev, ...newCache }))
      }
    } catch (e) {
      console.warn('Translation failed:', e)
    }
  }

  // t() function — returns translated text or original
  const t = (text) => {
    if (!text || lang === 'fr') return text
    if (cache[text]) return cache[text]
    
    // Queue for batch translation
    if (!pendingRef.current.has(text)) {
      pendingRef.current.add(text)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const batch = Array.from(pendingRef.current)
        pendingRef.current.clear()
        batchTranslate(batch)
      }, 300)
    }
    return translations[text] || text
  }

  return { lang, t }
}
