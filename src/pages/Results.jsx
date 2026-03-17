import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BACKEND, VERT, VERT_LIGHT, GRIS1, GRIS2, GRIS3, ORANGE, ORANGE_LT, TABS, fmt, fmtFcfa } from '../constants'

// ── Composants UI ─────────────────────────────────────────────
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
    background: ok ? VERT_LIGHT : ORANGE_LT,
    color: ok ? VERT : ORANGE,
    border: `1px solid ${ok ? VERT : ORANGE}`,
    borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700,
  }}>
    {label || (ok ? 'Conforme' : 'À vérifier')}
  </span>
)

const DataTable = ({ headers, rows, colWidths }) => (
  <div style={{ overflowX: 'auto', marginBottom: 8 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ background: VERT, color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 600, fontSize: 11, width: colWidths?.[i] || 'auto' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? GRIS1 : '#fff' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '6px 10px', borderBottom: `1px solid #EFEFEF`, verticalAlign: 'top', wordBreak: 'break-word' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const Spinner = ({ text = 'Chargement...' }) => (
  <div style={{ textAlign: 'center', padding: 60 }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${GRIS2}`, borderTop: `3px solid ${VERT}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
    <div style={{ fontSize: 13, color: GRIS3 }}>{text}</div>
  </div>
)

// ── Download PDF ───────────────────────────────────────────────
function usePdfDownload(params) {
  const [loading, setLoading] = useState(null)

  const download = async (endpoint, filename, extra = {}) => {
    if (!params || !endpoint) return
    setLoading(endpoint)
    try {
      const payload = { ...params, ...extra }
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de la génération du document.')
    } finally {
      setLoading(null)
    }
  }

  return { download, loading }
}

// ── Page Results ───────────────────────────────────────────────
export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  const resultats = state?.resultats || {}
  const params = state?.params || resultats.params_input || {}

  const [activeTab, setActiveTab] = useState('structure')
  const [mepData, setMepData] = useState(null)
  const [mepLoading, setMepLoading] = useState(false)
  const [mepError, setMepError] = useState(false)
  const { download, loading: dlLoading } = usePdfDownload(params)

  // Charger MEP au premier accès onglet MEP
  const MEP_TABS = ['note-mep', 'boq-mep', 'edge', 'fiches-mep']
  useEffect(() => {
    if (MEP_TABS.includes(activeTab) && !mepData && !mepLoading && !mepError && params?.nom) {
      setMepLoading(true)
      fetch(`${BACKEND}/calculate-mep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
        .then(r => r.json())
        .then(d => { setMepData(d); if (!d.ok) setMepError(true) })
        .catch(() => setMepError(true))
        .finally(() => setMepLoading(false))
    }
  }, [activeTab])

  if (!params?.nom) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: GRIS3, marginBottom: 16 }}>Aucun résultat disponible.</p>
          <button onClick={() => navigate('/projects/new')} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 13, fontWeight: 600 }}>
            Nouveau projet
          </button>
        </div>
      </div>
    )
  }

  // Données de base
  const boq = resultats.boq_resume || {}
  const analyse = resultats.analyse_claude || {}
  const poteaux = resultats.poteaux || resultats.poteaux_par_niveau || []
  const poutre = resultats.poutre || {}
  const fondation = resultats.fondation || {}
  const surf = params.surface_emprise_m2 || 0
  const niv = params.nb_niveaux || 1
  const surf_batie = surf * niv

  // Calculs BOQ structure depuis données réelles moteur
  const PRIX_ACIER = 810
  const PRIX_BETON = 185000
  const PRIX_COFFRAGE = 18000
  const PRIX_TERR = 8500
  const PRIX_ETANCH = 18500
  const beton_m3 = boq.beton_m3 || 0
  const acier_kg = boq.acier_kg || 0
  const coffrage_m2 = beton_m3 * 4
  const cout_beton = beton_m3 * PRIX_BETON
  const cout_acier = acier_kg * PRIX_ACIER
  const cout_coffrage = coffrage_m2 * PRIX_COFFRAGE
  const lot_terr = surf * 1.5 * PRIX_TERR
  const lot_fond = (cout_beton + cout_acier + cout_coffrage) * 0.22
  const lot_maco = surf * niv * 0.08 * 28000
  const lot_etanch = surf * PRIX_ETANCH
  const lot_divers = (cout_beton + cout_acier + cout_coffrage) * 0.05
  const total_bas = Math.round(cout_beton + cout_acier + cout_coffrage + lot_terr + lot_fond + lot_maco + lot_etanch + lot_divers)
  const total_haut = Math.round(total_bas * 1.15)
  const ratio_bas = surf_batie ? Math.round(total_bas / surf_batie) : 0
  const ratio_haut = surf_batie ? Math.round(total_haut / surf_batie) : 0

  // ── Rendu par onglet ─────────────────────────────────────────
  const renderContent = () => {
    const tab = TABS.find(t => t.id === activeTab)

    // Plans (bientôt)
    if (activeTab === 'plan-ba' || activeTab === 'plan-mep') {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: GRIS3 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏗</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Disponible prochainement</div>
          <div style={{ fontSize: 13 }}>Les plans {activeTab === 'plan-ba' ? 'de béton armé' : 'MEP'} seront disponibles dans une prochaine version.</div>
        </div>
      )
    }

    // ── NOTE STRUCTURE ────────────────────────────────────────
    if (activeTab === 'structure') {
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>PROJET</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{params.nom}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{params.ville} — R+{niv - 1}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>CONFORMITÉ EC2</div>
                <Badge ok={analyse.conformite_ec2 === 'Conforme'} label={analyse.conformite_ec2 || 'Vérifiée'} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>SURFACE BÂTIE</div>
                <div style={{ fontWeight: 600 }}>{fmt(surf_batie, 'm²')}</div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Emprise {fmt(surf, 'm²')} × {niv} niveaux</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>BÉTON / ACIER</div>
                <div style={{ fontWeight: 600 }}>{fmt(beton_m3, 'm³')} / {fmt(acier_kg, 'kg')}</div>
              </div>
            </div>
            {analyse.commentaire_global && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#F9FFF9', borderRadius: 6, fontSize: 12, color: '#333', lineHeight: 1.6 }}>
                {analyse.commentaire_global}
              </div>
            )}
          </Card>

          {poteaux.length > 0 && (
            <>
              <SectionTitle>Descente de charges — Poteaux (EC2/EC8)</SectionTitle>
              <DataTable
                headers={['Niveau', 'NEd (kN)', 'Section', 'Armatures', 'Taux arm.', 'NRd (kN)', 'Vérif.']}
                rows={poteaux.map(p => [
                  p.label,
                  fmt(p.NEd_kN, '', 1),
                  `${p.section_mm}×${p.section_mm} mm`,
                  `${p.nb_barres}HA${p.diametre_mm} — cad. HA${p.cadre_diam_mm} e=${p.espacement_cadres_mm}`,
                  `${p.taux_armature_pct?.toFixed(2)}%`,
                  fmt(p.NRd_kN, '', 1),
                  <Badge ok={p.verif_ok} label={p.verif_ok ? '✓ OK' : '⚠ NOK'} />,
                ])}
              />
            </>
          )}

          {poutre.b_mm && (
            <>
              <SectionTitle>Poutre principale (EC2)</SectionTitle>
              <DataTable
                headers={['b (mm)', 'h (mm)', 'As inf (cm²)', 'As sup (cm²)', 'Étrierss', 'Portée (m)']}
                rows={[[
                  poutre.b_mm, poutre.h_mm,
                  fmt(poutre.As_inf_cm2, '', 1), fmt(poutre.As_sup_cm2, '', 1),
                  `HA${poutre.etrier_diam_mm} e=${poutre.etrier_esp_mm}mm`,
                  fmt(poutre.portee_m, '', 2),
                ]]}
              />
            </>
          )}

          {fondation.type && (
            <>
              <SectionTitle>Fondations</SectionTitle>
              <DataTable
                headers={['Type', 'Diamètre', 'Longueur', 'Armatures', 'Nb pieux']}
                rows={[[
                  fondation.type,
                  `Ø${fondation.diam_pieu_mm} mm`,
                  `${fondation.longueur_pieu_m} m`,
                  `As = ${fondation.As_cm2} cm²`,
                  `${fondation.nb_pieux} pieux`,
                ]]}
              />
            </>
          )}

          {analyse.alertes?.length > 0 && (
            <>
              <SectionTitle>Points d'attention</SectionTitle>
              <Card style={{ borderLeft: `3px solid ${ORANGE}` }}>
                {analyse.alertes.map((a, i) => <div key={i} style={{ fontSize: 12, color: ORANGE, marginBottom: 4 }}>⚠ {a}</div>)}
              </Card>
            </>
          )}

          {analyse.recommandations?.length > 0 && (
            <>
              <SectionTitle>Recommandations</SectionTitle>
              <Card>
                {analyse.recommandations.map((r, i) => <div key={i} style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>• {r}</div>)}
              </Card>
            </>
          )}

          {analyse.note_ingenieur && (
            <>
              <SectionTitle>Note ingénieur</SectionTitle>
              <Card style={{ borderLeft: `3px solid #1565C0`, background: '#E3F2FD' }}>
                <div style={{ fontSize: 12, color: '#1565C0', fontStyle: 'italic' }}>{analyse.note_ingenieur}</div>
              </Card>
            </>
          )}
        </>
      )
    }

    // ── BOQ STRUCTURE ─────────────────────────────────────────
    if (activeTab === 'boq-structure') {
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>COÛT STRUCTURE (BAS)</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{fmtFcfa(total_bas)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>COÛT STRUCTURE (HAUT)</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: VERT }}>{fmtFcfa(total_haut)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>COÛT / m² BÂTI</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{fmt(ratio_bas)} — {fmt(ratio_haut)} FCFA/m²</div>
                <div style={{ fontSize: 10, color: GRIS3, marginTop: 2 }}>Structure seule (hors MEP, finitions, VRD)</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>* Estimation ±15% — Confirmer avec métrés architecte.</div>
          </Card>

          <SectionTitle>Détail par lot</SectionTitle>
          <DataTable
            headers={['Lot', 'Désignation', 'Qté', 'Unité', 'P.U. (FCFA)', 'Montant bas', 'Montant haut']}
            rows={[
              ['1', 'Terrassement — décapage + fouilles méca.', fmt(surf * 1.5, '', 0), 'm³', fmt(PRIX_TERR), fmtFcfa(lot_terr), fmtFcfa(lot_terr * 1.10)],
              ['2', 'Fondations spéciales — pieux forés ø800mm', 'Forfait', '—', '285 k/ml', fmtFcfa(lot_fond), fmtFcfa(lot_fond * 1.20)],
              ['3a', `Béton ${params.classe_beton || 'C30/37'} BPE (${fmt(beton_m3, '', 0)} m³)`, fmt(beton_m3, '', 0), 'm³', fmt(PRIX_BETON), fmtFcfa(cout_beton), fmtFcfa(cout_beton * 1.10)],
              ['3b', `Acier HA500B fourni-posé (${fmt(acier_kg, '', 0)} kg)`, fmt(acier_kg, '', 0), 'kg', fmt(PRIX_ACIER), fmtFcfa(cout_acier), fmtFcfa(cout_acier * 1.10)],
              ['3c', `Coffrage toutes faces (${fmt(coffrage_m2, '', 0)} m²)`, fmt(coffrage_m2, '', 0), 'm²', fmt(PRIX_COFFRAGE), fmtFcfa(cout_coffrage), fmtFcfa(cout_coffrage * 1.10)],
              ['4', 'Maçonnerie — agglos 15cm enduits 2 faces', 'Forfait', '—', '28 k/m²', fmtFcfa(lot_maco), fmtFcfa(lot_maco * 1.15)],
              ['5', `Étanchéité toiture-terrasse (${fmt(surf, '', 0)} m²)`, fmt(surf, '', 0), 'm²', fmt(PRIX_ETANCH), fmtFcfa(lot_etanch), fmtFcfa(lot_etanch * 1.10)],
              ['6', 'Divers — joints, acrotères, réservations', 'Forfait', '—', '—', fmtFcfa(lot_divers), fmtFcfa(lot_divers * 1.10)],
              ['', <strong>TOTAL STRUCTURE</strong>, '', '', '', <strong style={{ color: VERT }}>{fmtFcfa(total_bas)}</strong>, <strong style={{ color: VERT }}>{fmtFcfa(total_haut)}</strong>],
            ]}
          />
        </>
      )
    }

    // ── Onglets MEP — chargement ─────────────────────────────
    if (MEP_TABS.includes(activeTab)) {
      if (mepLoading) return <Spinner text="Calcul MEP en cours..." />
      if (mepError || !mepData?.ok) return (
        <div style={{ textAlign: 'center', padding: 60, color: GRIS3 }}>
          <div style={{ fontSize: 13 }}>Données MEP non disponibles.</div>
          <button onClick={() => { setMepError(false); setMepData(null) }} style={{ marginTop: 12, background: VERT, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 12 }}>
            Réessayer
          </button>
        </div>
      )
    }

    // ── NOTE MEP ─────────────────────────────────────────────
    if (activeTab === 'note-mep' && mepData) {
      const el = mepData.electrique || {}
      const pl = mepData.plomberie || {}
      const cv = mepData.cvc || {}
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>PUISSANCE INSTALLÉE</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(el.puissance_totale_kva, 'kVA')}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>TRANSFORMATEUR</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(el.transfo_kva, 'kVA')}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>CONSO ANNUELLE</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(el.conso_annuelle_kwh, 'kWh/an')}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>FACTURE ANNUELLE</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmtFcfa(el.facture_annuelle_fcfa)}</div></div>
            </div>
          </Card>

          <SectionTitle>Électricité (NF C 15-100)</SectionTitle>
          <DataTable
            headers={['Indicateur', 'Valeur', 'Indicateur', 'Valeur']}
            rows={[
              ['Puissance totale', fmt(el.puissance_totale_kva, 'kVA'), 'Transformateur', fmt(el.transfo_kva, 'kVA')],
              ['Groupe électrogène', fmt(el.groupe_electrogene_kva, 'kVA'), 'Nb compteurs', fmt(el.nb_compteurs)],
              ['Conso annuelle', fmt(el.conso_annuelle_kwh, 'kWh/an'), 'Facture annuelle', fmtFcfa(el.facture_annuelle_fcfa)],
            ]}
          />

          <SectionTitle>Plomberie (DTU 60.11)</SectionTitle>
          <DataTable
            headers={['Indicateur', 'Valeur', 'Indicateur', 'Valeur']}
            rows={[
              ['Nb logements', fmt(pl.nb_logements), 'Besoin eau/jour', fmt(pl.besoin_total_m3_j, 'm³/j', 1)],
              ['Volume citerne', fmt(pl.volume_citerne_m3, 'm³'), 'Surpresseur', fmt(pl.debit_surpresseur_m3h, 'm³/h', 1)],
              ['Nb CESI', fmt(pl.nb_chauffe_eau_solaire, 'unités'), 'Facture eau/an', fmtFcfa(pl.facture_eau_fcfa)],
            ]}
          />

          <SectionTitle>CVC (EN 12831 — Dakar 35°C)</SectionTitle>
          <DataTable
            headers={['Indicateur', 'Valeur', 'Indicateur', 'Valeur']}
            rows={[
              ['Puissance frigorifique', fmt(cv.puissance_frigorifique_kw, 'kW'), 'Splits séjour', fmt(cv.nb_splits_sejour)],
              ['Splits chambre', fmt(cv.nb_splits_chambre), 'VMC', fmt(cv.nb_vmc, 'unités')],
              ['Conso CVC/an', fmt(cv.conso_cvc_kwh_an, 'kWh/an'), '', ''],
            ]}
          />
        </>
      )
    }

    // ── BOQ MEP ──────────────────────────────────────────────
    if (activeTab === 'boq-mep' && mepData) {
      const boqm = mepData.boq_mep || {}
      const acb = mepData.analyse_cout_benefice || {}
      const ratio_basic = surf_batie ? Math.round((boqm.basic_fcfa || 0) / surf_batie) : 0
      const ratio_hend = surf_batie ? Math.round((boqm.hend_fcfa || 0) / surf_batie) : 0
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['BASIC', boqm.basic_fcfa, false], ['HIGH-END', boqm.hend_fcfa, true], ['LUXURY', boqm.luxury_fcfa, false]].map(([label, val, accent], i) => (
                <div key={i} style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: accent ? VERT : '#111' }}>{fmtFcfa(val)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GRIS2}` }}>
              <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>COÛT MEP / m² BÂTI</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {fmt(ratio_basic)} — {fmt(ratio_hend)} FCFA/m²
                <span style={{ fontSize: 11, color: GRIS3, marginLeft: 8 }}>(basic → high-end)</span>
              </div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Détail complet disponible dans le PDF</div>
            </div>
            {acb.recommandation && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: VERT_LIGHT, borderRadius: 6, fontSize: 12, color: '#2d7a3a' }}>
                <strong>Recommandation :</strong> {acb.recommandation}
              </div>
            )}
          </Card>
        </>
      )
    }

    // ── EDGE ─────────────────────────────────────────────────
    if (activeTab === 'edge' && mepData) {
      const edge = mepData.edge || {}
      const certifiable = edge.certifiable
      const piliers = [
        { key: 'economie_energie_pct', label: 'ÉCONOMIE ÉNERGIE', methode: edge.methode_energie },
        { key: 'economie_eau_pct', label: 'ÉCONOMIE EAU', methode: null },
        { key: 'economie_materiaux_pct', label: 'ÉCONOMIE MATÉRIAUX', methode: null },
      ]
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 6 }}>VERDICT EDGE BASIQUE</div>
                <Badge ok={certifiable} label={certifiable ? '✓ Certifiable EDGE Basique' : '✗ Non certifiable'} />
                {edge.niveau_certification && <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{edge.niveau_certification}</div>}
              </div>
              {piliers.map(({ key, label, methode }) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: GRIS3 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 26, color: (edge[key] || 0) >= 20 ? VERT : ORANGE }}>
                    {edge[key] !== undefined ? `${edge[key]}%` : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: GRIS3 }}>Seuil EDGE : 20% minimum</div>
                  {methode && <div style={{ fontSize: 10, color: VERT, marginTop: 2 }}>{methode}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: ORANGE }}>
              Certification IFC/World Bank — Seuil : 20% économie sur énergie, eau et matériaux incorporés
            </div>
          </Card>

          {/* Mesures par pilier */}
          {[
            { title: 'Mesures énergie', key: 'mesures_energie' },
            { title: 'Mesures eau', key: 'mesures_eau' },
            { title: 'Mesures matériaux', key: 'mesures_materiaux' },
          ].map(({ title, key }) => edge[key]?.length > 0 && (
            <div key={key}>
              <SectionTitle>{title}</SectionTitle>
              <Card>
                {edge[key].map((m, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>• {typeof m === 'string' ? m : m.critere || m.mesure || JSON.stringify(m)}</div>
                ))}
              </Card>
            </div>
          ))}

          <div style={{ marginTop: 12, fontSize: 11, color: GRIS3 }}>
            Pré-évaluation indicative Tijan AI. La certification officielle requiert un auditeur EDGE agréé IFC.
          </div>
        </>
      )
    }

    // ── FICHES STRUCTURE ─────────────────────────────────────
    if (activeTab === 'fiches-structure') {
      return (
        <>
          <Card>
            <SectionTitle>Fiche béton armé — Poteaux</SectionTitle>
            {poteaux.length > 0 ? (
              <DataTable
                headers={['Niveau', 'Section', 'Armatures longitudinales', 'Cadres', 'Béton']}
                rows={poteaux.map(p => [
                  p.label,
                  `${p.section_mm}×${p.section_mm} mm`,
                  `${p.nb_barres}HA${p.diametre_mm} — As=${(p.nb_barres * Math.PI * p.diametre_mm ** 2 / 400).toFixed(1)} cm²`,
                  `HA${p.cadre_diam_mm} e=${p.espacement_cadres_mm}mm`,
                  params.classe_beton || 'C30/37',
                ])}
              />
            ) : <div style={{ fontSize: 12, color: GRIS3 }}>Données poteaux non disponibles.</div>}
          </Card>

          {poutre.b_mm && (
            <Card>
              <SectionTitle>Fiche poutre principale</SectionTitle>
              <DataTable
                headers={['Paramètre', 'Valeur']}
                rows={[
                  ['Section', `${poutre.b_mm} × ${poutre.h_mm} mm`],
                  ['Armatures inférieures (travée)', `As = ${poutre.As_inf_cm2} cm²`],
                  ['Armatures supérieures (appui)', `As = ${poutre.As_sup_cm2} cm²`],
                  ['Étriers', `HA${poutre.etrier_diam_mm} e=${poutre.etrier_esp_mm}mm`],
                  ['Portée maximale', `${poutre.portee_m} m`],
                  ['Béton', params.classe_beton || 'C30/37'],
                ]}
              />
            </Card>
          )}

          {fondation.type && (
            <Card>
              <SectionTitle>Fiche fondations</SectionTitle>
              <DataTable
                headers={['Paramètre', 'Valeur']}
                rows={[
                  ['Type', fondation.type],
                  ['Diamètre', `Ø${fondation.diam_pieu_mm} mm`],
                  ['Longueur', `${fondation.longueur_pieu_m} m`],
                  ['Armatures', `As = ${fondation.As_cm2} cm² — cage HA500B`],
                  ['Nombre', `${fondation.nb_pieux} pieux`],
                  ['Pression sol admissible', `${params.pression_sol_MPa} MPa`],
                ]}
              />
            </Card>
          )}
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>
            Téléchargez le dossier complet des fiches techniques ci-dessous.
          </div>
        </>
      )
    }

    // ── FICHES MEP ───────────────────────────────────────────
    if (activeTab === 'fiches-mep' && mepData) {
      const el = mepData.electrique || {}
      const pl = mepData.plomberie || {}
      const cv = mepData.cvc || {}
      return (
        <>
          <Card>
            <SectionTitle>Fiche électricité (NF C 15-100)</SectionTitle>
            <DataTable
              headers={['Paramètre', 'Valeur', 'Paramètre', 'Valeur']}
              rows={[
                ['Puissance installée', `${fmt(el.puissance_totale_kva)} kVA`, 'Transformateur HTA/BT', `${fmt(el.transfo_kva)} kVA`],
                ['Groupe électrogène', `${fmt(el.groupe_electrogene_kva)} kVA`, 'Nb compteurs', fmt(el.nb_compteurs)],
                ['Conso annuelle', `${fmt(el.conso_annuelle_kwh)} kWh/an`, 'Facture annuelle', fmtFcfa(el.facture_annuelle_fcfa)],
              ]}
            />
          </Card>
          <Card>
            <SectionTitle>Fiche plomberie (DTU 60.11)</SectionTitle>
            <DataTable
              headers={['Paramètre', 'Valeur', 'Paramètre', 'Valeur']}
              rows={[
                ['Nb logements', fmt(pl.nb_logements), 'Besoin eau/jour', `${fmt(pl.besoin_total_m3_j, '', 1)} m³/j`],
                ['Volume citerne', `${fmt(pl.volume_citerne_m3)} m³`, 'Débit surpresseur', `${fmt(pl.debit_surpresseur_m3h, '', 1)} m³/h`],
                ['Chauffe-eau solaires', `${fmt(pl.nb_chauffe_eau_solaire)} unités`, 'Facture eau/an', fmtFcfa(pl.facture_eau_fcfa)],
              ]}
            />
          </Card>
          <Card>
            <SectionTitle>Fiche CVC (EN 12831)</SectionTitle>
            <DataTable
              headers={['Paramètre', 'Valeur', 'Paramètre', 'Valeur']}
              rows={[
                ['Puissance frigorifique', `${fmt(cv.puissance_frigorifique_kw)} kW`, 'Splits séjour', fmt(cv.nb_splits_sejour)],
                ['Splits chambre', fmt(cv.nb_splits_chambre), 'VMC', `${fmt(cv.nb_vmc)} unités`],
                ['Conso CVC/an', `${fmt(cv.conso_cvc_kwh_an)} kWh/an`, '', ''],
              ]}
            />
          </Card>
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>
            Téléchargez le dossier complet des fiches MEP ci-dessous.
          </div>
        </>
      )
    }

    return null
  }

  const currentTab = TABS.find(t => t.id === activeTab)
  const mepPayloadExtra = MEP_TABS.includes(activeTab) && mepData ? { mep_data: mepData } : {}

  return (
    <>
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#FAFAFA' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${GRIS2}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: `1px solid ${GRIS2}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, color: '#555' }}>
              ← Accueil
            </button>
            <span style={{ fontWeight: 700, color: VERT, fontSize: 15 }}><span>Ÿ</span>IJAN AI</span>
            <span style={{ color: GRIS3, fontSize: 11 }}>Engineering Intelligence for Africa</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{params.nom} — {params.ville}</div>
          <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 4, padding: '3px 10px', fontSize: 11, color: '#B8860B' }}>Version bêta</div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
          {/* Sidebar */}
          <div style={{ width: 220, background: '#fff', borderRight: `1px solid ${GRIS2}`, padding: '16px 0', overflowY: 'auto', flexShrink: 0 }}>
            {TABS.map(tab => {
              const disabled = !tab.endpoint
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 20px', border: 'none', fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    color: disabled ? '#BBB' : active ? VERT : '#444',
                    background: active ? VERT_LIGHT : 'transparent',
                    borderLeft: active ? `3px solid ${VERT}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                  {disabled && <span style={{ marginLeft: 6, fontSize: 9, background: '#F0F0F0', color: '#888', borderRadius: 8, padding: '1px 6px' }}>Bientôt</span>}
                </button>
              )
            })}
          </div>

          {/* Contenu */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <div className="fade-in">
              {renderContent()}
            </div>

            {/* Bouton PDF */}
            {currentTab?.endpoint && (
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={() => download(currentTab.endpoint, currentTab.filename, mepPayloadExtra)}
                  disabled={!!dlLoading || (MEP_TABS.includes(activeTab) && !mepData?.ok)}
                  style={{
                    background: dlLoading === currentTab.endpoint ? '#ccc' : VERT,
                    color: '#fff', border: 'none', borderRadius: 6,
                    padding: '11px 28px', fontSize: 13, fontWeight: 600,
                    width: '100%', maxWidth: 320,
                    opacity: (MEP_TABS.includes(activeTab) && !mepData?.ok) ? 0.5 : 1,
                  }}
                >
                  {dlLoading === currentTab.endpoint ? 'Génération en cours...' : '↓ Télécharger le PDF'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
