import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { VERT } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'

const CIBLES_KEYS = [
  { icon: '🏦', titre: 'cible_banques', desc: 'cible_banques_desc' },
  { icon: '🏗️', titre: 'cible_promoteurs', desc: 'cible_promoteurs_desc' },
  { icon: '🔨', titre: 'cible_constructeurs', desc: 'cible_constructeurs_desc' },
  { icon: '📐', titre: 'cible_bet', desc: 'cible_bet_desc' },
  { icon: '🏠', titre: 'cible_architectes', desc: 'cible_architectes_desc' },
]

const LIVRABLES_KEYS = [
  { label: 'liv_note_structure', norme: 'EC2 / EC8', icon: '📄' },
  { label: 'liv_boq_structure', norme: '7 lots', icon: '💰' },
  { label: 'liv_note_mep', norme: 'NF C 15-100 / DTU 60.11', icon: '⚡' },
  { label: 'liv_boq_mep', norme: 'Basic / High-End / Luxury', icon: '📊' },
  { label: 'liv_edge', norme: 'liv_norme_edge', icon: '🌱' },
  { label: 'liv_rapport', norme: 'liv_norme_rapport', icon: '📋' },
  { label: 'liv_plans_ba', norme: 'bientot_dispo', icon: '🏗️' },
  { label: 'liv_plans_mep', norme: 'bientot_dispo', icon: '📐' },
]

const CHIFFRES_KEYS = [
  { val: '<5 min', label: 'chiffre_dossier' },
  { val: '8', label: 'chiffre_docs' },
  { val: '5', label: 'chiffre_pays' },
  { val: '±15%', label: 'chiffre_precision' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLang()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      <Header />

            {/* ── HERO ── */}
      <section style={{
        textAlign: 'center', padding: '56px 24px 40px',
        background: 'linear-gradient(180deg, #FAFFFE 0%, #fff 100%)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: NAVY, borderRadius: 20,
          padding: '6px 18px', fontSize: 12, color: '#fff', fontWeight: 600,
          marginBottom: 18, letterSpacing: 0.2,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: VERT,
            display: 'inline-block', boxShadow: `0 0 6px ${VERT}`,
          }} />
          {t('badge_world_first')}
          <span style={{ opacity: 0.4, margin: '0 2px' }}>·</span>
          {t('badge_eurocodes')}
        </div>

        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, color: NAVY, lineHeight: 1.15,
          maxWidth: 700, margin: '0 auto 16px',
        }}>
          {t('hero_title_1')}<br />
          <span style={{ color: VERT }}>{t('hero_title_2')}</span>
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#555', lineHeight: 1.6,
          maxWidth: 520, margin: '0 auto 28px',
        }}>
          {t('hero_subtitle')}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(user ? '/projects/new' : '/login')} style={{
            background: VERT, color: '#fff', border: 'none', borderRadius: 8,
            padding: '13px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            {t('cta_analyser')}
          </button>
          <button onClick={() => document.getElementById('livrables')?.scrollIntoView({ behavior: 'smooth' })} style={{
            background: '#fff', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 8,
            padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>
            {t('cta_livrables')}
          </button>
        </div>

        {/* Chiffres */}
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap',
          flexWrap: 'wrap',
        }}>
          {CHIFFRES_KEYS.map((c, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: NAVY }}>{c.val}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{t(c.label)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section style={{ padding: '32px 16px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>{t('pour_qui')}</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>{t('pour_qui_titre')}</h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 14, maxWidth: 900, margin: '0 auto',
        }}>
          {CIBLES_KEYS.map((c, i) => (
            <div key={i} style={{
              background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: 10,
              padding: '18px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: NAVY, marginBottom: 4 }}>{t(c.titre)}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{t(c.desc)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVRABLES ── */}
      <section id="livrables" style={{ padding: '32px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>{t('livrables_section')}</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>{t('livrables_titre')}</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            {t('livrables_desc')}<br/>{t('livrables_plans_soon')}
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12, maxWidth: 900, margin: '0 auto',
        }}>
          {LIVRABLES_KEYS.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: 8,
              padding: '14px 16px',
            }}>
              <span style={{ fontSize: 22 }}>{l.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{t(l.label)}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{t(l.norme)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ padding: '32px 16px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>{t('comment_section')}</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>{t('comment_titre')}</h2>
        </div>
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
          maxWidth: 800, margin: '0 auto',
        }}>
          {[
            { step: '1', titre: t('step1_titre'), desc: t('step1_desc') },
            { step: '2', titre: t('step2_titre'), desc: t('step2_desc') },
            { step: '3', titre: t('step3_titre'), desc: t('step3_desc') },
          ].map((s, i) => (
            <div key={i} style={{
              flex: '1 1 220px', textAlign: 'center',
              background: '#fff', borderRadius: 10, padding: '24px 20px',
              border: '0.5px solid #E5E5E5',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: VERT, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, margin: '0 auto 12px',
              }}>{s.step}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: NAVY, marginBottom: 6 }}>{s.titre}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: '32px 16px', textAlign: 'center',
        background: NAVY,
      }}>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          {t('cta_final_titre')}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          {t('cta_final_desc')}
        </p>
        <button onClick={() => navigate('/pricing')} style={{
          background: VERT, color: '#fff', border: 'none', borderRadius: 8,
          padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>
          {t('cta_commencer')}
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
          {t('cta_gratuit')}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '20px 32px', borderTop: '0.5px solid #E5E5E5',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        fontSize: 11, color: '#aaa',
      }}>
        <div>© 2026 Tijan AI · Engineering Intelligence for Africa</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/impact')} style={{
            background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 11,
          }}>{t('nav_impact')}</button>
          <button onClick={() => navigate('/investors')} style={{
            background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 11,
          }}>{t('nav_investors')}</button>
        </div>
        <div>Dakar · Abidjan · Casablanca · Lagos · Accra</div>
      </footer>
    </div>
  )
}
