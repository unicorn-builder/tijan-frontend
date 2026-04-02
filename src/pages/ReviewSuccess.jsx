import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

const VERT = '#43A956'
const NAVY = '#1B2A4A'

export default function ReviewSuccess() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { lang } = useLang()
  const isEN = lang === 'en'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center', maxWidth: 500, padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
          {isEN ? 'Review Request Submitted' : 'Demande de revue soumise'}
        </h1>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
          {isEN
            ? 'Your request has been confirmed. A licensed engineer will review your project within 48-72 hours. You will receive a notification when your annotated PDF and signed validation letter are ready.'
            : 'Votre demande a bien ete prise en compte. Un ingenieur agree examinera votre projet sous 48-72 heures. Vous serez notifie lorsque le PDF annote et la lettre de validation signee seront prets.'}
        </p>
        <div style={{
          background: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: 8,
          padding: 16, marginBottom: 24, fontSize: 13, color: '#2D7A3A', textAlign: 'left',
        }}>
          <strong>{isEN ? 'What happens next:' : 'Prochaines etapes :'}</strong><br/>
          {isEN ? '1. An engineer is assigned to your project' : '1. Un ingenieur est assigne a votre projet'}<br/>
          {isEN ? '2. They review all calculations (2-4 hours)' : '2. Il revoit tous les calculs (2-4 heures)'}<br/>
          {isEN ? '3. You receive the annotated PDF + signed letter' : '3. Vous recevez le PDF annote + la lettre signee'}<br/>
          {isEN ? '4. Documents available in your dashboard' : '4. Documents disponibles dans votre tableau de bord'}
        </div>
        <button
          onClick={() => navigate('/projects/' + id + '/results')}
          style={{
            background: VERT, color: '#fff', border: 'none', borderRadius: 6,
            padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {isEN ? 'Back to Project' : 'Retour au projet'}
        </button>
      </div>
    </div>
  )
}
