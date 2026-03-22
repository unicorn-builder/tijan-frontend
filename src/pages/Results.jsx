import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
    } catch (e) { console.warn('PDF generation failed:', e) }
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
  const { supabase, user } = useAuth()
  const { restants, consommer } = useCredits()
  const { lang, setLang, t } = useLang()
  const [mepData, setMepData] = useState(state?.mepData || null)
  const [chatMessages, setChatMessages] = useState(state?.chatHistorique || [])
  const [mepLoading, setMepLoading] = useState(false)
  const [mepError, setMepError] = useState(false)
  const [edgeOptimise, setEdgeOptimise] = useState(null)
  const [edgeLoading, setEdgeLoading] = useState(false)
  const { download, loading: dlLoading } = usePdfDownload(params)

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

  const MEP_TABS = ['note-mep', 'boq-mep', 'edge', 'fiches-mep']

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
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{t('res_bientot')}</div>
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
                <div style={{ fontSize: 11, color: GRIS3 }}>{t('r_auto_select')}</div>
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
                <div style={{ fontSize: 10, color: GRIS3 }}>{t('r_structure_seule')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: GRIS3 }}>BÉTON / ACIER</div>
                <div style={{ fontWeight: 600 }}>{fmt(beton_m3, 'm³')} / {fmt(acier_kg, 'kg')}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: ORANGE }}>{t('r_estimation_note')}</div>
          </Card>
        </>
      )
    }

    // ── MEP chargement ──
    if (MEP_TABS.includes(activeTab)) {
      if (mepLoading) return <Spinner text="Calcul MEP en cours..." />
      if (mepError || !mepData?.ok) return (
        <div style={{ textAlign: 'center', padding: 60, color: GRIS3 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }}>{t('r_mep_non_dispo')}</div>
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

          <SectionTitle>{t('r_electricite')}</SectionTitle>
          <DataTable headers={[t('r_indicateur'), t('r_valeur'), t('r_indicateur'), t('r_valeur')]} rows={[
            [t('r_puissance_totale'), fmt(el.puissance_totale_kva, 'kVA'), t('r_transfo'), fmt(el.transfo_kva, 'kVA')],
            [t('r_groupe_elec'), fmt(el.groupe_electrogene_kva, 'kVA'), t('r_nb_compteurs'), fmt(el.nb_compteurs)],
            [t('r_conso_annuelle'), fmt(el.conso_annuelle_kwh, 'kWh/an'), t('r_facture_annuelle'), fmtFcfa(el.facture_annuelle_fcfa)],
          ]} />

          <SectionTitle>{t('r_plomberie')}</SectionTitle>
          <DataTable headers={[t('r_indicateur'), t('r_valeur'), t('r_indicateur'), t('r_valeur')]} rows={[
            [t('r_nb_logements'), fmt(pl.nb_logements), t('r_besoin_eau_jour'), fmt(pl.besoin_total_m3_j, 'm³/j', 2)],
            [t('r_volume_citerne'), fmt(pl.volume_citerne_m3, 'm³'), t('r_surpresseur'), fmt(pl.debit_surpresseur_m3h, 'm³/h', 1)],
            [t('r_cesi'), fmt(pl.nb_chauffe_eau_solaire, 'unités'), t('r_facture_eau'), fmtFcfa(pl.facture_eau_fcfa)],
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
        { key: 'economie_energie_pct', label: t('r_eco_energie') },
        { key: 'economie_eau_pct', label: t('r_eco_eau') },
        { key: 'economie_materiaux_pct', label: t('r_eco_materiaux') },
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
              {t('r_edge_note')}
            </div>
          </Card>

          {edge.plan_action?.length > 0 && (
            <>
              <SectionTitle>{t('r_plan_action')}</SectionTitle>
              <Card style={{ borderLeft: `3px solid ${ORANGE}` }}>
                <div style={{ fontSize: 12, color: ORANGE, marginBottom: 8, fontWeight: 600 }}>
                  {t('r_cout_conformite')} : {fmtFcfa(edge.cout_mise_conformite_fcfa)} | ROI : {edge.roi_ans} ans
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
                {[['Énergie', edgeOptimise.edge.economie_energie_pct], ['Eau', edgeOptimise.edge.economie_eau_pct], ['Matériaux', edgeOptimise.edge.economie_materiaux_pct]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#555' }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: val >= 20 ? '#43A956' : '#E07B00' }}>{val}%</div>
                    <div style={{ fontSize: 10, color: '#888' }}>Seuil : 20%</div>
                  </div>
                ))}
              </div>
              {edgeOptimise.surcout_edge && (
                <div style={{ fontSize: 12, color: '#555', borderTop: '1px solid #C8E6C9', paddingTop: 10 }}>
                  <strong>Surcoût d'optimisation :</strong>{' '}
                  {(edgeOptimise.surcout_edge.total_fcfa / 1e6).toFixed(1)} M FCFA
                  {' '}({edgeOptimise.surcout_edge.pct_boq_mep}% du BOQ MEP Basic)
                  <div style={{ marginTop: 4, fontSize: 11, color: '#888' }}>
                    LED {(edgeOptimise.surcout_edge.led_fcfa/1e6).toFixed(1)}M +
                    Isolation {(edgeOptimise.surcout_edge.isolation_fcfa/1e6).toFixed(1)}M +
                    WC éco {(edgeOptimise.surcout_edge.wc_fcfa/1e3).toFixed(0)}k +
                    Robinetterie {(edgeOptimise.surcout_edge.robinetterie_fcfa/1e3).toFixed(0)}k FCFA
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
                headers={['Niveau', 'Section', 'Armatures longitudinales', 'Cadres', 'Béton']}
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
              [t('r_conso_annuelle'), fmt(el.conso_annuelle_kwh, 'kWh/an'), 'Facture', fmtFcfa(el.facture_annuelle_fcfa)],
            ]} />
          </Card>
          <Card>
            <SectionTitle>{t('r_fiche_plomb')}</SectionTitle>
            <DataTable headers={[t('r_parametre'), t('r_valeur'), t('r_parametre'), t('r_valeur')]} rows={[
              [t('r_nb_logements'), fmt(pl.nb_logements), t('r_besoin_eau_jour'), fmt(pl.besoin_total_m3_j, 'm³/j', 2)],
              [t('r_volume_citerne'), fmt(pl.volume_citerne_m3, 'm³'), t('r_surpresseur'), fmt(pl.debit_surpresseur_m3h, 'm³/h', 1)],
              [t('r_cesi'), fmt(pl.nb_chauffe_eau_solaire, 'unités'), t('r_facture_eau'), fmtFcfa(pl.facture_eau_fcfa)],
            ]} />
          </Card>
          <div style={{ fontSize: 11, color: GRIS3, marginTop: 8 }}>{t('r_telecharger_complet')}</div>
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
          <SectionTitle>{t('r_budget_global')}</SectionTitle>
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
                <div style={{ fontSize: 10, color: GRIS3 }}>{t('r_structure_seule')}</div>
              </div>
            </div>
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

  const endpoint = activeTab === 'chat' ? null : ENDPOINT_MAP[activeTab]
  const filename = FILENAME_MAP[activeTab]

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#FAFAFA' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${GRIS2}`, padding: isMobile ? '0 8px' : '0 24px', height: isMobile ? 44 : 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 16 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid #E5E5E5', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#555', cursor: 'pointer' }}>←</button>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #E5E5E5', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#555', cursor: 'pointer' }}>Projets</button>
          <img src="/tijan_logo.png" alt="Tijan AI" onClick={() => navigate("/")} style={{ cursor: "pointer", height: isMobile ? 18 : 22, objectFit: 'contain' }} />
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
            <ChatTijan params={params} resultatsStructure={resultats} resultatsMep={mepData} savedChat={chatMessages} onUpdateChat={setChatMessages} />
          </div>
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
                {dlLoading === endpoint ? t('res_generation') : t('res_telecharger')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
