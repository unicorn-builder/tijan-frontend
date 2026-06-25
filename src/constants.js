export const BACKEND = 'https://build-ai-backend.onrender.com'

export const VERT = '#43A956'
export const VERT_LIGHT = '#EBF7ED'
export const VERT_DARK = '#2D7A3A'
export const GRIS1 = '#F5F5F5'
export const GRIS2 = '#E5E5E5'
export const GRIS3 = '#888888'
export const ORANGE = '#E07B00'
export const ORANGE_LT = '#FFF3E0'

export const TABS = [
  // ── Structure ──
  { id: 'structure',           label: 'Note de calcul structure',    endpoint: '/generate',                     filename: 'note_structure.pdf',      mep: false, group: 'Structure' },
  { id: 'boq-structure',       label: 'BOQ Structure',               endpoint: '/generate-boq',                 filename: 'boq_structure.pdf',       mep: false, group: 'Structure' },
  { id: 'schemas-ferraillage', label: 'Schémas de ferraillage',      endpoint: '/generate-schemas-ferraillage', filename: 'schemas_ferraillage.pdf', mep: false, group: 'Structure' },
  { id: 'dao-structure',       label: 'DAO Lot Structure',           endpoint: '/generate-dao?lot=structure',   filename: 'dao_structure.pdf',       mep: false, group: 'Structure' },
  // ── MEP ──
  { id: 'note-mep',            label: 'Note de calcul MEP',          endpoint: '/generate-note-mep',            filename: 'note_mep.pdf',            mep: true,  group: 'MEP' },
  { id: 'boq-mep',             label: 'BOQ MEP',                     endpoint: '/generate-boq-mep',             filename: 'boq_mep.pdf',             mep: true,  group: 'MEP' },
  { id: 'schemas-mep',         label: 'Schémas isométriques MEP',    endpoint: '/generate-schemas-mep',         filename: 'schemas_mep.pdf',         mep: true,  group: 'MEP' },
  { id: 'dao-mep',             label: 'DAO Lot MEP',                 endpoint: '/generate-dao?lot=mep',         filename: 'dao_mep.pdf',             mep: true,  group: 'MEP' },
  // ── Finitions ──
  { id: 'finitions',           label: 'BOQ Finitions',               endpoint: '/generate-boq-finitions',       filename: 'boq_finitions.pdf',       mep: false, group: 'Finitions' },
  { id: 'dao-finitions',       label: 'DAO Lot Finitions',           endpoint: '/generate-dao?lot=finitions',   filename: 'dao_finitions.pdf',       mep: false, group: 'Finitions' },
  // ── Synthèse ──
  { id: 'rapport-executif',    label: 'Rapport exécutif',            endpoint: '/generate-rapport-executif',    filename: 'rapport_executif.pdf',    mep: false, group: 'Synthèse' },
  { id: 'edge-assessment',     label: 'Conformité EDGE',             endpoint: '/generate-edge-assessment',     filename: 'edge_assessment.pdf',     mep: true,  group: 'Synthèse' },
  { id: 'planning',            label: "Planning d'exécution",        endpoint: '/generate-planning',            filename: 'planning_execution.pdf',  mep: false, group: 'Synthèse' },
  { id: 'tresorerie',          label: 'Planning des dépenses',       endpoint: '/generate-planning-tresorerie', filename: 'planning_tresorerie.pdf', mep: false, group: 'Synthèse' },
  // ── Fiches techniques ──
  { id: 'fiches-techniques',   label: 'Fiches techniques & Fournisseurs', endpoint: '/generate-fiches-all',     filename: 'fiches_techniques.pdf',   mep: true,  group: 'Fiches' },
  // ── Plans ──
  { id: 'plan-ba',             label: 'Plans BA',                    endpoint: '/generate-plans-structure',     filename: 'plans_structure.pdf',     mep: false, group: 'Plans', beta: true },
  { id: 'plan-mep',            label: 'Plans MEP',                   endpoint: '/generate-plans-mep',           filename: 'plans_mep.pdf',           mep: true,  group: 'Plans', beta: true },
  // ── Assistant ──
  { id: 'chat',                label: 'Discuter avec Tijan',         endpoint: 'chat',                          filename: '',                        mep: false, group: 'Assistant' },
]

// Helpers formatage
export const fmt = (v, unit = '', dec = 0) => {
  if (v === undefined || v === null || isNaN(v)) return '—'
  const n = dec === 0 ? Math.round(v).toLocaleString('fr-FR') : Number(v).toFixed(dec)
  return unit ? `${n} ${unit}` : n
}

const _fmtLocal = (local, sym) => {
  if (local >= 1e9) return (local / 1e9).toFixed(2) + ' B ' + sym
  if (local >= 1e6) return (local / 1e6).toFixed(1) + ' M ' + sym
  if (local >= 1e3) return (local / 1e3).toFixed(0) + 'k ' + sym
  return Math.round(local).toLocaleString('en') + ' ' + sym
}

const _fmtFcfaOnly = (v) => {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + ' Mds FCFA'
  if (v >= 1e6) return (v / 1e6).toFixed(1) + ' M FCFA'
  if (v >= 1e3) return (v / 1e3).toFixed(0) + 'k FCFA'
  return Math.round(v).toLocaleString('fr-FR') + ' FCFA'
}

export const fmtFcfa = (v, deviseInfo = null) => {
  if (!v || isNaN(v)) return '—'
  if (deviseInfo && deviseInfo.devise !== 'XOF' && deviseInfo.taux_depuis_fcfa) {
    const local = v * deviseInfo.taux_depuis_fcfa
    const sym = deviseInfo.symbole || deviseInfo.devise
    const localStr = _fmtLocal(local, sym)
    // Double display for MRU: "14.6k MRU (241k FCFA)"
    if (deviseInfo.devise === 'MRU') return `${localStr} (${_fmtFcfaOnly(v)})`
    return localStr
  }
  if (v >= 1e9) return (v / 1e9).toFixed(2) + ' Mds FCFA'
  if (v >= 1e6) return (v / 1e6).toFixed(1) + ' M FCFA'
  return Math.round(v).toLocaleString('fr-FR') + ' FCFA'
}
