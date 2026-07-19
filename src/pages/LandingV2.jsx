import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { VERT } from '../constants'

/*
 * LandingV2 — « la barre de commande est la page » (Sprint 1 UI/UX).
 * Un seul élément central : décrire son projet ou déposer un plan.
 * L'authentification n'intervient qu'au moment de générer (friction
 * après la valeur). L'ancienne landing reste sur /landing.
 */

const EXAMPLES = [
  { label: 'Immeuble R+8 à Dakar', prompt: 'Immeuble résidentiel R+8 avec sous-sol parking à Dakar, 32 logements, portée max 6 m' },
  { label: 'Villa R+1 à Saly', prompt: 'Villa R+1 de 250 m² à Saly, 4 chambres, piscine, terrasse accessible' },
  { label: 'Audit EDGE d’une école', prompt: 'Audit de rénovation EDGE d’une école de 2 400 m² à Thiès (climatisation, éclairage, eau)', route: '/retrofit' },
]

export default function LandingV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const start = (text, file, route) => {
    // La valeur d'abord : on mémorise l'intention, ProtectedRoute gère
    // la connexion si nécessaire, puis NewProject retrouve le contexte.
    if (text) sessionStorage.setItem('tijan_intent_prompt', text)
    if (file) sessionStorage.setItem('tijan_intent_filename', file.name)
    navigate(route || '/projects/new', { state: { prompt: text, fileName: file?.name } })
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) start(prompt, f)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAF8', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header minimal — logo + accès compte, rien d'autre */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px' }}>
        <span style={{ fontWeight: 800, fontSize: 18, color: VERT, letterSpacing: 0.3 }}>TIJAN AI</span>
        <button onClick={() => navigate(user ? '/dashboard' : '/login')}
          style={{ background: 'none', border: '1px solid #DDD', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer', color: '#333' }}>
          {user ? 'Mes projets' : 'Se connecter'}
        </button>
      </header>

      {/* Cœur de page — la barre de commande */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', marginTop: -40 }}>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#1B2A4A', textAlign: 'center', marginBottom: 10 }}>
          Que construisons-nous aujourd&rsquo;hui&nbsp;?
        </h1>
        <p style={{ color: '#666', fontSize: 15, textAlign: 'center', marginBottom: 28 }}>
          Notes de calcul, plans BA, MEP et BOQ — Eurocodes, en quelques minutes.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          style={{
            width: '100%', maxWidth: 720, background: '#FFF',
            border: dragOver ? `2px dashed ${VERT}` : '1px solid #E2E2DE',
            borderRadius: 16, boxShadow: '0 4px 24px rgba(27,42,74,0.07)',
            padding: '18px 18px 12px', transition: 'border .15s',
          }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) { e.preventDefault(); start(prompt.trim()) } }}
            placeholder="Décris ton projet… ou dépose ton plan (DWG, DXF, PDF) ici"
            rows={3}
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 16, color: '#222', background: 'transparent', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button onClick={() => fileRef.current?.click()}
              style={{ background: 'none', border: 'none', color: '#777', fontSize: 13.5, cursor: 'pointer', padding: '6px 8px' }}>
              📎 Joindre un plan
            </button>
            <input ref={fileRef} type="file" accept=".dwg,.dxf,.pdf,.ifc" hidden
              onChange={(e) => e.target.files?.[0] && start(prompt, e.target.files[0])} />
            <button onClick={() => prompt.trim() && start(prompt.trim())}
              disabled={!prompt.trim()}
              style={{
                background: prompt.trim() ? VERT : '#D8D8D4', color: '#FFF', border: 'none',
                borderRadius: 10, padding: '10px 22px', fontSize: 15, fontWeight: 600,
                cursor: prompt.trim() ? 'pointer' : 'default', transition: 'background .15s',
              }}>
              Générer le dossier →
            </button>
          </div>
        </div>

        {/* Exemples cliquables — chacun préremplit un vrai projet */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} onClick={() => start(ex.prompt, null, ex.route)}
              style={{
                background: '#FFF', border: '1px solid #E2E2DE', borderRadius: 999,
                padding: '8px 16px', fontSize: 13.5, color: '#444', cursor: 'pointer',
              }}>
              {ex.label}
            </button>
          ))}
        </div>

        {/* Une ligne de réassurance — engagement, pas excuse */}
        <p style={{ marginTop: 26, fontSize: 13, color: '#8A8A85', textAlign: 'center' }}>
          Eurocodes EC2/EC8 &nbsp;·&nbsp; Sénégal, Côte d&rsquo;Ivoire, Ghana, Nigeria &nbsp;·&nbsp; chaque dossier vérifié par un ingénieur structure habilité
        </p>
      </main>

      {/* Footer minimal — tout le reste vit sur des pages secondaires */}
      <footer style={{ display: 'flex', gap: 22, justifyContent: 'center', padding: '20px 0 26px', fontSize: 13, color: '#999' }}>
        <a href="/pricing" style={{ color: '#999', textDecoration: 'none' }}>Tarifs</a>
        <a href="/impact" style={{ color: '#999', textDecoration: 'none' }}>Impact</a>
        <a href="/landing" style={{ color: '#999', textDecoration: 'none' }}>En savoir plus</a>
        <a href="/cgu" style={{ color: '#999', textDecoration: 'none' }}>CGU</a>
      </footer>
    </div>
  )
}
