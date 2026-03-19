// Login.jsx — Page authentification Tijan AI
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const VERT = '#43A956'
const VERT_DARK = '#2D7A3A'
const NAVY = '#1B2A4A'
const GRIS1 = '#F7F8FA'
const GRIS2 = '#E5E7EB'
const GRIS3 = '#9CA3AF'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        if (!nom.trim()) throw new Error('Veuillez entrer votre nom.')
        if (password.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères.')
        const { error } = await signUp(email, password, nom)
        if (error) throw error
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      }
    } catch (err) {
      const msg = err.message || 'Une erreur est survenue.'
      if (msg.includes('Invalid login')) setError('Email ou mot de passe incorrect.')
      else if (msg.includes('already registered')) setError('Cet email est déjà utilisé.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: GRIS1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>
      {/* Logo + titre */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: NAVY, borderRadius: 10, padding: '10px 20px', marginBottom: 12,
        }}>
          <span style={{ color: VERT, fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>TIJAN AI</span>
        </div>
        <div style={{ color: '#555', fontSize: 13 }}>Engineering Intelligence for Africa</div>
      </div>

      {/* Carte */}
      <div style={{
        background: '#fff',
        border: `1px solid ${GRIS2}`,
        borderRadius: 12,
        padding: '32px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 28, gap: 0, borderBottom: `2px solid ${GRIS2}` }}>
          {[['login', 'Se connecter'], ['signup', 'Créer un compte']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
              flex: 1, background: 'none', border: 'none',
              paddingBottom: 12, fontSize: 14, fontWeight: mode === m ? 700 : 400,
              color: mode === m ? VERT : GRIS3,
              borderBottom: mode === m ? `2px solid ${VERT}` : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer', transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                Nom complet
              </label>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Amadou Diallo"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0', border: '1px solid #FCA5A5',
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: '#DC2626', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#EBF7ED', border: `1px solid ${VERT}`,
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: VERT_DARK, marginBottom: 16,
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? GRIS3 : VERT,
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '13px 0', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: GRIS3 }}>
            Pas encore de compte ?{' '}
            <button onClick={() => setMode('signup')} style={{
              background: 'none', border: 'none', color: VERT,
              fontWeight: 600, cursor: 'pointer', fontSize: 12,
            }}>
              Créer un compte
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: GRIS3, textAlign: 'center' }}>
        Tijan AI — Plateforme BIM/Ingénierie pour l'Afrique
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  padding: '11px 14px',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}
