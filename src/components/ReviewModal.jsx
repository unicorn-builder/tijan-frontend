import { useState } from 'react'

const VERT = '#43A956'
const NAVY = '#1B2A4A'

export default function ReviewModal({ lang, restants, onConfirm, onClose }) {
  const [selected, setSelected] = useState({})
  const isEN = lang === 'en'

  const scopes = [
    {
      id: 'structure',
      label: isEN ? 'Structural Review' : 'Revue Structure',
      desc: isEN
        ? 'Calculation note + BOQ + technical sheets + structural drawings'
        : 'Note de calcul + DQE + fiches techniques + plans structure',
      icon: '🏗️',
    },
    {
      id: 'mep',
      label: isEN ? 'MEP Review' : 'Revue MEP',
      desc: isEN
        ? 'MEP note + MEP BOQ + MEP drawings'
        : 'Note MEP + DQE MEP + plans MEP',
      icon: '⚡',
    },
    {
      id: 'edge',
      label: isEN ? 'EDGE Compliance Review' : 'Revue Conformité EDGE',
      desc: isEN
        ? 'EDGE certification report + action plan validation'
        : 'Rapport certification EDGE + validation plan d\'action',
      icon: '🌿',
    },
  ]

  const count = Object.values(selected).filter(Boolean).length
  const cost = count >= 3 ? 2 : count
  const promo = count >= 2
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
          background: '#fff', borderRadius: 14, maxWidth: 500, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: NAVY, padding: '20px 24px', color: '#fff' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {isEN ? 'Engineer Review' : 'Revue Ingénieur'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {isEN
              ? 'Have your project validated by licensed engineers'
              : 'Faites valider votre projet par des ingénieurs agréés'}
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* What you get */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 10 }}>
              {isEN ? 'What you receive:' : 'Ce que vous recevez :'}
            </div>
            {[
              isEN ? 'Annotated PDF with engineer comments & corrections' : 'PDF annoté avec commentaires et corrections',
              isEN ? 'Signed validation letter with professional stamp' : 'Lettre de validation signée avec tampon professionnel',
              isEN ? 'Delivery within 48-72 hours' : 'Livraison sous 48-72 heures',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                <span style={{ color: VERT, fontSize: 15, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: '#444' }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Scope selection */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 10 }}>
              {isEN ? 'Select review scope(s):' : 'Sélectionnez le(s) périmètre(s) :'}
            </div>
            {scopes.map(s => {
              const isOn = !!selected[s.id]
              return (
                <div
                  key={s.id}
                  onClick={() => setSelected(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                  style={{
                    border: isOn ? `2px solid ${VERT}` : '1.5px solid #E5E5E5',
                    borderRadius: 10, padding: '12px 14px', marginBottom: 8,
                    cursor: 'pointer', background: isOn ? '#F0FFF4' : '#fff',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: isOn ? `2px solid ${VERT}` : '2px solid #CCC',
                    background: isOn ? VERT : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}>
                    {isOn && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isOn ? VERT : '#333' }}>
                      {s.icon} {s.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isOn ? VERT : '#888', flexShrink: 0 }}>
                    1 {isEN ? 'cr.' : 'cr.'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Promo banner */}
          {promo && (
            <div style={{
              background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8,
              padding: '10px 14px', marginBottom: 16, fontSize: 12,
              color: '#92400E', fontWeight: 600, textAlign: 'center',
            }}>
              {count >= 3
                ? (isEN ? '🎉 3rd review FREE! You pay only 2 credits instead of 3' : '🎉 3ème revue OFFERTE ! Vous ne payez que 2 crédits au lieu de 3')
                : (isEN ? '💡 Add a 3rd review and get it FREE!' : '💡 Ajoutez une 3ème revue et elle est OFFERTE !')}
            </div>
          )}

          {/* Cost summary */}
          <div style={{
            background: '#F7F8FA', borderRadius: 8, padding: 14,
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#666' }}>{isEN ? 'Reviews selected' : 'Revues sélectionnées'}</span>
              <span style={{ fontWeight: 600 }}>
                {count} {count >= 3 && <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 4 }}>3 cr.</span>}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#666' }}>{isEN ? 'Cost' : 'Coût'}</span>
              <span style={{ fontWeight: 700, color: NAVY }}>
                {cost} {isEN ? (cost > 1 ? 'credits' : 'credit') : (cost > 1 ? 'crédits' : 'crédit')}
                {count >= 3 && <span style={{ color: VERT, marginLeft: 6, fontSize: 11 }}>(-33%)</span>}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#666' }}>{isEN ? 'Your balance' : 'Votre solde'}</span>
              <span style={{ fontWeight: 600 }}>{restants} {isEN ? 'credits' : 'crédits'}</span>
            </div>
            <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: 6, marginTop: 2, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#666' }}>{isEN ? 'After purchase' : 'Après achat'}</span>
              <span style={{ fontWeight: 700, color: soldeApres >= 0 ? VERT : '#DC2626' }}>
                {soldeApres >= 0 ? soldeApres : 0} {isEN ? 'credits' : 'crédits'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: '1.5px solid #E5E5E5', background: '#fff', color: '#666', cursor: 'pointer',
              }}
            >
              {isEN ? 'Cancel' : 'Annuler'}
            </button>
            <button
              onClick={() => {
                const scopes = Object.keys(selected).filter(k => selected[k])
                if (scopes.length === 0) return
                onConfirm(scopes, cost)
              }}
              disabled={count === 0 || soldeApres < 0}
              style={{
                flex: 2, padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
                border: 'none',
                background: (count === 0 || soldeApres < 0) ? '#ccc' : VERT,
                color: '#fff',
                cursor: (count === 0 || soldeApres < 0) ? 'not-allowed' : 'pointer',
              }}
            >
              {count === 0
                ? (isEN ? 'Select at least one review' : 'Sélectionnez au moins une revue')
                : soldeApres < 0
                  ? (isEN ? 'Not enough credits' : 'Crédits insuffisants')
                  : (isEN ? `Confirm — ${cost} credit${cost > 1 ? 's' : ''}` : `Confirmer — ${cost} crédit${cost > 1 ? 's' : ''}`)}
            </button>
          </div>
          {soldeApres < 0 && (
            <div
              onClick={() => { onClose(); window.location.href = '/pricing' }}
              style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: VERT, cursor: 'pointer', fontWeight: 600 }}
            >
              {isEN ? 'Buy credits →' : 'Acheter des crédits →'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
