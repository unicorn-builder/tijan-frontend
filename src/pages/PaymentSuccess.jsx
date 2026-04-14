// PaymentSuccess.jsx — Page de confirmation après paiement
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCredits } from '../hooks/useCredits'
import { useLang } from '../i18n.jsx'
import { VERT } from '../constants'

const NAVY = '#1B2A4A'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { ajouter, restants, loading } = useCredits()
  const { lang } = useLang()
  const [done, setDone] = useState(false)
  const credits = parseInt(searchParams.get('credits')) || 0

  useEffect(() => {
    if (credits > 0 && !done && !loading) {
      ajouter(credits).then(() => setDone(true))
    }
  }, [credits, done, loading])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px',
        textAlign: 'center', maxWidth: 420, border: '0.5px solid #E5E5E5',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
          {lang === 'en' ? 'Payment confirmed!' : 'Paiement confirmé !'}
        </h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
          {lang === 'en'
            ? `${credits} credit${credits > 1 ? 's' : ''} added to your account.`
            : `${credits} crédit${credits > 1 ? 's' : ''} ajouté${credits > 1 ? 's' : ''} à votre compte.`}
        </p>
        <div style={{
          background: '#F0FFF4', border: `1px solid ${VERT}`, borderRadius: 8,
          padding: '12px 20px', fontSize: 18, fontWeight: 700, color: VERT,
          marginBottom: 24,
        }}>
          {done ? restants : '...'} {lang === 'en' ? 'credits available' : 'crédits disponibles'}
        </div>
        <button onClick={() => navigate('/projects/new')} style={{
          background: VERT, color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          width: '100%',
        }}>
          {lang === 'en' ? 'Create a project →' : 'Créer un projet →'}
        </button>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: `1px solid #E5E5E5`, borderRadius: 8,
          padding: '10px 28px', fontSize: 13, color: '#555', cursor: 'pointer',
          width: '100%', marginTop: 8,
        }}>
          {lang === 'en' ? 'Back to dashboard' : 'Retour au dashboard'}
        </button>
      </div>
    </div>
  )
}
