// Pricing.jsx — Page achat crédits Tijan AI
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'
import Header from '../components/Header'
import { VERT, BACKEND } from '../constants'

const NAVY = '#1B2A4A'

const PACKS = [
  { id: 1, credits: 1, prix: 150000, label: '1 crédit', desc: '1 dossier technique complet', badge: null },
  { id: 2, credits: 3, prix: 500000, label: '3 crédits', desc: 'Économie 17% — Idéal promoteur', badge: 'Populaire', prixUnitaire: '167K/crédit' },
  { id: 3, credits: 5, prix: 750000, label: '5 crédits', desc: 'Économie 50% — Idéal BET', badge: 'Meilleur prix', prixUnitaire: '150K/crédit' },
]

function formatFCFA(n) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restants, loading: creditsLoading } = useCredits()
  const [selectedPack, setSelectedPack] = useState(2)
  const [payLoading, setPayLoading] = useState(false)

  const handlePay = async (pack) => {
    setPayLoading(true)
    try {
      const response = await fetch(`${BACKEND}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: pack.credits,
          prix: pack.prix,
          user_id: user.id,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        window.location.href = data.url
      } else {
        alert('Erreur: ' + (data.error || 'Réessayez'))
      }
    } catch (e) {
      console.error('PayDunya error:', e)
      alert('Impossible de contacter PayDunya. Vérifiez votre connexion.')
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif" }}>

      <Header />

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 20,
            padding: '4px 14px', fontSize: 11, color: '#B8860B', marginBottom: 12,
          }}>
            Offre Pionniers — Tarifs de lancement
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            Achetez des crédits
          </h1>
          <p style={{ fontSize: 14, color: '#666' }}>
            1 crédit = 1 dossier technique complet (notes de calcul + BOQ + fiches techniques)
          </p>
          {!creditsLoading && (
            <div style={{
              marginTop: 12, fontSize: 13, color: VERT, fontWeight: 600,
              background: '#F0FFF4', border: `1px solid ${VERT}`, borderRadius: 8,
              padding: '8px 16px', display: 'inline-block',
            }}>
              Crédits restants : {restants}
            </div>
          )}
        </div>

        {/* Packs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {PACKS.map(pack => {
            const selected = selectedPack === pack.id
            return (
              <div key={pack.id} onClick={() => setSelectedPack(pack.id)} style={{
                background: '#fff',
                border: selected ? `2px solid ${VERT}` : '1px solid #E5E5E5',
                borderRadius: 12, padding: '24px 20px',
                cursor: 'pointer', position: 'relative',
                boxShadow: selected ? `0 0 0 4px ${VERT}22` : 'none',
                transition: 'all 0.15s',
              }}>
                {pack.badge && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: pack.badge === 'Meilleur prix' ? VERT : NAVY,
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 10,
                  }}>{pack.badge}</div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 4 }}>
                    {pack.credits}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                    crédit{pack.credits > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 }}>
                    {formatFCFA(pack.prix)}
                  </div>
                  {pack.prixUnitaire && (
                    <div style={{ fontSize: 11, color: VERT, fontWeight: 600, marginBottom: 8 }}>
                      {pack.prixUnitaire}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                    {pack.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bouton payer */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => handlePay(PACKS.find(p => p.id === selectedPack))}
            disabled={payLoading}
            style={{
              background: payLoading ? '#ccc' : VERT, color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '14px 40px', fontSize: 16, fontWeight: 700,
              cursor: payLoading ? 'not-allowed' : 'pointer',
              minWidth: 300,
            }}
          >
            {payLoading ? 'Redirection vers PayDunya...' : `Acheter — ${formatFCFA(PACKS.find(p => p.id === selectedPack)?.prix || 0)}`}
          </button>
          <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
            Wave · Orange Money · Free Money · Carte bancaire
          </div>
        </div>

        {/* Inclus */}
        <div style={{
          marginTop: 40, background: '#fff', border: '0.5px solid #E5E5E5',
          borderRadius: 12, padding: '24px',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Chaque crédit inclut :</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              '📄 Note de calcul structure (EC2/EC8)',
              '💰 BOQ Structure détaillé (7 lots)',
              '⚡ Note de calcul MEP complète',
              '📊 BOQ MEP 3 gammes',
              '📋 Fiches techniques structure',
              '🔧 Fiches techniques MEP',
            ].map((item, i) => (
              <div key={i} style={{ fontSize: 12, color: '#555', padding: '4px 0' }}>
                {item}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: VERT, fontWeight: 600 }}>
            + Conformité EDGE IFC gratuite · + Chat IA illimité · + Rapport exécutif gratuit<br/>Plans d'exécution BA et MEP — disponibles très prochainement (1 crédit additionnel)
          </div>
        </div>

      </div>
    </div>
  )
}
