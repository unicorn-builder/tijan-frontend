// CreditsHistory.jsx — Historique crédits utilisateur
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredits } from '../hooks/useCredits'
import { useLang } from '../i18n.jsx'
import Header from '../components/Header'
import { VERT } from '../constants'

const NAVY = '#1B2A4A'

function formatFCFA(n) {
  return (n || 0).toLocaleString('fr-FR') + ' FCFA'
}

export default function CreditsHistory() {
  const navigate = useNavigate()
  const { supabase, user } = useAuth()
  const { credits, restants, loading: creditsLoading } = useCredits()
  const { t, lang } = useLang()
  const [paiements, setPaiements] = useState([])
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchHistorique()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchHistorique = async () => {
    setLoading(true)
    const [payRes, projRes] = await Promise.all([
      supabase.from('paiements').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('projets').select('id, nom, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    setPaiements(payRes.data || [])
    setProjets(projRes.data || [])
    setLoading(false)
  }

  // Construction du flux chronologique unifié : recharges (paiements completed) + consommations (projets créés)
  const flux = [
    ...paiements.filter(p => p.statut === 'completed').map(p => ({
      type: 'recharge',
      date: p.created_at,
      label: lang === 'en' ? `Purchase of ${p.nb_credits} credit${p.nb_credits > 1 ? 's' : ''}` : `Achat de ${p.nb_credits} crédit${p.nb_credits > 1 ? 's' : ''}`,
      credits: +p.nb_credits,
      montant: p.montant_fcfa,
      ref: p.reference,
    })),
    ...projets.map(pr => ({
      type: 'consommation',
      date: pr.created_at,
      label: lang === 'en' ? `Project "${pr.nom}"` : `Projet « ${pr.nom} »`,
      credits: -1,
      montant: null,
      ref: pr.id,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalDepense = paiements
    .filter(p => p.statut === 'completed')
    .reduce((s, p) => s + (p.montant_fcfa || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
              {t('ch_titre')}
            </h1>
            <div style={{ fontSize: 13, color: '#666' }}>
              {t('ch_desc')}
            </div>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            style={{ background: VERT, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            {t('ch_acheter')}
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '0.5px solid #E5E5E5' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
              {t('ch_kpi_disponibles')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: VERT }}>
              {creditsLoading ? '...' : restants}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '0.5px solid #E5E5E5' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
              {t('ch_kpi_achetes')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY }}>
              {credits?.total ?? '...'}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '0.5px solid #E5E5E5' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
              {t('ch_kpi_utilises')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY }}>
              {credits?.utilises ?? '...'}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '0.5px solid #E5E5E5' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
              {t('ch_kpi_depense')}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>
              {formatFCFA(totalDepense)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E5E5E5', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0', fontSize: 14, fontWeight: 700, color: NAVY }}>
            {t('ch_historique')}
          </div>
          {loading && (
            <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 13 }}>
              {t('ch_chargement')}
            </div>
          )}
          {!loading && flux.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>
              {t('ch_vide')}
            </div>
          )}
          {!loading && flux.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px', borderBottom: i < flux.length - 1 ? '1px solid #F5F5F5' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: item.type === 'recharge' ? `${VERT}22` : '#FFE8D6',
                  color: item.type === 'recharge' ? VERT : '#B8621B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800,
                }}>
                  {item.type === 'recharge' ? '+' : '−'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    {new Date(item.date).toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                    {item.ref && item.type === 'recharge' && ` · ${item.ref}`}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: item.credits > 0 ? VERT : '#B8621B',
                }}>
                  {item.credits > 0 ? '+' : ''}{item.credits} {t('pr_credit')}{Math.abs(item.credits) > 1 ? 's' : ''}
                </div>
                {item.montant && (
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    {formatFCFA(item.montant)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 18 }}>
          {t('ch_support')} <a href="mailto:malick@cepic.holdings" style={{ color: VERT, textDecoration: 'none' }}>malick@cepic.holdings</a>
        </div>

      </div>
    </div>
  )
}
