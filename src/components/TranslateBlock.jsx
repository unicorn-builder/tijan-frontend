// TranslateBlock.jsx — Traduit un bloc de contenu via Claude API
import { useState, useEffect, useRef } from 'react'
import { BACKEND } from '../constants'

const cache = {}

export default function TranslateBlock({ lang, children, cacheKey }) {
  const [translated, setTranslated] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (lang === 'fr' || !ref.current) {
      setTranslated(null)
      return
    }

    const key = cacheKey || ref.current.innerText?.slice(0, 100)
    if (cache[key]) {
      applyTranslation(cache[key])
      return
    }

    // Collect all text nodes
    const texts = []
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim()
      if (text && text.length > 1 && !/^[\d.,\s%×+\-—→←↓⚡✓✗✅⚠●]+$/.test(text)) {
        texts.push(text)
      }
    }

    if (texts.length === 0) return

    // Batch translate
    fetch(BACKEND + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, lang: 'en' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.translations) {
          const map = {}
          texts.forEach((t, i) => { map[t] = data.translations[i] || t })
          cache[key] = map
          applyTranslation(map)
        }
      })
      .catch(() => {})
  }, [lang, cacheKey])

  const applyTranslation = (map) => {
    if (!ref.current) return
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const original = walker.currentNode.textContent.trim()
      if (map[original]) {
        walker.currentNode.textContent = walker.currentNode.textContent.replace(original, map[original])
      }
    }
    setTranslated(true)
  }

  return <div ref={ref}>{children}</div>
}
