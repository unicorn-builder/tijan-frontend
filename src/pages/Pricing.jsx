// Pricing.jsx — Page tarifs Tijan AI (abonnement mensuel unique)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { VERT, BACKEND } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'
const PRIX_MENSUEL = 250000 // FCFA TTC par mois — tarif beta lancement
const PRIX_UNITE = 200000   // FCFA TTC — étude supplémentaire à l'unité
const TVA_RATE = 0.18

function formatFCFA(n) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

const EXTRAS = [
  { id: 'review' },
  { id: 'edge' },
  { id: 'permis' },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLang()
  const [payLoading, setPayLoading] = useState(false)

  const totalHT = Math.round(PRIX_MENSUEL / (1 + TVA_RATE))
  const totalTVA = PRIX_MENSUEL - totalHT

  const [unitLoading, setUnitLoading] = useState(false)
  const [showPromo, setShowPromo] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoResult, setPromoResult] = useState(null) // { valid, discount_percent, monthly_price, duration_months, ... }
  const [promoError, setPromoError] = useState('')

  // Auto-fill from URL param ?promo=TIJAN-XXX-YYYY
  useState(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('promo')
    if (code) { setPromoCode(code.toUpperCase()); setShowPromo(true) }
  }, [])

  const validatePromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true); setPromoError(''); setPromoResult(null)
    try {
      const res = await fetch(`${BACKEND}/promo-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (data.valid) {
        setPromoResult(data)
      } else {
        setPromoError(data.reason || 'Code invalide')
      }
    } catch (e) {
      setPromoError('Erreur de connexion')
    } finally {
      setPromoLoading(false)
    }
  }

  const effectivePrice = promoResult ? promoResult.monthly_price : PRIX_MENSUEL

  const handlePay = async () => {
    if (!user) { navigate('/login'); return }
    setPayLoading(true)
    try {
      const response = await fetch(`${BACKEND}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: 3,
          prix: effectivePrice,
          user_id: user.id,
          plan: 'cabinet_mensuel',
          promo_code: promoResult ? promoCode.trim().toUpperCase() : undefined,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        window.location.href = data.url
      } else {
        alert(t('pricing_err') + ': ' + (data.error || t('pricing_retry')))
      }
    } catch (e) {
      console.error('Payment error:', e)
      alert(t('pricing_no_server'))
    } finally {
      setPayLoading(false)
    }
  }

  const handlePayUnit = async () => {
    if (!user) { navigate('/login'); return }
    setUnitLoading(true)
    try {
      const response = await fetch(`${BACKEND}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: 1,
          prix: PRIX_UNITE,
          user_id: user.id,
          plan: 'etude_unitaire',
        }),
      })
      const data = await response.json()
      if (data.ok) {
        window.location.href = data.url
      } else {
        alert(t('pricing_err') + ': ' + (data.error || t('pricing_retry')))
      }
    } catch (e) {
      console.error('Payment error:', e)
      alert(t('pricing_no_server'))
    } finally {
      setUnitLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#E8F5E9', color: VERT, borderRadius: 20,
            padding: '5px 16px', fontSize: 11, fontWeight: 700, marginBottom: 14,
            border: `1px solid ${VERT}40`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: VERT, display: 'inline-block', boxShadow: `0 0 5px ${VERT}` }} />
            Tarif Beta — Offre de lancement
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            Lancez-vous au tarif fondateur
          </h1>
          <p style={{ fontSize: 15, color: '#666', maxWidth: 500, margin: '0 auto' }}>
            Profitez du tarif beta à 250 000 FCFA/mois — 3 études complètes, tous documents inclus.
          </p>
        </div>

        {/* Carte abonnement unique */}
        <div style={{
          background: '#fff',
          border: `2px solid ${VERT}`,
          borderRadius: 16,
          padding: '32px 28px',
          marginBottom: 32,
          boxShadow: `0 0 0 6px ${VERT}18`,
        }}>
          {/* Prix */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: VERT, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
              Offre Beta — Cabinet
            </div>
            {promoResult ? (
              <>
                <div style={{ fontSize: 24, color: '#999', textDecoration: 'line-through', lineHeight: 1 }}>
                  {formatFCFA(PRIX_MENSUEL)}
                </div>
                <div style={{ fontSize: 48, fontWeight: 800, color: VERT, marginBottom: 4, lineHeight: 1 }}>
                  {formatFCFA(promoResult.monthly_price)}
                </div>
                <div style={{ fontSize: 13, color: VERT, fontWeight: 600, marginTop: 6 }}>
                  -{promoResult.discount_percent}% pendant {promoResult.duration_months} mois
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  puis {formatFCFA(PRIX_MENSUEL)}/mois
                </div>
              </>
            ) : (
              <div style={{ fontSize: 48, fontWeight: 800, color: NAVY, marginBottom: 4, lineHeight: 1 }}>
                {formatFCFA(PRIX_MENSUEL)}
              </div>
            )}
            <div style={{ fontSize: 14, color: '#666', marginTop: 6 }}>
              par mois, TTC — sans engagement
            </div>
          </div>

          {/* Inclus */}
          <div style={{ marginBottom: 24 }}>
            {[
              { icon: '📁', text: '3 études complètes par mois' },
              { icon: '🚫', text: 'Sans watermark sur tous les documents' },
              { icon: '🕐', text: 'Support prioritaire 24h' },
              { icon: '📄', text: 'Tous formats — PDF, DWG, Excel, Word' },
              { icon: '🌱', text: 'Certification EDGE incluse' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid #F0F0F0' : 'none', fontSize: 14, color: '#333' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.text}</span>
                <span style={{ marginLeft: 'auto', color: VERT, fontWeight: 700 }}>✓</span>
              </div>
            ))}
          </div>

          {/* Code promo toggle */}
          <div style={{ marginBottom: 16 }}>
            {!showPromo ? (
              <button onClick={() => setShowPromo(true)} style={{
                background: 'none', border: 'none', color: VERT, fontSize: 13,
                cursor: 'pointer', fontWeight: 600, padding: 0,
              }}>
                J'ai un code partenaire
              </button>
            ) : (
              <div style={{ background: '#F7F8FA', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Code partenaire</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoResult(null) }}
                    placeholder="TIJAN-XXX-XXXX"
                    style={{
                      flex: 1, padding: '10px 12px', border: `1.5px solid ${promoError ? '#EF4444' : promoResult ? VERT : '#DDD'}`,
                      borderRadius: 8, fontSize: 14, fontFamily: 'monospace', letterSpacing: 1,
                    }}
                  />
                  <button
                    onClick={validatePromo}
                    disabled={promoLoading || !promoCode.trim()}
                    style={{
                      padding: '10px 18px', background: NAVY, color: '#fff', border: 'none',
                      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      opacity: promoLoading ? 0.7 : 1,
                    }}
                  >
                    {promoLoading ? '...' : 'Appliquer'}
                  </button>
                </div>
                {promoError && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>{promoError}</div>}
                {promoResult && (
                  <div style={{ color: VERT, fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                    Code valide — {promoResult.discount_percent}% de remise pendant {promoResult.duration_months} mois
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Récap fiscal */}
          <div style={{
            background: '#F7F8FA', borderRadius: 10,
            padding: '14px 16px', fontSize: 12, color: '#666', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Montant HT</span><span>{formatFCFA(Math.round(effectivePrice / (1 + TVA_RATE)))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>TVA 18%</span><span>{formatFCFA(effectivePrice - Math.round(effectivePrice / (1 + TVA_RATE)))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: NAVY, fontSize: 14, paddingTop: 8, borderTop: '1px solid #D0D0D0' }}>
              <span>Total TTC</span><span>{formatFCFA(effectivePrice)}</span>
            </div>
            {promoResult && (
              <div style={{ fontSize: 11, color: '#999', marginTop: 8, lineHeight: 1.5 }}>
                À l'issue des {promoResult.duration_months} mois, votre abonnement passe automatiquement à {formatFCFA(PRIX_MENSUEL)}/mois.
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={payLoading}
            style={{
              width: '100%', background: VERT, color: '#fff',
              border: 'none', borderRadius: 10, padding: '16px 0',
              fontSize: 16, fontWeight: 700,
              cursor: payLoading ? 'not-allowed' : 'pointer',
              opacity: payLoading ? 0.7 : 1,
            }}
          >
            {payLoading ? t('pr_redirection') : promoResult ? `S'abonner à ${formatFCFA(effectivePrice)}/mois →` : "S'abonner maintenant →"}
          </button>
          <div style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 10 }}>
            Wave · Orange Money · Free Money · Carte bancaire
          </div>
        </div>

        {/* Étude à l'unité */}
        <div style={{
          background: '#fff',
          border: '1px solid #E5E5E5',
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
              Besoin d'une seule étude ?
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              1 projet complet — tous documents inclus, sans abonnement
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{formatFCFA(PRIX_UNITE)}</div>
              <div style={{ fontSize: 11, color: '#999' }}>TTC — paiement unique</div>
            </div>
            <button
              onClick={handlePayUnit}
              disabled={unitLoading}
              style={{
                background: NAVY, color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 24px',
                fontSize: 14, fontWeight: 600,
                cursor: unitLoading ? 'not-allowed' : 'pointer',
                opacity: unitLoading ? 0.7 : 1, whiteSpace: 'nowrap',
              }}
            >
              {unitLoading ? '...' : 'Acheter →'}
            </button>
          </div>
        </div>

        {/* Inclus dans chaque étude */}
        <div style={{
          background: '#fff', border: '0.5px solid #E5E5E5',
          borderRadius: 12, padding: '24px', marginBottom: 32,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 14 }}>
            Inclus dans chaque étude
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { icon: '📄', label: 'Note de calcul structure (EC2/EC8)' },
              { icon: '💰', label: 'BOQ Structure détaillé (7 lots)' },
              { icon: '⚡', label: 'Note de calcul MEP complète' },
              { icon: '📊', label: 'BOQ MEP 3 gammes' },
              { icon: '🏗️', label: 'Plans BA (coffrage + ferraillage)' },
              { icon: '📐', label: 'Plans MEP tous niveaux' },
              { icon: '🔀', label: 'Schémas structure' },
              { icon: '🔌', label: 'Schémas MEP' },
              { icon: '🌱', label: 'Conformité EDGE IFC v3' },
              { icon: '📋', label: 'Rapport exécutif maître ouvrage' },
              { icon: '📑', label: 'Fiches techniques structure + MEP' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', padding: '4px 0' }}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Services premium */}
        <div style={{ background: NAVY, borderRadius: 14, padding: '28px 24px', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: VERT, marginBottom: 6 }}>
            {t('pr_extras_section')}
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>
            {t('pr_extras_titre')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {EXTRAS.map((extra, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 10,
                padding: '18px 16px', border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <div style={{
                  display: 'inline-block', background: VERT, color: NAVY,
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.6,
                  padding: '3px 8px', borderRadius: 999, marginBottom: 8, textTransform: 'uppercase',
                }}>
                  {t('bientot_dispo')}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                  {t(`pr_extra_${extra.id}`)}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  {t(`pr_extra_${extra.id}_desc`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#666' }}>
          {t('pr_enterprise_line')} <a href="mailto:malicktall@gmail.com?subject=Tijan Enterprise" style={{ color: VERT, fontWeight: 600, textDecoration: 'none' }}>malicktall@gmail.com</a>
        </div>

      </div>
    </div>
  )
}
