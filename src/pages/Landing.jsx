import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

/* Floating output card for hero */
function FloatingCard({ label, delay, x, y }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: '#fff', borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 4px 24px rgba(27,42,74,0.10), 0 1px 4px rgba(67,169,86,0.12)',
      border: `1px solid rgba(67,169,86,0.15)`,
      fontSize: 11, fontWeight: 600, color: NAVY,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      whiteSpace: 'nowrap', zIndex: 2,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: VERT,
        boxShadow: `0 0 6px ${VERT}`,
      }} />
      {label}
    </div>
  )
}

/* Pulsing glow orb */
const glowKeyframes = `
@keyframes pulseGlow {
  0%, 100% { opacity: 0.25; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.08); }
}
@keyframes gridFade {
  0%, 100% { opacity: 0.04; }
  50% { opacity: 0.09; }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLang()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{glowKeyframes}</style>

      <Header />

      {/* ── HERO ── */}
      <section style={{
        textAlign: 'center', padding: '60px 24px 48px',
        background: 'linear-gradient(180deg, #F4FFF6 0%, #F8FFFE 40%, #fff 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(${VERT}22 1px, transparent 1px), linear-gradient(90deg, ${VERT}22 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          animation: 'gridFade 4s ease-in-out infinite',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%)',
        }} />

        {/* Green glow orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '20%', width: 200, height: 200,
          borderRadius: '50%', background: `radial-gradient(circle, ${VERT}30 0%, transparent 70%)`,
          animation: 'pulseGlow 4s ease-in-out infinite', zIndex: 0, filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '25%', right: '15%', width: 160, height: 160,
          borderRadius: '50%', background: `radial-gradient(circle, ${VERT}20 0%, transparent 70%)`,
          animation: 'pulseGlow 4s ease-in-out infinite 1.5s', zIndex: 0, filter: 'blur(40px)',
        }} />

        {/* Floating output cards */}
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'none' }} className="hero-cards-desktop">
            {/* These show on wider screens via CSS below */}
          </div>
          <FloatingCard label="Note de calcul EC2" delay={600} x="2%" y="60px" />
          <FloatingCard label="BOQ Structure — 7 lots" delay={900} x="0%" y="180px" />
          <FloatingCard label="Plans BA A3" delay={1200} x="75%" y="50px" />
          <FloatingCard label="Certification EDGE" delay={1500} x="78%" y="170px" />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: NAVY, borderRadius: 20,
              padding: '7px 20px', fontSize: 12, color: '#fff', fontWeight: 600,
              marginBottom: 22, letterSpacing: 0.2,
              boxShadow: `0 2px 16px ${NAVY}33`,
              animation: 'slideUp 0.6s ease-out both',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: VERT,
                display: 'inline-block', boxShadow: `0 0 8px ${VERT}`,
                animation: 'pulseGlow 2s ease-in-out infinite',
              }} />
              {t('badge_world_first')}
              <span style={{ opacity: 0.35, margin: '0 2px' }}>·</span>
              {t('badge_eurocodes')}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(28px, 5.5vw, 48px)', fontWeight: 800, color: NAVY, lineHeight: 1.1,
              maxWidth: 700, margin: '0 auto 18px',
              animation: 'slideUp 0.6s ease-out 0.15s both',
            }}>
              {t('hero_title_1')}<br />
              <span style={{
                color: VERT,
                textShadow: `0 0 40px ${VERT}33`,
              }}>{t('hero_title_2')}</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(14px, 2.5vw, 17px)', color: '#555', lineHeight: 1.65,
              maxWidth: 540, margin: '0 auto 32px',
              animation: 'slideUp 0.6s ease-out 0.3s both',
            }}>
              {t('hero_subtitle')}
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
              animation: 'slideUp 0.6s ease-out 0.45s both',
            }}>
              <button onClick={() => navigate(user ? '/projects/new' : '/login')} style={{
                background: VERT, color: '#fff', border: 'none', borderRadius: 10,
                padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 20px ${VERT}44`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 6px 28px ${VERT}55` }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px ${VERT}44` }}
              >
                {t('cta_analyser')}
              </button>
              <button onClick={() => document.getElementById('livrables')?.scrollIntoView({ behavior: 'smooth' })} style={{
                background: '#fff', color: NAVY, border: `1.5px solid ${NAVY}20`, borderRadius: 10,
                padding: '13px 30px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(27,42,74,0.06)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
              >
                {t('cta_livrables')}
              </button>
            </div>
          </div>
        </div>

        {/* Chiffres */}
        <div style={{
          display: 'flex', gap: 32, justifyContent: 'center', marginTop: 44, flexWrap: 'wrap',
          position: 'relative', zIndex: 1,
        }}>
          {CHIFFRES_KEYS.map((c, i) => (
            <div key={i} style={{
              textAlign: 'center',
              animation: `slideUp 0.5s ease-out ${0.6 + i * 0.1}s both`,
            }}>
              <div style={{
                fontSize: 32, fontWeight: 800, color: NAVY,
                letterSpacing: '-0.02em',
              }}>{c.val}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{t(c.label)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section style={{ padding: '48px 16px', background: '#FAFBFC' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>{t('pour_qui')}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: NAVY }}>{t('pour_qui_titre')}</h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
          gap: 14, maxWidth: 920, margin: '0 auto',
        }}>
          {CIBLES_KEYS.map((c, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #EEF0F2', borderRadius: 12,
              padding: '22px 18px', textAlign: 'center',
              boxShadow: '0 1px 8px rgba(27,42,74,0.04)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(67,169,86,0.10)` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 8px rgba(27,42,74,0.04)' }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: NAVY, marginBottom: 5 }}>{t(c.titre)}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.55 }}>{t(c.desc)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVRABLES ── */}
      <section id="livrables" style={{ padding: '48px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>{t('livrables_section')}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: NAVY }}>{t('livrables_titre')}</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8, maxWidth: 500, margin: '8px auto 0' }}>
            {t('livrables_desc')}
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12, maxWidth: 920, margin: '0 auto',
        }}>
          {LIVRABLES_KEYS.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', border: '1px solid #EEF0F2', borderRadius: 10,
              padding: '16px 18px',
              boxShadow: '0 1px 6px rgba(27,42,74,0.03)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: 24 }}>{l.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{t(l.label)}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{t(l.norme)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ padding: '48px 16px', background: '#FAFBFC' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>{t('comment_section')}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: NAVY }}>{t('comment_titre')}</h2>
        </div>
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
          maxWidth: 820, margin: '0 auto',
        }}>
          {[
            { step: '1', titre: t('step1_titre'), desc: t('step1_desc') },
            { step: '2', titre: t('step2_titre'), desc: t('step2_desc') },
            { step: '3', titre: t('step3_titre'), desc: t('step3_desc') },
          ].map((s, i) => (
            <div key={i} style={{
              flex: '1 1 230px', textAlign: 'center',
              background: '#fff', borderRadius: 14, padding: '28px 22px',
              border: '1px solid #EEF0F2',
              boxShadow: '0 1px 8px rgba(27,42,74,0.04)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `linear-gradient(135deg, ${VERT}, #2E8B4A)`,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, margin: '0 auto 14px',
                boxShadow: `0 3px 12px ${VERT}33`,
              }}>{s.step}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: NAVY, marginBottom: 7 }}>{s.titre}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: '48px 16px', textAlign: 'center',
        background: `linear-gradient(135deg, ${NAVY} 0%, #243656 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid overlay on CTA */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${VERT}12 1px, transparent 1px), linear-gradient(90deg, ${VERT}12 1px, transparent 1px)`,
          backgroundSize: '40px 40px', opacity: 0.3,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
            {t('cta_final_titre')}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
            {t('cta_final_desc')}
          </p>
          <button onClick={() => navigate('/pricing')} style={{
            background: VERT, color: '#fff', border: 'none', borderRadius: 10,
            padding: '15px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 24px ${VERT}55`,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
          >
            {t('cta_commencer')}
          </button>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>
            {t('cta_gratuit')}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '22px 32px', borderTop: '1px solid #EEF0F2',
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
