import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChatTijan from '../components/ChatTijan'
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
  }}>{label || (ok ? 'Conforme' : 'À vérifier')}</span>
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

const Spinner = ({ text = 'Chargement...' }) => (
  <div style={{ textAlign: 'center', padding: 60 }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${GRIS2}`, borderTop: `3px solid ${VERT}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
    <div style={{ fontSize: 13, color: GRIS3 }}>{text}</div>
  </div>
)

function usePdfDownload(params) {
  const [loading, setLoading] = useState(null)
  const download = async (endpoint, filename, extra = {}) => {
    if (!params || !endpoint) return
    setLoading(endpoint)
    try {
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, ...extra }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Erreur lors de la génération du document.') }
    finally { setLoading(null) }
  }
  return { download, loading }
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state
  const resultats = state?.resultats || {}
  const params = state?.params || {}

  const [activeTab, setActiveTab] = useState('structure')
  const [mepData, setMepData] = useState(null)
  const [mepLoading, setMepLoading] = useState(false)
  const [mepError, setMepError] = useState(false)
  const { download, loading: dlLoading } = usePdfDownload(params)

  const MEP_TABS = ['note-mep', 'boq-mep', 'edge', 'fiches-mep']

  useEffect(() => {
    if (MEP_TABS.includes(activeTab) && !mepData && !mepLoading && !mepError && params?.nom) {
      setMepLoading(true)
      fetch(`${BACKEND}/calculate-mep`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: GRIS3 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏗</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Disponible prochainement</div>
        </div>
      )
    }

    // ── NOTE STRUCTURE ──
    if (activeTab === 'structure') {
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>PROJET</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{params.nom}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{params.ville} — R+{niv - 1}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>BÉTON / ACIER</div>
                <div style={{ fontWeight: 600 }}>{resultats.classe_beton || params.classe_beton || '—'} / {resultats.classe_acier || params.classe_acier || '—'}</div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Auto-sélectionné</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>SURFACE BÂTIE</div>
                <div style={{ fontWeight: 600 }}>{fmt(surf_batie, 'm²')}</div>
                <div style={{ fontSize: 11, color: GRIS3 }}>Emprise {fmt(surf, 'm²')} × {niv} niv.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>BÉTON / ACIER</div>
                <div style={{ fontWeight: 600 }}>{fmt(beton_m3, 'm³')} / {fmt(acier_kg, 'kg')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>CONFORMITÉ EC2</div>
                <Badge ok={analyse.conformite_ec2 === 'Conforme'} label={analyse.conformite_ec2 || 'Vérifiée'} />
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
              <SectionTitle>Descente de charges — Poteaux (EC2/EC8)</SectionTitle>
              <DataTable
                headers={['Niveau', 'NEd (kN)', 'Section', 'Armatures', 'Taux arm.', 'NRd (kN)', 'Vérif.']}
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
              <SectionTitle>Fondations</SectionTitle>
              <DataTable
                headers={['Type', 'Diamètre', 'Longueur', 'Armatures', 'Nb pieux']}
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
                <div style={{ fontSize: 11, color: GRIS3 }}>COÛT STRUCTURE (BAS)</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{fmtFcfa(boq.total_bas_fcfa)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>COÛT STRUCTURE (HAUT)</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: VERT }}>{fmtFcfa(boq.total_haut_fcfa)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>COÛT / m² BÂTI</div>
                <div style={{ fontWeight: 600 }}>{fmt(boq.ratio_fcfa_m2_bati)} — {fmt(boq.ratio_fcfa_m2_habitable)} FCFA/m²</div>
                <div style={{ fontSize: 10, color: GRIS3 }}>Structure seule</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>BÉTON / ACIER</div>
                <div style={{ fontWeight: 600 }}>{fmt(beton_m3, 'm³')} / {fmt(acier_kg, 'kg')}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>Estimation ±15% — BOQ détaillé disponible en téléchargement.</div>
          </Card>
        </>
      )
    }

    // ── MEP chargement ──
    if (MEP_TABS.includes(activeTab)) {
      if (mepLoading) return <Spinner text="Calcul MEP en cours..." />
      if (mepError || !mepData?.ok) return (
        <div style={{ textAlign: 'center', padding: 60, color: GRIS3 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }}>Données MEP non disponibles.</div>
          <button onClick={() => { setMepError(false); setMepData(null) }} style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 12 }}>
            Réessayer
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
              <div><div style={{ fontSize: 11, color: GRIS3 }}>PUISSANCE INSTALLÉE</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(el.puissance_totale_kva, 'kVA')}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>TRANSFORMATEUR</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(el.transfo_kva, 'kVA')}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>BESOIN EAU/JOUR</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(pl.besoin_total_m3_j, 'm³/j', 2)}</div></div>
              <div><div style={{ fontSize: 11, color: GRIS3 }}>PUISSANCE FRIGO</div><div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(cv.puissance_frigorifique_kw, 'kW')}</div></div>
              {asc.nb_ascenseurs > 0 && <div><div style={{ fontSize: 11, color: GRIS3 }}>ASCENSEURS</div><div style={{ fontWeight: 700, fontSize: 18 }}>{asc.nb_ascenseurs} × {asc.capacite_kg} kg</div></div>}
            </div>
          </Card>

          <SectionTitle>Électricité (NF C 15-100)</SectionTitle>
          <DataTable headers={['Indicateur', 'Valeur', 'Indicateur', 'Valeur']} rows={[
            ['Puissance totale', fmt(el.puissance_totale_kva, 'kVA'), 'Transformateur', fmt(el.transfo_kva, 'kVA')],
            ['Groupe électrogène', fmt(el.groupe_electrogene_kva, 'kVA'), 'Nb compteurs', fmt(el.nb_compteurs)],
            ['Conso annuelle', fmt(el.conso_annuelle_kwh, 'kWh/an'), 'Facture annuelle', fmtFcfa(el.facture_annuelle_fcfa)],
          ]} />

          <SectionTitle>Plomberie (DTU 60.11)</SectionTitle>
          <DataTable headers={['Indicateur', 'Valeur', 'Indicateur', 'Valeur']} rows={[
            ['Nb logements', fmt(pl.nb_logements), 'Besoin eau/jour', fmt(pl.besoin_total_m3_j, 'm³/j', 2)],
            ['Volume citerne', fmt(pl.volume_citerne_m3, 'm³'), 'Surpresseur', fmt(pl.debit_surpresseur_m3h, 'm³/h', 1)],
            ['CESI', fmt(pl.nb_chauffe_eau_solaire, 'unités'), 'Facture eau/an', fmtFcfa(pl.facture_eau_fcfa)],
          ]} />

          <SectionTitle>CVC (EN 12831)</SectionTitle>
          <DataTable headers={['Indicateur', 'Valeur', 'Indicateur', 'Valeur']} rows={[
            ['Puissance frigo', fmt(cv.puissance_frigorifique_kw, 'kW'), 'Type VMC', cv.type_vmc || '—'],
            ['Splits séjour', fmt(cv.nb_splits_sejour), 'Splits chambre', fmt(cv.nb_splits_chambre)],
            ['Cassettes', fmt(cv.nb_cassettes), 'Conso CVC/an', fmt(cv.conso_cvc_kwh_an, 'kWh/an')],
          ]} />

          {mepData.securite_incendie && (
            <>
              <SectionTitle>Sécurité incendie (IT 246)</SectionTitle>
              <DataTable headers={['Indicateur', 'Valeur', 'Indicateur', 'Valeur']} rows={[
                ['Catégorie ERP', mepData.securite_incendie.categorie_erp, 'Détecteurs fumée', fmt(mepData.securite_incendie.nb_detecteurs_fumee)],
                ['Extincteurs CO2', fmt(mepData.securite_incendie.nb_extincteurs_co2), 'Sprinklers', mepData.securite_incendie.sprinklers_requis ? 'Obligatoires' : 'Non requis'],
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
                  <div style={{ fontSize: 20, fontWeight: 700, color: accent ? VERT : '#111' }}>{fmtFcfa(val)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GRIS2}` }}>
              <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>COÛT MEP / m² BÂTI</div>
              <div style={{ fontWeight: 600 }}>{fmt(ratio_b)} — {fmt(ratio_h)} FCFA/m² <span style={{ fontSize: 11, color: GRIS3 }}>(basic → high-end)</span></div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Détail complet disponible dans le PDF</div>
            </div>
            {boqm.recommandation && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: VERT_LIGHT, borderRadius: 6, fontSize: 12, color: '#2d7a3a' }}>
                <strong>Recommandation :</strong> {boqm.recommandation}
              </div>
            )}
          </Card>
        </>
      )
    }

    // ── EDGE ──
    if (activeTab === 'edge' && mepData) {
      const edge = mepData.edge || {}
      const piliers = [
        { key: 'economie_energie_pct', label: 'ÉCONOMIE ÉNERGIE' },
        { key: 'economie_eau_pct', label: 'ÉCONOMIE EAU' },
        { key: 'economie_materiaux_pct', label: 'ÉCONOMIE MATÉRIAUX' },
      ]
      return (
        <>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 6 }}>VERDICT EDGE BASIQUE</div>
                <Badge ok={edge.certifiable} label={edge.certifiable ? '✓ Certifiable EDGE Basique' : '✗ Non certifiable'} />
                {edge.niveau_certification && <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{edge.niveau_certification}</div>}
              </div>
              {piliers.map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: GRIS3 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 26, color: (edge[key] || 0) >= 20 ? VERT : ORANGE }}>
                    {edge[key] !== undefined ? `${edge[key]}%` : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: GRIS3 }}>Seuil EDGE : 20%</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: ORANGE }}>
              Certification IFC/World Bank — 20% d'économie requis sur les 3 piliers
            </div>
          </Card>

          {edge.plan_action?.length > 0 && (
            <>
              <SectionTitle>Plan d'action — Optimisation vers certification</SectionTitle>
              <Card style={{ borderLeft: `3px solid ${ORANGE}` }}>
                <div style={{ fontSize: 12, color: ORANGE, marginBottom: 8, fontWeight: 600 }}>
                  Coût de mise en conformité estimé : {fmtFcfa(edge.cout_mise_conformite_fcfa)} | ROI : {edge.roi_ans} ans
                </div>
                {edge.plan_action.map((a, i) => (
                  <div key={i} style={{ fontSize: 12, marginBottom: 6, padding: '6px 10px', background: '#FFFBF0', borderRadius: 4 }}>
                    <strong>[{a.pilier}]</strong> {a.action} — <span style={{ color: VERT }}>+{a.gain_pct}%</span>
                    {a.cout_fcfa > 0 && <span style={{ color: GRIS3 }}> — {fmtFcfa(a.cout_fcfa)}</span>}
                  </div>
                ))}
              </Card>
            </>
          )}

          {['mesures_energie', 'mesures_eau', 'mesures_materiaux'].map((key, i) => (
            edge[key]?.length > 0 && (
              <div key={key}>
                <SectionTitle>{['Mesures énergie', 'Mesures eau', 'Mesures matériaux'][i]}</SectionTitle>
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
            <SectionTitle>Fiche béton armé — Poteaux</SectionTitle>
            {poteaux.length > 0 ? (
              <DataTable
                headers={['Niveau', 'Section', 'Armatures longitudinales', 'Cadres', 'Béton']}
                rows={poteaux.map(p => [
                  p.niveau || p.label,
                  `${p.section_mm}×${p.section_mm} mm`,
                  `${p.nb_barres}HA${p.diametre_mm}`,
                  `HA${p.cadre_diam_mm} e=${p.espacement_cadres_mm}mm`,
                  resultats.classe_beton || params.classe_beton || 'C30/37',
                ])}
              />
            ) : <div style={{ fontSize: 12, color: GRIS3 }}>Données non disponibles.</div>}
          </Card>
          {fondation.type && (
            <Card>
              <SectionTitle>Fiche fondations</SectionTitle>
              <DataTable headers={['Type', 'Diamètre', 'Longueur', 'Armatures', 'Nb pieux']} rows={[[
                fondation.type,
                fondation.diam_pieu_mm ? `Ø${fondation.diam_pieu_mm} mm` : '—',
                fondation.longueur_pieu_m ? `${fondation.longueur_pieu_m} m` : '—',
                fondation.As_cm2 ? `As = ${fondation.As_cm2} cm²` : '—',
                fondation.nb_pieux || '—',
              ]]} />
            </Card>
          )}
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>Téléchargez le dossier complet ci-dessous.</div>
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
            <SectionTitle>Fiche électricité (NF C 15-100)</SectionTitle>
            <DataTable headers={['Paramètre', 'Valeur', 'Paramètre', 'Valeur']} rows={[
              ['Puissance installée', fmt(el.puissance_totale_kva, 'kVA'), 'Transformateur', fmt(el.transfo_kva, 'kVA')],
              ['Groupe électrogène', fmt(el.groupe_electrogene_kva, 'kVA'), 'Nb compteurs', fmt(el.nb_compteurs)],
              ['Conso annuelle', fmt(el.conso_annuelle_kwh, 'kWh/an'), 'Facture', fmtFcfa(el.facture_annuelle_fcfa)],
            ]} />
          </Card>
          <Card>
            <SectionTitle>Fiche plomberie (DTU 60.11)</SectionTitle>
            <DataTable headers={['Paramètre', 'Valeur', 'Paramètre', 'Valeur']} rows={[
              ['Nb logements', fmt(pl.nb_logements), 'Besoin eau/jour', fmt(pl.besoin_total_m3_j, 'm³/j', 2)],
              ['Volume citerne', fmt(pl.volume_citerne_m3, 'm³'), 'Surpresseur', fmt(pl.debit_surpresseur_m3h, 'm³/h', 1)],
              ['CESI', fmt(pl.nb_chauffe_eau_solaire, 'unités'), 'Facture eau/an', fmtFcfa(pl.facture_eau_fcfa)],
            ]} />
          </Card>
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>Téléchargez le dossier complet ci-dessous.</div>
        </>
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
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>PROJET</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{params.nom}</div>
                <div style={{ fontSize: 13, color: '#555' }}>{params.ville} — R+{(params.nb_niveaux||1)-1}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>SURFACE BÂTIE</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{fmt(boq.surface_batie_m2 || params.surface_emprise_m2 * params.nb_niveaux, 'm²')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>BÉTON / ACIER</div>
                <div style={{ fontWeight: 600 }}>{resultats.classe_beton || '—'} / {resultats.classe_acier || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3, marginBottom: 4 }}>CONFORMITÉ EC2</div>
                <Badge ok={analyse.conformite_ec2 === 'Conforme'} label={analyse.conformite_ec2 || '—'} />
              </div>
            </div>
          </Card>
          <SectionTitle>Budget global estimé</SectionTitle>
          <Card>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>STRUCTURE (BAS)</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtFcfa(boq.total_bas_fcfa)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>STRUCTURE (HAUT)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: VERT }}>{fmtFcfa(boq.total_haut_fcfa)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>COÛT / m² BÂTI</div>
                <div style={{ fontWeight: 600 }}>{fmt(boq.ratio_fcfa_m2_bati)} FCFA/m²</div>
                <div style={{ fontSize: 10, color: GRIS3 }}>Structure seule</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>Estimation ±15% — hors MEP, finitions, VRD</div>
          </Card>
          {analyse.note_ingenieur && (
            <>
              <SectionTitle>Note de synthèse ingénieur</SectionTitle>
              <Card style={{ borderLeft: '3px solid #1565C0', background: '#E3F2FD' }}>
                <div style={{ fontSize: 12, color: '#1565C0', fontStyle: 'italic' }}>{analyse.note_ingenieur}</div>
              </Card>
            </>
          )}
          {analyse.points_forts?.length > 0 && (
            <>
              <SectionTitle>Points forts</SectionTitle>
              <Card>{analyse.points_forts.map((f,i) => <div key={i} style={{ fontSize: 12, color: '#2d7a3a', marginBottom: 4 }}>✅ {f}</div>)}</Card>
            </>
          )}
          {analyse.alertes?.length > 0 && (
            <>
              <SectionTitle>Points d'attention</SectionTitle>
              <Card style={{ borderLeft: '3px solid #E07B00' }}>{analyse.alertes.map((a,i) => <div key={i} style={{ fontSize: 12, color: '#E07B00', marginBottom: 4 }}>⚠ {a}</div>)}</Card>
            </>
          )}
          <div style={{ marginTop: 12, fontSize: 11, color: GRIS3 }}>Ce rapport est destiné au maître d'ouvrage. Téléchargez le PDF complet ci-dessous.</div>
        </>
      )
    }

    if (activeTab === 'chat') return <ChatTijan params={params} resultatsStructure={resultats} resultatsMep={mepData} />
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
    'edge':               '/generate-edge',
    'rapport-executif':   '/generate-rapport-executif',
    'fiches-structure':   '/generate-fiches-structure',
    'fiches-mep':         '/generate-fiches-mep',
  }
  const FILENAME_MAP = {
    'structure':          `TijanAI_NoteStructure_${slug}_${today}.pdf`,
    'boq-structure':      `TijanAI_BOQStructure_${slug}_${today}.pdf`,
    'note-mep':           `TijanAI_NoteMEP_${slug}_${today}.pdf`,
    'boq-mep':            `TijanAI_BOQMEP_${slug}_${today}.pdf`,
    'edge':               `TijanAI_EDGE_${slug}_${today}.pdf`,
    'rapport-executif':   `TijanAI_RapportExecutif_${slug}_${today}.pdf`,
    'fiches-structure':   `TijanAI_FichesStructure_${slug}_${today}.pdf`,
    'fiches-mep':         `TijanAI_FichesMEP_${slug}_${today}.pdf`,
  }

  const endpoint = ENDPOINT_MAP[activeTab]
  const filename = FILENAME_MAP[activeTab]

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#FAFAFA' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${GRIS2}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: `1px solid ${GRIS2}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, color: '#555' }}>← Accueil</button>
          <img src="/tijan_logo.png" alt="Tijan AI" style={{ height: 22, objectFit: 'contain' }} />
          <span style={{ color: GRIS3, fontSize: 11 }}>Engineering Intelligence for Africa</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{params.nom} — {params.ville}</div>
        <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 4, padding: '3px 10px', fontSize: 11, color: '#B8860B' }}>Version bêta</div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        <div style={{ width: 220, background: '#fff', borderRight: `1px solid ${GRIS2}`, padding: '16px 0', overflowY: 'auto', flexShrink: 0 }}>
          {TABS.map(tab => {
            const disabled = !tab.endpoint
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px',
                border: 'none', fontSize: 12, fontWeight: active ? 600 : 400,
                color: disabled ? '#BBB' : active ? VERT : '#444',
                background: active ? VERT_LIGHT : 'transparent',
                borderLeft: active ? `3px solid ${VERT}` : '3px solid transparent',
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                {tab.label}
                {disabled && <span style={{ marginLeft: 6, fontSize: 9, background: '#F0F0F0', color: '#888', borderRadius: 8, padding: '1px 6px' }}>Bientôt</span>}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {renderContent()}
          {endpoint && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => { const nomFichier = `TijanAI_${activeTab.replace(/-/g,'')}_${slug}_${today}.pdf`; download(endpoint, nomFichier) }}
                disabled={!!dlLoading || (MEP_TABS.includes(activeTab) && !mepData?.ok)}
                style={{
                  background: dlLoading === endpoint ? '#ccc' : VERT,
                  color: '#fff', border: 'none', borderRadius: 6,
                  padding: '11px 28px', fontSize: 13, fontWeight: 600,
                  width: '100%', maxWidth: 320, cursor: 'pointer',
                  opacity: (MEP_TABS.includes(activeTab) && !mepData?.ok) ? 0.5 : 1,
                }}
              >
                {dlLoading === endpoint ? 'Génération en cours...' : '↓ Télécharger le PDF'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
