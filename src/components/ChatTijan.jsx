// ChatTijan.jsx — Onglet conversation avec Tijan AI
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n.jsx'
import { BACKEND, VERT, VERT_LIGHT, GRIS1, GRIS2, GRIS3, ORANGE } from '../constants'

const SUGGESTIONS_FR = [
  "Pourquoi ce choix de béton pour mon projet ?",
  "Et si je réduisais les portées, ça changerait quoi ?",
  "Passe en C35/45 et montre-moi l'impact",
  "Augmente la portée principale à 7m",
  "Ajoute un niveau supplémentaire",
  "Compare le coût avec un R+3 sur la même emprise",
]
const SUGGESTIONS_EN = [
  "Why this concrete class for my project?",
  "What if I increased the main span to 7m?",
  "Switch to C35/45 and show me the impact",
  "Add one more level to the building",
  "How to get EDGE certification at minimum cost?",
  "Explain the foundation choice in simple terms",
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: VERT, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, marginRight: 8, flexShrink: 0,
        }}>T</div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? VERT : '#fff',
        color: isUser ? '#fff' : '#111',
        border: isUser ? 'none' : `1px solid ${GRIS2}`,
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function ChatTijan({ params, resultatsStructure, resultatsMep, savedChat, onUpdateChat, onModify, lang: langProp }) {
  const { supabase, user } = useAuth()
  const { t, lang } = useLang()
  const defaultMsg = [{
    role: 'assistant',
    content: lang === 'en'
      ? `Hi! 👋 I'm Tijan, your engineering partner on **${params?.nom || 'your project'}**.\n\nI've analyzed your project in detail — structure, MEP, costs, EDGE certification. Feel free to ask me any questions. I'm here to help you make the best decisions for your project.`
      : `Salut ! 👋 Je suis Tijan, votre partenaire ingénierie sur **${params?.nom || 'votre projet'}**.\n\nJ'ai analysé votre projet en détail — structure, MEP, coûts, certification EDGE. N'hésitez pas à me poser toutes vos questions, même les plus pointues. Je suis là pour vous aider à prendre les meilleures décisions pour votre projet.`,
  }]
  const [messages, setMessages] = useState(savedChat?.length > 0 ? savedChat : defaultMsg)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const envoyer = async (texte) => {
    const msg = texte || input.trim()
    if (!msg || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch(`${BACKEND}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          historique: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          params: params || {},
          resultats_structure: resultatsStructure || {},
          resultats_mep: resultatsMep || null,
          lang: lang,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        let reponseText = data.reponse

        // Backend already handles <MODIF> and returns recalcul results
        if (data.recalcul && data.updated_resultats) {
          reponseText = (t('chat_recalc') + '\n\n') + reponseText
        }

        const updated = [...newMessages, { role: 'assistant', content: reponseText }]
        setMessages(updated)
        if (onUpdateChat) onUpdateChat(updated)

        // If backend recalculated, update results in-place
        if (data.recalcul && data.updated_resultats && onModify) {
          onModify(data.updated_params, data.updated_resultats, data.updated_mep)
        }
        // Sauvegarder dans Supabase
        if (supabase && user && params?.nom) {
          supabase.from('projets')
            .update({ chat_historique: updated })
            .eq('nom', params.nom)
            .eq('user_id', user.id)
            .then(() => {})
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: lang === 'en' ? 'An error occurred. Please try again.' : "Une erreur s'est produite. Réessayez." }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('chat_erreur') }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyer()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 160px)' }}>
      
      {/* En-tête */}
      <div style={{
        padding: '12px 16px', background: VERT_LIGHT,
        borderRadius: 8, marginBottom: 12,
        border: `1px solid ${VERT}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: VERT }} />
        <span style={{ fontSize: 12, color: VERT, fontWeight: 600 }}>
          Tijan — {t('chat_titre')} {params?.nom || (lang === 'en' ? 'your project' : 'votre projet')}
        </span>
        <span style={{ fontSize: 11, color: GRIS3, marginLeft: 'auto' }}>
          {t('chat_charge')}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '8px 4px',
        background: GRIS1, borderRadius: 8, marginBottom: 12,
      }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: VERT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>T</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: GRIS3,
                  animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: GRIS3, marginBottom: 6 }}>{t('chat_suggestions')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(lang === 'en' ? SUGGESTIONS_EN : SUGGESTIONS_FR).slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => envoyer(s)} style={{
                background: '#fff', border: `1px solid ${GRIS2}`,
                borderRadius: 16, padding: '5px 12px', fontSize: 11,
                color: '#555', cursor: 'pointer', textAlign: 'left',
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t('chat_placeholder')}
          rows={2}
          style={{
            flex: 1, border: `1px solid ${GRIS2}`, borderRadius: 8,
            padding: '10px 12px', fontSize: 13, resize: 'none',
            fontFamily: 'inherit', outline: 'none',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => envoyer()}
          disabled={!input.trim() || loading}
          style={{
            background: (!input.trim() || loading) ? GRIS2 : VERT,
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 18px', fontSize: 13, fontWeight: 600,
            cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            height: 52,
          }}
        >
          ↑
        </button>
      </div>

      <div style={{ fontSize: 10, color: GRIS3, marginTop: 6, textAlign: 'center' }}>
        {t('chat_disclaimer')}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6 }}>
        <button onClick={() => { envoyer("J'ai un problème technique avec la plateforme. Pouvez-vous m'aider ?"); if (supabase && user) supabase.from('support_tickets').insert({ user_id: user.id, user_email: user.email, projet_nom: params?.nom, message: 'Problème technique signalé', type: 'probleme' }).then(() => {}) }} style={{
          background: 'none', border: '1px solid #E5E5E5', borderRadius: 12,
          padding: '4px 12px', fontSize: 10, color: '#888', cursor: 'pointer',
        }}>{t('chat_signaler')}</button>
        <button onClick={() => { envoyer("J'aimerais être contacté par l'équipe Tijan AI pour discuter de mon projet."); if (supabase && user) supabase.from('support_tickets').insert({ user_id: user.id, user_email: user.email, projet_nom: params?.nom, message: 'Demande de contact', type: 'contact' }).then(() => {}) }} style={{
          background: 'none', border: '1px solid #E5E5E5', borderRadius: 12,
          padding: '4px 12px', fontSize: 10, color: '#888', cursor: 'pointer',
        }}>{t('chat_contacter')}</button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
