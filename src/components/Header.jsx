// Header.jsx — Header réutilisable Tijan AI
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'
import { useLang } from '../i18n.jsx'

const VERT = '#43A956'

export default function Header() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { restants } = useCredits()
  const { lang, setLang, t } = useLang()

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 10px', minHeight: 56, flexWrap: 'wrap', gap: 8, borderBottom: '0.5px solid #E5E5E5',
      background: '#fff', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src="/tijan_logo_crop.png" alt="Tijan AI"
          onClick={() => navigate('/')}
          style={{ height: 24, cursor: 'pointer' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} style={{
          background: 'none', border: '1px solid #E5E5E5', borderRadius: 6,
          padding: '4px 8px', fontSize: 11, fontWeight: 700, color: '#555', cursor: 'pointer',
        }}>{lang === 'fr' ? 'EN' : 'FR'}</button>
        {user && (
          <button onClick={() => navigate('/pricing')} style={{
            background: '#F0FFF4', border: '1px solid #43A956', borderRadius: 6,
            padding: '5px 12px', fontSize: 11, color: VERT, cursor: 'pointer', fontWeight: 600,
          }}>
            {restants ?? '...'} {restants !== 1 ? t('credits_label_plural') : t('credits_label')} · {t('tarifs')}
          </button>
        )}
        {user && (
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'none', border: '1px solid #E5E5E5', borderRadius: 6,
            padding: '4px 8px', fontSize: 11, color: '#555', cursor: 'pointer',
          }}>{t('mes_projets')}</button>
        )}
        {!user && (
          <button onClick={() => navigate('/pricing')} style={{
            background: 'none', border: '1px solid #E5E5E5', borderRadius: 6,
            padding: '4px 8px', fontSize: 11, color: '#555', cursor: 'pointer',
          }}>{t('tarifs')}</button>
        )}
        {user ? (
          <button onClick={signOut} style={{
            background: 'none', border: '1px solid #E5E5E5', borderRadius: 6,
            padding: '4px 8px', fontSize: 11, color: '#888', cursor: 'pointer',
          }}>{t('deconnexion')}</button>
        ) : (
          <button onClick={() => navigate('/login')} style={{
            background: VERT, color: '#fff', border: 'none', borderRadius: 6,
            padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{t('commencer_gratuit')}</button>
        )}
      </div>
    </nav>
  )
}
