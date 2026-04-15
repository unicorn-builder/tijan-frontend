import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ChatTijan from '../components/ChatTijan'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'
import { useLang, TAB_KEYS } from '../i18n.jsx'
import { BACKEND, VERT, VERT_LIGHT, GRIS1, GRIS2, GRIS3, ORANGE, ORANGE_LT, TABS, fmt, fmtFcfa } from '../constants'

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', border: `1px solid ${GRIS2}`, borderRadius: 8, padding: '16px 20px', marginBottom: 12, ...style }}>
    {children}
  </div>
)

const SectionTitle = ({ children }) => (
  <div style={{ borderLeft: `3px solid ${VERT}`, paddingLeft: 10, marginBottom: 10, marginTop: 16 }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{children}</span>
  </div>
)

const Badge = ({ ok, label }) => (
  <span style={{
    background: ok ? VERT_LIGHT : ORANGE_LT, color: ok ? VERT : ORANGE,
    border: `1px solid ${ok ? VERT : ORANGE}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700,
  }}>{label || (ok ? t('r_conforme') : t('r_a_verifier'))}</span>
)

const DataTable = ({ headers, rows, colWidths }) => (
  <div style={{ overflowX: 'auto', marginBottom: 8 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>{headers.map((h, i) => (
          <th key={i} style={{ background: VERT, color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 600, fontSize: 11, width: colWidths?.[i] }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? GRIS1 : '#fff' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '6px 10px', borderBottom: '1px solid #EFEFEF', verticalAlign: 'top' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const Spinner = ({ text = '' }) => (
  <div style={{ textAlign: 'center', padding: 60 }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${GRIS2}`, borderTop: `3px solid ${VERT}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
    <div style={{ fontSize: 13, color: GRIS3 }}>{text}</div>
  </div>
)

// Endpoints whose output should be archived to Supabase Storage on download.
// Key = endpoint, value = { key: storage key suffix, ext: file extension, contentType }
const PLAN_ARCHIVE_MAP = {
  '/generate-plans-structure':     { key: 'plans_structure',     ext: 'pdf', contentType: 'application/pdf' },
  '/generate-plans-mep':           { key: 'plans_mep',           ext: 'pdf', contentType: 'application/pdf' },
  '/generate-plans-structure-dwg': { key: 'plans_structure_dxf', ext: 'dxf', contentType: 'application/dxf' },
  '/generate-plans-mep-dwg':       { key: 'plans_mep_dxf',       ext: 'dxf', contentType: 'application/dxf' },
}

async function archivePlan({ supabase, projectId, endpoint, blob }) {
  // Best-effort archive: upload latest plan to Supabase Storage and update projets.plans_urls.
  // Silent on failure — must never block the user's download.
  if (!supabase || !projectId) return null
  const meta = PLAN_ARCHIVE_MAP[endpoint]
  if (!meta) return null
  try {
    const path = `${projectId}/${meta.key}.${meta.ext}`
    const up = await supabase.storage.from('plans').upload(path, blob, {
      upsert: true, contentType: meta.contentType, cacheControl: '3600',
    })
    if (up.error) { console.warn('[plan archive] upload failed:', up.error.message); return null }
    const { data: pub } = supabase.storage.from('plans').getPublicUrl(path)
    const url = pub?.publicUrl || null
    // Merge into projets.plans_urls jsonb column
    const { data: row } = await supabase.from('projets')
      .select('plans_urls').eq('id', projectId).single()
    const next = { ...(row?.plans_urls || {}), [meta.key]: { url, updated_at: new Date().toISOString() } }
    await supabase.from('projets').update({ plans_urls: next }).eq('id', projectId)
    return url
  } catch (e) {
    console.warn('[plan archive] error:', e?.message || e)
    return null
  }
}

function usePdfDownload(params, lang = 'fr', { supabase = null, projectId = null } = {}) {
  const [loading, setLoading] = useState(null)
  const download = async (endpoint, filename, extra = {}) => {
    if (!params || !endpoint) return
    setLoading(endpoint)
    try {
      // Strip dwg_geometry from params — only pass via extra when needed (plans)
      const { dwg_geometry, dwgGeometry, ...cleanParams } = params
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cleanParams, lang, project_id: projectId || undefined, ...extra }),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        // Extract clean "detail" from FastAPI JSON error bodies
        let detail = errText
        try { const j = JSON.parse(errText); if (j?.detail) detail = j.detail } catch {}
        const err = new Error(detail.slice(0, 400))
        err.status = res.status
        throw err
      }
      const blob = await res.blob()
      // Fire-and-forget archive to Supabase Storage for plan endpoints (non-blocking)
      if (PLAN_ARCHIVE_MAP[endpoint]) {
        archivePlan({ supabase, projectId, endpoint, blob }).catch(() => {})
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.warn('PDF generation failed:', e)
      // 422 = DWG-only guard for plans. Show a clear, actionable message.
      if (e.status === 422 && (endpoint.includes('plans-structure') || endpoint.includes('plans-mep'))) {
        alert(lang === 'en'
          ? 'Plans require a DWG/DXF input file. This project was created from a PDF — please create a new project with a DWG/DXF to generate structure and MEP plans. (Other deliverables remain available.)'
          : 'Les plans nécessitent un fichier DWG/DXF en entrée. Ce projet a été créé à partir d\'un PDF — créez un nouveau projet avec un DWG/DXF pour générer les plans structure et MEP. (Les autres livrables restent disponibles.)')
      } else {
        alert((lang === 'en' ? 'Download error: ' : 'Erreur téléchargement: ') + e.message)
      }
    }
    finally { setLoading(null) }
  }
  return { download, loading }
}

// Inline manager to add/replace DWGs per level on an existing project.
// Calls /parse-multi with the NEW files only, then merges into existing dwg_geometry
// (keys already present get overwritten). Persists back to Supabase.
function DwgLevelsManager({ dwgGeometry, setDwgGeometry, supabase, projectId, lang }) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [levels, setLevels] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const LEVEL_OPTIONS = (() => {
    const out = [{ v: 'SOUS_SOL', label: 'Sous-sol' }, { v: 'RDC', label: 'RDC' }]
    for (let k = 1; k <= 40; k++) out.push({ v: `ETAGE_${k}`, label: `Étage ${k}` })
    out.push({ v: 'TERRASSE', label: 'Terrasse' })
    return out
  })()
  function guess(fname, idx) {
    const u = (fname || '').toUpperCase()
    if (/SOUS[\s-]?SOL|PARKING|BASEMENT/.test(u)) return 'SOUS_SOL'
    if (/REZ|RDC|GROUND/.test(u)) return 'RDC'
    if (/TERRASSE|ROOFTOP|TOITURE/.test(u)) return 'TERRASSE'
    const m = u.match(/(?:ETAGE|FLOOR|LEVEL)[^0-9]*(\d{1,2})/)
    if (m) return `ETAGE_${parseInt(m[1])}`
    return idx === 0 ? 'RDC' : `ETAGE_${idx}`
  }
  const onPick = e => {
    const fs = Array.from(e.target.files || [])
    setFiles(fs)
    setLevels(fs.map((f, i) => guess(f.name, i)))
  }
  const submit = async () => {
    if (!files.length) return
    setBusy(true); setMsg(lang === 'en' ? 'Parsing…' : 'Analyse…')
    try {
      const form = new FormData()
      for (const f of files) form.append('files', f)
      for (const lv of levels) form.append('levels', lv || '')
      const r = await fetch(`${BACKEND}/parse-multi`, { method: 'POST', body: form })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        const detail = d?.errors ? JSON.stringify(d.errors) : (d?.detail || r.statusText)
        console.error('[DwgLevelsManager] parse-multi HTTP', r.status, detail, d)
        throw new Error(`parse-multi ${r.status}: ${detail}`.slice(0, 240))
      }
      let result = d
      if (d?.ok && d.async && d.job_id) {
        for (let i = 0; i < 240; i++) {
          await new Promise(x => setTimeout(x, 3000))
          const pr = await fetch(`${BACKEND}/parse-status/${d.job_id}`)
          const pd = await pr.json()
          setMsg(`${lang === 'en' ? 'Parsing' : 'Analyse'} ${pd.progress || ''}`)
          if (pd.status === 'done' && pd.result) { result = pd.result; break }
          if (pd.status === 'error') { throw new Error(pd.error || 'parse error') }
        }
      }
      const newGeom = result?.dwg_geometry || {}
      // If backend returned a flat geometry (single-page PDF, no level dict),
      // wrap it under the first explicit level the user picked.
      const newGeomDict = ('walls' in newGeom)
        ? { [levels[0] || 'RDC']: newGeom }
        : newGeom
      const merged = { ...(dwgGeometry || {}), ...newGeomDict }
      // Strip heavy debug metadata so the row stays under Supabase update limits.
      const compact = {}
      for (const [k, g] of Object.entries(merged)) {
        if (!g || typeof g !== 'object') continue
        const { _cv_meta, ...lean } = g
        compact[k] = { ...lean,
          ...(g._cv_meta ? { _cv_meta: { quality: g._cv_meta.quality, source_page_idx: g._cv_meta.source_page_idx } } : {})
        }
      }
      setDwgGeometry(compact)
      if (supabase && projectId) {
        const payloadSize = new Blob([JSON.stringify(compact)]).size
        console.log('[DwgLevelsManager] persist', { projectId, levels: Object.keys(compact), bytes: payloadSize })
        const { error: updErr, data: updData } = await supabase
          .from('projets').update({ dwg_geometry: compact })
          .eq('id', projectId).select('id, dwg_geometry').maybeSingle()
        if (updErr) {
          console.error('[DwgLevelsManager] update FAILED', updErr)
          throw new Error(`save: ${updErr.message || updErr.code || 'unknown'}`)
        }
        if (!updData) {
          // RLS silently refused the update — the row exists for SELECT but not UPDATE
          console.error('[DwgLevelsManager] update returned no row — RLS likely blocking UPDATE for', projectId)
          throw new Error(lang === 'en' ? 'save blocked (RLS — check projets UPDATE policy)' : 'sauvegarde bloquée (RLS — vérifier policy UPDATE projets)')
        }
        const persistedKeys = Object.keys(updData.dwg_geometry || {})
        console.log('[DwgLevelsManager] persisted ✓', persistedKeys)
      }
      setMsg((lang === 'en'
        ? `Added ${Object.keys(newGeomDict).length} level(s) — total ${Object.keys(compact).length} ✓`
        : `${Object.keys(newGeomDict).length} niveau(x) ajoutés — total ${Object.keys(compact).length} ✓`))
      setFiles([]); setLevels([])
    } catch (e) {
      setMsg((lang === 'en' ? 'Error: ' : 'Erreur : ') + (e.message || 'parse failed'))
    } finally { setBusy(false) }
  }
  const existing = Object.keys(dwgGeometry || {})
  return (
    <div style={{ marginTop: 10, borderTop: `1px dashed ${GRIS2}`, paddingTop: 10 }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: VERT, fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
        {open ? '−' : '+'} {lang === 'en' ? 'Manage DWGs per level' : 'Gérer les DWG par niveau'}
        {existing.length > 0 && <span style={{ color: GRIS3, fontWeight: 400 }}> ({existing.length} {lang === 'en' ? 'level(s)' : 'niveau(x)'})</span>}
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: 10, background: '#FAFAFA', border: `1px solid ${GRIS2}`, borderRadius: 6 }}>
          {existing.length > 0 && (
            <div style={{ fontSize: 10, color: GRIS3, marginBottom: 8 }}>
              {lang === 'en' ? 'Already present' : 'Déjà présents'} : {existing.join(', ')}
            </div>
          )}
          <input type="file" accept=".pdf,.dwg,.dxf" multiple onChange={onPick} style={{ fontSize: 11, marginBottom: 8 }} />
          {files.length > 0 && (
            <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</div>
                  <select value={levels[i] || guess(f.name, i)} onChange={e => { const v = e.target.value; setLevels(p => { const n = [...p]; while (n.length < files.length) n.push(''); n[i] = v; return n }) }} style={{ padding: '5px 7px', border: `1px solid ${GRIS2}`, borderRadius: 5, fontSize: 11, background: '#fff' }}>
                    {LEVEL_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={submit} disabled={!files.length || busy} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 5, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: files.length && !busy ? 'pointer' : 'not-allowed', opacity: files.length && !busy ? 1 : 0.6 }}>
              {busy ? '…' : (lang === 'en' ? 'Upload & merge' : 'Ajouter / remplacer')}
            </button>
            {msg && <span style={{ fontSize: 10, color: GRIS3 }}>{msg}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id: projectId } = useParams()
  const state = location.state
  const [dbProjet, setDbProjet] = useState(null)

  const [resultats, setResultats] = useState(state?.resultats || {})
  const deviseInfo = resultats?.devise_info || null
  const [dwgGeometry, setDwgGeometry] = useState(state?.dwgGeometry || null)
  const [archiPdfUrl, setArchiPdfUrl] = useState(null)
  const archiPdfRef = state?.archiPdfRef || null
  const geomRef = state?.geomRef || null
  const [params, setParams] = useState(state?.params || {})

  const [activeTab, setActiveTab] = useState('structure')
  const { supabase, user } = useAuth()
  const { restants, consommer } = useCredits()
  const { lang, setLang, t } = useLang()
  const [mepData, setMepData] = useState(state?.mepData || null)
  const [chatMessages, setChatMessages] = useState(state?.chatHistorique || [])
  const [mepLoading, setMepLoading] = useState(false)
  const [mepError, setMepError] = useState(false)
  const [edgeOptimise, setEdgeOptimise] = useState(null)
  const [edgeLoading, setEdgeLoading] = useState(false)
  const { download, loading: dlLoading } = usePdfDownload(params, lang, { supabase, projectId })

  // Load project from Supabase if opened by URL (no location.state)
  useEffect(() => {
    if (!state?.resultats && projectId && supabase) {
      supabase.from('projets').select('*').eq('id', projectId).single()
        .then(({ data, error }) => {
          if (data && !error) {
            setDbProjet(data)
            if (data.resultats_structure) setResultats(data.resultats_structure)
            setParams({
              nom: data.nom, ville: data.ville, pays: data.pays || 'Senegal',
              nb_niveaux: data.nb_niveaux, surface_emprise_m2: data.surface_emprise_m2,
              portee_max_m: data.portee_max_m, portee_min_m: data.portee_min_m,
              nb_travees_x: data.nb_travees_x, nb_travees_y: data.nb_travees_y,
              usage: data.usage || 'residentiel',
              ...(data.urn ? { urn: data.urn } : {}),
              ...(data.archi_pdf_url ? { archi_pdf_url: data.archi_pdf_url } : {}),
            })
            // Restore persisted geometry and archi PDF URL for plan generation
            if (data.dwg_geometry) setDwgGeometry(data.dwg_geometry)
            if (data.archi_pdf_url) setArchiPdfUrl(data.archi_pdf_url)
            if (data.resultats_mep) setMepData(data.resultats_mep)
          }
        })
    }
  }, [projectId, supabase])

  // Auto-persist geometry to Supabase if we have it in state but DB doesn't
  // This backfills old projects that were created before persistence was added
  useEffect(() => {
    if (!projectId || !supabase || !user) return
    const geom = state?.dwgGeometry
    if (!geom || typeof geom !== 'object') return
    // Only persist if project doesn't already have geometry stored
    supabase.from('projets').select('dwg_geometry').eq('id', projectId).single()
      .then(({ data }) => {
        if (data && !data.dwg_geometry) {
          supabase.from('projets').update({ dwg_geometry: geom }).eq('id', projectId)
            .then(() => console.log('Backfilled dwg_geometry for project', projectId))
        }
      })
  }, [projectId, supabase, user])

  const optimiserEDGE = async () => {
    if (!params?.nom || edgeLoading) return
    setEdgeLoading(true)
    try {
      const res = await fetch(`${BACKEND}/calculate-mep-edge`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (data.ok) setEdgeOptimise(data)
    } catch (e) { console.warn('EDGE optimization failed:', e) }
    finally { setEdgeLoading(false) }
  }

  const MEP_TABS = ['note-mep', 'boq-mep', 'edge-assessment', 'fiches-mep', 'schemas-mep', 'plan-mep']

  useEffect(() => {
    if (MEP_TABS.includes(activeTab) && !mepData && !mepLoading && !mepError && params?.nom && params?.portee_max_m) {
      // D'abord essayer de charger depuis Supabase
      if (supabase && user && state?.resultats_mep) {
        setMepData(state.resultats_mep)
        return
      }
      setMepLoading(true)
      fetch(`${BACKEND}/calculate-mep`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
        .then(r => r.json())
        .then(d => {
          setMepData(d)
          if (!d.ok) setMepError(true)
          // Sauvegarder MEP dans Supabase
          if (d.ok && supabase && user) {
            const projectId = window.location.pathname.split('/projects/')[1]?.split('/')[0]
            if (projectId) {
              supabase.from('projets').update({ resultats_mep: d }).eq('nom', params.nom).eq('user_id', user.id).then(() => {})
            }
          }
        })
        .catch(() => setMepError(true))
        .finally(() => setMepLoading(false))
    }
  }, [activeTab])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (!params?.nom) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: GRIS3, marginBottom: 16 }}>{t('res_aucun')}</p>
          <button onClick={() => navigate('/projects/new')} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 13, fontWeight: 600 }}>
            {lang === 'en' ? 'New project' : 'Nouveau projet'}
          </button>
        </div>
      </div>
    )
  }

  // Données structure depuis nouveau /calculate
  const analyse = resultats.analyse || {}
  const poteaux = resultats.poteaux || []
  const poutre = resultats.poutre_principale || {}
  const fondation = resultats.fondation || {}
  const boq = resultats.boq || {}
  const surf = params.surface_emprise_m2 || 0
  const niv = params.nb_niveaux || 1
  const surf_batie = boq.surface_batie_m2 || surf * niv
  const beton_m3 = boq.beton_total_m3 || 0
  const acier_kg = boq.acier_kg || 0

  const renderContent = () => {
    if (activeTab === 'plan-ba') {
      const nbPages = (params.nb_niveaux || 4) + 5
      return (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t('res_plan_ba_titre') || 'Plans Structure (BA)'}</div>
              <div style={{ fontSize: 11, color: GRIS3 }}>{nbPages} {lang === 'en' ? 'pages' : 'planches'} A3</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { const extra = { ...(dwgGeometry ? { dwg_geometry: dwgGeometry } : {}), ...(archiPdfRef ? { archi_pdf_ref: archiPdfRef } : {}), ...(geomRef ? { geom_ref: geomRef } : {}), ...(archiPdfUrl ? { archi_pdf_url: archiPdfUrl } : {}) }; download('/generate-plans-structure', `TijanAI_PlansStructure_${slug}_${today}.pdf`, extra) }} disabled={!!dlLoading} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}>
                {dlLoading === '/generate-plans-structure' ? '...' : 'PDF'}
              </button>
              <button onClick={() => { const extra = { ...(dwgGeometry ? { dwg_geometry: dwgGeometry } : {}), ...(archiPdfRef ? { archi_pdf_ref: archiPdfRef } : {}), ...(geomRef ? { geom_ref: geomRef } : {}), ...(archiPdfUrl ? { archi_pdf_url: archiPdfUrl } : {}) }; download('/generate-plans-structure-dwg', `TijanAI_PlansStructure_${slug}_${today}.dxf`, extra) }} disabled={!!dlLoading} style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}>
                {dlLoading === '/generate-plans-structure-dwg' ? '...' : 'DWG'}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[t('r_lot_coffrage'), t('r_lot_ferr_pot'), t('r_lot_ferr_pou'), t('r_lot_ferr_dal'), t('r_lot_fond'), t('r_lot_voiles'), t('r_lot_escaliers'), t('r_lot_coupes'), t('r_lot_nomenclature'), t('r_lot_details')].map(s => (
              <span key={s} style={{ fontSize: 10, background: VERT_LIGHT, color: VERT, padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>{s}</span>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: GRIS3 }}>
            {t('res_plan_ba_note') || 'Plans A3 paysage — géométrie DXF architecte — calculs EC2/EC8 réels'}
          </div>
          <DwgLevelsManager dwgGeometry={dwgGeometry} setDwgGeometry={setDwgGeometry} supabase={supabase} projectId={projectId} lang={lang} />
        </Card>
      )
    }

    if (activeTab === 'plan-mep') {
      const nbLots = 7
      const nbLevels = params.nb_niveaux || 4
      const nbPages = nbLots * nbLevels
      return (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t('res_plan_mep_titre') || 'Plans MEP (7 lots)'}</div>
              <div style={{ fontSize: 11, color: GRIS3 }}>{nbPages} {lang === 'en' ? 'pages' : 'planches'} A3 ({nbLots} lots x {nbLevels} {lang === 'en' ? 'levels' : 'niveaux'})</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { const extra = { ...(dwgGeometry ? { dwg_geometry: dwgGeometry } : {}), ...(archiPdfRef ? { archi_pdf_ref: archiPdfRef } : {}), ...(geomRef ? { geom_ref: geomRef } : {}), ...(archiPdfUrl ? { archi_pdf_url: archiPdfUrl } : {}) }; download('/generate-plans-mep', `TijanAI_PlansMEP_${slug}_${today}.pdf`, extra) }} disabled={!!dlLoading} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}>
                {dlLoading === '/generate-plans-mep' ? '...' : 'PDF'}
              </button>
              <button onClick={() => { const extra = { ...(dwgGeometry ? { dwg_geometry: dwgGeometry } : {}), ...(archiPdfRef ? { archi_pdf_ref: archiPdfRef } : {}), ...(geomRef ? { geom_ref: geomRef } : {}), ...(archiPdfUrl ? { archi_pdf_url: archiPdfUrl } : {}) }; download('/generate-plans-mep-dwg', `TijanAI_PlansMEP_${slug}_${today}.dxf`, extra) }} disabled={!!dlLoading} style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}>
                {dlLoading === '/generate-plans-mep-dwg' ? '...' : 'DWG'}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[t('r_lot_plomberie'), t('r_lot_electricite'), t('r_lot_cvc'), t('r_lot_secu'), t('r_lot_courants_faibles'), t('r_lot_ascenseurs'), t('r_lot_gtb')].map(s => (
              <span key={s} style={{ fontSize: 10, background: VERT_LIGHT, color: VERT, padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>{s}</span>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: GRIS3 }}>
            {t('res_plan_mep_note') || 'Plans A3 paysage — géométrie DXF architecte — calculs MEP réels'}
          </div>
          <DwgLevelsManager dwgGeometry={dwgGeometry} setDwgGeometry={setDwgGeometry} supabase={supabase} projectId={projectId} lang={lang} />
        </Card>
      )
    }

    // ── NOTE STRUCTURE ──
    if (activeTab === 'structure') {
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_projet')}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{params.nom}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{params.ville} — R+{niv - 1}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_beton_acier')}</div>
                <div style={{ fontWeight: 600 }}>{resultats.classe_beton || params.classe_beton || '—'} / {resultats.classe_acier || params.classe_acier || '—'}</div>
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_auto_select')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_surface_batie')}</div>
                <div style={{ fontWeight: 600 }}>{fmt(surf_batie, 'm²')}</div>
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_emprise')} {fmt(surf, 'm²')} × {niv} {t('r_niv')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_beton_acier')}</div>
                <div style={{ fontWeight: 600 }}>{fmt(beton_m3, 'm³')} / {fmt(acier_kg, 'kg')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_conformite')}</div>
                <Badge ok={analyse.conformite_ec2 === 'Conforme'} label={analyse.conformite_ec2 === 'Conforme' ? t('r_conforme') : (analyse.conformite_ec2 || t('r_verifiee'))} />
              </div>
            </div>
            {analyse.commentaire_global && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#F9FFF9', borderRadius: 6, fontSize: 12, color: '#333', lineHeight: 1.6 }}>
                {analyse.commentaire_global}
              </div>
            )}
            {analyse.justification_materiaux && (
              <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>ℹ {analyse.justification_materiaux}</div>
            )}
          </Card>

          {poteaux.length > 0 && (
            <>
              <SectionTitle>{t('r_descente')}</SectionTitle>
              <DataTable
                headers={[t('r_niveau'), 'NEd (kN)', t('r_section'), t('r_armatures'), t('r_taux_arm'), 'NRd (kN)', t('r_verif')]}
                rows={poteaux.map(p => [
                  p.niveau || p.label,
                  fmt(p.NEd_kN, '', 1),
                  `${p.section_mm}×${p.section_mm} mm`,
                  `${p.nb_barres}HA${p.diametre_mm}`,
                  `${p.taux_armature_pct?.toFixed(2)}%`,
                  fmt(p.NRd_kN, '', 1),
                  <Badge ok={p.verif_ok} label={p.verif_ok ? '✓ OK' : '⚠ NOK'} />,
                ])}
              />
            </>
          )}

          {fondation.type && (
            <>
              <SectionTitle>{t('r_fondations')}</SectionTitle>
              <DataTable
                headers={[t('r_type'), t('r_diametre'), t('r_longueur'), t('r_armatures'), t('r_nb_pieux')]}
                rows={[[
                  fondation.type,
                  fondation.diam_pieu_mm ? `Ø${fondation.diam_pieu_mm} mm` : '—',
                  fondation.longueur_pieu_m ? `${fondation.longueur_pieu_m} m` : '—',
                  fondation.As_cm2 ? `As = ${fondation.As_cm2} cm²` : '—',
                  fondation.nb_pieux || '—',
                ]]}
              />
            </>
          )}

          {analyse.alertes?.length > 0 && (
            <>
              <SectionTitle>{t('r_points_attention')}</SectionTitle>
              <Card style={{ borderLeft: `3px solid ${ORANGE}` }}>
                {analyse.alertes.map((a, i) => <div key={i} style={{ fontSize: 12, color: ORANGE, marginBottom: 4 }}>⚠ {a}</div>)}
              </Card>
            </>
          )}

          {analyse.recommandations?.length > 0 && (
            <>
              <SectionTitle>{t('r_recommandations')}</SectionTitle>
              <Card>
                {analyse.recommandations.map((r, i) => <div key={i} style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>• {r}</div>)}
              </Card>
            </>
          )}
        </>
      )
    }

    // ── BOQ STRUCTURE ──
    if (activeTab === 'boq-structure') {
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_cout_bas')}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{fmtFcfa(boq.total_bas_fcfa, deviseInfo)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_cout_haut')}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: VERT }}>{fmtFcfa(boq.total_haut_fcfa, deviseInfo)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_cout_m2')}</div>
                <div style={{ fontWeight: 600 }}>{fmt(boq.ratio_fcfa_m2_bati)} — {fmt(boq.ratio_fcfa_m2_habitable)} {deviseInfo?.symbole || 'FCFA'}/m²</div>
                <div style={{ fontSize: 10, color: GRIS3 }}>{t('r_structure_seule')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_beton_acier')}</div>
                <div style={{ fontWeight: 600 }}>{fmt(beton_m3, 'm³')} / {fmt(acier_kg, 'kg')}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>{t('r_estimation_note')}</div>
          </Card>
        </>
      )
    }

    // ── MEP chargement (sauf plan-mep qui génère son propre calcul côté backend) ──
    if (MEP_TABS.includes(activeTab) && activeTab !== 'plan-mep') {
      if (mepLoading) return <Spinner text={t('r_mep_loading')} />
      if (mepError || !mepData?.ok) return (
        <div style={{ textAlign: 'center', padding: 60, color: GRIS3 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }}>{t('r_mep_non_dispo')}</div>
          <button onClick={() => { setMepError(false); setMepData(null) }} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 12 }}>
            {t('r_reessayer')}
          </button>
        </div>
      )
    }

    // ── NOTE MEP ──
    if (activeTab === 'note-mep' && mepData) {
      const el = mepData.electrique || {}
      const pl = mepData.plomberie || {}
      const cv = mepData.cvc || {}
      const asc = mepData.ascenseurs || {}
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>{t('r_puissance_installee')}</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(el.puissance_totale_kva, 'kVA')}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>{t('r_transformateur')}</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(el.transfo_kva, 'kVA')}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>{t('r_besoin_eau')}</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(pl.besoin_total_m3_j, 'm³/j', 2)}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>{t('r_puissance_frigo')}</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(cv.puissance_frigorifique_kw, 'kW')}</div></div>
              {asc.nb_ascenseurs > 0 && <div><div style={{ fontSize: 11, color: GRIS3 }}>{t('r_ascenseurs')}</div><div style={{ fontWeight: 700, fontSize: 18 }}>{asc.nb_ascenseurs} × {asc.capacite_kg} kg</div></div>}
            </div>
          </Card>

          <SectionTitle>{t('r_electricite')}</SectionTitle>
          <DataTable headers={[t('r_indicateur'), t('r_valeur'), t('r_indicateur'), t('r_valeur')]} rows={[
            [t('r_puissance_totale'), fmt(el.puissance_totale_kva, 'kVA'), t('r_transfo'), fmt(el.transfo_kva, 'kVA')],
            [t('r_groupe_elec'), fmt(el.groupe_electrogene_kva, 'kVA'), t('r_nb_compteurs'), fmt(el.nb_compteurs)],
            [t('r_conso_annuelle'), fmt(el.conso_annuelle_kwh, 'kWh/an'), t('r_facture_annuelle'), fmtFcfa(el.facture_annuelle_fcfa, deviseInfo)],
          ]} />

          <SectionTitle>{t('r_plomberie')}</SectionTitle>
          <DataTable headers={[t('r_indicateur'), t('r_valeur'), t('r_indicateur'), t('r_valeur')]} rows={[
            [t('r_nb_logements'), fmt(pl.nb_logements), t('r_besoin_eau_jour'), fmt(pl.besoin_total_m3_j, 'm³/j', 2)],
            [t('r_volume_citerne'), fmt(pl.volume_citerne_m3, 'm³'), t('r_surpresseur'), fmt(pl.debit_surpresseur_m3h, 'm³/h', 1)],
            [t('r_cesi'), fmt(pl.nb_chauffe_eau_solaire, 'unités'), t('r_facture_eau'), fmtFcfa(pl.facture_eau_fcfa, deviseInfo)],
          ]} />

          <SectionTitle>{t('r_cvc')}</SectionTitle>
          <DataTable headers={[t('r_indicateur'), t('r_valeur'), t('r_indicateur'), t('r_valeur')]} rows={[
            [t('r_puissance_frigo_label'), fmt(cv.puissance_frigorifique_kw, 'kW'), t('r_type_vmc'), cv.type_vmc || '—'],
            [t('r_splits_sejour'), fmt(cv.nb_splits_sejour), t('r_splits_chambre'), fmt(cv.nb_splits_chambre)],
            [t('r_cassettes'), fmt(cv.nb_cassettes), t('r_conso_cvc'), fmt(cv.conso_cvc_kwh_an, 'kWh/an')],
          ]} />

          {mepData.securite_incendie && (
            <>
              <SectionTitle>{t('r_securite_incendie')}</SectionTitle>
              <DataTable headers={[t('r_indicateur'), t('r_valeur'), t('r_indicateur'), t('r_valeur')]} rows={[
                [t('r_categorie_erp'), mepData.securite_incendie.categorie_erp, t('r_detecteurs'), fmt(mepData.securite_incendie.nb_detecteurs_fumee)],
                [t('r_extincteurs'), fmt(mepData.securite_incendie.nb_extincteurs_co2), 'Sprinklers', mepData.securite_incendie.sprinklers_requis ? t('r_sprinklers_obl') : t('r_sprinklers_non')],
              ]} />
            </>
          )}

          {el.note_dimensionnement && <div style={{ fontSize: 11, color: ORANGE, marginTop: 8 }}>ℹ {el.note_dimensionnement}</div>}
        </>
      )
    }

    // ── BOQ MEP ──
    if (activeTab === 'boq-mep' && mepData) {
      const boqm = mepData.boq_mep || {}
      const ratio_b = surf_batie ? Math.round((boqm.basic_fcfa || 0) / surf_batie) : 0
      const ratio_h = surf_batie ? Math.round((boqm.hend_fcfa || 0) / surf_batie) : 0
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['BASIC', boqm.basic_fcfa, false], ['HIGH-END', boqm.hend_fcfa, true], ['LUXURY', boqm.luxury_fcfa, false]].map(([label, val, accent]) => (
                <div key={label} style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: accent ? VERT : '#111' }}>{fmtFcfa(val, deviseInfo)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GRIS2}` }}>
              <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_boq_mep_m2')}</div>
              <div style={{ fontWeight: 600 }}>{fmt(ratio_b)} — {fmt(ratio_h)} {deviseInfo?.symbole || 'FCFA'}/m² <span style={{ fontSize: 11, color: GRIS3 }}>(basic → high-end)</span></div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{t('r_detail_pdf')}</div>
            </div>
            {boqm.recommandation && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: VERT_LIGHT, borderRadius: 6, fontSize: 12, color: '#2d7a3a' }}>
                <strong>{t('r_recommandation')} :</strong> {boqm.recommandation}
              </div>
            )}
          </Card>
        </>
      )
    }

    // ── CONFORMITÉ EDGE (ex EDGE Assessment v3.0.0) ──
    if (activeTab === 'edge-assessment' && mepData) {
      const edge = mepData.edge || {}
      const piliers = [
        { key: 'economie_energie_pct', label: t('r_eco_energie') },
        { key: 'economie_eau_pct', label: t('r_eco_eau') },
        { key: 'economie_materiaux_pct', label: t('r_eco_materiaux') },
      ]
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 6 }}>{t('r_verdict_edge')}</div>
                <Badge ok={edge.certifiable} label={edge.certifiable ? t('r_certifiable') : t('r_non_certifiable')} />
                {edge.niveau_certification && <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{edge.niveau_certification}</div>}
              </div>
              {piliers.map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: GRIS3 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 26, color: (edge[key] || 0) >= 20 ? VERT : ORANGE }}>
                    {edge[key] !== undefined ? `${edge[key]}%` : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: GRIS3 }}>{t('r_seuil_edge')}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: ORANGE }}>
              {t('r_edge_note')}
            </div>
          </Card>

          {edge.plan_action?.length > 0 && (
            <>
              <SectionTitle>{t('r_plan_action')}</SectionTitle>
              <Card style={{ borderLeft: `3px solid ${ORANGE}` }}>
                <div style={{ fontSize: 12, color: ORANGE, marginBottom: 8, fontWeight: 600 }}>
                  {t('r_cout_conformite')} : {fmtFcfa(edge.cout_mise_conformite_fcfa, deviseInfo)} | ROI : {edge.roi_ans} ans
                </div>
                {edge.plan_action.map((a, i) => (
                  <div key={i} style={{ fontSize: 12, marginBottom: 6, padding: '6px 10px', background: '#FFFBF0', borderRadius: 4 }}>
                    <strong>[{a.pilier}]</strong> {a.action} — <span style={{ color: VERT }}>+{a.gain_pct}%</span>
                    {a.cout_fcfa > 0 && <span style={{ color: GRIS3 }}> — {fmtFcfa(a.cout_fcfa, deviseInfo)}</span>}
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* Bouton optimisation EDGE */}
          {!edgeOptimise && !(edge.certifiable) && (
            <div style={{ margin: '16px 0', textAlign: 'center' }}>
              <button onClick={optimiserEDGE} disabled={edgeLoading} style={{
                background: edgeLoading ? '#ccc' : '#E07B00',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '12px 28px', fontSize: 14, fontWeight: 700,
                cursor: edgeLoading ? 'not-allowed' : 'pointer', width: '100%', maxWidth: 400,
              }}>
                {edgeLoading ? t('r_optimisation_cours') : t('r_optimiser_edge')}
              </button>
              <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>
                {t('r_optimise_note')}
              </div>
            </div>
          )}

          {/* Résultats optimisation EDGE */}
          {edgeOptimise && (
            <div style={{ background: '#EBF7ED', border: '1px solid #43A956', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#2D7A3A', fontSize: 15, marginBottom: 12 }}>
                ✅ Projet optimisé EDGE — {edgeOptimise.edge.niveau_certification}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                {[[t('r_energie_label'), edgeOptimise.edge.economie_energie_pct], [t('r_eau_label'), edgeOptimise.edge.economie_eau_pct], [t('r_materiaux_label'), edgeOptimise.edge.economie_materiaux_pct]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#555' }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: val >= 20 ? '#43A956' : '#E07B00' }}>{val}%</div>
                    <div style={{ fontSize: 10, color: '#888' }}>{t('r_seuil_edge')}</div>
                  </div>
                ))}
              </div>
              {edgeOptimise.surcout_edge && (
                <div style={{ fontSize: 12, color: '#555', borderTop: '1px solid #C8E6C9', paddingTop: 10 }}>
                  <strong>{t('r_surcout')} :</strong>{' '}
                  {fmtFcfa(edgeOptimise.surcout_edge.total_fcfa, deviseInfo)}
                  {' '}({edgeOptimise.surcout_edge.pct_boq_mep}% du BOQ MEP Basic)
                  <div style={{ marginTop: 4, fontSize: 11, color: '#888' }}>
                    {lang === 'en' ? 'LED' : 'LED'} {(edgeOptimise.surcout_edge.led_fcfa/1e6).toFixed(1)}M +
                    {lang === 'en' ? 'Insulation' : 'Isolation'} {(edgeOptimise.surcout_edge.isolation_fcfa/1e6).toFixed(1)}M +
                    {lang === 'en' ? 'Eco WC' : 'WC éco'} {(edgeOptimise.surcout_edge.wc_fcfa/1e3).toFixed(0)}k +
                    {lang === 'en' ? 'Faucets' : 'Robinetterie'} {fmtFcfa(edgeOptimise.surcout_edge.robinetterie_fcfa, deviseInfo)}
                  </div>
                </div>
              )}
              <button onClick={() => setEdgeOptimise(null)} style={{
                marginTop: 10, background: 'none', border: '1px solid #43A956',
                color: '#2D7A3A', borderRadius: 6, padding: '5px 14px', fontSize: 12, cursor: 'pointer'
              }}>{t('r_revenir_original')}</button>
            </div>
          )}

          {['mesures_energie', 'mesures_eau', 'mesures_materiaux'].map((key, i) => (
            edge[key]?.length > 0 && (
              <div key={key}>
                <SectionTitle>{[t('r_mesures_energie'), t('r_mesures_eau'), t('r_mesures_materiaux')][i]}</SectionTitle>
                <Card>
                  {edge[key].map((m, j) => (
                    <div key={j} style={{ fontSize: 12, marginBottom: 4, color: m.statut?.includes('Intégré') ? '#2d7a3a' : '#333' }}>
                      • {m.mesure} — <strong>+{m.gain_pct}%</strong>
                      {m.statut && <span style={{ fontSize: 11, color: GRIS3 }}> [{m.statut}]</span>}
                      {m.impact_prix && <div style={{ fontSize: 10, color: ORANGE, marginLeft: 10 }}>ℹ {m.impact_prix}</div>}
                    </div>
                  ))}
                </Card>
              </div>
            )
          ))}
        </>
      )
    }

    // ── FICHES STRUCTURE ──
    if (activeTab === 'fiches-structure') {
      return (
        <>
          <Card>
            <SectionTitle>{t('r_fiche_beton')}</SectionTitle>
            {poteaux.length > 0 ? (
              <DataTable
                headers={[t('r_niveau'), t('r_section'), t('r_armatures'), t('r_cadres'), t('r_beton')]}
                rows={poteaux.map(p => [
                  p.niveau || p.label,
                  `${p.section_mm}×${p.section_mm} mm`,
                  `${p.nb_barres}HA${p.diametre_mm}`,
                  `HA${p.cadre_diam_mm} e=${p.espacement_cadres_mm}mm`,
                  resultats.classe_beton || params.classe_beton || 'C30/37',
                ])}
              />
            ) : <div style={{ fontSize: 12, color: GRIS3 }}>{t('r_donnees_non_dispo')}</div>}
          </Card>
          {fondation.type && (
            <Card>
              <SectionTitle>{t('r_fiche_fondations')}</SectionTitle>
              <DataTable headers={[t('r_type'), t('r_diametre'), t('r_longueur'), t('r_armatures'), t('r_nb_pieux')]} rows={[[
                fondation.type,
                fondation.diam_pieu_mm ? `Ø${fondation.diam_pieu_mm} mm` : '—',
                fondation.longueur_pieu_m ? `${fondation.longueur_pieu_m} m` : '—',
                fondation.As_cm2 ? `As = ${fondation.As_cm2} cm²` : '—',
                fondation.nb_pieux || '—',
              ]]} />
            </Card>
          )}
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>{t('r_telecharger_complet')}</div>
        </>
      )
    }

    // ── FICHES MEP ──
    if (activeTab === 'fiches-mep' && mepData) {
      const el = mepData.electrique || {}
      const pl = mepData.plomberie || {}
      return (
        <>
          <Card>
            <SectionTitle>{t('r_fiche_elec')}</SectionTitle>
            <DataTable headers={[t('r_parametre'), t('r_valeur'), t('r_parametre'), t('r_valeur')]} rows={[
              [t('r_puissance_totale'), fmt(el.puissance_totale_kva, 'kVA'), t('r_transfo'), fmt(el.transfo_kva, 'kVA')],
              [t('r_groupe_elec'), fmt(el.groupe_electrogene_kva, 'kVA'), t('r_nb_compteurs'), fmt(el.nb_compteurs)],
              [t('r_conso_annuelle'), fmt(el.conso_annuelle_kwh, 'kWh/an'), 'Facture', fmtFcfa(el.facture_annuelle_fcfa, deviseInfo)],
            ]} />
          </Card>
          <Card>
            <SectionTitle>{t('r_fiche_plomb')}</SectionTitle>
            <DataTable headers={[t('r_parametre'), t('r_valeur'), t('r_parametre'), t('r_valeur')]} rows={[
              [t('r_nb_logements'), fmt(pl.nb_logements), t('r_besoin_eau_jour'), fmt(pl.besoin_total_m3_j, 'm³/j', 2)],
              [t('r_volume_citerne'), fmt(pl.volume_citerne_m3, 'm³'), t('r_surpresseur'), fmt(pl.debit_surpresseur_m3h, 'm³/h', 1)],
              [t('r_cesi'), fmt(pl.nb_chauffe_eau_solaire, 'unités'), t('r_facture_eau'), fmtFcfa(pl.facture_eau_fcfa, deviseInfo)],
            ]} />
          </Card>
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>{t('r_telecharger_complet')}</div>
        </>
      )
    }


    // ── SCHEMAS DE FERRAILLAGE ──
    if (activeTab === 'schemas-ferraillage') {
      return (
        <Card>
          <SectionTitle>{t('tab_schemas_ferraillage')}</SectionTitle>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>{t('r_schemas_ferr_desc')}</div>
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 10 }}>{t('r_telecharger_complet')}</div>
        </Card>
      )
    }

    // ── SCHEMAS ISOMÉTRIQUES MEP ──
    if (activeTab === 'schemas-mep' && mepData) {
      return (
        <Card>
          <SectionTitle>{t('tab_schemas_mep')}</SectionTitle>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>{t('r_schemas_mep_desc')}</div>
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 10 }}>{t('r_telecharger_complet')}</div>
        </Card>
      )
    }

    // ── RAPPORT EXÉCUTIF ──
    if (activeTab === 'rapport-executif') {
      const boq = resultats.boq || {}
      const analyse = resultats.analyse || {}
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_projet')}</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{params.nom}</div>
                <div style={{ fontSize: 13, color: '#555' }}>{params.ville} — R+{(params.nb_niveaux||1)-1}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_surface_batie')}</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{fmt(boq.surface_batie_m2 || params.surface_emprise_m2 * params.nb_niveaux, 'm²')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_beton_acier')}</div>
                <div style={{ fontWeight: 600 }}>{resultats.classe_beton || '—'} / {resultats.classe_acier || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{t('r_conformite')}</div>
                <Badge ok={analyse.conformite_ec2 === 'Conforme'} label={analyse.conformite_ec2 === 'Conforme' ? t('r_conforme') : (analyse.conformite_ec2 || '—')} />
              </div>
            </div>
          </Card>
          <SectionTitle>{t('r_budget_global')}</SectionTitle>
          <Card>
            {(() => {
              const boqm = mepData?.boq_mep || {}
              const structBas = boq.total_bas_fcfa || 0
              const structHaut = boq.total_haut_fcfa || 0
              const mepBas = boqm.basic_fcfa || 0
              const mepHaut = boqm.hend_fcfa || 0
              const totalBas = structBas + mepBas
              const totalHaut = structHaut + mepHaut
              const sBatie = boq.surface_batie_m2 || (surf * niv)
              const coutM2 = sBatie > 0 ? Math.round(totalHaut / sBatie) : 0
              return (
                <>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_structure_bas')} / {t('r_structure_haut')}</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtFcfa(structBas, deviseInfo)} — {fmtFcfa(structHaut, deviseInfo)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: GRIS3 }}>MEP & Automation</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtFcfa(mepBas, deviseInfo)} — {fmtFcfa(mepHaut, deviseInfo)}</div>
                      {!mepData && <div style={{ fontSize: 10, color: ORANGE }}>Calcul MEP non chargé — consultez l'onglet MEP</div>}
                    </div>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GRIS2}`, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, color: GRIS3 }}>COÛT TOTAL ESTIMÉ</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: VERT }}>{fmtFcfa(totalBas, deviseInfo)} — {fmtFcfa(totalHaut, deviseInfo)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_cout_m2')}</div>
                      <div style={{ fontWeight: 600 }}>{fmt(coutM2)} {deviseInfo?.symbole || 'FCFA'}/m²</div>
                      <div style={{ fontSize: 10, color: GRIS3 }}>Structure + MEP</div>
                    </div>
                  </div>
                </>
              )
            })()}
            <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>{t('r_estimation_hors')}</div>
          </Card>
          {analyse.note_ingenieur && (
            <>
              <SectionTitle>{t('r_note_ingenieur')}</SectionTitle>
              <Card style={{ borderLeft: '3px solid #1565C0', background: '#E3F2FD' }}>
                <div style={{ fontSize: 12, color: '#1565C0', fontStyle: 'italic' }}>{analyse.note_ingenieur}</div>
              </Card>
            </>
          )}
          {analyse.points_forts?.length > 0 && (
            <>
              <SectionTitle>{t('r_points_forts')}</SectionTitle>
              <Card>{analyse.points_forts.map((f,i) => <div key={i} style={{ fontSize: 12, color: '#2d7a3a', marginBottom: 4 }}>✅ {f}</div>)}</Card>
            </>
          )}
          {analyse.alertes?.length > 0 && (
            <>
              <SectionTitle>{t('r_points_attention')}</SectionTitle>
              <Card style={{ borderLeft: '3px solid #E07B00' }}>{analyse.alertes.map((a,i) => <div key={i} style={{ fontSize: 12, color: '#E07B00', marginBottom: 4 }}>⚠ {a}</div>)}</Card>
            </>
          )}
          <div style={{ marginTop: 12, fontSize: 11, color: GRIS3 }}>{t('r_rapport_dest')}</div>
        </>
      )
    }

    return null
  }

  const today = new Date().toISOString().slice(0,10).replace(/-/g,'')
  const slug = (params.nom || 'Projet').replace(/\s+/g,'').slice(0,20)

  const currentTab = TABS.find(t => t.id === activeTab)

  // Mapping endpoints v6
  const ENDPOINT_MAP = {
    'structure':          '/generate',
    'boq-structure':      '/generate-boq',
    'note-mep':           '/generate-note-mep',
    'boq-mep':            '/generate-boq-mep',
    'rapport-executif':   '/generate-rapport-executif',
    'fiches-structure':   '/generate-fiches-structure',
    'fiches-mep':         '/generate-fiches-mep',
    'schemas-ferraillage':'/generate-schemas-ferraillage',
    'schemas-mep':        '/generate-schemas-mep',
    'edge-assessment':    '/generate-edge-assessment',
    'plan-ba':            '/generate-plans-structure',
    'plan-mep':           '/generate-plans-mep',
  }
  const FILENAME_MAP = {
    'structure':          `TijanAI_NoteStructure_${slug}_${today}.pdf`,
    'boq-structure':      `TijanAI_BOQStructure_${slug}_${today}.pdf`,
    'note-mep':           `TijanAI_NoteMEP_${slug}_${today}.pdf`,
    'boq-mep':            `TijanAI_BOQMEP_${slug}_${today}.pdf`,
    'rapport-executif':   `TijanAI_RapportExecutif_${slug}_${today}.pdf`,
    'fiches-structure':   `TijanAI_FichesStructure_${slug}_${today}.pdf`,
    'fiches-mep':         `TijanAI_FichesMEP_${slug}_${today}.pdf`,
    'schemas-ferraillage':`TijanAI_SchemasFerraillage_${slug}_${today}.pdf`,
    'schemas-mep':        `TijanAI_SchemasMEP_${slug}_${today}.pdf`,
    'edge-assessment':    `TijanAI_EdgeAssessment_${slug}_${today}.pdf`,
    'plan-ba':            `TijanAI_PlansStructure_${slug}_${today}.pdf`,
    'plan-mep':           `TijanAI_PlansMEP_${slug}_${today}.pdf`,
  }

  const endpoint = activeTab === 'chat' ? null : ENDPOINT_MAP[activeTab]
  const filename = FILENAME_MAP[activeTab]

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#FAFAFA' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${GRIS2}`, padding: isMobile ? '0 8px' : '0 24px', height: isMobile ? 44 : 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 16 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid #E5E5E5', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#555', cursor: 'pointer' }}>←</button>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #E5E5E5', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#555', cursor: 'pointer' }}>Projets</button>
          <img src="/tijan_logo.png" alt="Tijan AI" onClick={() => navigate("/")} style={{ cursor: "pointer", height: isMobile ? 30 : 38, objectFit: 'contain' }} />
          {!isMobile && <span style={{ color: GRIS3, fontSize: 11 }}>Engineering Intelligence for Africa</span>}
        </div>
        {!isMobile && <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{params.nom} — {params.ville}</div>}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} style={{ background: 'none', border: '1px solid #E5E5E5', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: '#555', cursor: 'pointer' }}>{lang === 'fr' ? 'EN' : 'FR'}</button>
            <button onClick={() => navigate('/pricing')} style={{ background: '#F0FFF4', border: '1px solid #43A956', borderRadius: 4, padding: '2px 6px', fontSize: 9, color: '#43A956', fontWeight: 600, cursor: 'pointer' }}>{restants ?? '...'} cr.</button>
            <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 4, padding: '2px 6px', fontSize: 9, color: '#B8860B' }}>Beta</div>
          </div>
      </div>

      <div style={{ display: 'flex', height: isMobile ? 'auto' : 'calc(100vh - 56px)', minHeight: isMobile ? '100vh' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ width: isMobile ? '100%' : 220, minWidth: isMobile ? 'unset' : 220, background: '#fff', borderRight: isMobile ? 'none' : `1px solid ${GRIS2}`, borderBottom: isMobile ? `1px solid ${GRIS2}` : 'none', padding: isMobile ? '8px 0' : '16px 0', overflowY: isMobile ? 'hidden' : 'auto', overflowX: isMobile ? 'auto' : 'hidden', flexShrink: 0, display: isMobile ? 'flex' : 'block', whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
          {TABS.map(tab => {
            const disabled = !tab.endpoint
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: isMobile ? 'inline-block' : 'block', width: isMobile ? 'auto' : '100%', textAlign: 'left', padding: '10px 20px',
                border: 'none', fontSize: 12, fontWeight: active ? 600 : 400,
                color: disabled ? '#BBB' : active ? VERT : '#444',
                background: active ? VERT_LIGHT : 'transparent',
                borderLeft: active ? `3px solid ${VERT}` : '3px solid transparent',
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                {t(TAB_KEYS[tab.id]) || tab.label}
                {disabled && <span style={{ marginLeft: 6, fontSize: 9, background: '#F0F0F0', color: '#888', borderRadius: 8, padding: '1px 6px' }}>{t('res_bientot_badge')}</span>}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 24 }}>
          {renderContent()}
          {/* Chat toujours monté, caché si pas actif */}
          <div style={{ display: activeTab === 'chat' ? 'block' : 'none', height: '100%' }}>
            <ChatTijan params={params} resultatsStructure={resultats} resultatsMep={mepData} savedChat={chatMessages} onUpdateChat={setChatMessages} onModify={(updatedParams, updatedResultats, updatedMep) => {
                // Update React state directly — triggers re-render of all dependent components
                setParams(updatedParams)
                setResultats(updatedResultats)
                if (updatedMep) setMepData({ ok: true, ...updatedMep })
                // Show toast notification
                const toast = document.createElement('div')
                toast.textContent = lang === 'en' ? 'Studies updated ✓' : 'Études mises à jour ✓'
                toast.style.cssText = 'position:fixed;top:16px;right:16px;background:#43A956;color:#fff;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;animation:fadeInOut 3s ease-in-out forwards;font-family:DM Sans,sans-serif'
                const style = document.createElement('style')
                style.textContent = '@keyframes fadeInOut{0%{opacity:0;transform:translateY(-10px)}10%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}'
                document.head.appendChild(style)
                document.body.appendChild(toast)
                setTimeout(() => { toast.remove(); style.remove() }, 3200)
              }} />
          </div>
          {endpoint && activeTab !== 'plan-ba' && activeTab !== 'plan-mep' && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const nomFichier = `TijanAI_${activeTab.replace(/-/g,'')}_${slug}_${today}.pdf`
                  const extra = {}
                  if (activeTab === 'edge-assessment') {
                    if (dwgGeometry) extra.dwg_geometry = dwgGeometry
                    const ee = dbProjet?.edge_extras || {}
                    Object.assign(extra, ee)
                  }
                  download(endpoint, nomFichier, extra)
                }}
                disabled={!!dlLoading || (MEP_TABS.includes(activeTab) && activeTab !== 'plan-mep' && !mepData?.ok)}
                style={{
                  background: dlLoading === endpoint ? '#ccc' : VERT,
                  color: '#fff', border: 'none', borderRadius: 6,
                  padding: '11px 28px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  opacity: (MEP_TABS.includes(activeTab) && !mepData?.ok && activeTab !== 'plan-mep') ? 0.5 : 1,
                }}
              >
                {dlLoading === endpoint ? t('res_generation') : (t('res_telecharger') || t('r_telecharger_pdf'))}
              </button>
              {activeTab === 'boq-structure' && (
                <button
                  onClick={() => download('/generate-boq-xlsx', `TijanAI_BOQ_Structure_${slug}_${today}.xlsx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-boq-xlsx' ? '...' : 'Excel'}
                </button>
              )}
              {activeTab === 'boq-mep' && (
                <button
                  onClick={() => download('/generate-boq-mep-xlsx', `TijanAI_BOQ_MEP_${slug}_${today}.xlsx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-boq-mep-xlsx' ? '...' : 'Excel'}
                </button>
              )}
              {activeTab === 'structure' && (
                <button
                  onClick={() => download('/generate-note-docx', `TijanAI_NoteStructure_${slug}_${today}.docx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-note-docx' ? '...' : 'Word'}
                </button>
              )}
              {activeTab === 'rapport-executif' && (
                <button
                  onClick={() => download('/generate-rapport-docx', `TijanAI_RapportExecutif_${slug}_${today}.docx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-rapport-docx' ? '...' : 'Word'}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
