import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { VERT } from '../constants'

const NAVY = '#1B2A4A'

const CIBLES = [
  { icon: '🏦', titre: 'Banques', desc: 'Challengez les dossiers techniques et coûts des projets que vous financez' },
  { icon: '🏗️', titre: 'Promoteurs', desc: 'Obtenez des estimations fiables dès la phase d\'avant-projet' },
  { icon: '🔨', titre: 'Constructeurs', desc: 'Chiffrez vos clients en quelques minutes, pas en semaines' },
  { icon: '📐', titre: 'Bureaux d\'études', desc: 'Multipliez votre productivité par 10 sur les pré-études' },
  { icon: '🏠', titre: 'Architectes', desc: 'Offrez de la valeur technique à vos clients sans sous-traiter' },
]

const LIVRABLES = [
  { label: 'Note de calcul structure', norme: 'EC2 / EC8', icon: '📄' },
  { label: 'BOQ Structure détaillé', norme: '7 lots', icon: '💰' },
  { label: 'Note MEP complète', norme: 'NF C 15-100 / DTU 60.11', icon: '⚡' },
  { label: 'BOQ MEP 3 gammes', norme: 'Basic / High-End / Luxury', icon: '📊' },
  { label: 'Conformité EDGE IFC', norme: '+ Plan d\'action certification', icon: '🌱' },
  { label: 'Rapport exécutif', norme: 'Maître d\'ouvrage', icon: '📋' },
  { label: 'Plans d\'exécution BA', norme: 'Bientôt disponible', icon: '🏗️' },
  { label: 'Plans MEP', norme: 'Bientôt disponible', icon: '📐' },
]

const CHIFFRES = [
  { val: '<5 min', label: 'pour un dossier complet' },
  { val: '8', label: 'documents techniques' },
  { val: '5', label: 'pays couverts' },
  { val: '±15%', label: 'précision estimations' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      <Header />

            {/* ── HERO ── */}
      <section style={{
        textAlign: 'center', padding: '56px 24px 40px',
        background: 'linear-gradient(180deg, #FAFFFE 0%, #fff 100%)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          border: '0.5px solid #E5E5E5', borderRadius: 20,
          padding: '4px 14px', fontSize: 11, color: '#555', marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: VERT, display: 'inline-block' }} />
          Moteur Eurocodes EC2/EC8 · Certifié
        </div>

        <h1 style={{
          fontSize: 40, fontWeight: 800, color: NAVY, lineHeight: 1.15,
          maxWidth: 700, margin: '0 auto 16px',
        }}>
          Dossiers techniques complets<br />
          <span style={{ color: VERT }}>en moins de 5 minutes</span>
        </h1>

        <p style={{
          fontSize: 16, color: '#555', lineHeight: 1.6,
          maxWidth: 520, margin: '0 auto 28px',
        }}>
          Tijan AI génère automatiquement notes de calcul, BOQ, rapport MEP et certification EDGE
          pour vos projets de construction en Afrique.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(user ? '/projects/new' : '/login')} style={{
            background: VERT, color: '#fff', border: 'none', borderRadius: 8,
            padding: '13px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            Analyser mon projet →
          </button>
          <button onClick={() => document.getElementById('livrables')?.scrollIntoView({ behavior: 'smooth' })} style={{
            background: '#fff', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 8,
            padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>
            Voir les livrables
          </button>
        </div>

        {/* Chiffres */}
        <div style={{
          display: 'flex', gap: 40, justifyContent: 'center', marginTop: 40,
          flexWrap: 'wrap',
        }}>
          {CHIFFRES.map((c, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: NAVY }}>{c.val}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>POUR QUI ?</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>Conçu pour les professionnels de la construction</h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14, maxWidth: 900, margin: '0 auto',
        }}>
          {CIBLES.map((c, i) => (
            <div key={i} style={{
              background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: 10,
              padding: '18px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: NAVY, marginBottom: 4 }}>{c.titre}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVRABLES ── */}
      <section id="livrables" style={{ padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>LIVRABLES</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>8 documents générés automatiquement</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            Uploadez vos plans → Tijan AI analyse, dimensionne et chiffre → Téléchargez vos documents<br/>Plans d'exécution BA et MEP disponibles très prochainement.
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 12, maxWidth: 900, margin: '0 auto',
        }}>
          {LIVRABLES.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: 8,
              padding: '14px 16px',
            }}>
              <span style={{ fontSize: 22 }}>{l.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{l.label}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{l.norme}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ padding: '48px 24px', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: VERT, fontWeight: 700, marginBottom: 6 }}>COMMENT ÇA MARCHE</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY }}>3 étapes, 5 minutes</h2>
        </div>
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
          maxWidth: 800, margin: '0 auto',
        }}>
          {[
            { step: '1', titre: 'Uploadez vos plans', desc: 'PDF ou saisie manuelle des paramètres du projet' },
            { step: '2', titre: 'Tijan AI analyse', desc: 'Calcul structure EC2/EC8, MEP, EDGE, chiffrage multi-pays' },
            { step: '3', titre: 'Téléchargez tout', desc: '8 documents PDF professionnels prêts à l\'emploi' },
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
        padding: '48px 24px', textAlign: 'center',
        background: NAVY,
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          Prêt à transformer votre processus d'ingénierie ?
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          Rejoignez les professionnels qui utilisent Tijan AI pour produire des dossiers techniques
          10x plus vite et à une fraction du coût d'un BET traditionnel.
        </p>
        <button onClick={() => navigate(user ? '/projects/new' : '/login')} style={{
          background: VERT, color: '#fff', border: 'none', borderRadius: 8,
          padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>
          Commencer maintenant →
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
          1 projet gratuit · Pas de carte bancaire requise
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '20px 32px', borderTop: '0.5px solid #E5E5E5',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: '#aaa',
      }}>
        <div>© 2026 Tijan AI · Engineering Intelligence for Africa</div>
        <div>Dakar · Abidjan · Casablanca · Lagos · Accra</div>
      </footer>
    </div>
  )
}
