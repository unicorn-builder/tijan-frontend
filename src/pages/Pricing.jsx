// Pricing.jsx — Page abonnements Tijan AI
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { VERT, BACKEND } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'

function formatFCFA(n) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

const PLANS = [
  {
    id: 'starter',
    projets: 1,
    prix: 100000,
    prixParProjet: 100000,
    badge: null,
    extra: false,
  },
  {
    id: 'pro',
    projets: 3,
    prix: 225000,
    prixParProjet: 75000,
    badge: 'popular',
    extra: true,
    extraPrix: 75000,
  },
  {
    id: 'enterprise',
    projets: null, // unlimited
    prix: null,    // custom
    prixParProjet: null,
    badge: null,
    extra: false,
  },
]

const EXTRAS = [
  { id: 'review', prix: 250000 },
  { id: 'edge', prix: 350000 },
  { id: 'permis', prix: 200000 },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLang()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [payLoading, setPayLoading] = useState(false)

  const handlePay = async (plan) => {
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:malicktall@gmail.com?subject=Tijan Enterprise'
      return
    }
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
          credits: plan.projets,
          prix: plan.prix,
          user_id: user.id,
          plan: plan.id,
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
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

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 40 }}>
          {PLANS.map(plan => {
            const selected = selectedPlan === plan.id
            const isEnterprise = plan.id === 'enterprise'
            return (
              <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
                background: '#fff',
                border: selected ? `2px solid ${VERT}` : '1px solid #E5E5E5',
                borderRadius: 14, padding: '28px 24px',
                cursor: 'pointer', position: 'relative',
                boxShadow: selected ? `0 0 0 4px ${VERT}22` : 'none',
                transition: 'all 0.15s',
              }}>
                {plan.badge === 'popular' && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: VERT, color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '3px 12px', borderRadius: 10, whiteSpace: 'nowrap',
                  }}>{t('pr_populaire')}</div>
                )}

                <div style={{ textAlign: 'center' }}>
                  {/* Plan name */}
                  <div style={{ fontSize: 12, fontWeight: 700, color: VERT, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
                    {t(`pr_plan_${plan.id}`)}
                  </div>

                  {/* Price */}
                  {isEnterprise ? (
                    <div style={{ fontSize: 26, fontWeight: 800, color: NAVY, marginBottom: 4 }}>
                      {t('pr_sur_devis')}
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 2 }}>
                        {formatFCFA(plan.prix)}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                        {t('pr_par_mois')}
                      </div>
                    </>
                  )}

                  {/* Divider */}
                  <div style={{ width: 40, height: 2, background: '#E5E5E5', margin: '14px auto' }} />

                  {/* Projects */}
                  <div style={{ fontSize: 14, color: '#333', fontWeight: 600, marginBottom: 6 }}>
                    {isEnterprise ? t('pr_projets_illimites') : `${plan.projets} ${plan.projets > 1 ? t('pr_projets_plural') : t('pr_projet_single')}`}
                  </div>

                  {/* Per project price */}
                  {plan.prixParProjet && (
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                      {formatFCFA(plan.prixParProjet)} / {t('pr_par_projet')}
                    </div>
                  )}

                  {/* Extra credits note */}
                  {plan.extra && (
                    <div style={{
                      fontSize: 11, color: VERT, fontWeight: 600,
                      background: '#F0FFF4', borderRadius: 6, padding: '6px 10px', marginTop: 8,
                    }}>
                      {t('pr_extra_credit')}
                    </div>
                  )}

                  {/* Enterprise features */}
                  {isEnterprise && (
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7, marginTop: 8 }}>
                      {t('pr_enterprise_features')}
                    </div>
                  )}

                  {/* CTA button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePay(plan) }}
                    disabled={payLoading && selected}
                    style={{
                      marginTop: 18, width: '100%',
                      background: selected ? (isEnterprise ? NAVY : VERT) : '#fff',
                      color: selected ? '#fff' : NAVY,
                      border: selected ? 'none' : `1.5px solid ${NAVY}`,
                      borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 700,
                      cursor: payLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isEnterprise ? t('pr_contact') : (payLoading && selected ? t('pr_redirection') : t('pr_souscrire'))}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Inclus dans chaque plan */}
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

        {/* Services premium */}
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

        {/* Payment methods */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#999' }}>
          {t('pr_moyens')}
        </div>

      </div>
    </div>
  )
}
