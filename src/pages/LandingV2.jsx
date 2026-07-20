import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { VERT, VERT_LIGHT, VERT_DARK, ORANGE, ORANGE_LT } from '../constants'

const NAVY = '#1B2A4A'
const BLEU = '#185FA5'
const BLEU_LT = '#E6F1FB'

/*
 * LandingV2 — page de conviction Tijan AI.
 * Un message central (3 mois → 5 minutes), les 4 promesses clés,
 * un CTA unique. Le chat de modification vit DANS le projet.
 */

const PROMESSES = [
  {
    t: '3 mois de travail en 5 minutes',
    d: 'Notes de calcul Eurocodes, plans BA, MEP et BOQ générés d’un coup, cohérents entre eux — ce qu’un bureau d’études livre en un trimestre.',
    c: ORANGE, bg: ORANGE_LT, ic: '⚡',
  },
  {
    t: 'Plus de clash',
    d: 'Structure, plomberie, électricité et CVC issus d’une même maquette : les conflits entre lots sont détectés et résolus avant le chantier, pas dessus.',
    c: BLEU, bg: BLEU_LT, ic: '🛡️',
  },
  {
    t: 'Modifiez en conversant',
    d: '« Passe le bâtiment en R+6 », « ajoute un sous-sol » : l’assistant intégré recalcule tout le dossier. L’ingénierie devient une conversation.',
    c: VERT_DARK, bg: VERT_LIGHT, ic: '💬',
  },
  {
    t: 'Impact vert mesuré',
    d: 'Certification EDGE intégrée : chaque projet chiffre ses économies d’énergie, d’eau et de carbone. Construire sobre devient le choix par défaut.',
    c: VERT_DARK, bg: VERT_LIGHT, ic: '🌱',
  },
]

export default function LandingV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const go = () => navigate(user ? '/projects/new' : '/login')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ height: 4, background: `linear-gradient(90deg, ${VERT} 0%, ${VERT_DARK} 60%, ${ORANGE} 100%)` }} />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 28px' }}>
        <img src="/tijan_logo_crop.png" alt="Tijan AI" style={{ height: 54, cursor: 'pointer' }} onClick={() => navigate('/')} />
        <button onClick={() => navigate(user ? '/dashboard' : '/login')}
          style={{ background: VERT_LIGHT, border: `1px solid ${VERT}`, borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer', color: VERT_DARK, fontWeight: 600 }}>
          {user ? 'Mes projets' : 'Se connecter'}
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 40px' }}>

        {/* ── Hero — tient dans le premier écran, CTA visible sans scroller ── */}
        <section style={{ minHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div style={{ background: ORANGE_LT, color: ORANGE, fontSize: 13, fontWeight: 700, borderRadius: 999, padding: '6px 16px', marginBottom: 16, letterSpacing: 0.3 }}>
            ⚡ 3 mois de travail d&rsquo;ingénierie — livrés en 5 minutes
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.8vw, 40px)', fontWeight: 800, color: NAVY, textAlign: 'center', lineHeight: 1.15, margin: '0 0 12px', maxWidth: 760 }}>
            Le bureau d&rsquo;études qui <span style={{ color: VERT }}>disrupte</span> la construction africaine
          </h1>
          <p style={{ color: '#555', fontSize: 16, textAlign: 'center', maxWidth: 600, margin: '0 0 24px', lineHeight: 1.5 }}>
            <span style={{ color: VERT_DARK, fontWeight: 600 }}>Notes de calcul</span>, <span style={{ color: VERT_DARK, fontWeight: 600 }}>plans BA</span>, <span style={{ color: BLEU, fontWeight: 600 }}>MEP</span> et <span style={{ color: ORANGE, fontWeight: 600 }}>BOQ</span> conformes Eurocodes, générés à partir de vos plans d&rsquo;architecte.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
            <button onClick={go}
              style={{ background: VERT, color: '#FFF', border: 'none', borderRadius: 12, padding: '15px 34px', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(67,169,86,0.35)' }}>
              Lancer mon projet →
            </button>
            <button onClick={() => navigate('/pricing')}
              style={{ background: '#FFF', color: NAVY, border: `1.5px solid ${NAVY}22`, borderRadius: 12, padding: '15px 26px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Voir les tarifs
            </button>
          </div>
          <p style={{ fontSize: 13, color: '#8A8A85', margin: 0 }}>
            <span style={{ color: VERT }}>✓</span> Déposez un DWG, DXF ou PDF — le dossier part de vos vrais plans
          </p>
          <div style={{ marginTop: 26, color: '#B5B5B0', fontSize: 20 }}>↓</div>
        </section>

        {/* ── Les 4 promesses ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, width: '100%', maxWidth: 1060, marginBottom: 44 }}>
          {PROMESSES.map((p) => (
            <div key={p.t} style={{ background: '#FFF', border: '1px solid #ECECEA', borderTop: `4px solid ${p.c}`, borderRadius: 14, padding: '22px 20px', boxShadow: '0 2px 12px rgba(27,42,74,0.05)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{p.ic}</div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{p.t}</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.55 }}>{p.d}</div>
            </div>
          ))}
        </div>

        {/* ── Bandeau révolution ── */}
        <div style={{ width: '100%', maxWidth: 1060, background: NAVY, borderRadius: 16, padding: '30px 28px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', marginBottom: 44 }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ color: VERT, fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 6 }}>RÉVOLUTION TECHNOLOGIQUE</div>
            <div style={{ color: '#FFF', fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>
              97 % des projets africains se construisent sans ingénierie de qualité. Tijan AI change l&rsquo;équation : l&rsquo;excellence d&rsquo;un bureau d&rsquo;études, au prix et à la vitesse du continent.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[['4', 'pays couverts'], ['<5 min', 'par dossier'], ['EC2/EC8', 'Eurocodes']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ color: VERT, fontSize: 26, fontWeight: 800 }}>{v}</div>
                <div style={{ color: '#B8C2D8', fontSize: 12.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA final ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Votre prochain projet mérite une vraie ingénierie.</div>
          <button onClick={go}
            style={{ background: VERT, color: '#FFF', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Commencer maintenant →
          </button>
          <p style={{ marginTop: 16, fontSize: 12.5, color: '#8A8A85' }}>
            Chaque dossier est vérifié par un ingénieur structure habilité.
          </p>
        </div>
      </main>

      <footer style={{ display: 'flex', gap: 22, justifyContent: 'center', padding: '18px 0 24px', fontSize: 13, color: '#999', borderTop: '1px solid #F0F0EE' }}>
        <a href="/pricing" style={{ color: '#999', textDecoration: 'none' }}>Tarifs</a>
        <a href="/impact" style={{ color: '#999', textDecoration: 'none' }}>Impact</a>
        <a href="/landing" style={{ color: '#999', textDecoration: 'none' }}>En savoir plus</a>
        <a href="/cgu" style={{ color: '#999', textDecoration: 'none' }}>CGU</a>
      </footer>
    </div>
  )
}
