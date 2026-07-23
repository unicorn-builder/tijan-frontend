import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ChatTijan from '../components/ChatTijan'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'
import { useLang, TAB_KEYS } from '../i18n.jsx'
import { BACKEND, VERT, VERT_LIGHT, VERT_DARK, GRIS1, GRIS2, GRIS3, ORANGE, ORANGE_LT, TABS, fmt, fmtFcfa } from '../constants'

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

// Download-all: complete manifest of outputs organized by folder
const DOWNLOAD_ALL_ITEMS = [
  // 01_Structure
  { folder: '01_Structure', label: 'Note Structure', format: 'PDF', endpoint: '/generate', filename: 'NoteCalculStructure.pdf' },
  { folder: '01_Structure', label: 'Note Structure', format: 'Word', endpoint: '/generate-note-docx', filename: 'NoteCalculStructure.docx' },
  { folder: '01_Structure', label: 'BOQ Structure', format: 'PDF', endpoint: '/generate-boq', filename: 'BOQ_Structure.pdf' },
  { folder: '01_Structure', label: 'BOQ Structure', format: 'Excel', endpoint: '/generate-boq-xlsx', filename: 'BOQ_Structure.xlsx' },
  { folder: '01_Structure', label: 'Schémas Ferraillage', format: 'PDF', endpoint: '/generate-schemas-ferraillage', filename: 'SchemasFerraillage.pdf' },
  { folder: '01_Structure', label: 'DAO Structure', format: 'PDF', endpoint: '/generate-dao?lot=structure', filename: 'DAO_Structure.pdf' },
  { folder: '01_Structure', label: 'DAO Structure', format: 'Word', endpoint: '/generate-dao-docx?lot=structure', filename: 'DAO_Structure.docx' },
  // 02_MEP
  { folder: '02_MEP', label: 'Note MEP', format: 'PDF', endpoint: '/generate-note-mep', filename: 'NoteCalculMEP.pdf', needsMep: true },
  { folder: '02_MEP', label: 'BOQ MEP', format: 'PDF', endpoint: '/generate-boq-mep', filename: 'BOQ_MEP.pdf', needsMep: true },
  { folder: '02_MEP', label: 'BOQ MEP', format: 'Excel', endpoint: '/generate-boq-mep-xlsx', filename: 'BOQ_MEP.xlsx', needsMep: true },
  { folder: '02_MEP', label: 'Schémas MEP', format: 'PDF', endpoint: '/generate-schemas-mep', filename: 'SchemasMEP.pdf', needsMep: true },
  { folder: '02_MEP', label: 'DAO MEP', format: 'PDF', endpoint: '/generate-dao?lot=mep', filename: 'DAO_MEP.pdf', needsMep: true },
  { folder: '02_MEP', label: 'DAO MEP', format: 'Word', endpoint: '/generate-dao-docx?lot=mep', filename: 'DAO_MEP.docx', needsMep: true },
  // 03_Finitions
  { folder: '03_Finitions', label: 'BOQ Finitions', format: 'PDF', endpoint: '/generate-boq-finitions', filename: 'BOQ_Finitions.pdf' },
  { folder: '03_Finitions', label: 'DAO Finitions', format: 'PDF', endpoint: '/generate-dao?lot=finitions', filename: 'DAO_Finitions.pdf' },
  { folder: '03_Finitions', label: 'DAO Finitions', format: 'Word', endpoint: '/generate-dao-docx?lot=finitions', filename: 'DAO_Finitions.docx' },
  // 04_Synthese
  { folder: '04_Synthese', label: 'Rapport Exécutif', format: 'PDF', endpoint: '/generate-rapport-executif', filename: 'RapportExecutif.pdf' },
  { folder: '04_Synthese', label: 'Rapport Exécutif', format: 'Word', endpoint: '/generate-rapport-docx', filename: 'RapportExecutif.docx' },
  { folder: '04_Synthese', label: 'Conformité EDGE', format: 'PDF', endpoint: '/generate-edge-assessment', filename: 'ConformiteEDGE.pdf', needsMep: true, isEdge: true },
  { folder: '04_Synthese', label: 'Planning', format: 'PDF', endpoint: '/generate-planning', filename: 'PlanningExecution.pdf' },
  { folder: '04_Synthese', label: 'Planning', format: 'Word', endpoint: '/generate-planning-docx', filename: 'PlanningExecution.docx' },
  { folder: '04_Synthese', label: 'Planning & Trésorerie', format: 'Excel', endpoint: '/generate-planning-xlsx', filename: 'Planning_Tresorerie.xlsx' },
  { folder: '04_Synthese', label: 'Trésorerie', format: 'PDF', endpoint: '/generate-planning-tresorerie', filename: 'PlanningDepenses.pdf' },
  { folder: '04_Synthese', label: 'Trésorerie', format: 'Word', endpoint: '/generate-tresorerie-docx', filename: 'PlanningDepenses.docx' },
  // 05_Fiches
  { folder: '05_Fiches', label: 'Fiches Techniques', format: 'PDF', endpoint: '/generate-fiches-all', filename: 'FichesTechniques.pdf', needsMep: true },
  // 06_Plans
  { folder: '06_Plans', label: 'Plans BA', format: 'PDF', endpoint: '/generate-plans-structure', filename: 'PlansBA.pdf', needsDwg: true },
  { folder: '06_Plans', label: 'Plans BA', format: 'DWG', endpoint: '/generate-plans-structure-pro?format=dwg', filename: 'PlansBA.dwg', needsDwg: true },
  { folder: '06_Plans', label: 'Plans MEP', format: 'PDF', endpoint: '/generate-plans-mep', filename: 'PlansMEP.pdf', needsDwg: true },
  { folder: '06_Plans', label: 'Plans MEP', format: 'DWG', endpoint: '/generate-plans-mep-pro?format=dwg', filename: 'PlansMEP.dwg', needsDwg: true },
]

function usePdfDownload(params, lang = 'fr', { projectId = null } = {}) {
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
        let detail = errText
        try { const j = JSON.parse(errText); if (j?.detail) detail = j.detail } catch {}
        const err = new Error(detail.slice(0, 400))
        err.status = res.status
        throw err
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.warn('PDF generation failed:', e)
      if (e.status === 422 && (endpoint.includes('plans-structure') || endpoint.includes('plans-mep'))) {
        alert(lang === 'en'
          ? 'The server could not find the DWG geometry for this project. If it was created from a PDF, plans are unavailable; if you did upload a DWG/DXF, re-import it in the Plans tab ("Manage DWGs per level") to re-attach the geometry. (Other deliverables remain available.)'
          : 'Le serveur n\'a pas retrouvé la géométrie DWG de ce projet. S\'il a été créé depuis un PDF, les plans sont indisponibles ; si vous aviez importé un DWG/DXF, ré-importez-le dans l\'onglet Plans (« Gérer les DWG par niveau ») pour ré-associer la géométrie. (Les autres livrables restent disponibles.)')
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
  const [geomRef, setGeomRef] = useState(state?.geomRef || null)
  const [params, setParams] = useState(state?.params || {})

  const [activeTab, setActiveTab] = useState('structure')
  const { supabase, user } = useAuth()
  const { restants, consommer } = useCredits()
  const { lang, setLang, t } = useLang()
  const [mepData, setMepData] = useState(state?.mepData || null)
  const [finitionsData, setFinitionsData] = useState(null)
  const [chatMessages, setChatMessages] = useState(state?.chatHistorique || [])
  const [mepLoading, setMepLoading] = useState(false)
  const [mepError, setMepError] = useState(false)
  const [edgeOptimise, setEdgeOptimise] = useState(null)
  const [edgeLoading, setEdgeLoading] = useState(false)
  const [edgeMode, setEdgeMode] = useState(false)   // true = all tabs show EDGE-optimised data
  const [standardMepData, setStandardMepData] = useState(null)  // cache for reverting
  const [standardResultats, setStandardResultats] = useState(null)
  const { download, loading: dlLoading } = usePdfDownload(params, lang, { projectId })
  const [downloadAllState, setDownloadAllState] = useState(null) // { current, total, label, errors }
  const abortDownloadAllRef = useRef(false)

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
            if (data.geom_ref) setGeomRef(data.geom_ref)
            if (data.archi_pdf_url) setArchiPdfUrl(data.archi_pdf_url)
            if (data.resultats_mep) setMepData(data.resultats_mep)
            if (data.chat_historique?.length > 0) setChatMessages(data.chat_historique)
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

  // Activate EDGE mode: swap all tabs to EDGE-optimised data
  const activerModeEDGE = async () => {
    if (edgeOptimise) {
      // Already cached — just switch
      setStandardMepData(mepData)
      setStandardResultats(resultats)
      setMepData(edgeOptimise)
      if (edgeOptimise.structure) {
        setResultats(prev => ({ ...prev, ...edgeOptimise.structure }))
      }
      setEdgeMode(true)
      return
    }
    // Need to recalculate first
    if (!params?.nom || edgeLoading) return
    setEdgeLoading(true)
    try {
      const res = await fetch(`${BACKEND}/calculate-mep-edge`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (data.ok) {
        setEdgeOptimise(data)
        setStandardMepData(mepData)
        setStandardResultats(resultats)
        setMepData(data)
        if (data.structure) {
          setResultats(prev => ({ ...prev, ...data.structure }))
        }
        setEdgeMode(true)
      }
    } catch (e) { console.warn('EDGE activation failed:', e) }
    finally { setEdgeLoading(false) }
  }

  // Revert to standard (non-EDGE) design
  const revenirStandard = () => {
    if (standardMepData) setMepData(standardMepData)
    if (standardResultats) setResultats(standardResultats)
    setEdgeMode(false)
  }

  const MEP_TABS = ['note-mep', 'boq-mep', 'edge-assessment', 'schemas-mep', 'plan-mep']
  const NEEDS_MEP = [...MEP_TABS, 'rapport-executif', 'planning', 'tresorerie']

  useEffect(() => {
    if (NEEDS_MEP.includes(activeTab) && !mepData && !mepLoading && !mepError && params?.nom && params?.portee_max_m) {
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
    if (activeTab === 'plan-ba' || activeTab === 'plan-mep') {
      const hasDwg = (dwgGeometry && Object.keys(dwgGeometry).length > 0) || !!geomRef
      const isPlanBA = activeTab === 'plan-ba'
      const title = isPlanBA
        ? (lang === 'en' ? 'Structural Drawings (BA)' : 'Plans Structure (BA)')
        : (lang === 'en' ? 'MEP Drawings (7 trades)' : 'Plans MEP (7 lots)')
      const desc = isPlanBA
        ? (lang === 'en'
            ? 'Formwork and reinforcement execution drawings generated from Eurocode calculations. Includes axes, dimensions, and title block.'
            : 'Plans d\'exécution coffrage et ferraillage générés à partir des calculs Eurocodes. Inclut axes, cotations et cartouche.')
        : (lang === 'en'
            ? 'MEP execution drawings with equipment placement, network routing, and nomenclature per trade.'
            : 'Plans d\'exécution MEP avec placement des équipements, routage des réseaux et nomenclature par lot.')
      const badges = isPlanBA
        ? [lang === 'en' ? 'Formwork' : 'Coffrage', lang === 'en' ? 'Columns' : 'Poteaux', lang === 'en' ? 'Beams' : 'Poutres', lang === 'en' ? 'Slabs' : 'Dalles', lang === 'en' ? 'Foundations' : 'Fondations']
        : [lang === 'en' ? 'Plumbing' : 'Plomberie', lang === 'en' ? 'Electrical' : 'Électricité', 'CVC/HVAC', lang === 'en' ? 'Fire safety' : 'Sécurité incendie', lang === 'en' ? 'Low current' : 'Courants faibles']
      return (
        <Card>
          <div style={{ padding: '24px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#1B2A4A' }}>{title}</div>
              <span style={{
                fontSize: 10, background: '#E3F2FD', color: '#1565C0', borderRadius: 8,
                padding: '3px 12px', fontWeight: 700, border: '1px solid #90CAF9',
              }}>
                {lang === 'en' ? 'Preview — Under construction' : 'Apercu — En construction'}
              </span>
            </div>
            <div style={{
              background: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: 8,
              padding: '12px 16px', marginBottom: 16,
            }}>
              <span style={{ fontSize: 12, color: '#1565C0', lineHeight: 1.5 }}>
                {lang === 'en'
                  ? 'This feature is under active development. Plans are available for preview at no charge and are not included in your subscription billing.'
                  : 'Cette fonctionnalité est en cours de construction. Les plans sont accessibles en aperçu gratuitement et ne sont pas facturés dans votre abonnement.'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>{desc}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {badges.map(s => (
                <span key={s} style={{ fontSize: 10, background: VERT_LIGHT, color: VERT_DARK, padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
            {!hasDwg && (
              <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#B8860B', marginBottom: 6 }}>
                  {lang === 'en' ? 'DWG/DXF file required' : 'Fichier DWG/DXF requis'}
                </div>
                <p style={{ fontSize: 12, color: '#8B6914', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'en'
                    ? 'To generate execution drawings, please upload your architectural plans in DWG or DXF format using the panel below. All other deliverables (calculations, BOQ, reports) remain available without DWG.'
                    : 'Pour générer les plans d\'exécution, veuillez importer vos plans architecturaux au format DWG ou DXF via le panneau ci-dessous. Tous les autres livrables (notes de calcul, BOQ, rapports) restent disponibles sans fichier DWG.'}
                </p>
              </div>
            )}
            {hasDwg && (
              <div style={{ background: VERT_LIGHT, border: `1px solid ${VERT}`, borderRadius: 8, padding: '12px 16px' }}>
                <span style={{ fontSize: 12, color: VERT_DARK, fontWeight: 600 }}>
                  ✓ {dwgGeometry && Object.keys(dwgGeometry).length > 0
                    ? (lang === 'en' ? `Geometry ready: ${Object.keys(dwgGeometry).filter(k => !k.startsWith('_')).length} levels detected` : `Géométrie prête : ${Object.keys(dwgGeometry).filter(k => !k.startsWith('_')).length} niveaux détectés`)
                    : (lang === 'en' ? 'DWG geometry ready (stored server-side)' : 'Géométrie DWG prête (sauvegardée côté serveur)')}
                </span>
              </div>
            )}
          </div>
          <DwgLevelsManager dwgGeometry={dwgGeometry} setDwgGeometry={setDwgGeometry}
            supabase={supabase} projectId={projectId} lang={lang} />
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
      const lots = [
        [lang === 'en' ? 'Earthworks' : 'Terrassement', boq.cout_terr_fcfa, 'm³', boq.terrassement_m3],
        [lang === 'en' ? 'Foundations' : 'Fondations', boq.cout_fond_fcfa, 'm³', boq.beton_fondation_m3],
        [lang === 'en' ? 'Concrete (BA)' : 'Béton armé (BA)', boq.cout_beton_fcfa, 'm³', boq.beton_structure_m3],
        [lang === 'en' ? 'Reinforcing steel' : 'Acier HA', boq.cout_acier_fcfa, 'kg', boq.acier_kg],
        [lang === 'en' ? 'Formwork' : 'Coffrage', boq.cout_coffrage_fcfa, 'm²', boq.coffrage_m2],
        [lang === 'en' ? 'Masonry' : 'Maçonnerie', boq.cout_maco_fcfa, 'm²', boq.maconnerie_m2],
        [lang === 'en' ? 'Waterproofing' : 'Étanchéité', boq.cout_etanch_fcfa, 'm²', boq.etancheite_m2],
        [lang === 'en' ? 'Miscellaneous' : 'Divers', boq.cout_divers_fcfa, 'fft', ''],
      ].filter(r => r[1])
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
                <div style={{ fontWeight: 600 }}>{(() => {
                  const tx = deviseInfo?.taux_depuis_fcfa || 1.0
                  const sym = deviseInfo?.symbole || 'FCFA'
                  const bati = Math.round((boq.ratio_fcfa_m2_bati || 0) * tx)
                  const hab = Math.round((boq.ratio_fcfa_m2_habitable || 0) * tx)
                  return `${fmt(bati)} — ${fmt(hab)} ${sym}/m²`
                })()}</div>
                <div style={{ fontSize: 10, color: GRIS3 }}>{t('r_structure_seule')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_beton_acier')}</div>
                <div style={{ fontWeight: 600 }}>{fmt(beton_m3, 'm³')} / {fmt(acier_kg, 'kg')}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>{t('r_estimation_note')}</div>
          </Card>
          {lots.length > 0 && (
            <>
              <SectionTitle>{lang === 'en' ? 'Cost breakdown by lot' : 'Récapitulatif par lot'}</SectionTitle>
              <DataTable
                headers={[lang === 'en' ? 'Lot' : 'Poste', lang === 'en' ? 'Qty' : 'Qté', lang === 'en' ? 'Unit' : 'Unité', lang === 'en' ? 'Amount' : 'Montant', '% Total']}
                rows={lots.map(([label, cost, unit, qty]) => [
                  label,
                  qty ? fmt(qty, '', qty > 1000 ? 0 : 1) : '—',
                  unit,
                  fmtFcfa(cost, deviseInfo),
                  boq.total_haut_fcfa > 0 ? `${Math.round(cost / boq.total_haut_fcfa * 100)}%` : '—',
                ])}
                colWidths={['28%', '14%', '10%', '28%', '12%']}
              />
            </>
          )}
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
      // Build lot breakdown from MEP data
      const el = mepData.electrique || {}
      const pl = mepData.plomberie || {}
      const cv = mepData.cvc || {}
      const mepLots = [
        [lang === 'en' ? 'Electrical' : 'Électricité', boqm.elec_basic_fcfa || boqm.lot_elec_basic, boqm.elec_hend_fcfa || boqm.lot_elec_hend],
        [lang === 'en' ? 'Plumbing' : 'Plomberie', boqm.plomb_basic_fcfa || boqm.lot_plomb_basic, boqm.plomb_hend_fcfa || boqm.lot_plomb_hend],
        [lang === 'en' ? 'HVAC' : 'CVC / Climatisation', boqm.cvc_basic_fcfa || boqm.lot_cvc_basic, boqm.cvc_hend_fcfa || boqm.lot_cvc_hend],
        [lang === 'en' ? 'Fire Safety' : 'Sécurité incendie', boqm.ssi_basic_fcfa || boqm.lot_ssi_basic, boqm.ssi_hend_fcfa || boqm.lot_ssi_hend],
        [lang === 'en' ? 'Low Voltage' : 'Courants faibles', boqm.cf_basic_fcfa || boqm.lot_cf_basic, boqm.cf_hend_fcfa || boqm.lot_cf_hend],
      ].filter(r => r[1] || r[2])
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
              <div style={{ fontWeight: 600 }}>{(() => {
                const tx = deviseInfo?.taux_depuis_fcfa || 1.0
                const sym = deviseInfo?.symbole || 'FCFA'
                return `${fmt(Math.round(ratio_b * tx))} — ${fmt(Math.round(ratio_h * tx))} ${sym}/m²`
              })()} <span style={{ fontSize: 11, color: GRIS3 }}>(basic → high-end)</span></div>
            </div>
            {boqm.recommandation && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: VERT_LIGHT, borderRadius: 6, fontSize: 12, color: '#2d7a3a' }}>
                <strong>{t('r_recommandation')} :</strong> {boqm.recommandation}
              </div>
            )}
          </Card>
          {mepLots.length > 0 && (
            <>
              <SectionTitle>{lang === 'en' ? 'Cost breakdown by trade' : 'Récapitulatif par lot technique'}</SectionTitle>
              <DataTable
                headers={['Lot', 'Basic', 'High-End']}
                rows={mepLots.map(([label, basic, hend]) => [
                  label,
                  fmtFcfa(basic, deviseInfo),
                  fmtFcfa(hend, deviseInfo),
                ])}
                colWidths={['40%', '30%', '30%']}
              />
            </>
          )}
        </>
      )
    }

    // ── CONFORMITÉ EDGE (ex EDGE Assessment v3.0.0) ──
    if (activeTab === 'edge-assessment' && mepData) {
      const edge = mepData.edge || {}
      const piliers = [
        { key: 'economie_energie_pct', label: t('r_energie_label'), base: edge.base_energie_kwh_m2_an, projet: edge.projet_energie_kwh_m2_an, unite: 'kWh/m²/an' },
        { key: 'economie_eau_pct', label: t('r_eau_label'), base: edge.base_eau_L_pers_j, projet: edge.projet_eau_L_pers_j, unite: 'L/pers/j' },
        { key: 'economie_materiaux_pct', label: t('r_materiaux_label'), base: edge.base_ei_kwh_m2, projet: edge.projet_ei_kwh_m2, unite: 'kWh/m²' },
      ]
      const seuil = 20

      // Gauge bar component
      const Gauge = ({ label, value, base, projet, unite }) => {
        const pct = value || 0
        const ok = pct >= seuil
        const barColor = ok ? VERT : ORANGE
        const barW = Math.min(pct, 100)
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{label}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: barColor }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ position: 'relative', height: 18, background: '#F0F0F0', borderRadius: 9, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${barW}%`, background: barColor, borderRadius: 9, transition: 'width 0.6s ease' }} />
              <div style={{ position: 'absolute', left: `${seuil}%`, top: -2, bottom: -2, width: 2, background: '#333', zIndex: 2 }} />
              <div style={{ position: 'absolute', left: `${seuil}%`, top: -14, fontSize: 9, color: '#555', transform: 'translateX(-50%)', fontWeight: 600 }}>20%</div>
            </div>
            {base != null && projet != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: GRIS3, marginTop: 3 }}>
                <span>{t('r_reference')}: {base?.toFixed(0)} {unite}</span>
                <span>{t('r_projet')}: {projet?.toFixed(0)} {unite} ({ok ? '✓' : '✗'})</span>
              </div>
            )}
          </div>
        )
      }

      return (
        <>
          {/* EDGE mode banner */}
          {edgeMode && (
            <div style={{ background: '#EBF7ED', border: `1px solid ${VERT}`, borderRadius: 8, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🌱</span>
              <span style={{ fontSize: 13, color: '#2D7A3A', fontWeight: 600, flex: 1 }}>{t('r_mode_edge_actif')}</span>
              <button onClick={revenirStandard} style={{ background: 'none', border: `1px solid ${VERT}`, color: '#2D7A3A', borderRadius: 6, padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                {t('r_revenir_standard')}
              </button>
            </div>
          )}

          {/* Section 1: Verdict + Gauges */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Badge ok={edge.certifiable} label={edge.certifiable ? t('r_certifiable') : t('r_non_certifiable')} />
              {edge.niveau_certification && <span style={{ fontSize: 12, color: '#555' }}>{edge.niveau_certification}</span>}
            </div>
            <SectionTitle>{t('r_performance_actuelle')}</SectionTitle>
            {piliers.map(({ key, label, base, projet, unite }) => (
              <Gauge key={key} label={label} value={edge[key] || 0} base={base} projet={projet} unite={unite} />
            ))}
            <div style={{ fontSize: 11, color: GRIS3, marginTop: 8, borderTop: `1px solid ${GRIS2}`, paddingTop: 8 }}>
              {t('r_edge_note')}
            </div>
          </Card>

          {/* Section 2: Modifications proposées */}
          {edge.plan_action?.length > 0 && !edgeMode && (
            <>
              <SectionTitle>{t('r_modifications_proposees')}</SectionTitle>
              <Card>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${GRIS2}` }}>
                        {[t('r_mesure'), t('r_pilier'), t('r_impact'), t('r_cout')].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: GRIS3, fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {edge.plan_action.map((a, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${GRIS1}` }}>
                          <td style={{ padding: '8px 10px', fontWeight: 500 }}>{a.action}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ background: a.pilier === 'Énergie' ? '#FFF3E0' : a.pilier === 'Eau' ? '#E3F2FD' : '#F3E5F5', color: a.pilier === 'Énergie' ? '#E65100' : a.pilier === 'Eau' ? '#1565C0' : '#7B1FA2', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                              {a.pilier}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: VERT, fontWeight: 600 }}>+{a.gain_pct}%</td>
                          <td style={{ padding: '8px 10px', color: '#555' }}>{a.cout_fcfa > 0 ? fmtFcfa(a.cout_fcfa, deviseInfo) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${GRIS2}`, background: GRIS1 }}>
                        <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 700, fontSize: 12 }}>{t('r_total_surcout')}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: ORANGE }}>{fmtFcfa(edge.cout_mise_conformite_fcfa, deviseInfo)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {edge.roi_ans > 0 && (
                  <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>
                    ROI {t('r_economie').toLowerCase()}: ~{edge.roi_ans} {lang === 'en' ? 'years' : 'ans'}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Section 3: Measures detail (expandable) */}
          {['mesures_energie', 'mesures_eau', 'mesures_materiaux'].map((key, i) => (
            edge[key]?.length > 0 && (
              <div key={key}>
                <SectionTitle>{[t('r_mesures_energie'), t('r_mesures_eau'), t('r_mesures_materiaux')][i]}</SectionTitle>
                <Card>
                  {edge[key].map((m, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12, marginBottom: 6, padding: '6px 10px', background: m.statut?.includes('Intégré') || m.statut?.toLowerCase().includes('standard') ? '#F0FFF4' : '#FFFBF0', borderRadius: 4 }}>
                      <span style={{ color: m.statut?.includes('Intégré') || m.statut?.toLowerCase().includes('standard') ? VERT : ORANGE, fontWeight: 700, fontSize: 14 }}>
                        {m.statut?.includes('Intégré') || m.statut?.toLowerCase().includes('standard') ? '✓' : '○'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 500 }}>{m.mesure}</span>
                        <span style={{ color: VERT, fontWeight: 600 }}> +{m.gain_pct}%</span>
                        {m.statut && <span style={{ fontSize: 10, color: GRIS3 }}> — {m.statut}</span>}
                        {m.impact_prix && <div style={{ fontSize: 10, color: ORANGE, marginTop: 2 }}>💰 {m.impact_prix}</div>}
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            )
          ))}

          {/* Section 4: Recommandations architecturales (quand mesures techniques insuffisantes) */}
          {edge.recommandations_archi?.length > 0 && !edgeMode && (
            <>
              <SectionTitle>{lang === 'en' ? 'Architectural Recommendations' : 'Recommandations architecturales'}</SectionTitle>
              <Card style={{ borderLeft: '3px solid #1565C0' }}>
                <div style={{ fontSize: 12, color: '#1565C0', marginBottom: 10, fontWeight: 600 }}>
                  {lang === 'en'
                    ? 'The technical measures alone are insufficient. The following architectural changes would enable EDGE certification:'
                    : 'Les mesures techniques seules sont insuffisantes. Les évolutions architecturales suivantes permettraient la certification EDGE :'}
                </div>
                {edge.recommandations_archi.map((r, i) => (
                  <div key={i} style={{ padding: '10px 12px', marginBottom: 8, background: '#F5F8FF', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: r.pilier === 'Énergie' ? '#FFF3E0' : r.pilier === 'Eau' ? '#E3F2FD' : '#F3E5F5', color: r.pilier === 'Énergie' ? '#E65100' : r.pilier === 'Eau' ? '#1565C0' : '#7B1FA2', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                        {r.pilier}
                      </span>
                      <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>{r.type}</span>
                      <span style={{ marginLeft: 'auto', color: VERT, fontWeight: 700, fontSize: 12 }}>+{r.gain_potentiel_pct}%</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 2 }}>{r.recommandation}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{r.detail}</div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* Section 5: Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
            {/* Mise en conformité / Revenir au standard */}
            {!edgeMode ? (
              <button onClick={activerModeEDGE} disabled={edgeLoading} style={{
                background: edgeLoading ? '#ccc' : VERT,
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '14px 28px', fontSize: 14, fontWeight: 700,
                cursor: edgeLoading ? 'not-allowed' : 'pointer', width: '100%',
              }}>
                {edgeLoading ? t('r_optimisation_cours') : `🌱 ${t('r_mise_conformite_edge')}`}
              </button>
            ) : (
              <button onClick={revenirStandard} style={{
                background: '#fff', border: `2px solid ${ORANGE}`,
                color: ORANGE, borderRadius: 8,
                padding: '14px 28px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', width: '100%',
              }}>
                {t('r_revenir_standard')}
              </button>
            )}
            <div style={{ fontSize: 11, color: GRIS3, textAlign: 'center' }}>
              {edgeMode ? t('r_revenir_standard_desc') : t('r_mise_conformite_desc')}
            </div>

            {/* Télécharger la liasse EDGE */}
            <button
              onClick={() => {
                const extra = { edge_mode: edgeMode }
                if (dwgGeometry) extra.dwg_geometry = dwgGeometry
                const ee = dbProjet?.edge_extras || {}
                Object.assign(extra, ee)
                download('/generate-edge-dossier', `TijanAI_LiasseEDGE_${(params.nom || 'projet').replace(/\s+/g, '_').slice(0, 20)}_${new Date().toISOString().slice(0,10)}.pdf`, extra)
              }}
              disabled={!!dlLoading}
              style={{
                background: dlLoading === '/generate-edge-dossier' ? '#ccc' : '#1B2A4A',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '12px 28px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', width: '100%',
              }}
            >
              {dlLoading === '/generate-edge-dossier' ? t('res_generation') : `📋 ${t('r_telecharger_liasse')}`}
            </button>
            <div style={{ fontSize: 11, color: GRIS3, textAlign: 'center' }}>
              {t('r_liasse_desc')}
            </div>
          </div>
        </>
      )
    }

    // (Fiches techniques removed from sidebar)


    // ── BOQ FINITIONS ──
    if (activeTab === 'finitions') {
      if (!finitionsData && params?.surface_emprise_m2) {
        fetch(`${BACKEND}/calculate-finitions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }).then(r => r.json()).then(d => { if (d.ok) setFinitionsData(d.finitions) }).catch(() => {})
      }
      const POSTE_LABELS = {
        carrelage: lang === 'en' ? 'Floor Tiling' : 'Carrelage',
        menuiserie_interieure: lang === 'en' ? 'Interior Joinery' : 'Menuiserie intérieure',
        menuiserie_exterieure: lang === 'en' ? 'Exterior Joinery' : 'Menuiserie extérieure',
        faux_plafond: lang === 'en' ? 'False Ceiling' : 'Faux-plafond',
        peinture: lang === 'en' ? 'Painting & Finishes' : 'Peinture et enduits',
        cuisine: lang === 'en' ? 'Fitted Kitchen' : 'Cuisine équipée'
      }
      const GAMME_LABELS = { basic: 'BASIC', high_end: 'HIGH-END', luxury: 'LUXURY' }
      const GAMME_COLORS = { basic: '#3B82F6', high_end: VERT, luxury: '#F59E0B' }
      const surfaceBatie = (params?.surface_emprise_m2 || 0) * (params?.nb_niveaux || 1)
      return (
        <Card>
          <SectionTitle>{t('tab_finitions')}</SectionTitle>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            {lang === 'en'
              ? `Interior and exterior finishes estimate for ${Math.round(surfaceBatie).toLocaleString('fr-FR')} m² built area — 3 quality levels.`
              : `Estimation des finitions intérieures et extérieures pour ${Math.round(surfaceBatie).toLocaleString('fr-FR')} m² bâtis — 3 niveaux de standing.`}
          </div>
          {!finitionsData ? (
            <Spinner text={lang === 'en' ? 'Calculating finishes...' : 'Calcul des finitions...'} />
          ) : (
            <>
              {/* Comparative table */}
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 10px', background: GRIS1, borderBottom: `2px solid ${VERT}`, fontWeight: 700, color: '#333', width: '22%' }}>
                        {lang === 'en' ? 'Item' : 'Poste'}
                      </th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', background: GRIS1, borderBottom: `2px solid ${VERT}`, fontWeight: 600, color: '#666', width: '8%' }}>
                        {lang === 'en' ? 'Qty' : 'Qté'}
                      </th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', background: GRIS1, borderBottom: `2px solid ${VERT}`, fontWeight: 600, color: '#666', width: '5%' }}>
                        {lang === 'en' ? 'Unit' : 'Unité'}
                      </th>
                      {Object.entries(GAMME_LABELS).map(([gamme, label]) => (
                        <th key={gamme} style={{ textAlign: 'right', padding: '8px 10px', background: GAMME_COLORS[gamme], color: '#fff', fontWeight: 700, width: '21.66%' }}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(POSTE_LABELS).map(([poste, pl], idx) => {
                      const basicItem = finitionsData.basic?.detail?.[poste] || {}
                      const heItem = finitionsData.high_end?.detail?.[poste] || {}
                      const luxItem = finitionsData.luxury?.detail?.[poste] || {}
                      return (
                        <tr key={poste} style={{ background: idx % 2 === 0 ? '#fff' : GRIS1 }}>
                          <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEE' }}>
                            <div style={{ fontWeight: 600, color: '#333' }}>{pl}</div>
                            <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{basicItem.description || ''}</div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px 6px', borderBottom: '1px solid #EEE', color: '#555', fontWeight: 500 }}>
                            {basicItem.quantite?.toLocaleString('fr-FR') || '—'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px 6px', borderBottom: '1px solid #EEE', color: '#888' }}>
                            {basicItem.unite || '—'}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid #EEE' }}>
                            <div style={{ fontWeight: 600, color: '#111' }}>{fmtFcfa(basicItem.montant, deviseInfo)}</div>
                            <div style={{ fontSize: 9, color: '#999' }}>{fmtFcfa(basicItem.pu, deviseInfo)}/{basicItem.unite}</div>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid #EEE' }}>
                            <div style={{ fontWeight: 600, color: '#111' }}>{fmtFcfa(heItem.montant, deviseInfo)}</div>
                            <div style={{ fontSize: 9, color: '#999' }}>{fmtFcfa(heItem.pu, deviseInfo)}/{heItem.unite}</div>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid #EEE' }}>
                            <div style={{ fontWeight: 600, color: '#111' }}>{fmtFcfa(luxItem.montant, deviseInfo)}</div>
                            <div style={{ fontSize: 9, color: '#999' }}>{fmtFcfa(luxItem.pu, deviseInfo)}/{luxItem.unite}</div>
                          </td>
                        </tr>
                      )
                    })}
                    {/* Total row */}
                    <tr style={{ borderTop: `2px solid ${VERT}` }}>
                      <td colSpan={3} style={{ padding: '10px 10px', fontWeight: 800, fontSize: 13, color: '#333' }}>TOTAL</td>
                      {['basic', 'high_end', 'luxury'].map(gamme => (
                        <td key={gamme} style={{ textAlign: 'right', padding: '10px 10px', fontWeight: 800, fontSize: 13, color: GAMME_COLORS[gamme] }}>
                          {fmtFcfa(finitionsData[gamme]?.total, deviseInfo)}
                        </td>
                      ))}
                    </tr>
                    {/* Ratio per m² */}
                    <tr>
                      <td colSpan={3} style={{ padding: '4px 10px', fontSize: 10, color: '#888' }}>
                        {lang === 'en' ? 'Ratio per m²' : 'Ratio au m²'}
                      </td>
                      {['basic', 'high_end', 'luxury'].map(gamme => {
                        const ratio = surfaceBatie > 0 ? (finitionsData[gamme]?.total || 0) / surfaceBatie : 0
                        return (
                          <td key={gamme} style={{ textAlign: 'right', padding: '4px 10px', fontSize: 10, color: '#888' }}>
                            {fmtFcfa(ratio, deviseInfo)}/m²
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Brands summary */}
              <div style={{ background: GRIS1, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                  {lang === 'en' ? 'Recommended brands by quality level' : 'Marques recommandées par gamme'}
                </div>
                {Object.entries(POSTE_LABELS).map(([poste, pl]) => {
                  const heItem = finitionsData.high_end?.detail?.[poste]
                  if (!heItem?.marques) return null
                  return (
                    <div key={poste} style={{ fontSize: 10, color: '#666', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: '#444' }}>{pl}:</span>{' '}
                      {heItem.marques}
                    </div>
                  )
                })}
              </div>

              <div style={{ fontSize: 10, color: GRIS3, fontStyle: 'italic' }}>
                {lang === 'en'
                  ? `Prices for ${params?.ville || 'Dakar'} — including supply and installation. Download the complete BOQ for details.`
                  : `Prix marché ${params?.ville || 'Dakar'} — fourniture et pose incluses. Téléchargez le BOQ complet pour le détail.`}
              </div>
            </>
          )}
        </Card>
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

    // ── FICHES TECHNIQUES & FOURNISSEURS ──
    if (activeTab === 'fiches-techniques') {
      const FICHES = [
        {
          icon: '🧱',
          titre: lang === 'en' ? 'Concrete & Reinforcement' : 'Béton & Armatures',
          items: [
            { mat: lang === 'en' ? 'Ready-mix concrete' : 'Béton prêt à l\'emploi (BPE)', spec: resultats?.classe_beton || 'C25/30', fournisseurs: 'LafargeHolcim, SOCOCIM (SN), CIMAF (CI), Dangote (NG), Ciments du Maroc' },
            { mat: lang === 'en' ? 'Reinforcing steel' : 'Acier HA haute adhérence', spec: resultats?.classe_acier || 'HA500', fournisseurs: 'ArcelorMittal, SOSEDIM (SN), Turkish Steel, Dangote Steel (NG)' },
            { mat: lang === 'en' ? 'Formwork' : 'Coffrage bois/métallique', spec: 'PERI, DOKA', fournisseurs: 'PERI, Doka, Paschal, menuisiers locaux' },
          ]
        },
        {
          icon: '⚡',
          titre: lang === 'en' ? 'Electrical' : 'Électricité',
          items: [
            { mat: lang === 'en' ? 'Main switchboard (TGBT)' : 'Tableau général (TGBT)', spec: 'NF C 15-100', fournisseurs: 'Schneider Electric, Legrand, Hager, ABB' },
            { mat: lang === 'en' ? 'Cables & conduits' : 'Câbles & conduits', spec: 'U1000 R2V', fournisseurs: 'Nexans, Prysmian, Südkabel, General Cable' },
            { mat: lang === 'en' ? 'Switches & outlets' : 'Appareillage (prises, inter.)', spec: 'IP20/IP44', fournisseurs: 'Legrand Mosaic, Schneider Odace, Hager' },
          ]
        },
        {
          icon: '💧',
          titre: lang === 'en' ? 'Plumbing' : 'Plomberie',
          items: [
            { mat: lang === 'en' ? 'PPR pipes' : 'Tubes PPR eau chaude/froide', spec: 'PN20, DTU 60.11', fournisseurs: 'Wavin, Aliaxis, Interplast (SN), Pipelife' },
            { mat: lang === 'en' ? 'PVC drainage' : 'Évacuation PVC', spec: 'Ø100-160mm', fournisseurs: 'Nicoll, Girpi, Interplast, Aliaxis' },
            { mat: lang === 'en' ? 'Sanitary fixtures' : 'Équipements sanitaires', spec: 'NF EN 997', fournisseurs: 'Grohe, Roca, Jacob Delafon, Duravit, VitrA' },
          ]
        },
        {
          icon: '❄️',
          titre: lang === 'en' ? 'HVAC' : 'Climatisation & Ventilation',
          items: [
            { mat: lang === 'en' ? 'Split AC units' : 'Climatiseurs split', spec: 'R32/R410A', fournisseurs: 'Daikin, Carrier, Midea, Samsung, LG' },
            { mat: lang === 'en' ? 'VMC extraction' : 'VMC extraction', spec: 'DTU 68.3', fournisseurs: 'Atlantic, Aldes, Unelvent, S&P' },
            { mat: lang === 'en' ? 'Copper piping' : 'Tubes cuivre frigorifiques', spec: 'NF EN 12735', fournisseurs: 'KME, Wieland, Halcor' },
          ]
        },
        {
          icon: '🔥',
          titre: lang === 'en' ? 'Fire Safety' : 'Sécurité Incendie',
          items: [
            { mat: lang === 'en' ? 'Fire detection' : 'Détection incendie (SSI)', spec: 'NF S 61-970', fournisseurs: 'Siemens, Honeywell, Bosch, Notifier' },
            { mat: lang === 'en' ? 'Fire extinguishers' : 'Extincteurs & RIA', spec: 'NF EN 3, IT 246', fournisseurs: 'Desautel, Sicli, Andrieu, Gloria' },
            { mat: lang === 'en' ? 'Sprinkler system' : 'Réseau sprinklers', spec: 'NF EN 12845', fournisseurs: 'Viking, Tyco, Reliable, Victaulic' },
          ]
        },
        {
          icon: '🛗',
          titre: lang === 'en' ? 'Elevators' : 'Ascenseurs',
          items: [
            { mat: lang === 'en' ? 'Passenger elevator' : 'Ascenseur passagers', spec: `${mepData?.ascenseurs?.capacite_kg || 630} kg`, fournisseurs: 'Otis, Schindler, KONE, ThyssenKrupp, Mitsubishi' },
          ]
        },
      ]

      return (
        <Card>
          <SectionTitle>{t('tab_fiches_techniques')}</SectionTitle>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
            {lang === 'en'
              ? 'Technical specifications and recommended suppliers for all materials and equipment. Download the full PDF for detailed datasheets per item.'
              : 'Spécifications techniques et fournisseurs recommandés pour l\'ensemble des matériaux et équipements. Téléchargez le PDF complet pour les fiches détaillées par item.'}
          </div>
          {FICHES.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1B2A4A' }}>{cat.titre}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 10px', background: VERT, color: '#fff', fontWeight: 600, borderRadius: ci === 0 ? '6px 0 0 0' : 0 }}>
                      {lang === 'en' ? 'Material / Equipment' : 'Matériau / Équipement'}
                    </th>
                    <th style={{ textAlign: 'center', padding: '8px 10px', background: VERT, color: '#fff', fontWeight: 600, width: '18%' }}>
                      {lang === 'en' ? 'Specification' : 'Norme / Spec.'}
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px 10px', background: VERT, color: '#fff', fontWeight: 600, borderRadius: ci === 0 ? '0 6px 0 0' : 0 }}>
                      {lang === 'en' ? 'Recommended Suppliers' : 'Fournisseurs recommandés'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((item, ii) => (
                    <tr key={ii} style={{ background: ii % 2 === 0 ? '#fff' : GRIS1 }}>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEE', fontWeight: 600, color: '#333' }}>
                        {item.mat}
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEE', textAlign: 'center', color: '#666' }}>
                        {item.spec}
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEE', color: '#888', fontStyle: 'italic' }}>
                        {item.fournisseurs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div style={{ fontSize: 10, color: GRIS3, fontStyle: 'italic', marginTop: 8 }}>
            {lang === 'en'
              ? `Suppliers listed are available in ${params?.ville || 'Dakar'} or import to West Africa. Download the complete technical datasheets for full details.`
              : `Fournisseurs disponibles à ${params?.ville || 'Dakar'} ou à l\'import en Afrique de l\'Ouest. Téléchargez les fiches techniques complètes pour le détail.`}
          </div>
        </Card>
      )
    }

    // ── RAPPORT EXÉCUTIF ──
    if (activeTab === 'rapport-executif') {
      // Auto-load finitions data if not yet fetched
      if (!finitionsData && params?.surface_emprise_m2) {
        fetch(`${BACKEND}/calculate-finitions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }).then(r => r.json()).then(d => { if (d.ok) setFinitionsData(d.finitions) }).catch(() => {})
      }
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
          {(() => {
            const boqm = mepData?.boq_mep || {}
            const sBatie = boq.surface_batie_m2 || (surf * niv)
            const devise = deviseInfo?.symbole || 'FCFA'
            const taux = deviseInfo?.taux_depuis_fcfa || 1.0
            const m2 = (v) => {
              if (sBatie <= 0) return '—'
              const fcfaM2 = v / sBatie
              const localM2 = Math.round(fcfaM2 * taux)
              if (deviseInfo?.devise === 'MRU') return `${fmt(localM2)} ${devise}/m² (${fmt(Math.round(fcfaM2))} FCFA/m²)`
              return `${fmt(localM2)} ${devise}/m²`
            }

            // Structure
            const strBas = boq.total_bas_fcfa || 0
            const strHaut = boq.total_haut_fcfa || 0

            // MEP
            const mepBas = boqm.basic_fcfa || 0
            const mepHaut = boqm.hend_fcfa || 0
            const mepOk = mepData?.ok

            // Finitions 3 gammes
            const finBasic = finitionsData?.basic?.total || 0
            const finHE = finitionsData?.high_end?.total || 0
            const finLux = finitionsData?.luxury?.total || 0
            const finOk = !!finitionsData

            // Totaux fourchette
            const totalBas = strBas + mepBas + finBasic
            const totalHaut = strHaut + mepHaut + finLux
            const totalRef = strHaut + mepHaut + finHE // référence High-End

            return (
              <>
                {/* ── STRUCTURE ── */}
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 24, background: VERT, borderRadius: 2 }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>Structure — Gros Œuvre</span>
                    </div>
                    <span style={{ fontSize: 11, color: GRIS3 }}>{totalRef > 0 ? Math.round(strHaut / totalRef * 100) : '—'}% du budget</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 140, background: GRIS1, borderRadius: 6, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: GRIS3 }}>Fourchette basse</div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{fmtFcfa(strBas, deviseInfo)}</div>
                      <div style={{ fontSize: 10, color: GRIS3 }}>{m2(strBas)}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 140, background: '#F0FFF4', border: `1px solid ${VERT}`, borderRadius: 6, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: VERT }}>Fourchette haute</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: VERT }}>{fmtFcfa(strHaut, deviseInfo)}</div>
                      <div style={{ fontSize: 10, color: VERT }}>{m2(strHaut)}</div>
                    </div>
                  </div>
                </Card>

                {/* ── MEP ── */}
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 24, background: '#1565C0', borderRadius: 2 }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>MEP — Corps d'état techniques</span>
                    </div>
                    <span style={{ fontSize: 11, color: GRIS3 }}>{mepOk && totalRef > 0 ? Math.round(mepHaut / totalRef * 100) : '—'}% du budget</span>
                  </div>
                  {mepOk ? (
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 140, background: GRIS1, borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: GRIS3 }}>Fourchette basse</div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{fmtFcfa(mepBas, deviseInfo)}</div>
                        <div style={{ fontSize: 10, color: GRIS3 }}>{m2(mepBas)}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 140, background: '#E3F2FD', border: '1px solid #1565C0', borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: '#1565C0' }}>Fourchette haute</div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1565C0' }}>{fmtFcfa(mepHaut, deviseInfo)}</div>
                        <div style={{ fontSize: 10, color: '#1565C0' }}>{m2(mepHaut)}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#FFF8E1', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#B8860B' }}>
                      <Spinner text="Chargement du calcul MEP..." />
                    </div>
                  )}
                </Card>

                {/* ── FINITIONS ── */}
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 24, background: ORANGE, borderRadius: 2 }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>Finitions — Second Œuvre</span>
                    </div>
                    <span style={{ fontSize: 11, color: GRIS3 }}>{finOk && totalRef > 0 ? Math.round(finHE / totalRef * 100) : '—'}% du budget</span>
                  </div>
                  {finOk ? (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 120, background: GRIS1, borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: GRIS3 }}>Basic</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtFcfa(finBasic, deviseInfo)}</div>
                        <div style={{ fontSize: 10, color: GRIS3 }}>{m2(finBasic)}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 120, background: ORANGE_LT, border: `1px solid ${ORANGE}`, borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: ORANGE }}>High-End</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: ORANGE }}>{fmtFcfa(finHE, deviseInfo)}</div>
                        <div style={{ fontSize: 10, color: ORANGE }}>{m2(finHE)}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 120, background: '#FFF8E1', border: '1px solid #F59E0B', borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: '#B8860B' }}>Luxury</div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#B8860B' }}>{fmtFcfa(finLux, deviseInfo)}</div>
                        <div style={{ fontSize: 10, color: '#B8860B' }}>{m2(finLux)}</div>
                      </div>
                    </div>
                  ) : (
                    <Spinner text="Calcul des finitions..." />
                  )}
                </Card>

                {/* ── TOTAL ── */}
                <Card style={{ background: '#F0FFF4', border: `2px solid ${VERT}` }}>
                  <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>COÛT TOTAL PROJET (Structure + MEP + Finitions)</div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ fontSize: 11, color: GRIS3 }}>Fourchette</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: VERT }}>
                        {fmtFcfa(totalBas, deviseInfo)} — {fmtFcfa(totalHaut, deviseInfo)}
                      </div>
                    </div>
                    <div style={{ borderLeft: `1px solid ${GRIS2}`, paddingLeft: 16 }}>
                      <div style={{ fontSize: 11, color: GRIS3 }}>Référence (High-End)</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtFcfa(totalRef, deviseInfo)}</div>
                      <div style={{ fontSize: 11, color: GRIS3 }}>{m2(totalRef)}</div>
                    </div>
                  </div>
                  {(!mepOk || !finOk) && (
                    <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>
                      {!mepOk && 'MEP en cours de chargement. '}{!finOk && 'Finitions en cours de chargement. '}Le total sera mis à jour automatiquement.
                    </div>
                  )}
                </Card>
              </>
            )
          })()}
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

    // ── PLANNING D'EXÉCUTION ──
    if (activeTab === 'planning') {
      const durEst = resultats?.boq?.duree_estimee_mois || Math.ceil((params.nb_niveaux || 5) * 2.5)
      const coutStr = fmtFcfa(boq?.total_haut_fcfa || 0, deviseInfo)
      const coutMep = fmtFcfa(mepData?.boq_mep?.hend_fcfa || 0, deviseInfo)
      return (
        <>
          <Card>
            <SectionTitle>{"Planning d'exécution des travaux"}</SectionTitle>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Projet</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{params.nom}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{params.ville} — R+{(params.nb_niveaux||1)-1}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Durée estimée</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: VERT }}>{durEst} mois</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Surface bâtie</div>
                <div style={{ fontWeight: 600 }}>{fmt(surf_batie, 'm²')}</div>
              </div>
            </div>
          </Card>
          <SectionTitle>Phases principales</SectionTitle>
          <DataTable
            headers={['Phase', 'Lot', 'Durée estimée']}
            rows={[
              ['Préparation du chantier', 'Structure', '~1 mois'],
              ['Fondations', 'Structure', `~${Math.ceil(niv * 0.3)} mois`],
              ['Gros œuvre (Structure BA)', 'Structure', `~${Math.ceil(niv * 1.0)} mois`],
              ['Maçonnerie', 'Structure', `~${Math.ceil(niv * 0.7)} mois`],
              ['Corps d\'état techniques (MEP)', 'MEP', `~${Math.ceil(niv * 0.8)} mois`],
              ['Finitions et aménagements', 'Finitions', `~${Math.ceil(niv * 0.6)} mois`],
            ]}
          />
          <Card style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              Le PDF contient le diagramme de Gantt complet avec toutes les tâches, dépendances et le chemin critique. Format paysage pour une meilleure lisibilité.
            </div>
          </Card>
        </>
      )
    }

    // ── TRÉSORERIE ──
    if (activeTab === 'tresorerie') {
      const totalStruct = boq?.total_haut_fcfa || 0
      const totalMep = mepData?.boq_mep?.hend_fcfa || 0
      const totalGlobal = totalStruct + totalMep
      const finEst = Math.round((params.surface_emprise_m2 || 300) * (params.nb_niveaux || 5) * 55000)
      const grandTotal = totalGlobal + finEst
      return (
        <>
          <Card>
            <SectionTitle>Planning des dépenses (Trésorerie)</SectionTitle>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Projet</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{params.nom}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Budget global estimé</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: VERT }}>{fmtFcfa(grandTotal, deviseInfo)}</div>
              </div>
            </div>
          </Card>
          <SectionTitle>Ventilation budgétaire par lot</SectionTitle>
          <DataTable
            headers={['Lot', 'Montant estimé', '% du total']}
            rows={[
              ['Structure (Gros œuvre)', fmtFcfa(totalStruct, deviseInfo), grandTotal > 0 ? `${Math.round(totalStruct/grandTotal*100)}%` : '—'],
              ['MEP (Corps d\'état techniques)', fmtFcfa(totalMep, deviseInfo), grandTotal > 0 ? `${Math.round(totalMep/grandTotal*100)}%` : '—'],
              ['Finitions (estimation)', fmtFcfa(finEst, deviseInfo), grandTotal > 0 ? `${Math.round(finEst/grandTotal*100)}%` : '—'],
            ]}
          />
          <Card style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              Le PDF contient le plan de trésorerie mensuel complet, la courbe en S des dépenses cumulées, et le tableau croisé Lot × Phase.
            </div>
          </Card>
        </>
      )
    }

    // (Fiches finitions removed from sidebar)

    // ── DAO (APPEL D'OFFRES) ──
    if (activeTab?.startsWith('dao-')) {
      const lotConfig = {
        'dao-structure': {
          titre: lang === 'en' ? 'Structure — Main Works' : 'Structure — Gros Œuvre',
          postes: [
            ['S.1', lang === 'en' ? 'Site preparation' : 'Installation de chantier', 'fft', 1],
            ['S.2', lang === 'en' ? 'Earthworks' : 'Terrassement', 'm³', boq.terrassement_m3 ? Math.round(boq.terrassement_m3) : '—'],
            ['S.3', lang === 'en' ? 'Foundations' : 'Fondations', 'm³', boq.beton_fondation_m3 ? Math.round(boq.beton_fondation_m3) : '—'],
            ['S.4', lang === 'en' ? 'Reinforced concrete (columns, beams, slabs)' : 'Béton armé (poteaux, poutres, dalles)', 'm³', boq.beton_structure_m3 ? Math.round(boq.beton_structure_m3) : '—'],
            ['S.5', lang === 'en' ? 'Reinforcing steel' : 'Acier HA', 'kg', boq.acier_kg ? Math.round(boq.acier_kg).toLocaleString('fr-FR') : '—'],
            ['S.6', lang === 'en' ? 'Formwork' : 'Coffrage', 'm²', boq.coffrage_m2 ? Math.round(boq.coffrage_m2) : '—'],
            ['S.7', lang === 'en' ? 'Masonry' : 'Maçonnerie', 'm²', boq.maconnerie_m2 ? Math.round(boq.maconnerie_m2) : '—'],
            ['S.8', lang === 'en' ? 'Waterproofing' : 'Étanchéité', 'm²', boq.etancheite_m2 ? Math.round(boq.etancheite_m2) : '—'],
          ],
        },
        'dao-mep': {
          titre: lang === 'en' ? "MEP — Technical Trades" : "MEP — Corps d'état techniques",
          postes: [
            ['E', lang === 'en' ? 'Electrical (HV/LV)' : 'Électricité courants forts', 'fft', 1],
            ['P', lang === 'en' ? 'Plumbing / Water supply' : 'Plomberie / Alimentation eau', 'fft', 1],
            ['C', lang === 'en' ? 'HVAC / Air conditioning' : 'CVC / Climatisation', 'fft', 1],
            ['SSI', lang === 'en' ? 'Fire safety' : 'Sécurité incendie', 'fft', 1],
            ['CF', lang === 'en' ? 'Low voltage / Data' : 'Courants faibles / Data', 'fft', 1],
          ],
        },
        'dao-finitions': {
          titre: lang === 'en' ? 'Finishes — Secondary Works' : 'Finitions — Second Œuvre',
          postes: [
            ['F.1', lang === 'en' ? 'Floor tiles / coverings' : 'Carrelage / Revêtements sol', 'm²', surf_batie ? Math.round(surf_batie * 0.85) : '—'],
            ['F.2', lang === 'en' ? 'Interior joinery' : 'Menuiserie intérieure', 'U', '—'],
            ['F.3', lang === 'en' ? 'Exterior joinery (alu)' : 'Menuiserie extérieure (alu)', 'm²', '—'],
            ['F.4', lang === 'en' ? 'Suspended ceilings' : 'Faux-plafonds', 'm²', surf_batie ? Math.round(surf_batie * 0.70) : '—'],
            ['F.5', lang === 'en' ? 'Paint / Finishes' : 'Peinture / Enduits', 'm²', surf_batie ? Math.round(surf_batie * 2.5) : '—'],
            ['F.6', lang === 'en' ? 'Fitted kitchen' : 'Cuisine équipée', 'U', '—'],
          ],
        },
      }
      const cfg = lotConfig[activeTab] || { titre: 'DAO', postes: [] }
      return (
        <>
          <Card>
            <SectionTitle>{lang === 'en' ? 'Tender Document' : "Dossier d'Appel d'Offres"}</SectionTitle>
            <div style={{ fontSize: 14, color: VERT, fontWeight: 600, marginBottom: 8 }}>{cfg.titre}</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              {lang === 'en'
                ? 'Bill of quantities with unit prices to be completed by the contractor. Includes CCTP technical specifications.'
                : "Bordereau des quantités avec prix unitaires à compléter par l'entreprise. Inclut le CCTP avec spécifications d'exécution."}
            </div>
          </Card>
          <SectionTitle>{lang === 'en' ? 'Bill of Quantities' : 'Postes du bordereau'}</SectionTitle>
          <DataTable
            headers={['N°', lang === 'en' ? 'Description' : 'Désignation', lang === 'en' ? 'Qty' : 'Qté', lang === 'en' ? 'Unit' : 'Unité', 'PU (HT)', lang === 'en' ? 'Amount (excl.)' : 'Montant (HT)']}
            rows={cfg.postes.map(([no, label, unit, qty]) => [no, label, String(qty), unit, '', ''])}
            colWidths={['8%', '34%', '12%', '8%', '18%', '20%']}
          />
          <Card style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#555' }}>
              {lang === 'en'
                ? 'The PDF contains the complete bill with all calculated quantities. Unit prices and amounts are to be completed by the bidding contractor.'
                : "Le PDF contient le bordereau complet avec toutes les quantités calculées. Les prix unitaires et montants sont à compléter par l'entreprise soumissionnaire."}
            </div>
          </Card>
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
    'schemas-ferraillage':'/generate-schemas-ferraillage',
    'schemas-mep':        '/generate-schemas-mep',
    'edge-assessment':    '/generate-edge-assessment',
    'plan-ba':            '/generate-plans-structure',
    'plan-mep':           '/generate-plans-mep',
    'finitions':          '/generate-boq-finitions',
    'planning':           '/generate-planning',
    'tresorerie':         '/generate-planning-tresorerie',
    'dao-structure':      '/generate-dao?lot=structure',
    'dao-mep':            '/generate-dao?lot=mep',
    'dao-finitions':      '/generate-dao?lot=finitions',
    'fiches-techniques':  '/generate-fiches-all',
  }
  const FILENAME_MAP = {
    'structure':          `TijanAI_NoteStructure_${slug}_${today}.pdf`,
    'boq-structure':      `TijanAI_BOQStructure_${slug}_${today}.pdf`,
    'note-mep':           `TijanAI_NoteMEP_${slug}_${today}.pdf`,
    'boq-mep':            `TijanAI_BOQMEP_${slug}_${today}.pdf`,
    'rapport-executif':   `TijanAI_RapportExecutif_${slug}_${today}.pdf`,
    'schemas-ferraillage':`TijanAI_SchemasFerraillage_${slug}_${today}.pdf`,
    'schemas-mep':        `TijanAI_SchemasMEP_${slug}_${today}.pdf`,
    'edge-assessment':    `TijanAI_EdgeAssessment_${slug}_${today}.pdf`,
    'plan-ba':            `TijanAI_PlansBA_${slug}_${today}.pdf`,
    'plan-mep':           `TijanAI_PlansMEP_${slug}_${today}.pdf`,
    'finitions':          `TijanAI_BOQFinitions_${slug}_${today}.pdf`,
    'planning':           `TijanAI_Planning_${slug}_${today}.pdf`,
    'tresorerie':         `TijanAI_Tresorerie_${slug}_${today}.pdf`,
    'dao-structure':      `TijanAI_DAO_Structure_${slug}_${today}.pdf`,
    'dao-mep':            `TijanAI_DAO_MEP_${slug}_${today}.pdf`,
    'dao-finitions':      `TijanAI_DAO_Finitions_${slug}_${today}.pdf`,
    'fiches-techniques':  `TijanAI_FichesTechniques_${slug}_${today}.pdf`,
  }

  const endpoint = activeTab === 'chat' ? null : ENDPOINT_MAP[activeTab]
  const filename = FILENAME_MAP[activeTab]

  // ── Download All Dossier ──
  const downloadAllDossier = async () => {
    if (!params || !params.nom || downloadAllState) return
    const hasDwg = (dwgGeometry && Object.keys(dwgGeometry).length > 0) || !!geomRef
    const hasMep = mepData?.ok

    // Filter items based on available data — track what was skipped
    const skipped = []
    const items = DOWNLOAD_ALL_ITEMS.filter(item => {
      if (item.needsDwg && !hasDwg) { skipped.push({ label: `${item.label} (${item.format})`, reason: lang === 'en' ? 'no DWG geometry' : 'pas de géométrie DWG' }); return false }
      if (item.needsMep && !hasMep) { skipped.push({ label: `${item.label} (${item.format})`, reason: lang === 'en' ? 'MEP not calculated' : 'MEP non calculé' }); return false }
      return true
    })
    if (items.length === 0) return

    const errors = []
    setDownloadAllState({ current: 0, total: items.length, label: lang === 'en' ? 'Waking up server...' : 'Réveil du serveur...', errors: [] })
    abortDownloadAllRef.current = false

    // Load JSZip dynamically from CDN (only on first use)
    if (!window.JSZip) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
          s.onload = resolve
          s.onerror = reject
          document.head.appendChild(s)
        })
      } catch {
        alert(lang === 'en' ? 'Failed to load ZIP library' : 'Impossible de charger la librairie ZIP')
        setDownloadAllState(null)
        return
      }
    }

    // Wake up backend before starting (avoids cold-start timeout on first real request)
    try {
      await fetch(`${BACKEND}/health`, { method: 'GET', signal: AbortSignal.timeout(60000) })
      console.log('[download-all] Backend is awake')
    } catch {
      console.warn('[download-all] Health check failed — backend may be cold, proceeding anyway')
    }

    if (abortDownloadAllRef.current) { setDownloadAllState(null); return }

    const zip = new window.JSZip()
    const { dwg_geometry: _dg1, dwgGeometry: _dg2, ...cleanParams } = params

    // Helper: fetch with timeout + 1 retry on failure — captures error detail
    const fetchWithRetry = async (url, options) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 min timeout
          const res = await fetch(url, { ...options, signal: controller.signal })
          clearTimeout(timeoutId)
          if (!res.ok) {
            // Read error body for diagnostics
            let detail = `HTTP ${res.status}`
            try {
              const errText = await res.text()
              try { const j = JSON.parse(errText); if (j?.detail) detail = `${res.status}: ${typeof j.detail === 'string' ? j.detail.slice(0, 200) : JSON.stringify(j.detail).slice(0, 200)}` } catch { if (errText) detail = `${res.status}: ${errText.slice(0, 200)}` }
            } catch { /* body unreadable */ }
            const err = new Error(detail)
            err.status = res.status
            throw err
          }
          return res
        } catch (e) {
          if (attempt === 0) {
            console.log(`[download-all] Retry after failure: ${e.message}`)
            await new Promise(r => setTimeout(r, 5000)) // wait 5s before retry (let server recover)
          } else {
            throw e
          }
        }
      }
    }

    for (let i = 0; i < items.length; i++) {
      if (abortDownloadAllRef.current) break
      const item = items[i]
      setDownloadAllState({ current: i + 1, total: items.length, label: `${item.label} (${item.format})`, errors: [...errors] })

      try {
        // Build extra params for special endpoints
        const extra = {}
        if (item.needsDwg) {
          if (dwgGeometry) extra.dwg_geometry = dwgGeometry
          else if (geomRef) extra.geom_ref = geomRef
        }
        if (item.isEdge) {
          if (dwgGeometry) extra.dwg_geometry = dwgGeometry
          Object.assign(extra, dbProjet?.edge_extras || {})
        }

        const res = await fetchWithRetry(`${BACKEND}${item.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...cleanParams, lang, project_id: projectId || undefined, ...extra }),
        })

        const blob = await res.blob()
        if (blob.size < 100) throw new Error('Empty response')
        zip.folder(item.folder).file(item.filename, blob)
      } catch (e) {
        console.warn(`[download-all] Failed: ${item.label} (${item.format})`, e)
        errors.push(`${item.label} (${item.format}) — ${e.message || 'Unknown error'}`)
      }
      // Small delay between requests to let server GC between heavy generations
      if (i < items.length - 1) await new Promise(r => setTimeout(r, 1500))
    }

    if (abortDownloadAllRef.current) {
      setDownloadAllState(null)
      return
    }

    // Generate and trigger ZIP download
    setDownloadAllState({ current: items.length, total: items.length, label: lang === 'en' ? 'Creating ZIP...' : 'Création du ZIP...', errors: [...errors] })
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TijanAI_Dossier_${slug}_${today}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert((lang === 'en' ? 'ZIP error: ' : 'Erreur ZIP : ') + e.message)
    }

    // Summary message: errors + skipped items
    const msgs = []
    if (errors.length > 0) {
      msgs.push((lang === 'en' ? `${errors.length} error(s):\n` : `${errors.length} erreur(s) :\n`) + errors.join('\n'))
    }
    if (skipped.length > 0) {
      const skippedLines = skipped.map(s => `${s.label} — ${s.reason}`).join('\n')
      msgs.push((lang === 'en' ? `\n${skipped.length} skipped:\n` : `\n${skipped.length} ignoré(s) :\n`) + skippedLines)
    }
    if (msgs.length > 0) {
      const prefix = errors.length > 0
        ? (lang === 'en' ? 'Download complete with issues:\n\n' : 'Téléchargement terminé avec des problèmes :\n\n')
        : (lang === 'en' ? 'Download complete.\n\n' : 'Téléchargement terminé.\n\n')
      setTimeout(() => alert(prefix + msgs.join('\n')), 500)
    }

    setDownloadAllState(null)
  }

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
          {TABS.map((tab, idx) => {
            const disabled = !tab.endpoint || tab.comingSoon
            const active = !disabled && activeTab === tab.id
            const showGroupHeader = idx === 0 || TABS[idx - 1].group !== tab.group
            return (
              <React.Fragment key={tab.id}>
                {showGroupHeader && !isMobile && (
                  <div style={{
                    padding: '10px 20px 6px',
                    fontSize: 10,
                    fontWeight: 800,
                    color: VERT_DARK,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    borderTop: idx === 0 ? 'none' : `2px solid ${GRIS2}`,
                    marginTop: idx === 0 ? 0 : 8,
                    background: VERT_LIGHT,
                  }}>
                    {tab.group}
                  </div>
                )}
                <button onClick={() => { if (!disabled) setActiveTab(tab.id) }} style={{
                  display: isMobile ? 'inline-block' : 'block', width: isMobile ? 'auto' : '100%', textAlign: 'left', padding: '10px 20px',
                  border: 'none', fontSize: 12, fontWeight: active ? 600 : 400,
                  color: disabled ? '#BBB' : active ? VERT : '#444',
                  background: active ? VERT_LIGHT : 'transparent',
                  borderLeft: active ? `3px solid ${VERT}` : '3px solid transparent',
                  transition: 'all 0.15s', cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.7 : 1,
                }}>
                  {t(TAB_KEYS[tab.id]) || tab.label}
                  {disabled && <span style={{ marginLeft: 6, fontSize: 9, background: '#FFF3E0', color: '#E65100', borderRadius: 8, padding: '1px 6px', fontWeight: 600 }}>{t('res_bientot_badge')}</span>}
                </button>
              </React.Fragment>
            )
          })}
          {/* Download All button */}
          {params?.nom && (
            <div style={{ padding: isMobile ? '0 8px' : '16px 20px', borderTop: isMobile ? 'none' : `1px solid ${GRIS2}`, marginTop: isMobile ? 0 : 8, display: isMobile ? 'inline-block' : 'block' }}>
              <button
                onClick={downloadAllDossier}
                disabled={!!dlLoading || !!downloadAllState}
                style={{
                  background: VERT_LIGHT,
                  color: VERT_DARK,
                  border: `1.5px solid ${VERT}`,
                  borderRadius: 6,
                  padding: isMobile ? '8px 14px' : '10px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: downloadAllState || dlLoading ? 'not-allowed' : 'pointer',
                  width: isMobile ? 'auto' : '100%',
                  textAlign: 'center',
                  opacity: downloadAllState || dlLoading ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {t('res_download_all')}
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 24 }}>
          {renderContent()}
          {/* Chat toujours monté, caché si pas actif */}
          <div style={{ display: activeTab === 'chat' ? 'block' : 'none', height: '100%' }}>
            <ChatTijan params={params} projectId={projectId} resultatsStructure={resultats} resultatsMep={mepData} savedChat={chatMessages} onUpdateChat={setChatMessages} onModify={(updatedParams, updatedResultats, updatedMep) => {
                // Update React state directly — triggers re-render of all dependent components
                setParams(updatedParams)
                setResultats(updatedResultats)
                if (updatedMep) setMepData({ ok: true, ...updatedMep })
                // Persist updated results to Supabase so they survive page refresh
                if (supabase && user && projectId) {
                  const update = {
                    resultats_structure: updatedResultats,
                    ...(updatedParams.nb_niveaux !== undefined ? { nb_niveaux: updatedParams.nb_niveaux } : {}),
                    ...(updatedParams.surface_emprise_m2 !== undefined ? { surface_emprise_m2: updatedParams.surface_emprise_m2 } : {}),
                    ...(updatedParams.portee_max_m !== undefined ? { portee_max_m: updatedParams.portee_max_m } : {}),
                    ...(updatedParams.portee_min_m !== undefined ? { portee_min_m: updatedParams.portee_min_m } : {}),
                    ...(updatedParams.nb_travees_x !== undefined ? { nb_travees_x: updatedParams.nb_travees_x } : {}),
                    ...(updatedParams.nb_travees_y !== undefined ? { nb_travees_y: updatedParams.nb_travees_y } : {}),
                    ...(updatedParams.usage ? { usage: updatedParams.usage } : {}),
                    ...(updatedParams.ville ? { ville: updatedParams.ville } : {}),
                  }
                  if (updatedMep) update.resultats_mep = { ok: true, ...updatedMep }
                  supabase.from('projets').update(update).eq('id', projectId).then(() => {
                    console.log('Project updated in Supabase after chat modification')
                  })
                }
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
          {endpoint && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Plans BA/MEP: DWG required — hide download if no geometry */}
              {(activeTab === 'plan-ba' || activeTab === 'plan-mep') && !(dwgGeometry && Object.keys(dwgGeometry).length > 0) ? null : (
              <button
                onClick={() => {
                  const nomFichier = `TijanAI_${activeTab.replace(/-/g,'')}_${slug}_${today}.pdf`
                  const extra = {}
                  if (activeTab === 'edge-assessment') {
                    if (dwgGeometry) extra.dwg_geometry = dwgGeometry
                    const ee = dbProjet?.edge_extras || {}
                    Object.assign(extra, ee)
                  }
                  if (activeTab === 'plan-ba' || activeTab === 'plan-mep') {
                    if (dwgGeometry) extra.dwg_geometry = dwgGeometry
                    else if (geomRef) extra.geom_ref = geomRef
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
                {dlLoading === endpoint ? t('res_generation') : (activeTab === 'plan-ba' || activeTab === 'plan-mep' ? 'PDF' : (t('res_telecharger') || t('r_telecharger_pdf')))}
              </button>
              )}
              {/* DWG download button for plans */}
              {(activeTab === 'plan-ba' || activeTab === 'plan-mep') && dwgGeometry && Object.keys(dwgGeometry).length > 0 && (
                <button
                  onClick={() => {
                    const proEndpoint = activeTab === 'plan-ba' ? '/generate-plans-structure-pro?format=dwg' : '/generate-plans-mep-pro?format=dwg'
                    const dwgName = `TijanAI_${activeTab === 'plan-ba' ? 'PlansBA' : 'PlansMEP'}_${slug}_${today}.dwg`
                    download(proEndpoint, dwgName, { dwg_geometry: dwgGeometry })
                  }}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading && dlLoading.includes('format=dwg') ? '...' : 'DWG'}
                </button>
              )}
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
              {activeTab === 'planning' && (
                <button
                  onClick={() => download('/generate-planning-xlsx', `TijanAI_Planning_Tresorerie_${slug}_${today}.xlsx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-planning-xlsx' ? '...' : 'Excel'}
                </button>
              )}
              {activeTab === 'tresorerie' && (
                <button
                  onClick={() => download('/generate-planning-xlsx', `TijanAI_Planning_Tresorerie_${slug}_${today}.xlsx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-planning-xlsx' ? '...' : 'Excel'}
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
              {activeTab === 'planning' && (
                <button
                  onClick={() => download('/generate-planning-docx', `TijanAI_Planning_${slug}_${today}.docx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-planning-docx' ? '...' : 'Word'}
                </button>
              )}
              {activeTab === 'tresorerie' && (
                <button
                  onClick={() => download('/generate-tresorerie-docx', `TijanAI_Tresorerie_${slug}_${today}.docx`)}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading === '/generate-tresorerie-docx' ? '...' : 'Word'}
                </button>
              )}
              {activeTab?.startsWith('dao-') && (
                <button
                  onClick={() => {
                    const lot = activeTab.replace('dao-', '')
                    download(`/generate-dao-docx?lot=${lot}`, `TijanAI_DAO_${lot}_${slug}_${today}.docx`)
                  }}
                  disabled={!!dlLoading}
                  style={{ background: '#fff', color: VERT, border: `1.5px solid ${VERT}`, borderRadius: 6, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: dlLoading ? 0.6 : 1 }}
                >
                  {dlLoading?.includes('/generate-dao-docx') ? '...' : 'Word'}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Download All progress overlay */}
      {downloadAllState && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '32px 40px',
            maxWidth: 420, width: '90%', textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>
              {t('res_download_all')}
            </div>
            <div style={{ fontSize: 12, color: GRIS3, marginBottom: 16 }}>
              {downloadAllState.label}
            </div>
            <div style={{ background: GRIS1, borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                height: '100%', background: VERT, borderRadius: 8,
                width: `${Math.round((downloadAllState.current / downloadAllState.total) * 100)}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
              {downloadAllState.current} / {downloadAllState.total}
            </div>
            {downloadAllState.errors?.length > 0 && (
              <div style={{ fontSize: 11, color: ORANGE, marginBottom: 12 }}>
                {downloadAllState.errors.length} {lang === 'en' ? 'error(s)' : 'erreur(s)'}
              </div>
            )}
            <button
              onClick={() => { abortDownloadAllRef.current = true }}
              style={{
                background: '#fff', border: `1px solid ${GRIS2}`, borderRadius: 6,
                padding: '8px 24px', fontSize: 12, color: '#666',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {lang === 'en' ? 'Cancel' : 'Annuler'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
