import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { VERT } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'

function Counter({ target, suffix = '', prefix = '' }) {
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

  return <>{prefix}{count.toLocaleString('fr-FR')}{suffix}</>
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
        background: 'linear-gradient(180deg, #F0FFF4 0%, #fff 100%)',
      }}>
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, color: NAVY, lineHeight: 1.15,
          maxWidth: 700, margin: '0 auto 16px',
        }}>
          {t('impact_hero_title')}
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#555', lineHeight: 1.6,
          maxWidth: 600, margin: '0 auto 32px',
        }}>
          {t('impact_hero_desc')}
        </p>
      </section>

      {/* ── CARBON PROJECTION — 12,000 projects/year (TOP POSITION) ── */}
      <section style={{ padding: '56px 24px', background: NAVY }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              {t('impact_carbon_title')}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 640, margin: '0 auto' }}>
              {t('impact_carbon_subtitle')}
            </p>
          </div>

          {/* Big number */}
          <div style={{
            textAlign: 'center', padding: '40px 24px', marginBottom: 32,
            background: 'rgba(67, 169, 86, 0.15)',
            borderRadius: 16, border: `2px solid ${VERT}`,
          }}>
            <div style={{ fontSize: 'clamp(48px, 10vw, 84px)', fontWeight: 900, color: VERT, lineHeight: 1 }}>
              <Counter target={240000} suffix=" t" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 10 }}>
              {t('impact_carbon_big_label')}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
              {t('impact_carbon_big_equiv')}
            </div>
          </div>

          {/* Breakdown cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 24,
          }}>
            {[
              { value: 12000, suffix: '', label: 'impact_carbon_projects', icon: '🏗️' },
              { value: 576000, suffix: ' m³', label: 'impact_carbon_concrete', icon: '🧱' },
              { value: 57600, suffix: ' t', label: 'impact_carbon_steel', icon: '⚙️' },
              { value: 20, suffix: ' t', label: 'impact_carbon_per_project', icon: '🌱' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 16px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                  <Counter target={item.value} suffix={item.suffix} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 1.4 }}>
                  {t(item.label)}
                </div>
              </div>
            ))}
          </div>

          {/* Methodology note */}
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '14px 18px',
            border: '1px solid rgba(255,255,255,0.1)', fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
          }}>
            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{t('impact_carbon_method_title')}</span>{' '}
            {t('impact_carbon_method_desc')}
          </div>
        </div>
      </section>

      {/* ── ENVIRONMENTAL STATS ── */}
      <section style={{
        padding: '48px 24px', background: '#fff',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24, maxWidth: 1000, margin: '0 auto',
        }}>
          {[
            { target: 30, suffix: '%', label: 'impact_stat_1', icon: '💧' },
            { target: 25, suffix: '%', label: 'impact_stat_2', icon: '⚡' },
            { target: 35, suffix: '%', label: 'impact_stat_3', icon: '♻️' },
            { target: 100, suffix: '%', label: 'impact_stat_4', icon: '🛡️' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, color: NAVY, marginBottom: 8 }}>
                <Counter target={stat.target} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>
                {t(stat.label)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── IMPACT CATEGORIES (6 cards) ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>{t('impact_categories_title')}</h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20, maxWidth: 1000, margin: '0 auto',
        }}>
          {[
            { icon: '🏅', title: 'impact_cat_1_title', desc: 'impact_cat_1_desc' },
            { icon: '💧', title: 'impact_cat_2_title', desc: 'impact_cat_2_desc' },
            { icon: '♻️', title: 'impact_cat_3_title', desc: 'impact_cat_3_desc' },
            { icon: '🌍', title: 'impact_cat_4_title', desc: 'impact_cat_4_desc' },
            { icon: '🛡️', title: 'impact_cat_5_title', desc: 'impact_cat_5_desc' },
            { icon: '🏗️', title: 'impact_cat_6_title', desc: 'impact_cat_6_desc' },
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

      {/* ── VISION ── */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, #F0FFF4 0%, #FAFFFE 100%)',
          border: `1px solid ${VERT}`, borderRadius: 12,
          padding: '32px 24px',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
            {t('impact_vision_title')}
          </h2>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 0 }}>
            {t('impact_vision_desc')}
          </p>
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
        <div>Dakar · Abidjan · Casablanca · Lagos · Accra · Nouakchott</div>
      </footer>
    </div>
  )
}
