// Pricing.jsx — Page tarifs Tijan AI (abonnement mensuel unique)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { VERT, BACKEND } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'
const PRIX_MENSUEL = 250000 // FCFA TTC par mois — prix de lancement beta
const PRIX_UNITE = 100000   // FCFA TTC — étude supplémentaire à l'unité
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

  const handlePay = async () => {
    if (!user) { navigate('/login'); return }
    setPayLoading(true)
    try {
      const response = await fetch(`${BACKEND}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: 3,
          prix: PRIX_MENSUEL,
          user_id: user.id,
          plan: 'abonnement_mensuel',
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
            background: NAVY, color: '#fff', borderRadius: 20,
            padding: '5px 16px', fontSize: 11, fontWeight: 600, marginBottom: 14,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: VERT, display: 'inline-block', boxShadow: `0 0 5px ${VERT}` }} />
            {t('pr_badge')}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            Une offre simple et complète
          </h1>
          <p style={{ fontSize: 15, color: '#666', maxWidth: 500, margin: '0 auto' }}>
            Accès illimité à la plateforme, 3 études complètes par mois, support prioritaire 24h.
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
              Abonnement mensuel
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: NAVY, marginBottom: 4, lineHeight: 1 }}>
              {formatFCFA(PRIX_MENSUEL)}
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 6 }}>
              par mois, TTC — sans engagement
            </div>
            <div style={{ fontSize: 12, color: VERT, marginTop: 8, fontWeight: 600, fontStyle: 'italic' }}>
              Prix de lancement — Plans d'exécution en cours de finalisation
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

          {/* Récap fiscal */}
          <div style={{
            background: '#F7F8FA', borderRadius: 10,
            padding: '14px 16px', fontSize: 12, color: '#666', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Montant HT</span><span>{formatFCFA(totalHT)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>TVA 18%</span><span>{formatFCFA(totalTVA)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: NAVY, fontSize: 14, paddingTop: 8, borderTop: '1px solid #D0D0D0' }}>
              <span>Total TTC</span><span>{formatFCFA(PRIX_MENSUEL)}</span>
            </div>
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
            {payLoading ? t('pr_redirection') : "S'abonner maintenant →"}
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
