import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { VERT } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'
const ORANGE = '#E07B00'

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const increment = target / 60
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 30)
    return () => clearInterval(timer)
  }, [target])

  return <>{count}{suffix}</>
}

export default function Impact() {
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
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, color: NAVY, lineHeight: 1.15,
          maxWidth: 700, margin: '0 auto 16px',
        }}>
          {t('impact_hero_title')}
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#555', lineHeight: 1.6,
          maxWidth: 560, margin: '0 auto 32px',
        }}>
          {t('impact_hero_desc')}
        </p>
      </section>

      {/* ── STATS ── */}
      <section style={{
        padding: '48px 24px', background: NAVY, color: '#fff',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24, maxWidth: 1000, margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, marginBottom: 8 }}>
              <Counter target={500} suffix="+" />
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{t('impact_stat_1')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, marginBottom: 8 }}>
              <Counter target={10000} suffix="+" />
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{t('impact_stat_2')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, marginBottom: 8 }}>
              <Counter target={5} />
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{t('impact_stat_3')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, marginBottom: 8 }}>
              <Counter target={95} suffix="%" />
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{t('impact_stat_4')}</div>
          </div>
        </div>
      </section>

      {/* ── IMPACT CATEGORIES ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>{t('impact_categories_title')}</h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20, maxWidth: 1000, margin: '0 auto',
        }}>
          {[
            { icon: '🎯', title: 'impact_cat_1_title', desc: 'impact_cat_1_desc' },
            { icon: '⚡', title: 'impact_cat_2_title', desc: 'impact_cat_2_desc' },
            { icon: '✓', title: 'impact_cat_3_title', desc: 'impact_cat_3_desc' },
            { icon: '🌱', title: 'impact_cat_4_title', desc: 'impact_cat_4_desc' },
          ].map((cat, i) => (
            <div key={i} style={{
              background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: 12,
              padding: '28px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{cat.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                {t(cat.title)}
              </h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                {t(cat.desc)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS PLACEHOLDER ── */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>{t('impact_testimonials_title')}</h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20, maxWidth: 1000, margin: '0 auto',
        }}>
          {[
            { name: 'impact_testimonial_1_name', role: 'impact_testimonial_1_role', text: 'impact_testimonial_1_text' },
            { name: 'impact_testimonial_2_name', role: 'impact_testimonial_2_role', text: 'impact_testimonial_2_text' },
            { name: 'impact_testimonial_3_name', role: 'impact_testimonial_3_role', text: 'impact_testimonial_3_text' },
          ].map((testimonial, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12,
              padding: '20px', display: 'flex', flexDirection: 'column',
            }}>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                "{t(testimonial.text)}"
              </p>
              <div style={{ borderTop: '0.5px solid #E5E5E5', paddingTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>
                  {t(testimonial.name)}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {t(testimonial.role)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '48px 24px', textAlign: 'center',
        background: NAVY,
      }}>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          {t('impact_cta_title')}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          {t('impact_cta_desc')}
        </p>
        <button onClick={() => navigate(user ? '/projects/new' : '/login')} style={{
          background: VERT, color: '#fff', border: 'none', borderRadius: 8,
          padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>
          {t('impact_cta_button')}
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '20px 32px', borderTop: '0.5px solid #E5E5E5',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        fontSize: 11, color: '#aaa',
      }}>
        <div>© 2026 Tijan AI · Engineering Intelligence for Africa</div>
        <div>Dakar · Abidjan · Casablanca · Lagos · Accra</div>
      </footer>
    </div>
  )
}
