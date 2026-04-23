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

/* ── Animation CSS for all 3 scenes ── */
const animStyles = `
  @keyframes sceneFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes glowPulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.35; } }

  /* Scene 1: Plan qui prend vie */
  @keyframes scanSweep { 0% { transform: translateX(-20px); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(340px); opacity: 0; } }
  @keyframes planDraw { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
  @keyframes riseUp { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
  @keyframes pipeFlow { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -40; } }
  @keyframes windowFlicker { 0%, 100% { opacity: 0.12; } 30% { opacity: 0.3; } 60% { opacity: 0.08; } 80% { opacity: 0.25; } }
  .s1-plan { stroke-dasharray: 400; animation: planDraw 1.5s ease-out both; }
  .s1-scan { animation: scanSweep 2.5s ease-in-out 1.8s both; }
  .s1-rise { transform-origin: bottom; animation: riseUp 0.5s ease-out both; }
  .s1-pipe-e { stroke-dasharray: 10 14; animation: fadeIn 0.5s ease-out 5.5s both, pipeFlow 1.5s linear 5.5s infinite; }
  .s1-pipe-p { stroke-dasharray: 10 14; animation: fadeIn 0.5s ease-out 6s both, pipeFlow 2s linear 6s infinite; }

  /* Scene 2: Cerveau-Ingenieur */
  @keyframes chipDraw { from { stroke-dashoffset: 400; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
  @keyframes extendLine { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
  @keyframes neuralPulse { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -30; } }
  @keyframes nodeAppear { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes chipGlow { 0%, 100% { opacity: 0.06; } 50% { opacity: 0.18; } }
  .s2-chip { stroke-dasharray: 400; animation: chipDraw 1.5s ease-out both; }
  .s2-conn { stroke-dasharray: 300; animation: extendLine 0.8s ease-out both; }
  .s2-pulse { stroke-dasharray: 6 24; animation: neuralPulse 1.5s linear infinite; }
  .s2-node { animation: nodeAppear 0.4s ease-out both; }
  .s2-label { animation: fadeIn 0.5s ease-out both; }

  /* Scene 3: Du Trait au Batiment */
  @keyframes lineDraw { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
  @keyframes veinFlow { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -30; } }
  @keyframes fillIn { from { opacity: 0; } to { opacity: 0.12; } }
  .s3-line { stroke-dasharray: 2000; animation: lineDraw 4s ease-in-out both; }
  .s3-vein-e { stroke-dasharray: 8 12; animation: fadeIn 0.5s ease-out 5s both, veinFlow 1.5s linear 5s infinite; }
  .s3-vein-p { stroke-dasharray: 8 12; animation: fadeIn 0.5s ease-out 5.5s both, veinFlow 2s linear 5.5s infinite; }
  .s3-fill { animation: fillIn 1s ease-out 4.5s both; }
`

/* ── Scene 1: Le Plan qui prend vie ── */
function ScenePlan() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
      {/* Floor plan drawing itself */}
      <rect x="60" y="185" width="280" height="105" stroke="#94A3B8" strokeWidth="1.5" fill="none" rx="1" className="s1-plan" />
      <line x1="200" y1="185" x2="200" y2="290" stroke="#94A3B8" strokeWidth="1" className="s1-plan" style={{ animationDelay: '0.3s' }} />
      <line x1="270" y1="185" x2="270" y2="290" stroke="#94A3B8" strokeWidth="1" className="s1-plan" style={{ animationDelay: '0.5s' }} />
      <line x1="60" y1="235" x2="200" y2="235" stroke="#94A3B8" strokeWidth="1" className="s1-plan" style={{ animationDelay: '0.7s' }} />
      <line x1="200" y1="255" x2="340" y2="255" stroke="#94A3B8" strokeWidth="1" className="s1-plan" style={{ animationDelay: '0.9s' }} />
      {/* Door gaps */}
      <rect x="155" y="232" width="20" height="6" fill="#fff" style={{ animation: 'fadeIn 0.3s ease-out 1.2s both' }} />
      <rect x="197" y="210" width="6" height="20" fill="#fff" style={{ animation: 'fadeIn 0.3s ease-out 1.4s both' }} />

      {/* Green scan bar */}
      <rect x="55" y="180" width="6" height="120" rx="3" fill={VERT} className="s1-scan" />

      {/* Building rising above plan */}
      <rect x="60" y="180" width="280" height="5" rx="1" fill={NAVY} opacity="0.35"
        className="s1-rise" style={{ animationDelay: '3.8s', transformOrigin: '200px 185px' }} />
      {[80, 155, 230, 320].map((x, i) => (
        <rect key={`c${i}`} x={x} y="50" width="4" height="130" rx="1" fill={NAVY} opacity="0.22"
          className="s1-rise" style={{ animationDelay: `${4 + i * 0.15}s`, transformOrigin: `${x}px 180px` }} />
      ))}
      {[0, 1, 2, 3].map(i => (
        <g key={`fl${i}`}>
          <rect x="75" y={175 - i * 32} width="250" height="4" rx="1" fill={NAVY} opacity={0.22 + i * 0.04}
            className="s1-rise" style={{ animationDelay: `${4.2 + i * 0.3}s`, transformOrigin: `200px ${179 - i * 32}px` }} />
          {i > 0 && [0, 1, 2].map(j => (
            <rect key={`w${i}${j}`} x={92 + j * 75} y={152 - (i - 1) * 32} width="26" height="15" rx="2"
              fill={VERT} opacity="0.1"
              style={{ animation: `windowFlicker ${2 + j * 0.7}s ease-in-out ${5 + i * 0.3 + j * 0.2}s infinite, fadeIn 0.3s ease-out ${5 + i * 0.2}s both` }} />
          ))}
        </g>
      ))}

      {/* Electrical helix (orange) */}
      <path d="M85,175 C85,158 120,150 120,133 C120,116 85,108 85,91 C85,74 120,66 120,50"
        stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" className="s1-pipe-e" />
      {/* Plumbing helix (blue) */}
      <path d="M315,175 C315,158 280,150 280,133 C280,116 315,108 315,91 C315,74 280,66 280,50"
        stroke="#2563EB" strokeWidth="2.5" fill="none" strokeLinecap="round" className="s1-pipe-p" />

      {/* Labels */}
      <g style={{ animation: 'fadeIn 0.5s ease-out 6.5s both' }}>
        <rect x="150" y="33" width="100" height="18" rx="9" fill={NAVY} opacity="0.9" />
        <text x="200" y="45" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="DM Sans, sans-serif">STRUCTURE EC2</text>
      </g>
      <g style={{ animation: 'fadeIn 0.5s ease-out 6.8s both' }}>
        <rect x="22" y="105" width="52" height="14" rx="7" fill="#F59E0B" opacity="0.9" />
        <text x="48" y="115" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="DM Sans, sans-serif">ELEC</text>
      </g>
      <g style={{ animation: 'fadeIn 0.5s ease-out 7.1s both' }}>
        <rect x="328" y="105" width="58" height="14" rx="7" fill="#3B82F6" opacity="0.9" />
        <text x="357" y="115" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="DM Sans, sans-serif">PLOMB</text>
      </g>
    </svg>
  )
}

/* ── Scene 2: Le Cerveau-Ingenieur ── */
function SceneBrain() {
  const outputs = [
    { x: 65, y: 35, label: 'Note EC2', color: NAVY, lx: -2, ly: -18 },
    { x: 335, y: 35, label: 'Plan BA', color: NAVY, lx: 2, ly: -18 },
    { x: 30, y: 210, label: 'BOQ', color: '#F59E0B', lx: 0, ly: 28 },
    { x: 370, y: 210, label: 'MEP', color: '#2563EB', lx: 0, ly: 28 },
    { x: 200, y: 275, label: 'EDGE', color: VERT, lx: 0, ly: 26 },
  ]
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
      {/* Central glow */}
      <ellipse cx="200" cy="145" rx="50" ry="40" fill={VERT} opacity="0.06"
        style={{ animation: 'chipGlow 3s ease-in-out infinite' }} />

      {/* AI chip hexagon */}
      <polygon points="200,105 240,125 240,165 200,185 160,165 160,125"
        stroke={VERT} strokeWidth="2.5" fill="none" className="s2-chip" />
      <circle cx="200" cy="145" r="14" stroke={VERT} strokeWidth="1.5" fill={VERT} fillOpacity="0.12"
        className="s2-chip" style={{ animationDelay: '0.5s' }} />
      <text x="200" y="150" textAnchor="middle" fill={VERT} fontSize="11" fontWeight="800"
        fontFamily="DM Sans, sans-serif" style={{ animation: 'fadeIn 0.5s ease-out 1.2s both' }}>AI</text>

      {/* Connections to deliverables */}
      {outputs.map((o, i) => (
        <g key={i}>
          {/* Base line */}
          <line x1="200" y1="145" x2={o.x} y2={o.y} stroke="#CBD5E1" strokeWidth="1.5"
            className="s2-conn" style={{ animationDelay: `${1.5 + i * 0.3}s` }} />
          {/* Pulse overlay */}
          <line x1="200" y1="145" x2={o.x} y2={o.y} stroke={VERT} strokeWidth="1.5" opacity="0.6"
            className="s2-pulse" style={{ animationDelay: `${3 + i * 0.2}s` }} />
          {/* Outer glow node */}
          <circle cx={o.x} cy={o.y} r="20" fill={o.color} fillOpacity="0.06" stroke={o.color} strokeWidth="1.5"
            className="s2-node" style={{ animationDelay: `${2.5 + i * 0.3}s` }} />
          {/* Inner solid node */}
          <circle cx={o.x} cy={o.y} r="5" fill={o.color}
            className="s2-node" style={{ animationDelay: `${2.7 + i * 0.3}s` }} />
          {/* Label with background pill */}
          <g className="s2-label" style={{ animationDelay: `${3.5 + i * 0.3}s` }}>
            <rect x={o.x + o.lx - 28} y={o.y + o.ly - 10} width="56" height="16" rx="8"
              fill={o.color} opacity="0.9" />
            <text x={o.x + o.lx} y={o.y + o.ly + 1} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700"
              fontFamily="DM Sans, sans-serif">
              {o.label}
            </text>
          </g>
        </g>
      ))}
    </svg>
  )
}

/* ── Scene 3: Du Trait au Batiment ── */
function SceneLine() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
      {/* Single continuous zigzag line — draws a building floor by floor */}
      <path
        d="M60,275 L340,275 L340,240 L60,240 L60,205 L340,205 L340,170 L60,170 L60,135 L340,135 L340,100 L60,100 L60,68 L340,68"
        stroke={NAVY} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
        className="s3-line"
      />

      {/* Floor fills (appear after line draws) */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={`fill${i}`} x="62" y={243 - i * 35} width="276" height="30" rx="1"
          fill={NAVY} className="s3-fill" style={{ animationDelay: `${4.3 + i * 0.15}s` }} />
      ))}

      {/* Column highlights */}
      {[80, 160, 240, 320].map((x, i) => (
        <rect key={`ch${i}`} x={x} y="68" width="3" height="207" fill={VERT}
          className="s3-fill" style={{ animationDelay: `${5 + i * 0.1}s` }} />
      ))}

      {/* Electrical veins (orange) */}
      <path d="M90,270 C90,248 130,238 130,216 C130,194 90,184 90,162 C90,140 130,130 130,108 C130,86 90,76 90,68"
        stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" className="s3-vein-e" />

      {/* Plumbing veins (blue) */}
      <path d="M310,270 C310,248 270,238 270,216 C270,194 310,184 310,162 C310,140 270,130 270,108 C270,86 310,76 310,68"
        stroke="#2563EB" strokeWidth="2.5" fill="none" strokeLinecap="round" className="s3-vein-p" />

      {/* Bottom label */}
      <text x="200" y="295" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="600"
        fontFamily="DM Sans, sans-serif" style={{ animation: 'fadeIn 0.5s ease-out 6.5s both' }}>
        Un trait continu · Structure + MEP
      </text>
    </svg>
  )
}

/* ── Cycling Hero Animation — 3 conceptual scenes ── */
function BuildingAnimation() {
  const [scene, setScene] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setScene(s => (s + 1) % 3), 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <style>{animStyles}</style>
      <div key={scene} style={{ animation: 'sceneFadeIn 0.6s ease-out', minHeight: 280 }}>
        {scene === 0 && <ScenePlan />}
        {scene === 1 && <SceneBrain />}
        {scene === 2 && <SceneLine />}
      </div>
      {/* Navigation dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
        {[0, 1, 2].map(i => (
          <button key={i} onClick={() => setScene(i)} style={{
            width: i === scene ? 24 : 8, height: 8, borderRadius: 4,
            background: i === scene ? VERT : '#D1D5DB',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: 1 }}>
        {['VOTRE PLAN \u2192 NOTRE ANALYSE', "L'IA QUI CON\u00C7OIT", 'UN TRAIT, UN B\u00C2TIMENT'][scene]}
      </div>
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
          <button onClick={() => navigate('/cgu')} style={{
            background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 11,
          }}>Conditions d'utilisation</button>
          <button onClick={() => navigate('/investors')} style={{
            background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 11,
          }}>{t('nav_investors')}</button>
        </div>
        <div>Dakar · Abidjan · Casablanca · Lagos · Accra</div>
      </footer>
    </div>
  )
}
