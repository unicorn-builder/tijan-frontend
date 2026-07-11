import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BACKEND, VERT, VERT_LIGHT, VERT_DARK, GRIS1, GRIS2, GRIS3, ORANGE, ORANGE_LT, fmtFcfa } from '../constants'
import { useLang } from '../i18n.jsx'
import Header from '../components/Header'

const PAYS_VILLES = {
  'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Mbour'],
  "Côte d'Ivoire": ['Abidjan', 'Bouaké', 'Daloa', 'Korhogo', 'Yamoussoukro'],
  'Mali': ['Bamako', 'Sikasso', 'Mopti', 'Ségou'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou'],
  'Niger': ['Niamey', 'Zinder', 'Maradi'],
  'Togo': ['Lomé', 'Sokodé', 'Kara'],
  'Bénin': ['Cotonou', 'Porto-Novo', 'Parakou'],
  'Guinée-Bissau': ['Bissau'],
  'Maroc': ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir'],
  'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
  'Ghana': ['Accra', 'Kumasi', 'Tamale', 'Takoradi'],
  'Mauritanie': ['Nouakchott', 'Nouadhibou'],
}

const TYPES_BATIMENT = [
  { value: 'bureau', label: 'Bureau / Administratif' },
  { value: 'logement', label: 'Logement / Résidence' },
  { value: 'hopital', label: 'Hôpital / Centre de santé' },
  { value: 'ecole', label: 'École / Université' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'administratif', label: 'Administration publique' },
]

const TYPES_TOITURE = [
  { value: 'terrasse_nue', label: 'Terrasse béton (non isolée)' },
  { value: 'terrasse_carrelage', label: 'Terrasse + carrelage' },
  { value: 'terrasse_isolee', label: 'Terrasse isolée' },
  { value: 'tole', label: 'Tôle (non isolée)' },
  { value: 'tole_isolee', label: 'Tôle isolée' },
  { value: 'tuiles', label: 'Tuiles' },
]

const CLIM_OPTIONS = [
  { value: 'aucune', label: 'Aucune' },
  { value: 'ventilateur', label: 'Ventilateurs' },
  { value: 'split_ancien', label: 'Split ancien (>5 ans)' },
  { value: 'split_recent', label: 'Split récent (<5 ans)' },
  { value: 'split_inverter', label: 'Split inverter' },
  { value: 'central_ancien', label: 'Central ancien (>10 ans)' },
  { value: 'central_recent', label: 'Central récent' },
  { value: 'vrv', label: 'VRV/VRF' },
]

const ECLAIRAGE_OPTIONS = [
  { value: 'incandescent', label: 'Incandescent' },
  { value: 'neon_t8', label: 'Néon T8 (fluorescent ancien)' },
  { value: 'neon_t5', label: 'Néon T5 (fluorescent récent)' },
  { value: 'led', label: 'LED' },
  { value: 'mixte', label: 'Mixte' },
]

const VITRAGE_OPTIONS = [
  { value: 'simple_alu', label: 'Simple vitrage alu' },
  { value: 'simple_bois', label: 'Simple vitrage bois' },
  { value: 'double_alu', label: 'Double vitrage alu' },
  { value: 'double_low_e', label: 'Double vitrage Low-E' },
  { value: 'jalousies', label: 'Jalousies / persiennes' },
  { value: 'absent', label: 'Pas de vitrage' },
]

const ROB_OPTIONS = [
  { value: 'classique', label: 'Robinet standard (12L/min)' },
  { value: 'mitigeur', label: 'Mitigeur' },
  { value: 'mousseur', label: 'Mousseur éco (6L/min)' },
  { value: 'vetuste', label: 'Vétuste / fuit' },
]

const WC_OPTIONS = [
  { value: 'standard', label: 'Chasse simple (9L)' },
  { value: 'double_chasse', label: 'Double chasse (3/6L)' },
  { value: 'ancien', label: 'Ancien (>9L)' },
  { value: 'turc', label: 'WC à la turque' },
]

const CE_OPTIONS = [
  { value: 'aucun', label: 'Aucun' },
  { value: 'electrique', label: 'Électrique' },
  { value: 'solaire', label: 'Solaire (CESI)' },
  { value: 'gaz', label: 'Gaz' },
]

/* ── shared styles ── */
const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16 }
const label = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#333' }
const input = { width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${GRIS2}`, fontSize: 14, boxSizing: 'border-box' }
const select = { ...input, appearance: 'auto' }
const btn = (primary) => ({
  padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
  background: primary ? VERT : '#fff', color: primary ? '#fff' : VERT,
  ...(primary ? {} : { border: `2px solid ${VERT}` }),
})


export default function Retrofit() {
  const navigate = useNavigate()
  const { t, lang } = useLang()

  // ── STEPS ──
  const [step, setStep] = useState('info')  // info → survey → results
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── STEP 1: Building info ──
  const [nom, setNom] = useState('')
  const [pays, setPays] = useState('Sénégal')
  const [ville, setVille] = useState('Dakar')
  const [typeBat, setTypeBat] = useState('bureau')
  const [annee, setAnnee] = useState('2000')
  const [nbNiveaux, setNbNiveaux] = useState('3')
  const [surfaceEmprise, setSurfaceEmprise] = useState('500')
  const [toiture, setToiture] = useState('terrasse_nue')
  const [nbOccupants, setNbOccupants] = useState('')
  const [factureEau, setFactureEau] = useState('')
  const [tarifElec, setTarifElec] = useState('115')
  const [tarifEau, setTarifEau] = useState('800')

  // ── STEP 2: Zones from analysis ──
  const [zones, setZones] = useState([])
  const [ficheReleve, setFicheReleve] = useState(null)

  // ── Photo analysis per zone ──
  const [photoAnalysis, setPhotoAnalysis] = useState({})  // { zoneId: { loading, result } }
  const photoRefs = useRef({})

  // ── STEP 3: Results ──
  const [results, setResults] = useState(null)

  // ─────────────────────────────────────────
  // STEP 1 → 2: Analyze building
  // ─────────────────────────────────────────
  async function analyzeBuilding() {
    setLoading(true)
    setError('')
    try {
      const body = {
        nom, ville, pays,
        type_batiment: typeBat,
        annee_construction: parseInt(annee) || 2000,
        nb_niveaux: parseInt(nbNiveaux) || 1,
        surface_emprise_m2: parseFloat(surfaceEmprise) || 500,
        toiture,
        nb_occupants: parseInt(nbOccupants) || 0,
      }
      const res = await fetch(`${BACKEND}/retrofit/analyze-building`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Erreur serveur')

      // Initialize zones with default survey values
      const initialZones = data.zones.map(z => ({
        ...z,
        climatisation: 'split_ancien',
        eclairage: 'neon_t8',
        vitrage: 'simple_alu',
        robinetterie: 'classique',
        wc: 'standard',
        chauffe_eau: 'aucun',
        notes: '',
      }))
      setZones(initialZones)
      setFicheReleve(data.fiche_releve)
      setStep('survey')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────
  // STEP 2 → 3: Submit survey data
  // ─────────────────────────────────────────
  async function submitSurvey() {
    setLoading(true)
    setError('')
    try {
      const body = {
        nom, ville, pays,
        type_batiment: typeBat,
        annee_construction: parseInt(annee) || 2000,
        nb_niveaux: parseInt(nbNiveaux) || 1,
        surface_emprise_m2: parseFloat(surfaceEmprise) || 500,
        toiture,
        nb_occupants: parseInt(nbOccupants) || 0,
        facture_eau_m3_mois: parseFloat(factureEau) || 0,
        tarif_electricite: parseFloat(tarifElec) || 115,
        tarif_eau: parseFloat(tarifEau) || 800,
        zones: zones,
      }
      const res = await fetch(`${BACKEND}/retrofit/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Erreur serveur')
      setResults(data)
      setStep('results')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────
  // PDF DOWNLOAD
  // ─────────────────────────────────────────
  async function downloadPdf(endpoint, filename) {
    setLoading(true)
    try {
      const body = {
        nom, ville, pays,
        type_batiment: typeBat,
        annee_construction: parseInt(annee) || 2000,
        nb_niveaux: parseInt(nbNiveaux) || 1,
        surface_emprise_m2: parseFloat(surfaceEmprise) || 500,
        toiture,
        nb_occupants: parseInt(nbOccupants) || 0,
        facture_eau_m3_mois: parseFloat(factureEau) || 0,
        tarif_electricite: parseFloat(tarifElec) || 115,
        tarif_eau: parseFloat(tarifEau) || 800,
        zones: zones,
        lang: 'fr',
      }
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────
  // Photo upload & Claude Vision analysis
  // ─────────────────────────────────────────
  async function analyzePhoto(zoneId, zoneType, file) {
    setPhotoAnalysis(prev => ({ ...prev, [zoneId]: { loading: true, result: null } }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('zone_type', zoneType)
      formData.append('item', 'climatisation')
      const res = await fetch(`${BACKEND}/retrofit/analyze-photo`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setPhotoAnalysis(prev => ({ ...prev, [zoneId]: { loading: false, result: data.analysis } }))
    } catch (e) {
      setPhotoAnalysis(prev => ({ ...prev, [zoneId]: { loading: false, result: { error: e.message } } }))
    }
  }

  // Update a zone's survey field
  const updateZone = (idx, field, value) => {
    setZones(prev => prev.map((z, i) => i === idx ? { ...z, [field]: value } : z))
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: GRIS1 }}>
      <Header />

      {/* Title */}
      <div style={{ maxWidth: 800, margin: '24px auto 0', padding: '0 16px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: VERT_DARK, margin: '0 0 4px' }}>
          {lang === 'fr' ? 'Audit EDGE — Rénovation' : 'EDGE Audit — Retrofit'}
        </h1>
        <p style={{ fontSize: 13, color: GRIS3, margin: '0 0 16px' }}>
          {lang === 'fr'
            ? 'Évaluez la performance énergétique et hydrique de votre bâtiment existant, et obtenez un plan d\'interventions chiffré.'
            : 'Assess your existing building\'s energy and water performance, and get a costed intervention plan.'
          }
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {['Bâtiment', 'Relevé terrain', 'Résultats'].map((s, i) => {
            const steps = ['info', 'survey', 'results']
            const current = steps.indexOf(step)
            const active = i <= current
            return (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, background: active ? VERT : GRIS2, transition: '0.3s' }} />
                <div style={{ fontSize: 11, color: active ? VERT_DARK : GRIS3, marginTop: 4, textAlign: 'center', fontWeight: i === current ? 700 : 400 }}>
                  {s}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
            <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 48px' }}>

        {/* ════════ STEP 1: Building info ════════ */}
        {step === 'info' && (
          <>
            <div style={card}>
              <h2 style={{ margin: '0 0 16px', color: VERT_DARK, fontSize: 18 }}>Informations du bâtiment</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={label}>Nom du bâtiment *</label>
                  <input style={input} value={nom} onChange={e => setNom(e.target.value)}
                    placeholder="Ex: Ministère de l'Éducation" />
                </div>
                <div>
                  <label style={label}>Type de bâtiment *</label>
                  <select style={select} value={typeBat} onChange={e => setTypeBat(e.target.value)}>
                    {TYPES_BATIMENT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Pays *</label>
                  <select style={select} value={pays} onChange={e => { setPays(e.target.value); setVille((PAYS_VILLES[e.target.value] || [''])[0]) }}>
                    {Object.keys(PAYS_VILLES).map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Ville *</label>
                  <select style={select} value={ville} onChange={e => setVille(e.target.value)}>
                    {(PAYS_VILLES[pays] || []).map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Année de construction</label>
                  <input style={input} type="number" value={annee} onChange={e => setAnnee(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Nombre de niveaux</label>
                  <input style={input} type="number" value={nbNiveaux} onChange={e => setNbNiveaux(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Surface emprise (m²)</label>
                  <input style={input} type="number" value={surfaceEmprise} onChange={e => setSurfaceEmprise(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Toiture</label>
                  <select style={select} value={toiture} onChange={e => setToiture(e.target.value)}>
                    {TYPES_TOITURE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Nombre d'occupants (optionnel)</label>
                  <input style={input} type="number" value={nbOccupants} onChange={e => setNbOccupants(e.target.value)}
                    placeholder="Auto-estimé si vide" />
                </div>
                <div>
                  <label style={label}>Facture eau (m³/mois, optionnel)</label>
                  <input style={input} type="number" value={factureEau} onChange={e => setFactureEau(e.target.value)}
                    placeholder="Relevé compteur si disponible" />
                </div>
                <div>
                  <label style={label}>Tarif électricité (FCFA/kWh)</label>
                  <input style={input} type="number" value={tarifElec} onChange={e => setTarifElec(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Tarif eau (FCFA/m³)</label>
                  <input style={input} type="number" value={tarifEau} onChange={e => setTarifEau(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={analyzeBuilding} disabled={loading || !nom}
                style={{ ...btn(true), opacity: loading || !nom ? 0.5 : 1 }}>
                {loading ? 'Analyse en cours...' : 'Analyser le bâtiment →'}
              </button>
            </div>
          </>
        )}

        {/* ════════ STEP 2: Survey ════════ */}
        {step === 'survey' && (
          <>
            {/* Summary from analysis */}
            {ficheReleve?.resume && (
              <div style={{ ...card, background: VERT_LIGHT, border: `1px solid ${VERT}` }}>
                <h3 style={{ margin: '0 0 8px', color: VERT_DARK, fontSize: 15 }}>Fiche de relevé générée</h3>
                <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                  <span><b>{ficheReleve.resume.nb_zones_a_relever}</b> zones à relever</span>
                  <span><b>{ficheReleve.resume.nb_pieces_couvertes}</b> pièces couvertes</span>
                  <span><b>{ficheReleve.resume.nb_photos_estimees}</b> photos estimées</span>
                  <span><b>{ficheReleve.resume.duree_estimee_heures}h</b> de relevé</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => downloadPdf('/retrofit/generate-fiche-releve', `fiche_releve_${nom}.pdf`)}
                    style={{ ...btn(false), padding: '6px 14px', fontSize: 12 }}>
                    Télécharger fiche de relevé PDF
                  </button>
                </div>
              </div>
            )}

            {/* Zone survey forms */}
            {zones.map((zone, idx) => (
              <div key={zone.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: VERT_DARK }}>
                    {zone.id} — {zone.nom}
                  </h3>
                  <span style={{ fontSize: 12, color: GRIS3 }}>
                    {zone.niveau} | {zone.surface_m2} m² | {zone.nb_pieces_similaires} pièce(s)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={label}>Climatisation</label>
                    <select style={select} value={zone.climatisation}
                      onChange={e => updateZone(idx, 'climatisation', e.target.value)}>
                      {CLIM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Éclairage</label>
                    <select style={select} value={zone.eclairage}
                      onChange={e => updateZone(idx, 'eclairage', e.target.value)}>
                      {ECLAIRAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Vitrage</label>
                    <select style={select} value={zone.vitrage}
                      onChange={e => updateZone(idx, 'vitrage', e.target.value)}>
                      {VITRAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  {(zone.type_zone === 'sanitaire' || zone.type_zone === 'cuisine') && (
                    <>
                      <div>
                        <label style={label}>Robinetterie</label>
                        <select style={select} value={zone.robinetterie}
                          onChange={e => updateZone(idx, 'robinetterie', e.target.value)}>
                          {ROB_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={label}>WC</label>
                        <select style={select} value={zone.wc}
                          onChange={e => updateZone(idx, 'wc', e.target.value)}>
                          {WC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={label}>Chauffe-eau</label>
                        <select style={select} value={zone.chauffe_eau}
                          onChange={e => updateZone(idx, 'chauffe_eau', e.target.value)}>
                          {CE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: 8 }}>
                  <label style={label}>Notes terrain</label>
                  <input style={input} value={zone.notes || ''} onChange={e => updateZone(idx, 'notes', e.target.value)}
                    placeholder="Observations, défauts visibles..." />
                </div>

                {/* Photo upload for Claude Vision analysis */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={el => { if (el) photoRefs.current[zone.id] = el }}
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files?.[0]) analyzePhoto(zone.id, zone.type_zone, e.target.files[0])
                    }}
                  />
                  <button
                    onClick={() => photoRefs.current[zone.id]?.click()}
                    disabled={photoAnalysis[zone.id]?.loading}
                    style={{ ...btn(false), padding: '5px 12px', fontSize: 11, opacity: photoAnalysis[zone.id]?.loading ? 0.5 : 1 }}
                  >
                    {photoAnalysis[zone.id]?.loading
                      ? (lang === 'fr' ? 'Analyse en cours...' : 'Analyzing...')
                      : (lang === 'fr' ? 'Photo équipement (IA)' : 'Equipment photo (AI)')
                    }
                  </button>
                  {photoAnalysis[zone.id]?.result && !photoAnalysis[zone.id]?.result?.error && (
                    <span style={{ fontSize: 11, color: VERT, fontWeight: 600 }}>
                      {photoAnalysis[zone.id].result.marque
                        ? `${photoAnalysis[zone.id].result.marque} ${photoAnalysis[zone.id].result.modele || ''} — ${photoAnalysis[zone.id].result.etat || ''}`
                        : (lang === 'fr' ? 'Analyse reçue' : 'Analysis received')
                      }
                    </span>
                  )}
                  {photoAnalysis[zone.id]?.result?.error && (
                    <span style={{ fontSize: 11, color: ORANGE }}>{photoAnalysis[zone.id].result.error}</span>
                  )}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep('info')} style={btn(false)}>← Retour</button>
              <button onClick={submitSurvey} disabled={loading}
                style={{ ...btn(true), opacity: loading ? 0.5 : 1 }}>
                {loading ? 'Calcul en cours...' : 'Calculer le plan EDGE →'}
              </button>
            </div>
          </>
        )}

        {/* ════════ STEP 3: Results ════════ */}
        {step === 'results' && results && (
          <>
            {/* Certification verdict */}
            <div style={{ ...card, background: results.projections.niveau_certification_projete.includes('Certified') || results.projections.niveau_certification_projete.includes('Advanced') ? VERT_LIGHT : ORANGE_LT,
              border: `2px solid ${results.projections.niveau_certification_projete.includes('Certified') || results.projections.niveau_certification_projete.includes('Advanced') ? VERT : ORANGE}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: GRIS3 }}>Score actuel</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: results.baseline.score_actuel.includes('Non') ? ORANGE : VERT }}>
                    {results.baseline.score_actuel}
                  </div>
                </div>
                <div style={{ fontSize: 28, color: GRIS3 }}>→</div>
                <div>
                  <div style={{ fontSize: 13, color: GRIS3 }}>Score projeté</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: results.projections.niveau_certification_projete.includes('Non') ? ORANGE : VERT }}>
                    {results.projections.niveau_certification_projete}
                  </div>
                </div>
              </div>
            </div>

            {/* Three pillars */}
            <div style={{ ...card }}>
              <h3 style={{ margin: '0 0 12px', color: VERT_DARK, fontSize: 15 }}>Scores EDGE — 3 piliers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Énergie', current: results.baseline.economie_energie_pct, projected: results.projections.score_projete_energie_pct },
                  { label: 'Eau', current: results.baseline.economie_eau_pct, projected: results.projections.score_projete_eau_pct },
                  { label: 'Matériaux', current: results.baseline.economie_materiaux_pct, projected: results.projections.score_projete_materiaux_pct },
                ].map(p => (
                  <div key={p.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{p.label}</div>
                    {/* Gauge */}
                    <div style={{ background: GRIS2, borderRadius: 4, height: 12, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ background: p.projected >= 20 ? VERT : ORANGE, height: '100%', width: `${Math.min(100, p.projected)}%`, borderRadius: 4, transition: '0.5s' }} />
                      {/* 20% marker */}
                      <div style={{ position: 'absolute', left: '20%', top: -2, height: 16, width: 2, background: '#DC2626' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                      <span style={{ color: GRIS3 }}>Actuel: {p.current}%</span>
                      <span style={{ color: VERT_DARK, fontWeight: 600 }}>Projeté: {p.projected}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div style={{ ...card }}>
              <h3 style={{ margin: '0 0 12px', color: VERT_DARK, fontSize: 15 }}>Bilan financier</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Investissement total', value: fmtFcfa(results.projections.cout_total_fcfa), color: '#333' },
                  { label: 'Économie annuelle', value: fmtFcfa(results.projections.economie_annuelle_totale_fcfa), color: VERT },
                  { label: 'Retour sur investissement', value: `${results.projections.roi_global_ans} ans`, color: '#333' },
                  { label: 'Réduction facture élec', value: `${results.projections.reduction_facture_elec_pct}%`, color: VERT },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: 12, background: GRIS1, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interventions list */}
            <div style={{ ...card }}>
              <h3 style={{ margin: '0 0 12px', color: VERT_DARK, fontSize: 15 }}>
                Plan d'interventions ({results.interventions.length})
              </h3>
              {results.interventions.map(intv => (
                <div key={intv.id} style={{ padding: '12px 0', borderBottom: `1px solid ${GRIS2}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, color: VERT, fontWeight: 700, marginRight: 8 }}>{intv.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{intv.titre}</span>
                    </div>
                    <span style={{ fontSize: 12, color: VERT, fontWeight: 700 }}>+{intv.gain_edge_pct}% EDGE</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: GRIS3, marginTop: 4 }}>
                    <span>Coût: <b style={{ color: '#333' }}>{fmtFcfa(intv.cout_fcfa)}</b></span>
                    <span>Économie/an: <b style={{ color: VERT }}>{fmtFcfa(intv.economie_annuelle_fcfa)}</b></span>
                    <span>ROI: <b>{intv.roi_ans} ans</b></span>
                    <span>Complexité: {intv.complexite}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div style={{ ...card, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => downloadPdf('/retrofit/generate-audit', `audit_edge_${nom}.pdf`)}
                disabled={loading} style={{ ...btn(true), opacity: loading ? 0.5 : 1 }}>
                {loading ? '...' : 'Télécharger Rapport d\'Audit'}
              </button>
              <button onClick={() => downloadPdf('/retrofit/generate-business-case', `business_case_${nom}.pdf`)}
                disabled={loading} style={{ ...btn(false), opacity: loading ? 0.5 : 1 }}>
                {loading ? '...' : 'Télécharger Business Case IFC'}
              </button>
              <button onClick={() => downloadPdf('/retrofit/generate-fiche-releve', `fiche_releve_${nom}.pdf`)}
                disabled={loading} style={{ ...btn(false), opacity: loading ? 0.5 : 1 }}>
                {loading ? '...' : 'Fiche de relevé PDF'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep('survey')} style={btn(false)}>← Modifier le relevé</button>
              <button onClick={() => navigate('/dashboard')} style={btn(true)}>
                Terminer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
