// TranslateBlock.jsx — Traduit tout le contenu en un seul appel Claude API, cache en localStorage
import { useState, useEffect, useRef } from 'react'
import { BACKEND } from '../constants'

const CACHE_PREFIX = 'tijan_tr_'

export default function TranslateBlock({ lang, children, cacheKey }) {
  const [ready, setReady] = useState(lang === 'fr')
  const [translating, setTranslating] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (lang === 'fr') {
      // Restore original texts
      restoreOriginals()
      setReady(true)
      return
    }

    // Check cache first
    const cached = localStorage.getItem(CACHE_PREFIX + cacheKey)
    if (cached) {
      try {
        applyTranslation(JSON.parse(cached))
        setReady(true)
        return
      } catch {}
    }

    // Translate all texts in one batch
    translateAll()
  }, [lang, cacheKey])

  const collectTexts = () => {
    if (!ref.current) return []
    const texts = []
    const seen = new Set()
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim()
      if (text && text.length > 1 && !seen.has(text) && !/^[\d.,\s%×+\-—→←↓⚡✓✗✅⚠●·:]+$/.test(text)) {
        // Skip numbers, units, and very short strings
        if (!/^[\d\s.,]+\s*(kVA|kW|m²|m³|mm|kg|FCFA|kN|%|M|cm²)?\.?$/.test(text)) {
          texts.push(text)
          seen.add(text)
        }
      }
    }
    return texts
  }

  const storeOriginals = () => {
    if (!ref.current) return
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      if (!walker.currentNode._original) {
        walker.currentNode._original = walker.currentNode.textContent
      }
    }
  }

  const restoreOriginals = () => {
    if (!ref.current) return
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      if (walker.currentNode._original) {
        walker.currentNode.textContent = walker.currentNode._original
      }
    }
  }

  const translateAll = async () => {
    if (!ref.current || translating) return
    storeOriginals()
    const texts = collectTexts()
    if (texts.length === 0) { setReady(true); return }

    setTranslating(true)
    try {
      const res = await fetch(BACKEND + '/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, lang: 'en' }),
      })
      const data = await res.json()
      if (data.ok && data.translations) {
        const map = {}
        texts.forEach((t, i) => { map[t] = data.translations[i] || t })
        // Cache in localStorage
        localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(map))
        applyTranslation(map)
      }
    } catch (e) {
      console.warn('Translation error:', e)
    }
    setTranslating(false)
    setReady(true)
  }

  const applyTranslation = (map) => {
    if (!ref.current) return
    storeOriginals()
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const original = walker.currentNode.textContent.trim()
      if (map[original]) {
        walker.currentNode.textContent = walker.currentNode.textContent.replace(original, map[original])
      }
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {translating && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 50,
          background: '#111', color: '#fff', borderRadius: 6,
          padding: '6px 14px', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid #fff', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
          Translating...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {children}
    </div>
  )
}
