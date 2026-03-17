import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BACKEND, VERT, GRIS2 } from '../constants'

export default function NewProject() {
  const navigate = useNavigate()
  const [step, setStep] = useState('form') // form | uploading | calculating | error
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('Dakar')
  const [surfaceTerrain, setSurfaceTerrain] = useState('')
  const [mainFile, setMainFile] = useState(null)
  const [solFile, setSolFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const mainRef = useRef(null)
  const solRef = useRef(null)

  const loading = step === 'uploading' || step === 'calculating'
  const loadingText = step === 'uploading' ? 'Lecture des plans...' : 'Tijan analyse votre projet...'

  async function lancer() {
    if (!nom.trim()) { setErrorMsg('Veuillez nommer votre projet.'); return }
    if (!ville.trim()) { setErrorMsg('Veuillez indiquer la ville.'); return }
    if (!mainFile) { setErrorMsg('Veuillez uploader vos plans.'); return }
    if (!surfaceTerrain) { setErrorMsg('Veuillez indiquer la surface du terrain.'); return }
    setErrorMsg('')
    setStep('uploading')

    // 1. Parse plans
    const form = new FormData()
    form.append('file', mainFile)
    form.append('ville', ville)
    let parsed = {}
    try {
      const res = await fetch(`${BACKEND}/parse`, { method: 'POST', body: form })
      const data = await res.json()
      if (data.ok) parsed = data
    } catch { /* silencieux */ }

    // Surface : depuis parsing si fiable (>100m²), sinon terrain * 0.70
    const surface_emprise_m2 = (parsed.surface_emprise_m2 && parsed.surface_emprise_m2 > 100)
      ? parseFloat(parsed.surface_emprise_m2)
      : Math.round(parseFloat(surfaceTerrain) * 0.70)

    // 2. Étude de sol optionnelle
    let sol_context = undefined
    if (solFile) {
      try {
        const sf = new FormData()
        sf.append('file', solFile)
        const sr = await fetch(`${BACKEND}/parse-sol`, { method: 'POST', body: sf })
        const sd = await sr.json()
        if (sd.ok) sol_context = JSON.stringify(sd)
      } catch { /* silencieux */ }
    }

    // 3. Construire payload
    setStep('calculating')
    const payload = {
      nom: nom.trim(),
      ville: ville.trim(),
      nb_niveaux: Math.min(Math.max(parseInt(parsed.nb_niveaux) || 5, 2), 20),
      hauteur_etage_m: parseFloat(parsed.hauteur_etage_m) || 3.0,
      surface_emprise_m2: Math.min(Math.max(surface_emprise_m2, 50), 10000),
      portee_max_m: Math.min(Math.max(parseFloat(parsed.portee_max_m) || 6.0, 3), 12),
      portee_min_m: Math.min(Math.max(parseFloat(parsed.portee_min_m) || 4.5, 3), 12),
      nb_travees_x: parseInt(parsed.nb_travees_x) || 4,
      nb_travees_y: parseInt(parsed.nb_travees_y) || 3,
      classe_beton: parsed.classe_beton || 'C30/37',
      classe_acier: parsed.classe_acier || 'HA500',
      pression_sol_MPa: parseFloat(parsed.pression_sol_MPa) || 0.15,
      surface_terrain_m2: parseFloat(surfaceTerrain),
    }
    if (sol_context) payload.sol_context = sol_context

    try {
      const res = await fetch(`${BACKEND}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const resultats = await res.json()
      if (!resultats.ok) { setStep('error'); setErrorMsg('Erreur lors du calcul.'); return }
      navigate(`/projects/${Date.now()}/results`, { state: { params: payload, resultats } })
    } catch {
      setStep('error')
      setErrorMsg('Erreur de connexion au moteur de calcul.')
    }
  }

  const inp = {
    width: '100%', border: `0.5px solid ${GRIS2}`, borderRadius: 6,
    padding: '10px 12px', fontSize: 14, background: '#fff', color: '#111',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 24 }}>
      {/* Nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '14px 24px', display: 'flex', alignItems: 'center', borderBottom: `0.5px solid ${GRIS2}`, background: '#fff', zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888' }}>← Accueil</button>
        <span style={{ fontWeight: 700, fontSize: 15, marginLeft: 16, color: '#111' }}><span style={{ color: VERT }}>Ÿ</span>IJAN AI</span>
        <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>Engineering Intelligence for Africa</span>
      </div>

      <div style={{ width: '100%', maxWidth: 520, paddingTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#111', marginBottom: 8 }}>Nouveau projet</div>
          <div style={{ fontSize: 14, color: '#888' }}>Nommez votre projet et déposez vos plans</div>
        </div>

        {!loading && step !== 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Nom + Ville */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>Nom du projet *</label>
                <input value={nom} onChange={e => setNom(e.target.value)} placeholder="ex: Résidence Sakho" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>Ville *</label>
                <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Dakar" style={inp} />
              </div>
            </div>

            {/* Surface terrain */}
            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>Surface du terrain (m²) *</label>
              <input
                type="number" value={surfaceTerrain}
                onChange={e => setSurfaceTerrain(e.target.value)}
                placeholder="ex: 1400" style={inp} min="50" max="50000"
              />
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>
                L'emprise bâtie sera estimée à 70% si non détectée depuis les plans.
              </div>
            </div>

            {/* Plans */}
            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>Plans architecturaux *</label>
              <div
                onClick={() => mainRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setMainFile(f) }}
                style={{
                  border: `2px dashed ${dragging ? VERT : mainFile ? VERT : GRIS2}`,
                  borderRadius: 8, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
                  background: mainFile ? '#F0FAF1' : dragging ? '#F5FFF6' : '#FAFAFA',
                }}
              >
                {mainFile ? (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: VERT, marginBottom: 4 }}>✓ {mainFile.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Cliquez pour changer</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Déposez vos plans ou cliquez pour choisir</div>
                    <div style={{ fontSize: 11, color: '#888' }}>PDF (vectoriel ou scanné), DWG, DXF</div>
                  </div>
                )}
                <input ref={mainRef} type="file" accept=".pdf,.dwg,.dxf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setMainFile(f) }} />
              </div>
            </div>

            {/* Étude de sol */}
            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>
                Étude de sol <span style={{ color: '#aaa' }}>(optionnel — PDF)</span>
              </label>
              <div
                onClick={() => solRef.current?.click()}
                style={{ border: `1px dashed ${solFile ? VERT : GRIS2}`, borderRadius: 8, padding: '14px 20px', textAlign: 'center', cursor: 'pointer', background: solFile ? '#F0FAF1' : '#FAFAFA' }}
              >
                {solFile
                  ? <div style={{ fontSize: 12, color: VERT }}>✓ {solFile.name}</div>
                  : <div style={{ fontSize: 12, color: '#aaa' }}>Ajouter une étude de sol (PDF)</div>
                }
                <input ref={solRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setSolFile(f) }} />
              </div>
            </div>

            {errorMsg && <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{errorMsg}</div>}

            <button onClick={lancer} style={{ width: '100%', padding: 13, background: VERT, color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600 }}>
              Lancer l'analyse
            </button>
            <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>
              Si vos plans ne sont pas lisibles automatiquement, l'analyse sera lancée avec des paramètres standards.
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${GRIS2}`, borderTop: `3px solid ${VERT}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ fontSize: 14, color: '#555' }}>{loadingText}</div>
          </div>
        )}

        {step === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>{errorMsg}</div>
            <button onClick={() => { setStep('form'); setErrorMsg('') }} style={{ padding: '10px 28px', background: VERT, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
