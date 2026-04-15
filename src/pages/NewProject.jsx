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
  // Parallel array of level labels, one per entry in mainFiles
  // Values: "SOUS_SOL" | "RDC" | "ETAGE_1".."ETAGE_40" | "TERRASSE" | "" (auto)
  const [mainLevels, setMainLevels] = useState([])
  const [nbNiveaux, setNbNiveaux] = useState('')
  const [nbLogements, setNbLogements] = useState('')
  const [solFile, setSolFile] = useState(null)
  // EDGE Assessment optional inputs
  const [edgeOpen, setEdgeOpen] = useState(false)
  const [costConstr, setCostConstr] = useState('')
  const [saleValue, setSaleValue] = useState('')
  const [poolM2, setPoolM2] = useState('')
  const [irrigM2, setIrrigM2] = useState('')
  const [carWash, setCarWash] = useState(false)
  const [washClothes, setWashClothes] = useState(true)
  const [dishwasher, setDishwasher] = useState(false)
  const [nbSousSols, setNbSousSols] = useState('')
  const [typosText, setTyposText] = useState('') // CSV: "name,bedrooms,area,units,occupancy" per line
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const mainRef = useRef(null)
  const solRef = useRef(null)

  const [parseProgress, setParseProgress] = useState('')

  // Guess level label from filename — same heuristic as backend _classify_level_from_name
  function guessLevelFromName(fname, idx) {
    const u = (fname || '').toUpperCase()
    if (/SOUS[\s-]?SOL|PARKING|BASEMENT/.test(u)) return 'SOUS_SOL'
    if (/REZ|RDC|GROUND/.test(u)) return 'RDC'
    if (/TERRASSE|ROOFTOP|TOITURE/.test(u)) return 'TERRASSE'
    const m = u.match(/(?:ETAGE|FLOOR|LEVEL)[^0-9]*(\d{1,2})/)
    if (m) return `ETAGE_${parseInt(m[1])}`
    // Common defaults by index order: RDC, ETAGE_1, ETAGE_2, ..., TERRASSE
    if (idx === 0) return 'RDC'
    return `ETAGE_${idx}`
  }
  function autoLevels(files) {
    return files.map((f, i) => guessLevelFromName(f.name, i))
  }
  const LEVEL_OPTIONS = (() => {
    const out = [
      { v: 'SOUS_SOL', label: 'Sous-sol' },
      { v: 'RDC', label: 'RDC' },
    ]
    for (let k = 1; k <= 40; k++) out.push({ v: `ETAGE_${k}`, label: `Étage ${k}` })
    out.push({ v: 'TERRASSE', label: 'Terrasse' })
    return out
  })()
  const loading = step === 'uploading' || step === 'calculating'
  const loadingText = step === 'uploading' ? (parseProgress || t('np_uploading')) : t('np_calculating')
  const [creditWarningShown, setCreditWarningShown] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function prepareLancer() {
    // Same up-front validations as lancer() so we don't open the modal if the form is invalid
    if (!nom.trim()) { setErrorMsg(t('np_err_nom')); return }
    if (!ville.trim()) { setErrorMsg(t('np_err_ville')); return }
    if (!mainFile) { setErrorMsg(t('np_err_plans')); return }
    if (!surfaceTerrain) { setErrorMsg(t('np_err_surface')); return }
    if (!nbLogements || parseInt(nbLogements) < 1) { setErrorMsg(t('np_err_logements')); return }
    if (restants < 1) {
      setErrorMsg(t('np_credits_insufficient'))
      setTimeout(() => navigate('/pricing'), 1500)
      return
    }
    setErrorMsg('')
    setShowConfirm(true)
  }

  async function lancer() {
    if (!nom.trim()) { setErrorMsg(t('np_err_nom')); return }
    if (!ville.trim()) { setErrorMsg(t('np_err_ville')); return }
    if (!mainFile) { setErrorMsg(t('np_err_plans')); return }
    if (!surfaceTerrain) { setErrorMsg(t('np_err_surface')); return }
    if (!nbLogements || parseInt(nbLogements) < 1) { setErrorMsg(t('np_err_logements')); return }

    // Check if user has sufficient credits (1 required)
    if (restants < 1) {
      setErrorMsg(t('np_credits_insufficient'))
      if (!creditWarningShown) {
        setCreditWarningShown(true)
        // Auto-redirect to pricing after 2 seconds
        setTimeout(() => {
          navigate('/pricing')
        }, 2000)
      }
      return
    }
    setErrorMsg('')
    setStep('uploading')

    // Multi-DWG: one file per level → /parse-multi returns dwg_geometry dict keyed by level.
    // Single DWG/PDF: /parse as before (single geometry).
    const allFiles = mainFiles.length > 1 ? mainFiles : [mainFile]
    const userNiveaux = parseInt(nbNiveaux) || (allFiles.length > 1 ? allFiles.length : null)

    let parsed = {}
    try {
      if (allFiles.length > 1) {
        setParseProgress(`Analyse de ${allFiles.length} plans... peut prendre 1-3 minutes`)
        const form = new FormData()
        for (const f of allFiles) form.append('files', f)
        // Parallel level labels (one per file, same order)
        const labels = (mainLevels && mainLevels.length === allFiles.length)
          ? mainLevels
          : autoLevels(allFiles)
        for (const lv of labels) form.append('levels', lv || '')
        form.append('ville', ville)
        if (userNiveaux) form.append('nb_niveaux', String(userNiveaux))
        const res = await fetch(`${BACKEND}/parse-multi`, { method: 'POST', body: form })
        const data = await res.json()
        if (data.ok) parsed = data
        // Async APS path: poll job status until done
        if (data.ok && data.async && data.job_id) {
          const jobId = data.job_id
          for (let i = 0; i < 240; i++) { // up to ~12 min
            await new Promise(r => setTimeout(r, 3000))
            try {
              const pr = await fetch(`${BACKEND}/parse-status/${jobId}`)
              const pd = await pr.json()
              setParseProgress(`Analyse (${pd.progress || '...'})`)
              if (pd.status === 'done' && pd.result) { parsed = pd.result; break }
              if (pd.status === 'error') { break }
            } catch {}
          }
        }
      } else {
        const fileToSend = mainFile
        setParseProgress('Analyse du plan en cours...')
        const form = new FormData()
        form.append('file', fileToSend)
        form.append('ville', ville)
        if (userNiveaux) form.append('nb_niveaux', String(userNiveaux))
        const res = await fetch(`${BACKEND}/parse`, { method: 'POST', body: form })
        const data = await res.json()
        if (data.ok) parsed = data
      }

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
      nb_logements: parseInt(nbLogements),
    }
    // EDGE optional inputs (only include if user provided)
    if (costConstr) payload.cost_construction_xof_m2 = parseFloat(costConstr)
    if (saleValue) payload.sale_value_xof_m2 = parseFloat(saleValue)
    if (poolM2) payload.pool_m2 = parseFloat(poolM2)
    if (irrigM2) payload.irrigated_area_m2 = parseFloat(irrigM2)
    if (nbSousSols) payload.nb_sous_sols = parseInt(nbSousSols)
    payload.car_wash = carWash
    payload.washing_clothes = washClothes
    payload.dishwasher = dishwasher
    // Parse typologies (one per line: "name,bedrooms,area,units,occupancy")
    if (typosText.trim()) {
      const typos = typosText.trim().split('\n').map(line => {
        const parts = line.split(',').map(s => s.trim())
        if (parts.length < 5) return null
        const area = parseFloat(parts[2]) || 0
        return {
          name: parts[0], bedrooms: parseInt(parts[1]) || 0,
          area, units: parseInt(parts[3]) || 1, occupancy: parseInt(parts[4]) || 2,
          bedroom_m2: Math.round(area * 0.35 * 10) / 10,
          kitchen_m2: Math.round(area * 0.10 * 10) / 10,
          dining_m2: Math.round(area * 0.08 * 10) / 10,
          living_m2: Math.round(area * 0.15 * 10) / 10,
          toilet_m2: Math.round(area * 0.08 * 10) / 10,
          utility_m2: Math.round(area * 0.04 * 10) / 10,
          balcony_m2: Math.round(area * 0.08 * 10) / 10,
          parking_m2: 12.5,
          corridor_m2: Math.round(area * 0.12 * 10) / 10,
        }
      }).filter(Boolean)
      if (typos.length) payload.typologies = typos
    }
    if (sol_context) payload.sol_context = sol_context
    if (parsed.urn) payload.urn = parsed.urn
    // Store DWG geometry and references for plan generation
    const dwgGeometry = parsed.dwg_geometry || null
    const archiPdfRef = parsed.archi_pdf_ref || null
    const geomRef = parsed.geom_ref || null

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
          nb_logements: payload.nb_logements,
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
          console.error('SUPABASE SAVE ERROR', saveErr.message, saveErr.code, saveErr.details, saveErr.hint)
          setStep('error'); setErrorMsg(`${t('np_err_save')} (${saveErr.code || saveErr.message})`); return
        }
        if (!saved?.id) {
          // RLS policy may silently block inserts — no error but no data returned
          console.error('SUPABASE SAVE: no row returned — likely RLS policy blocking insert. user_id:', user.id)
          setStep('error'); setErrorMsg(`${t('np_err_save')} (RLS)`); return
        }
        projectId = saved.id
        // Consommer 1 crédit — si la décrémentation échoue, rollback du projet.
        // Pas de fallback silencieux : un projet sans crédit est un trou de caisse.
        if (consommer) {
          const ok = await consommer(1)
          if (!ok) {
            console.error('Credit deduction failed — rolling back project', projectId)
            await supabase.from('projets').delete().eq('id', projectId)
            setStep('error')
            setErrorMsg(t('np_credits_insufficient'))
            setTimeout(() => navigate('/pricing'), 2000)
            return
          }
        }
        // Persist archi PDF to Supabase Storage + geometry to projets row
        // so plan generation works even after server redeploys wipe /tmp
        try {
          const extras = {}
          // Upload the original archi PDF to Supabase Storage
          if (mainFile && mainFile.name.toLowerCase().endsWith('.pdf')) {
            const storagePath = `archi_pdfs/${projectId}/${mainFile.name}`
            const { error: upErr } = await supabase.storage.from('project-files').upload(storagePath, mainFile, { upsert: true })
            if (!upErr) {
              const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(storagePath)
              if (urlData?.publicUrl) extras.archi_pdf_url = urlData.publicUrl
            }
          }
          // Save extracted geometry (compact: only walls + rooms + axes per level)
          if (dwgGeometry && typeof dwgGeometry === 'object') {
            extras.dwg_geometry = dwgGeometry
          }
          // Save EDGE optional inputs as jsonb blob
          const edgeExtras = {}
          if (payload.cost_construction_xof_m2) edgeExtras.cost_construction_xof_m2 = payload.cost_construction_xof_m2
          if (payload.sale_value_xof_m2) edgeExtras.sale_value_xof_m2 = payload.sale_value_xof_m2
          if (payload.pool_m2) edgeExtras.pool_m2 = payload.pool_m2
          if (payload.irrigated_area_m2) edgeExtras.irrigated_area_m2 = payload.irrigated_area_m2
          if (payload.nb_sous_sols) edgeExtras.nb_sous_sols = payload.nb_sous_sols
          edgeExtras.car_wash = payload.car_wash
          edgeExtras.washing_clothes = payload.washing_clothes
          edgeExtras.dishwasher = payload.dishwasher
          if (payload.typologies) edgeExtras.typologies = payload.typologies
          if (Object.keys(edgeExtras).length > 0) extras.edge_extras = edgeExtras
          if (Object.keys(extras).length > 0) {
            const { error: updErr } = await supabase.from('projets').update(extras).eq('id', projectId)
            if (updErr) console.warn('Update extras failed:', updErr.message, updErr.code)
          }
        } catch (e) {
          console.warn('Non-critical: failed to persist geometry/PDF', e)
        }
      }
      navigate(`/projects/${projectId}/results`, { state: { params: payload, resultats, dwgGeometry, archiPdfRef, geomRef } })
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
                <input value={nom} onChange={e => setNom(e.target.value)} placeholder={t('np_placeholder_nom')} style={inp} />
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_niveaux')}</label>
                <input type="number" value={nbNiveaux} onChange={e => setNbNiveaux(e.target.value)} placeholder={mainFiles.length > 1 ? `${mainFiles.length} ${t('np_fichiers')}` : t('np_niveaux_ph')} style={inp} min="2" max="40" />
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{t('np_niveaux_note')}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_logements')} *</label>
                <input type="number" value={nbLogements} onChange={e => setNbLogements(e.target.value)} placeholder="ex: 33" style={inp} min="1" max="500" />
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{t('np_logements_note')}</div>
              </div>
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
                  if (files.length > 1) { setMainFiles(files); setMainFile(files[0]); setMainLevels(autoLevels(files)); if (!nbNiveaux) setNbNiveaux(String(files.length)) }
                  else if (files[0]) { setMainFile(files[0]); setMainFiles([]); setMainLevels([]) }
                }}
                style={{ border: `2px dashed ${dragging ? VERT : mainFile ? VERT : GRIS2}`, borderRadius: 8, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: mainFile ? '#F0FAF1' : '#FAFAFA' }}
              >
                {mainFiles.length > 1
                  ? <div><div style={{ fontSize: 13, fontWeight: 500, color: VERT, marginBottom: 4 }}>✓ {mainFiles.length} fichiers DWG</div>{mainFiles.map((f,i) => <div key={i} style={{ fontSize: 10, color: '#888' }}>{f.name}</div>)}<div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Cliquez pour changer</div></div>
                  : mainFile
                    ? <div><div style={{ fontSize: 13, fontWeight: 500, color: VERT, marginBottom: 4 }}>✓ {mainFile.name}</div><div style={{ fontSize: 11, color: '#888' }}>Cliquez pour changer</div></div>
                    : <div><div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>{t('np_drop')}</div><div style={{ fontSize: 11, color: '#888' }}>{t('np_drop_hint')}</div></div>
                }
                <input ref={mainRef} type="file" accept=".pdf,.dwg,.dxf" multiple style={{ display: 'none' }} onChange={e => {
                  const files = Array.from(e.target.files || [])
                  if (files.length > 1) { setMainFiles(files); setMainFile(files[0]); setMainLevels(autoLevels(files)); if (!nbNiveaux) setNbNiveaux(String(files.length)) }
                  else if (files[0]) { setMainFile(files[0]); setMainFiles([]); setMainLevels([]) }
                }} />
              </div>
            </div>

            {mainFiles.length > 1 && (
              <div style={{ border: `1px solid ${GRIS2}`, borderRadius: 8, padding: 12, background: '#FAFAFA' }}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 8, fontWeight: 500 }}>
                  Niveau de chaque fichier
                  <span style={{ color: '#aaa', fontWeight: 400 }}> — auto-détecté, modifiable</span>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {mainFiles.map((f, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</div>
                      <select
                        value={(mainLevels[i] || guessLevelFromName(f.name, i))}
                        onChange={e => {
                          const v = e.target.value
                          setMainLevels(prev => {
                            const next = [...prev]
                            while (next.length < mainFiles.length) next.push('')
                            next[i] = v
                            return next
                          })
                        }}
                        style={{ padding: '6px 8px', border: `1px solid ${GRIS2}`, borderRadius: 6, fontSize: 12, background: '#fff' }}
                      >
                        {LEVEL_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{t('np_sol')} <span style={{ color: '#aaa' }}>({t('np_sol_opt')})</span></label>
              <div onClick={() => solRef.current?.click()} style={{ border: `1px dashed ${solFile ? VERT : GRIS2}`, borderRadius: 8, padding: '14px 20px', textAlign: 'center', cursor: 'pointer', background: solFile ? '#F0FAF1' : '#FAFAFA' }}>
                {solFile ? <div style={{ fontSize: 12, color: VERT }}>✓ {solFile.name}</div> : <div style={{ fontSize: 12, color: '#aaa' }}>{t('np_sol_add')}</div>}
                <input ref={solRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setSolFile(f) }} />
              </div>
            </div>

            <div style={{ border: `1px solid ${GRIS2}`, borderRadius: 8, background: '#FAFAFA' }}>
              <div onClick={() => setEdgeOpen(!edgeOpen)} style={{ padding: '12px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#444', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('np_edge_titre')}</span>
                <span style={{ color: '#888' }}>{edgeOpen ? '−' : '+'}</span>
              </div>
              {edgeOpen && (
                <div style={{ padding: '0 14px 14px', display: 'grid', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#666' }}>{t('np_edge_typo')}</label>
                    <textarea value={typosText} onChange={e => setTyposText(e.target.value)} rows={3} placeholder="T3,2,75,12,4" style={{ width: '100%', padding: 8, border: `1px solid ${GRIS2}`, borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input type="number" value={costConstr} onChange={e => setCostConstr(e.target.value)} placeholder={t('np_edge_cost')} style={{ padding: 8, border: `1px solid ${GRIS2}`, borderRadius: 6, fontSize: 12 }} />
                    <input type="number" value={saleValue} onChange={e => setSaleValue(e.target.value)} placeholder={t('np_edge_sale')} style={{ padding: 8, border: `1px solid ${GRIS2}`, borderRadius: 6, fontSize: 12 }} />
                    <input type="number" value={poolM2} onChange={e => setPoolM2(e.target.value)} placeholder={t('np_edge_pool')} style={{ padding: 8, border: `1px solid ${GRIS2}`, borderRadius: 6, fontSize: 12 }} />
                    <input type="number" value={irrigM2} onChange={e => setIrrigM2(e.target.value)} placeholder={t('np_edge_irrig')} style={{ padding: 8, border: `1px solid ${GRIS2}`, borderRadius: 6, fontSize: 12 }} />
                    <input type="number" value={nbSousSols} onChange={e => setNbSousSols(e.target.value)} placeholder={t('np_edge_basements')} style={{ padding: 8, border: `1px solid ${GRIS2}`, borderRadius: 6, fontSize: 12 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#555', flexWrap: 'wrap' }}>
                    <label><input type="checkbox" checked={washClothes} onChange={e => setWashClothes(e.target.checked)} /> {t('np_edge_washer')}</label>
                    <label><input type="checkbox" checked={dishwasher} onChange={e => setDishwasher(e.target.checked)} /> {t('np_edge_dishw')}</label>
                    <label><input type="checkbox" checked={carWash} onChange={e => setCarWash(e.target.checked)} /> {t('np_edge_carwash')}</label>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{errorMsg}</div>}

            <button onClick={prepareLancer} style={{ width: '100%', padding: 13, background: VERT, color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {t('np_lancer')}
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

        {showConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '28px 26px', maxWidth: 420, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1B2A4A', marginBottom: 10 }}>
                {t('np_confirm_title')}
              </div>
              <div style={{ fontSize: 14, color: '#444', lineHeight: 1.55, marginBottom: 18 }}>
                {t('np_confirm_body_1')} <strong>1 {t('pr_credit')}</strong>. {t('np_confirm_body_2')} <strong>{Math.max(restants - 1, 0)}</strong>.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 12, background: '#fff', color: '#1B2A4A', border: '1.5px solid #1B2A4A', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {t('np_confirm_cancel')}
                </button>
                <button onClick={() => { setShowConfirm(false); lancer() }} style={{ flex: 1, padding: 12, background: VERT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {t('np_confirm_ok')}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
            <div style={{ fontSize: 15, color: '#111', fontWeight: 600, marginBottom: 10 }}>{t('np_err_titre')}</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 18 }}>{errorMsg}</div>
            <div style={{
              background: '#F7F8FA', border: '0.5px solid #E5E5E5', borderRadius: 10,
              padding: '16px 18px', fontSize: 13, color: '#333', textAlign: 'left',
              marginBottom: 20, lineHeight: 1.55,
            }}>
              <div style={{ fontWeight: 600, color: '#1B2A4A', marginBottom: 6 }}>{t('np_err_support_titre')}</div>
              <div>{t('np_err_support_body')}</div>
              <div style={{ marginTop: 8 }}>
                ✉️ <a href="mailto:malick@cepic.holdings" style={{ color: VERT, textDecoration: 'none', fontWeight: 600 }}>malick@cepic.holdings</a>
              </div>
              <div style={{ marginTop: 4 }}>
                💬 <a href="https://wa.me/221755500000" target="_blank" rel="noopener noreferrer" style={{ color: VERT, textDecoration: 'none', fontWeight: 600 }}>WhatsApp +221 75 550 00 00</a>
              </div>
            </div>
            <button onClick={() => { setStep('form'); setErrorMsg('') }} style={{ padding: '10px 28px', background: VERT, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('np_reessayer')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
