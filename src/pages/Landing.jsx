import { useNavigate } from 'react-router-dom'
import { VERT } from '../constants'

const MODULES = [
  { label: 'Structure', desc: 'Notes de calcul Eurocodes, plans BA, fondations', status: 'Actif', icon: '📐' },
  { label: 'MEP', desc: 'Électricité NF C 15-100, plomberie, CVC', status: 'Bientôt', icon: '⚡' },
  { label: 'Fiches techniques', desc: 'Spécifications matériaux, datasheets équipements', status: 'Bientôt', icon: '📋' },
  { label: 'BOQ', desc: 'Métrés automatiques, chiffrage multi-pays', status: 'Bientôt', icon: '💰' },
]

const STATS = [
  { value: '97%', label: 'des projets africains sans ingénierie de qualité' },
  { value: '4', label: 'pays couverts' },
  { value: '<5 min', label: 'pour un dossier technique complet' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div style={{ height:'100vh', overflow:'hidden', display:'flex', flexDirection:'column', background:'#fff', fontFamily:"'DM Sans', sans-serif" }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:56, borderBottom:'0.5px solid #E5E5E5', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="/tijan_logo.png" alt="Tijan AI" style={{ height:36, width:'auto' }} />
          <span style={{ fontSize:11, color:'#888' }}>Engineering Intelligence for Africa</span>
        </div>
        <button onClick={() => navigate('/projects/new')} style={{ background:VERT, color:'#fff', border:'none', borderRadius:6, padding:'7px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Nouveau Projet →
        </button>
      </nav>
      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-evenly', padding:'0 24px', overflow:'hidden' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, border:'0.5px solid #E5E5E5', borderRadius:20, padding:'3px 12px', fontSize:11, color:'#555', marginBottom:12 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:VERT, display:'inline-block' }} />
            Calcul structurel Eurocodes certifié
          </div>
          <h1 style={{ fontSize:36, fontWeight:700, color:'#111', lineHeight:1.2, marginBottom:10 }}>
            Dossiers techniques complets <span style={{ color:VERT }}>en quelques minutes</span>
          </h1>
          <p style={{ fontSize:14, color:'#666', lineHeight:1.55, maxWidth:420, margin:'0 auto 16px' }}>
            Tijan AI automatise la production de notes de calcul, plans béton armé, MEP et BOQ pour les projets de construction en Afrique.
          </p>
          <button onClick={() => navigate('/projects/new')} style={{ background:VERT, color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Nouveau Projet →
          </button>
        </div>
        <div style={{ width:'100%', maxWidth:720 }}>
          <div style={{ fontSize:10, color:'#aaa', letterSpacing:1, textAlign:'center', marginBottom:8, fontWeight:500 }}>4 MODULES SÉQUENTIELS</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {MODULES.map((m, i) => (
              <div key={i} style={{ border:'0.5px solid #E5E5E5', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:7 }}>
                  <span style={{ fontSize:15 }}>{m.icon}</span>
                  <span style={{ fontSize:9, fontWeight:600, borderRadius:10, padding:'2px 7px', background:m.status==='Actif'?VERT:'#F0F0F0', color:m.status==='Actif'?'#fff':'#888' }}>{m.status}</span>
                </div>
                <div style={{ fontWeight:600, fontSize:12, color:'#111', marginBottom:3 }}>{m.label}</div>
                <div style={{ fontSize:10, color:'#888', lineHeight:1.4 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:60 }}>
          {STATS.map((st, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#111', marginBottom:2 }}>{st.value}</div>
              <div style={{ fontSize:11, color:'#888' }}>{st.label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', fontSize:10, color:'#aaa' }}>
          © 2026 Tijan AI · Engineering Intelligence for Africa · Version bêta
        </div>
      </main>
    </div>
  )
}
