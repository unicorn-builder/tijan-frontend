// Header.jsx — Header réutilisable Tijan AI
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'

const VERT = '#43A956'

export default function Header({ showBack, backLabel, backTo }) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { restants } = useCredits()

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56, borderBottom: '0.5px solid #E5E5E5',
      background: '#fff', position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Gauche */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button onClick={() => navigate(backTo || '/')} style={{
            background: 'none', border: '1px solid #E5E5E5', borderRadius: 6,
            padding: '5px 12px', fontSize: 12, color: '#555', cursor: 'pointer',
          }}>{backLabel || '← Accueil'}</button>
        )}
        <img
          src="/tijan_logo_crop.png" alt="Tijan AI"
          onClick={() => navigate('/')}
          style={{ height: 28, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 11, color: '#888' }}>Engineering Intelligence for Africa</span>
      </div>

      {/* Droite */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && (
          <button onClick={() => navigate('/pricing')} style={{
            background: '#F0FFF4', border: '1px solid #43A956', borderRadius: 6,
            padding: '5px 12px', fontSize: 11, color: VERT, cursor: 'pointer', fontWeight: 600,
          }}>
            {restants ?? '...'} crédit{restants !== 1 ? 's' : ''}
          </button>
        )}
        {user && (
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'none', border: '1px solid #E5E5E5', borderRadius: 6,
            padding: '5px 12px', fontSize: 12, color: '#555', cursor: 'pointer',
          }}>Mes projets</button>
        )}
        {user ? (
          <button onClick={signOut} style={{
            background: 'none', border: '1px solid #E5E5E5', borderRadius: 6,
            padding: '5px 12px', fontSize: 12, color: '#888', cursor: 'pointer',
          }}>Déconnexion</button>
        ) : (
          <button onClick={() => navigate('/login')} style={{
            background: VERT, color: '#fff', border: 'none', borderRadius: 6,
            padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Commencer gratuitement</button>
        )}
      </div>
    </nav>
  )
}
