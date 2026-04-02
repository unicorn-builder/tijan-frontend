import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { VERT } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'
const ORANGE = '#E07B00'

export default function Investors() {
  const navigate = useNavigate()
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
          {t('investors_hero_title')}
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#555', lineHeight: 1.6,
          maxWidth: 560, margin: '0 auto 32px',
        }}>
          {t('investors_hero_desc')}
        </p>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            {t('investors_problem_title')}
          </h2>
          <p style={{ fontSize: 14, color: '#666', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            {t('investors_problem_desc')}
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, maxWidth: 900, margin: '24px auto 0',
        }}>
          {[
            { label: 'investors_problem_stat_1', value: '$1.4T' },
            { label: 'investors_problem_stat_2', value: '85%' },
            { label: 'investors_problem_stat_3', value: 'Weeks' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: 10,
              padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: ORANGE, marginBottom: 6 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                {t(stat.label)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>
            {t('investors_solution_title')}
          </h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20, maxWidth: 1000, margin: '0 auto',
        }}>
          {[
            { icon: '⚡', title: 'investors_solution_1_title', desc: 'investors_solution_1_desc' },
            { icon: '💰', title: 'investors_solution_2_title', desc: 'investors_solution_2_desc' },
            { icon: '✓', title: 'investors_solution_3_title', desc: 'investors_solution_3_desc' },
          ].map((sol, i) => (
            <div key={i} style={{
              background: '#f8f8f8', border: '0.5px solid #E5E5E5', borderRadius: 12,
              padding: '28px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{sol.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                {t(sol.title)}
              </h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                {t(sol.desc)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARKET ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>
            {t('investors_market_title')}
          </h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, maxWidth: 900, margin: '0 auto',
        }}>
          {[
            { label: 'investors_market_1', value: '7%' },
            { label: 'investors_market_2', value: '5' },
            { label: 'investors_market_3', value: '50M+' },
            { label: 'investors_market_4', value: '2M' },
          ].map((market, i) => (
            <div key={i} style={{
              background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: 10,
              padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: VERT, marginBottom: 6 }}>
                {market.value}
              </div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                {t(market.label)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRACTION ── */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>
            {t('investors_traction_title')}
          </h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, maxWidth: 900, margin: '0 auto',
        }}>
          {[
            { label: 'investors_traction_1', value: '500+' },
            { label: 'investors_traction_2', value: '10k+' },
            { label: 'investors_traction_3', value: 'Free' },
            { label: 'investors_traction_4', value: '95%' },
          ].map((metric, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #E5E5E5', borderRadius: 10,
              padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: NAVY, marginBottom: 6 }}>
                {metric.value}
              </div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                {t(metric.label)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>
            {t('investors_team_title')}
          </h2>
        </div>
        <div style={{
          maxWidth: 500, margin: '0 auto', background: '#fff', border: '0.5px solid #E5E5E5',
          borderRadius: 12, padding: '28px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍💼</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
            {t('investors_team_founder_name')}
          </h3>
          <p style={{ fontSize: 13, color: VERT, fontWeight: 600, marginBottom: 12 }}>
            {t('investors_team_founder_title')}
          </p>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
            {t('investors_team_founder_bio')}
          </p>
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
            {t('investors_vision_title')}
          </h2>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 0 }}>
            {t('investors_vision_desc')}
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '48px 24px', textAlign: 'center',
        background: NAVY,
      }}>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          {t('investors_cta_title')}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          {t('investors_cta_desc')}
        </p>
        <a href="mailto:malicktall@gmail.com" style={{
          display: 'inline-block', background: VERT, color: '#fff', textDecoration: 'none',
          border: 'none', borderRadius: 8, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>
          {t('investors_cta_button')}
        </a>
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
