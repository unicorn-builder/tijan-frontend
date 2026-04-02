import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VERT = '#43A956'
const NAVY = '#1B2A4A'
const ORANGE = '#E07B00'
const GRIS2 = '#E5E7EB'

export default function ReviewModal({ lang, restants, onConfirm, onClose }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState({})
  const isEN = lang === 'en'

  const scopes = [
    {
      id: 'structure',
      label: isEN ? 'Structural Review' : 'Revue Structure',
      icon: '🏗️',
      features: isEN
        ? ['Calculation note reviewed', 'BOQ validated', 'Technical sheets checked', 'Structural drawings approved']
        : ['Note de calcul revue', 'DQE validée', 'Fiches techniques vérifiées', 'Plans structure approuvés']
    },
    {
      id: 'mep',
      label: isEN ? 'MEP Review' : 'Revue MEP',
      icon: '⚡',
      features: isEN
        ? ['MEP calculations checked', 'MEP BOQ validated', 'MEP drawings approved', 'Systems integration reviewed']
        : ['Calculs MEP vérifiés', 'DQE MEP validée', 'Plans MEP approuvés', 'Intégration systèmes revue']
    },
    {
      id: 'edge',
      label: isEN ? 'EDGE Compliance' : 'Conformité EDGE',
      icon: '🌿',
      features: isEN
        ? ['EDGE report reviewed', 'Action plan validated', 'Optimization suggestions', 'Certification guidance']
        : ['Rapport EDGE revu', 'Plan d\'action validé', 'Suggestions d\'optimisation', 'Guidance certification']
    },
  ]

  const count = Object.values(selected).filter(Boolean).length
  const cost = count > 0 ? 2 : 0
  const soldeApres = restants - cost

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div
        style={{
          background: '#fff', borderRadius: 14, maxWidth: 540, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: NAVY, padding: '28px 28px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>✓</span>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              {isEN ? 'Engineer Review' : 'Revue par un Ingénieur'}
            </h1>
          </div>
          <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>
            {isEN
              ? 'Professional validation with annotated feedback & signed certification'
              : 'Validation professionnelle avec retours annotés et certification signée'}
          </p>
        </div>

        <div style={{ padding: '28px 28px' }}>
          {/* What you get */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isEN ? 'What You Receive' : 'Ce Que Vous Recevez'}
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: isEN ? 'Annotated PDF' : 'PDF Annoté', desc: isEN ? 'Engineer comments & corrections' : 'Commentaires et corrections' },
                { label: isEN ? 'Signed Letter' : 'Lettre Signée', desc: isEN ? 'Official validation with stamp' : 'Validation officielle avec tampon' },
                { label: isEN ? '48-72 Hour Delivery' : 'Livraison 48-72h', desc: isEN ? 'Fast professional turnaround' : 'Délai professionnel rapide' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: VERT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scope selection — toggle cards */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isEN ? 'Select Review Scope' : 'Sélectionnez le Périmètre'}
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {scopes.map(s => {
                const isOn = !!selected[s.id]
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelected(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                    style={{
                      border: isOn ? `2px solid ${VERT}` : `1px solid ${GRIS2}`,
                      borderRadius: 10, padding: 16, cursor: 'pointer',
                      background: isOn ? '#F0FFF4' : '#fff',
                      transition: 'all 0.2s ease',
                      transform: isOn ? 'scale(1.01)' : 'scale(1)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        border: isOn ? `2px solid ${VERT}` : `2px solid ${GRIS2}`,
                        background: isOn ? VERT : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.2s',
                        color: '#fff', fontSize: 16
                      }}>
                        {isOn ? '✓' : s.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isOn ? VERT : NAVY }}>
                          {s.label}
                        </div>
                      </div>
                    </div>
                    {isOn && (
                      <div style={{ marginLeft: 40, display: 'grid', gap: 6 }}>
                        {s.features.map((feat, i) => (
                          <div key={i} style={{ fontSize: 12, color: '#666', display: 'flex', gap: 8 }}>
                            <span style={{ color: VERT }}>•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cost summary — clean card */}
          <div style={{
            background: '#F7F8FA', border: `1px solid ${GRIS2}`, borderRadius: 10, padding: 16,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                {isEN ? 'Your Balance' : 'Votre Solde'}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>
                {restants} {isEN ? 'credit' : 'crédit'}{restants > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ borderTop: `1px solid ${GRIS2}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                {isEN ? 'Review Cost' : 'Coût Revue'}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: ORANGE }}>
                2 {isEN ? 'credit' : 'crédit'}s
              </span>
            </div>
            <div style={{ borderTop: `1px solid ${GRIS2}`, paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>
                {isEN ? 'After Review' : 'Après Revue'}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: soldeApres >= 0 ? VERT : '#DC2626' }}>
                {soldeApres >= 0 ? soldeApres : 0} {isEN ? 'credit' : 'crédit'}{soldeApres !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Buttons */}
          {soldeApres < 0 ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${GRIS2}`, background: '#fff', color: '#666', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {isEN ? 'Cancel' : 'Annuler'}
              </button>
              <button
                onClick={() => {
                  onClose()
                  navigate('/pricing')
                }}
                style={{
                  flex: 2, padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  border: 'none', background: VERT, color: '#fff', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {isEN ? 'Buy Credits' : 'Acheter des Crédits'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${GRIS2}`, background: '#fff', color: '#666', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {isEN ? 'Cancel' : 'Annuler'}
              </button>
              <button
                onClick={() => {
                  const scopes = Object.keys(selected).filter(k => selected[k])
                  if (scopes.length === 0) return
                  onConfirm(scopes, cost)
                }}
                disabled={count === 0}
                style={{
                  flex: 2, padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  border: 'none', background: count === 0 ? '#ccc' : VERT, color: '#fff',
                  cursor: count === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => !count === 0 && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => !count === 0 && (e.currentTarget.style.opacity = '1')}
              >
                {count === 0
                  ? (isEN ? 'Select Scope' : 'Sélectionnez')
                  : (isEN ? 'Confirm Review — 2 Credits' : 'Confirmer la Revue — 2 Crédits')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
