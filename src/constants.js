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
  { id: 'structure',        label: 'Note de calcul structure',    endpoint: '/generate',                  filename: 'note_structure.pdf',   mep: false },
  { id: 'boq-structure',    label: 'BOQ Structure',               endpoint: '/generate-boq',              filename: 'boq_structure.pdf',    mep: false },
  { id: 'note-mep',         label: 'Note de calcul MEP',          endpoint: '/generate-note-mep',         filename: 'note_mep.pdf',         mep: true  },
  { id: 'boq-mep',          label: 'BOQ MEP',                     endpoint: '/generate-boq-mep',          filename: 'boq_mep.pdf',          mep: true  },
  { id: 'edge',             label: 'Conformité EDGE',             endpoint: '/generate-edge',             filename: 'edge.pdf',             mep: true  },
  { id: 'rapport-executif', label: 'Rapport exécutif',            endpoint: '/generate-rapport-executif', filename: 'rapport_executif.pdf', mep: false },
  { id: 'fiches-structure', label: 'Fiches techniques structure', endpoint: '/generate-fiches-structure', filename: 'fiches_structure.pdf', mep: false },
  { id: 'fiches-mep',       label: 'Fiches techniques MEP',       endpoint: '/generate-fiches-mep',       filename: 'fiches_mep.pdf',       mep: true  },
  { id: 'chat', label: 'Discuter avec Tijan', endpoint: 'chat', filename: '', mep: false },
  { id: 'plan-ba',          label: 'Plans BA',                    endpoint: null,                         filename: '',                     mep: false },
  { id: 'plan-mep',         label: 'Plans MEP',                   endpoint: null,                         filename: '',                     mep: false },
]

// Helpers formatage
export const fmt = (v, unit = '', dec = 0) => {
  if (v === undefined || v === null || isNaN(v)) return '—'
  const n = dec === 0 ? Math.round(v).toLocaleString('fr-FR') : Number(v).toFixed(dec)
  return unit ? `${n} ${unit}` : n
}

export const fmtFcfa = (v) => {
  if (!v || isNaN(v)) return '—'
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)} Mds FCFA`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)} M FCFA`
  return `${Math.round(v).toLocaleString('fr-FR')} FCFA`
}
