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
          maxWidth: 620, margin: '0 auto 32px',
        }}>
          {t('investors_hero_desc')}
        </p>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
            {t('investors_problem_title')}
          </h2>
        </div>
        <p style={{
          fontSize: 14, color: '#555', maxWidth: 720, margin: '0 auto 28px',
          lineHeight: 1.7, textAlign: 'center',
        }}>
          {t('investors_problem_desc')}
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16, maxWidth: 900, margin: '0 auto',
        }}>
          {[
            { label: 'investors_problem_stat_1', value: '4.3%' },
            { label: 'investors_problem_stat_2', value: '85%' },
            { label: 'investors_problem_stat_3', value: '40%' },
            { label: 'investors_problem_stat_4', value: '50M+' },
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

      {/* ── PRODUCT ── */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
            {t('investors_product_title')}
          </h2>
        </div>
        <p style={{
          fontSize: 14, color: '#555', maxWidth: 660, margin: '0 auto 28px',
          lineHeight: 1.7, textAlign: 'center',
        }}>
          {t('investors_product_desc')}
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20, maxWidth: 1000, margin: '0 auto',
        }}>
          {[
            { icon: '🏗️', title: 'investors_product_1_title', desc: 'investors_product_1_desc' },
            { icon: '⚡', title: 'investors_product_2_title', desc: 'investors_product_2_desc' },
            { icon: '🌍', title: 'investors_product_3_title', desc: 'investors_product_3_desc' },
            { icon: '📐', title: 'investors_product_4_title', desc: 'investors_product_4_desc' },
          ].map((prod, i) => (
            <div key={i} style={{
              background: '#f8f8f8', border: '0.5px solid #E5E5E5', borderRadius: 12,
              padding: '28px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{prod.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                {t(prod.title)}
              </h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                {t(prod.desc)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARKET ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
            {t('investors_market_title')}
          </h2>
        </div>
        <p style={{
          fontSize: 14, color: '#555', maxWidth: 720, margin: '0 auto 28px',
          lineHeight: 1.7, textAlign: 'center',
        }}>
          {t('investors_market_desc')}
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, maxWidth: 900, margin: '0 auto',
        }}>
          {[
            { label: 'investors_market_1', value: '$1.4T' },
            { label: 'investors_market_2', value: '2M+' },
            { label: 'investors_market_3', value: '5' },
            { label: 'investors_market_4', value: '$8B+' },
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

      {/* ── TEAM ── */}
      <section style={{ padding: '48px 24px' }}>
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
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
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
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="mailto:malick@cepic.holdings" style={{
            display: 'inline-block', background: VERT, color: '#fff', textDecoration: 'none',
            border: 'none', borderRadius: 8, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>
            {t('investors_cta_button')}
          </a>
          <a href="tel:+221755500000" style={{
            display: 'inline-block', background: 'transparent', color: '#fff', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '14px 36px',
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            +221 75 550 00 00
          </a>
        </div>
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
