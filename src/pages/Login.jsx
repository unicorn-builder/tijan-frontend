// Login.jsx — Page authentification Tijan AI
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n.jsx'

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
  const [acceptCGU, setAcceptCGU] = useState(false)

  const { signIn, signUp, supabase } = useAuth()
  const { t } = useLang()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }
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
        if (!nom.trim()) throw new Error(t('signup_nom_required'))
        if (password.length < 6) throw new Error(t('signup_password_short'))
        if (!acceptCGU) throw new Error(t('signup_cgu_required'))
        const { error } = await signUp(email, password, nom)
        if (error) throw error
        setSuccess(t('signup_success'))
      }
    } catch (err) {
      const msg = err.message || 'Une erreur est survenue.'
      if (msg.includes('Invalid login')) setError(t('login_email_invalid'))
      else if (msg.includes('already registered')) setError(t('login_already_registered'))
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
        <img src="/tijan_logo_crop.png" alt="Tijan AI" style={{ height: 52, marginBottom: 8 }} />
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
          {[['login', t('login_tab')], ['signup', t('signup_tab')]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
              flex: 1, background: 'none', border: 'none',
              paddingBottom: 12, fontSize: 14, fontWeight: mode === m ? 700 : 400,
              color: mode === m ? VERT : GRIS3,
              borderBottom: mode === m ? `2px solid ${VERT}` : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer', transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Google OAuth */}
        <button type="button" onClick={signInWithGoogle} style={{
          width: '100%', background: '#fff', border: '1px solid #E5E7EB',
          borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 600,
          color: '#111', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-7.7 19.7-20 0-1.3-.1-2.7-.2-3z"/>
          </svg>
          {t('login_google')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{t('login_ou')}</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
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

          {mode === 'signup' && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#444', marginBottom: 14, cursor: 'pointer', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={acceptCGU}
                onChange={e => setAcceptCGU(e.target.checked)}
                style={{ marginTop: 3, cursor: 'pointer' }}
              />
              <span>
                {t('signup_cgu_label_1')}{' '}
                <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: VERT, fontWeight: 600, textDecoration: 'underline' }}>
                  {t('signup_cgu_link')}
                </a>
                {' '}{t('signup_cgu_label_2')}
              </span>
            </label>
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
            {loading ? t('login_loading') : mode === 'login' ? t('login_submit') : t('signup_submit')}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: GRIS3 }}>
            {t('login_no_account')}{' '}
            <button onClick={() => setMode('signup')} style={{
              background: 'none', border: 'none', color: VERT,
              fontWeight: 600, cursor: 'pointer', fontSize: 12,
            }}>
              {t('login_create')}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: GRIS3, textAlign: 'center' }}>
        {t('login_footer')}
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
