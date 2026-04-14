// Pricing.jsx — Page tarifs Tijan AI (modèle crédit unique style Wave)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { VERT, BACKEND } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'
const PRIX_CREDIT = 500000 // FCFA TTC par crédit
const TVA_RATE = 0.18      // Sénégal
const QUANTITES = [1, 2, 3, 5, 10]

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
  const [qty, setQty] = useState(1)
  const [payLoading, setPayLoading] = useState(false)

  const bonus = Math.floor(qty / 5)
  const totalCredits = qty + bonus
  const totalTTC = qty * PRIX_CREDIT
  const totalHT = Math.round(totalTTC / (1 + TVA_RATE))
  const totalTVA = totalTTC - totalHT

  const handlePay = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setPayLoading(true)
    try {
      const response = await fetch(`${BACKEND}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: totalCredits, // Inclut le bonus — le backend ajoute ce nombre
          prix: totalTTC,
          user_id: user.id,
          plan: `credits_${qty}${bonus ? `_plus_${bonus}` : ''}`,
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif" }}>

      <Header />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: NAVY, color: '#fff', borderRadius: 20,
            padding: '5px 16px', fontSize: 11, fontWeight: 600, marginBottom: 14,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: VERT,
              display: 'inline-block', boxShadow: `0 0 5px ${VERT}`,
            }} />
            {t('pr_badge')}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            {t('pr_titre')}
          </h1>
          <p style={{ fontSize: 15, color: '#666', maxWidth: 500, margin: '0 auto' }}>
            {t('pr_desc')}
          </p>
        </div>

        {/* Carte tarif unique */}
        <div style={{
          background: '#fff',
          border: `2px solid ${VERT}`,
          borderRadius: 16,
          padding: '32px 28px',
          marginBottom: 32,
          boxShadow: `0 0 0 6px ${VERT}18`,
        }}>
          {/* Prix unitaire */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: VERT, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
              {t('pr_credit_label')}
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: NAVY, marginBottom: 4, lineHeight: 1 }}>
              {formatFCFA(PRIX_CREDIT)}
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              {t('pr_ttc_par_credit')}
            </div>
            <div style={{ fontSize: 13, color: '#333', marginTop: 10, fontWeight: 600 }}>
              1 {t('pr_credit')} = 1 {t('pr_projet_complet')}
            </div>
          </div>

          {/* Quantité */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 10, textAlign: 'center' }}>
              {t('pr_choisir_quantite')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {QUANTITES.map(q => {
                const active = qty === q
                return (
                  <button key={q} onClick={() => setQty(q)} style={{
                    minWidth: 56,
                    background: active ? NAVY : '#fff',
                    color: active ? '#fff' : NAVY,
                    border: active ? `1.5px solid ${NAVY}` : '1px solid #D0D0D0',
                    borderRadius: 8, padding: '10px 14px',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>{q}</button>
                )
              })}
            </div>
          </div>

          {/* Bonus banner */}
          {bonus > 0 && (
            <div style={{
              background: `${VERT}18`,
              border: `1px solid ${VERT}`,
              borderRadius: 10,
              padding: '10px 14px',
              textAlign: 'center',
              fontSize: 13, fontWeight: 700, color: VERT,
              marginBottom: 16,
            }}>
              🎁 +{bonus} {bonus > 1 ? t('pr_credits_offerts') : t('pr_credit_offert')} — {t('pr_bonus_regle')}
            </div>
          )}

          {/* Récap */}
          <div style={{
            background: '#F7F8FA',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 13, color: '#444',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>{t('pr_credits_achetes')}</span>
              <span style={{ fontWeight: 600, color: NAVY }}>{qty}</span>
            </div>
            {bonus > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: VERT }}>
                <span>{t('pr_credits_bonus')}</span>
                <span style={{ fontWeight: 700 }}>+{bonus}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, paddingTop: 6, borderTop: '1px dashed #D0D0D0' }}>
              <span style={{ fontWeight: 700, color: NAVY }}>{t('pr_credits_recus')}</span>
              <span style={{ fontWeight: 800, color: NAVY }}>{totalCredits}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 10 }}>
              <span>{t('pr_montant_ht')}</span>
              <span>{formatFCFA(totalHT)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
              <span>{t('pr_tva_18')}</span>
              <span>{formatFCFA(totalTVA)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: NAVY, marginTop: 6, paddingTop: 6, borderTop: '1px solid #D0D0D0' }}>
              <span>{t('pr_total_ttc')}</span>
              <span>{formatFCFA(totalTTC)}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={payLoading}
            style={{
              width: '100%',
              background: VERT,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 0',
              fontSize: 15, fontWeight: 700,
              cursor: payLoading ? 'not-allowed' : 'pointer',
              opacity: payLoading ? 0.7 : 1,
            }}
          >
            {payLoading ? t('pr_redirection') : t('pr_souscrire')}
          </button>

          <div style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 10 }}>
            {t('pr_moyens')}
          </div>
        </div>

        {/* Inclus dans chaque crédit */}
        <div style={{
          background: '#fff', border: '0.5px solid #E5E5E5',
          borderRadius: 12, padding: '24px', marginBottom: 32,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 14 }}>{t('pr_inclus_titre')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { icon: '📄', label: t('pr_incl_note_structure') },
              { icon: '💰', label: t('pr_incl_boq_structure') },
              { icon: '⚡', label: t('pr_incl_note_mep') },
              { icon: '📊', label: t('pr_incl_boq_mep') },
              { icon: '🏗️', label: t('pr_incl_plans_ba') },
              { icon: '📐', label: t('pr_incl_plans_mep') },
              { icon: '🌱', label: t('pr_incl_edge') },
              { icon: '📋', label: t('pr_incl_rapport') },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', padding: '4px 0' }}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Services premium — bientôt */}
        <div style={{
          background: NAVY, borderRadius: 14, padding: '28px 24px', color: '#fff',
        }}>
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
                position: 'relative',
              }}>
                <div style={{
                  display: 'inline-block',
                  background: VERT, color: NAVY,
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.6,
                  padding: '3px 8px', borderRadius: 999, marginBottom: 8,
                  textTransform: 'uppercase',
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
          <div style={{
            fontSize: 12, color: VERT, marginTop: 18, fontWeight: 600,
            textAlign: 'center',
            background: 'rgba(46,139,87,0.12)',
            border: '1px solid rgba(46,139,87,0.35)',
            borderRadius: 8, padding: '10px 14px',
          }}>
            {t('pr_extras_note')}
          </div>
        </div>

        {/* Enterprise contact */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#666' }}>
          {t('pr_enterprise_line')} <a href="mailto:malicktall@gmail.com?subject=Tijan Enterprise" style={{ color: VERT, fontWeight: 600, textDecoration: 'none' }}>malicktall@gmail.com</a>
        </div>

      </div>
    </div>
  )
}
