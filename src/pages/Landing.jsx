import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
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

/* ── Animated Building + DNA pipes/cables illustration ── */
function BuildingAnimation() {
  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', position: 'relative' }}>
      <style>{`
        @keyframes riseUp {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes helixDraw {
          from { stroke-dashoffset: 800; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes helixFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -80; }
        }
        @keyframes pulseNode {
          0%, 100% { r: 3; opacity: 0.8; }
          50% { r: 5; opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        @keyframes windowFlicker {
          0%, 100% { opacity: 0.15; }
          30% { opacity: 0.35; }
          60% { opacity: 0.1; }
          80% { opacity: 0.3; }
        }
        @keyframes labelPulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; filter: brightness(1.2); }
        }
        .floor-slab { transform-origin: bottom; }
        .floor-0 { animation: riseUp 0.5s ease-out 0.3s both; }
        .floor-1 { animation: riseUp 0.5s ease-out 0.55s both; }
        .floor-2 { animation: riseUp 0.5s ease-out 0.8s both; }
        .floor-3 { animation: riseUp 0.5s ease-out 1.05s both; }
        .floor-4 { animation: riseUp 0.5s ease-out 1.3s both; }
        .floor-5 { animation: riseUp 0.5s ease-out 1.55s both; }
        .floor-6 { animation: riseUp 0.5s ease-out 1.8s both; }
        .helix-elec {
          stroke-dasharray: 800;
          animation: helixDraw 1.8s ease-in-out 1.2s both, helixFlow 2s linear 3s infinite;
        }
        .helix-plumb {
          stroke-dasharray: 800;
          animation: helixDraw 1.8s ease-in-out 1.5s both, helixFlow 2.5s linear 3.3s infinite;
        }
        .helix-elec-flow {
          stroke-dasharray: 12 28;
          animation: helixFlow 1.5s linear infinite;
        }
        .helix-plumb-flow {
          stroke-dasharray: 12 28;
          animation: helixFlow 1.8s linear 0.4s infinite;
        }
        .helix-node-elec {
          animation: pulseNode 1.5s ease-in-out infinite;
        }
        .helix-node-plumb {
          animation: pulseNode 1.5s ease-in-out 0.4s infinite;
        }
        .label-structure { animation: fadeSlideUp 0.4s ease-out 2.2s both, labelPulse 3s ease-in-out 3s infinite; }
        .label-elec { animation: fadeSlideUp 0.4s ease-out 2.5s both, labelPulse 3s ease-in-out 3.5s infinite; }
        .label-plumb { animation: fadeSlideUp 0.4s ease-out 2.8s both, labelPulse 3s ease-in-out 4s infinite; }
      `}</style>
      <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>

        {/* Glow behind building */}
        <ellipse cx="210" cy="290" rx="160" ry="35" fill={VERT} opacity="0.12" style={{ animation: 'glowPulse 3s ease-in-out infinite' }} />
        <ellipse cx="210" cy="288" rx="80" ry="18" fill={VERT} opacity="0.18" style={{ animation: 'glowPulse 3s ease-in-out 0.5s infinite' }} />

        {/* ── Foundation ── */}
        <rect x="80" y="285" width="260" height="6" rx="2" fill={NAVY} opacity="0.35" className="floor-0" style={{ transformOrigin: 'center bottom' }} />

        {/* ── Building frame — columns + floor slabs ── */}
        {/* Columns (4 vertical) */}
        {[110, 170, 240, 310].map((x, i) => (
          <rect key={`col-${i}`} x={x} y="45" width="5" height="240" rx="1" fill={NAVY} opacity="0.25"
            className={`floor-${Math.min(i, 6)}`} style={{ transformOrigin: `${x}px 285px` }} />
        ))}

        {/* Floor slabs (7 floors) */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => {
          const y = 280 - i * 38
          return (
            <g key={`floor-${i}`} className={`floor-slab floor-${i}`} style={{ transformOrigin: `210px ${y + 4}px` }}>
              <rect x="105" y={y} width="215" height="5" rx="1" fill={NAVY} opacity={0.3 + i * 0.05} />
              {/* Window rectangles with flickering animation */}
              {i > 0 && [0, 1, 2].map(j => (
                <rect key={`win-${i}-${j}`} x={120 + j * 70} y={y + 9} width="28" height="17" rx="2"
                  fill={VERT} opacity={0.12 + i * 0.03}
                  style={{ animation: `windowFlicker ${2 + j * 0.7}s ease-in-out ${i * 0.3 + j * 0.5}s infinite` }} />
              ))}
            </g>
          )
        })}

        {/* ── DNA Helix — Electrical (orange/gold) ── */}
        {/* Base helix stroke */}
        <path
          d="M90,280 C90,265 140,255 140,240 C140,225 90,215 90,200 C90,185 140,175 140,160 C140,145 90,135 90,120 C90,105 140,95 140,80 C140,65 90,55 90,45"
          stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"
          className="helix-elec" opacity="0.9"
        />
        {/* Animated energy flow overlay */}
        <path
          d="M90,280 C90,265 140,255 140,240 C140,225 90,215 90,200 C90,185 140,175 140,160 C140,145 90,135 90,120 C90,105 140,95 140,80 C140,65 90,55 90,45"
          stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round"
          className="helix-elec-flow" opacity="0.7"
        />
        {/* Electrical nodes — bigger, brighter */}
        {[280, 240, 200, 160, 120, 80].map((y, i) => (
          <g key={`en-${i}`}>
            <circle cx={i % 2 === 0 ? 90 : 140} cy={y} r="6" fill="#F59E0B" opacity="0.15"
              className="helix-node-elec" style={{ animationDelay: `${i * 0.25}s` }} />
            <circle cx={i % 2 === 0 ? 90 : 140} cy={y} r="3.5" fill="#F59E0B"
              className="helix-node-elec" style={{ animationDelay: `${i * 0.25}s` }} />
          </g>
        ))}

        {/* ── DNA Helix — Plumbing (blue) ── */}
        <path
          d="M340,280 C340,265 290,255 290,240 C290,225 340,215 340,200 C340,185 290,175 290,160 C290,145 340,135 340,120 C340,105 290,95 290,80 C290,65 340,55 340,45"
          stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round"
          className="helix-plumb" opacity="0.9"
        />
        {/* Animated water flow overlay */}
        <path
          d="M340,280 C340,265 290,255 290,240 C290,225 340,215 340,200 C340,185 290,175 290,160 C290,145 340,135 340,120 C340,105 290,95 290,80 C290,65 340,55 340,45"
          stroke="#93C5FD" strokeWidth="2" fill="none" strokeLinecap="round"
          className="helix-plumb-flow" opacity="0.6"
        />
        {/* Plumbing nodes — bigger, brighter */}
        {[280, 240, 200, 160, 120, 80].map((y, i) => (
          <g key={`pn-${i}`}>
            <circle cx={i % 2 === 0 ? 340 : 290} cy={y} r="6" fill="#2563EB" opacity="0.15"
              className="helix-node-plumb" style={{ animationDelay: `${i * 0.25}s` }} />
            <circle cx={i % 2 === 0 ? 340 : 290} cy={y} r="3.5" fill="#2563EB"
              className="helix-node-plumb" style={{ animationDelay: `${i * 0.25}s` }} />
          </g>
        ))}

        {/* Cross-connections (DNA rungs) — brighter, animated */}
        {[240, 170, 100].map((y, i) => (
          <line key={`rung-${i}`} x1={i % 2 === 0 ? 140 : 90} y1={y} x2={i % 2 === 0 ? 290 : 340} y2={y}
            stroke={VERT} strokeWidth="1.5" opacity="0.3" strokeDasharray="5 4"
            className={`floor-${Math.min(i + 3, 6)}`} style={{ transformOrigin: `210px ${y}px` }}
          />
        ))}

        {/* ── Labels ── */}
        <g className="label-structure">
          <rect x="155" y="30" width="110" height="18" rx="9" fill={NAVY} opacity="0.9" />
          <text x="210" y="42" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="DM Sans, sans-serif">STRUCTURE EC2</text>
        </g>
        <g className="label-elec">
          <rect x="30" y="145" width="58" height="16" rx="8" fill="#F59E0B" opacity="0.9" />
          <text x="59" y="156" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="DM Sans, sans-serif">ELEC</text>
        </g>
        <g className="label-plumb">
          <rect x="345" y="145" width="58" height="16" rx="8" fill="#3B82F6" opacity="0.9" />
          <text x="374" y="156" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="DM Sans, sans-serif">PLOMB</text>
        </g>

        {/* Green glow at base */}
        <ellipse cx="210" cy="290" rx="100" ry="15" fill={VERT} opacity="0.08" />

      </svg>
    </div>
  )
}

/* ── Keyframes ── */
const heroKeyframes = `
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes gridFade {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.07; }
}
`

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLang()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{heroKeyframes}</style>

      <Header />

      {/* ── HERO ── */}
      <section style={{
        padding: '48px 24px 40px',
        background: 'linear-gradient(180deg, #F6FFF8 0%, #FAFFFE 50%, #fff 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(${VERT}18 1px, transparent 1px), linear-gradient(90deg, ${VERT}18 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
          animation: 'gridFade 5s ease-in-out infinite',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto' }}>

          {/* Two columns: text left, animation right */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 32,
            flexWrap: 'wrap', justifyContent: 'center',
          }}>

            {/* Left: Text content */}
            <div style={{ flex: '1 1 380px', maxWidth: 500, textAlign: 'left' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: NAVY, borderRadius: 20,
                padding: '7px 18px', fontSize: 11, color: '#fff', fontWeight: 600,
                marginBottom: 20, letterSpacing: 0.2,
                boxShadow: `0 2px 16px ${NAVY}33`,
                animation: 'slideUp 0.6s ease-out both',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: VERT,
                  display: 'inline-block', boxShadow: `0 0 8px ${VERT}`,
                }} />
                {t('badge_world_first')}
                <span style={{ opacity: 0.35 }}>·</span>
                {t('badge_eurocodes')}
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 800, color: NAVY, lineHeight: 1.1,
                marginBottom: 16,
                animation: 'slideUp 0.6s ease-out 0.15s both',
              }}>
                {t('hero_title_1')}<br />
                <span style={{ color: VERT }}>{t('hero_title_2')}</span>
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(14px, 2vw, 16px)', color: '#555', lineHeight: 1.65,
                marginBottom: 28,
                animation: 'slideUp 0.6s ease-out 0.3s both',
              }}>
                {t('hero_subtitle')}
              </p>

              {/* CTAs */}
              <div style={{
                display: 'flex', gap: 12, flexWrap: 'wrap',
                animation: 'slideUp 0.6s ease-out 0.45s both',
              }}>
                <button onClick={() => navigate(user ? '/projects/new' : '/login')} style={{
                  background: VERT, color: '#fff', border: 'none', borderRadius: 10,
                  padding: '14px 34px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: `0 4px 20px ${VERT}44`,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 6px 28px ${VERT}55` }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px ${VERT}44` }}
                >
                  {t('cta_analyser')}
                </button>
                <button onClick={() => document.getElementById('livrables')?.scrollIntoView({ behavior: 'smooth' })} style={{
                  background: '#fff', color: NAVY, border: `1.5px solid ${NAVY}18`, borderRadius: 10,
                  padding: '13px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(27,42,74,0.05)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
                >
                  {t('cta_livrables')}
                </button>
              </div>
            </div>

            {/* Right: Animation */}
            <div style={{
              flex: '1 1 320px', maxWidth: 420,
              animation: 'slideUp 0.8s ease-out 0.3s both',
            }}>
              <BuildingAnimation />
            </div>
          </div>

          {/* Chiffres */}
          <div style={{
            display: 'flex', gap: 32, justifyContent: 'center', marginTop: 44, flexWrap: 'wrap',
          }}>
            {CHIFFRES_KEYS.map((c, i) => (
              <div key={i} style={{
                textAlign: 'center',
                animation: `slideUp 0.5s ease-out ${0.7 + i * 0.1}s both`,
              }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>{c.val}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{t(c.label)}</div>
              </div>
            ))}
          </div>
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
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${VERT}10 1px, transparent 1px), linear-gradient(90deg, ${VERT}10 1px, transparent 1px)`,
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
