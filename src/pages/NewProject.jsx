import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'
import { BACKEND, VERT, GRIS2 } from '../constants'
import { useLang } from '../i18n.jsx'

export default function NewProject() {
  const navigate = useNavigate()
  const { supabase, user } = useAuth()
  const { restants, consommer } = useCredits()
  const { t } = useLang()
  const [step, setStep] = useState('form')
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('Dakar')
  const [surfaceTerrain, setSurfaceTerrain] = useState('')
  const [mainFile, setMainFile] = useState(null)
  const [mainFiles, setMainFiles] = useState([])
  const [nbNiveaux, setNbNiveaux] = useState('')
  const [solFile, setSolFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const mainRef = useRef(null)
  const solRef = useRef(null)

  const [parseProgress, setParseProgress] = useState('')
  const loading = step === 'uploading' || step === 'calculating'
  const loadingText = step === 'uploading' ? (parseProgress || t('np_uploading')) : t('np_calculating')

  async function lancer() {
    if (!nom.trim()) { setErrorMsg(t('np_err_nom')); return }
    if (!ville.trim()) { setErrorMsg(t('np_err_ville')); return }
    if (!mainFile) { setErrorMsg(t('np_err_plans')); return }
    if (!surfaceTerrain) { setErrorMsg(t('np_err_surface')); return }
    setErrorMsg('')
    setStep('uploading')

    // Always send ONE file to /parse — the biggest one (most geometry)
    // For multi-DWG: nb_niveaux = user input or file count
    const allFiles = mainFiles.length > 1 ? mainFiles : [mainFile]
    const fileToSend = allFiles.length > 1
      ? [...allFiles].sort((a, b) => b.size - a.size)[0]
      : mainFile
    const userNiveaux = parseInt(nbNiveaux) || (allFiles.length > 1 ? allFiles.length : null)

    let parsed = {}
    try {
      setParseProgress(allFiles.length > 1
        ? `Analyse du plan principal (${fileToSend.name})... peut prendre 1-2 minutes`
        : 'Analyse du plan en cours...')

      const form = new FormData()
      form.append('file', fileToSend)
      form.append('ville', ville)
      if (userNiveaux) form.append('nb_niveaux', String(userNiveaux))
      const res = await fetch(`${BACKEND}/parse`, { method: 'POST', body: form })
      const data = await res.json()
      if (data.ok) parsed = data

      // Override nb_niveaux: user field > file count > parsed value
      if (userNiveaux) {
        parsed.nb_niveaux = userNiveaux
        if (parsed.donnees_moteur) parsed.donnees_moteur.nb_niveaux = userNiveaux
      }
      setParseProgress('')
    } catch {}

    // Priorité : surface terrain saisie × 0.70, sauf si le parser extrait une emprise réaliste
    const terrainCalc = Math.round(parseFloat(surfaceTerrain) * 0.70)
    const parsedEmprise = parseFloat(parsed.surface_emprise_m2) || 0
    const surface_emprise_m2 = terrainCalc > 0 ? terrainCalc : (parsedEmprise > 100 ? parsedEmprise : 500)

    let sol_context = undefined
    if (solFile) {
      try {
        const sf = new FormData()
        sf.append('file', solFile)
        const sr = await fetch(`${BACKEND}/parse-sol`, { method: 'POST', body: sf })
        const sd = await sr.json()
        if (sd.ok) sol_context = JSON.stringify(sd)
      } catch {}
    }

    setStep('calculating')
    const payload = {
      nom: nom.trim(), ville: ville.trim(), pays: 'Senegal',
      usage: 'residentiel',
      nb_niveaux: Math.min(Math.max(parseInt(parsed.nb_niveaux) || 5, 2), 20),
      hauteur_etage_m: parseFloat(parsed.hauteur_etage_m) || 3.0,
      surface_emprise_m2: Math.min(Math.max(surface_emprise_m2, 50), 10000),
      portee_max_m: Math.min(Math.max(parseFloat(parsed.portee_max_m) || 6.0, 3), 12),
      portee_min_m: Math.min(Math.max(parseFloat(parsed.portee_min_m) || 4.5, 3), 12),
      nb_travees_x: parseInt(parsed.nb_travees_x) || 4,
      nb_travees_y: parseInt(parsed.nb_travees_y) || 3,
      surface_terrain_m2: parseFloat(surfaceTerrain),
    }
    if (sol_context) payload.sol_context = sol_context
    if (parsed.urn) payload.urn = parsed.urn
    // Store DWG geometry for plan generation
    const dwgGeometry = parsed.dwg_geometry || null

    try {
      const res = await fetch(`${BACKEND}/calculate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const resultats = await res.json()
      if (!resultats.ok) { setStep('error'); setErrorMsg(t('np_err_calcul')); return }
      // Sauvegarder dans Supabase AVANT de consommer le crédit
      let projectId = Date.now()
      if (user && supabase) {
        const { data: saved, error: saveErr } = await supabase.from('projets').insert({
          user_id: user.id,
          nom: payload.nom || nom,
          ville: payload.ville || ville,
          pays: payload.pays || 'Senegal',
          nb_niveaux: payload.nb_niveaux,
          surface_emprise_m2: payload.surface_emprise_m2,
          portee_max_m: payload.portee_max_m,
          portee_min_m: payload.portee_min_m,
          nb_travees_x: payload.nb_travees_x,
          nb_travees_y: payload.nb_travees_y,
          usage: payload.usage || 'residentiel',
          urn: payload.urn || null,
          resultats_structure: resultats,
        }).select('id').maybeSingle()
        if (saveErr) {
          console.error('SUPABASE SAVE ERROR', saveErr)
          setStep('error'); setErrorMsg(t('np_err_save') || 'Erreur lors de la sauvegarde du projet. Réessayez.'); return
        }
        if (saved?.id) projectId = saved.id
        // Consommer un crédit seulement après sauvegarde réussie
        if (consommer) {
          const ok = await consommer()
          if (!ok && restants <= 0) {
            // Credit failed but project is saved — user can still access it
            console.warn('Credit deduction failed, project saved anyway')
          }
        }
      }
      navigate(`/projects/${projectId}/results`, { state: { params: payload, resultats, dwgGeometry } })
    } catch {
      setStep('error'); setErrorMsg(t('np_err_connexion'))
    }
  }

  const inp = { width: '100%', border: `0.5px solid ${GRIS2}`, borderRadius: 6, padding: '10px 12px', fontSize: 14, background: '#fff', color: '#111', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 24 }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '14px 24px', display: 'flex', alignItems: 'center', borderBottom: `0.5px solid ${GRIS2}`, background: '#fff', zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer' }}>{t('np_accueil')}</button>
        <img src="/tijan_logo.png" alt="Tijan AI" style={{ height: 26, objectFit: 'contain', marginLeft: 16 }} />
        <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>Engineering Intelligence for Africa</span>
      </div>

      <div style={{ width: '100%', maxWidth: 520, paddingTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#111', marginBottom: 8 }}>{t('np_titre')}</div>
          <div style={{ fontSize: 14, color: '#888' }}>{t('np_desc')}</div>
        </div>

        {!loading && step !== 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_nom')} *</label>
                <input value={nom} onChange={e => setNom(e.target.value)} placeholder="ex: Résidence Sakho" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_ville')} *</label>
                <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Dakar" style={inp} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_surface')} *</label>
              <input type="number" value={surfaceTerrain} onChange={e => setSurfaceTerrain(e.target.value)} placeholder="ex: 1400" style={inp} min="50" />
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{t('np_emprise_note')}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>Nombre de niveaux (R+?)</label>
              <input type="number" value={nbNiveaux} onChange={e => setNbNiveaux(e.target.value)} placeholder={mainFiles.length > 1 ? `${mainFiles.length} fichiers détectés` : "ex: 10 pour R+8 avec SS"} style={inp} min="2" max="40" />
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>SS + RDC + étages + terrasse. Laissez vide pour détection automatique.</div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_plans')} *</label>
              <div
                onClick={() => mainRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                  e.preventDefault(); setDragging(false)
                  const files = Array.from(e.dataTransfer.files)
                  if (files.length > 1) { setMainFiles(files); setMainFile(files[0]); if (!nbNiveaux) setNbNiveaux(String(files.length)) }
                  else if (files[0]) { setMainFile(files[0]); setMainFiles([]) }
                }}
                style={{ border: `2px dashed ${dragging ? VERT : mainFile ? VERT : GRIS2}`, borderRadius: 8, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: mainFile ? '#F0FAF1' : '#FAFAFA' }}
              >
                {mainFiles.length > 1
                  ? <div><div style={{ fontSize: 13, fontWeight: 500, color: VERT, marginBottom: 4 }}>✓ {mainFiles.length} fichiers DWG</div>{mainFiles.map((f,i) => <div key={i} style={{ fontSize: 10, color: '#888' }}>{f.name}</div>)}<div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Cliquez pour changer</div></div>
                  : mainFile
                    ? <div><div style={{ fontSize: 13, fontWeight: 500, color: VERT, marginBottom: 4 }}>✓ {mainFile.name}</div><div style={{ fontSize: 11, color: '#888' }}>Cliquez pour changer</div></div>
                    : <div><div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>{t('np_drop')}</div><div style={{ fontSize: 11, color: '#888' }}>PDF, DWG, DXF — un ou plusieurs fichiers</div></div>
                }
                <input ref={mainRef} type="file" accept=".pdf,.dwg,.dxf" multiple style={{ display: 'none' }} onChange={e => {
                  const files = Array.from(e.target.files || [])
                  if (files.length > 1) { setMainFiles(files); setMainFile(files[0]); if (!nbNiveaux) setNbNiveaux(String(files.length)) }
                  else if (files[0]) { setMainFile(files[0]); setMainFiles([]) }
                }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_sol')} <span style={{ color: '#aaa' }}>({t('np_sol_opt')})</span></label>
              <div onClick={() => solRef.current?.click()} style={{ border: `1px dashed ${solFile ? VERT : GRIS2}`, borderRadius: 8, padding: '14px 20px', textAlign: 'center', cursor: 'pointer', background: solFile ? '#F0FAF1' : '#FAFAFA' }}>
                {solFile ? <div style={{ fontSize: 12, color: VERT }}>✓ {solFile.name}</div> : <div style={{ fontSize: 12, color: '#aaa' }}>{t('np_sol_add')}</div>}
                <input ref={solRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setSolFile(f) }} />
              </div>
            </div>

            {errorMsg && <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{errorMsg}</div>}

            <button onClick={lancer} style={{ width: '100%', padding: 13, background: VERT, color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Lancer l'analyse
            </button>
            <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>{t('np_disclaimer')}</div>
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
            <button onClick={() => { setStep('form'); setErrorMsg('') }} style={{ padding: '10px 28px', background: VERT, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('np_reessayer')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
