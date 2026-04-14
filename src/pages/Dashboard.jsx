// Dashboard.jsx — Liste des projets de l'utilisateur
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../hooks/useProjects'
import Header from '../components/Header'
import { useCredits } from '../hooks/useCredits'
import { useLang } from '../i18n.jsx'

const VERT = '#43A956'
const VERT_LIGHT = '#EBF7ED'
const NAVY = '#1B2A4A'
const GRIS1 = '#F7F8FA'
const GRIS2 = '#E5E7EB'
const GRIS3 = '#9CA3AF'
const ORANGE = '#E07B00'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatFcfa(n) {
  if (!n) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} Mds FCFA`
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} M FCFA`
  return `${n.toLocaleString()} FCFA`
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { projets, loading, supprimerProjet } = useProjects()
  const { restants } = useCredits()
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(null)

  const nomUser = user?.user_metadata?.nom_complet || user?.email?.split('@')[0] || 'Utilisateur'

  const handleDelete = async (id) => {
    await supprimerProjet(id)
    setConfirmDelete(null)
  }

  const ouvrirProjet = (projet) => {
    navigate(`/projects/${projet.id}/results`, {
      state: {
        params: {
          nom: projet.nom, ville: projet.ville, pays: projet.pays,
          nb_niveaux: projet.nb_niveaux, surface_emprise_m2: projet.surface_emprise_m2,
          portee_max_m: projet.portee_max_m, portee_min_m: projet.portee_min_m,
          nb_travees_x: projet.nb_travees_x, nb_travees_y: projet.nb_travees_y,
          usage: projet.usage,
        },
        resultats: projet.resultats_structure,
        mepData: projet.resultats_mep,
        chatHistorique: projet.chat_historique || [],
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: GRIS1, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <Header />

      {/* Contenu */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: 0 }}>{t('dash_titre')}</h1>
            <p style={{ fontSize: 13, color: GRIS3, marginTop: 4 }}>
              {projets.length} projet{projets.length > 1 ? 's' : ''} {projets.length > 1 ? t('dash_count_plural') : t('dash_count')}
            </p>
          </div>
          <button onClick={() => navigate('/projects/new')} style={{
            background: VERT, color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>{t('dash_nouveau')}</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: GRIS3 }}>
            <div style={{
              width: 36, height: 36, border: `3px solid ${GRIS2}`,
              borderTop: `3px solid ${VERT}`, borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
            }} />
            {lang === 'en' ? 'Loading...' : 'Chargement...'}
          </div>
        ) : projets.length === 0 ? (
          <div style={{
            background: '#fff', border: `2px dashed ${GRIS2}`,
            borderRadius: 12, padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: NAVY, marginBottom: 8 }}>
              {t('dash_aucun')}
            </div>
            <div style={{ fontSize: 13, color: GRIS3, marginBottom: 24 }}>
              {t('dash_creer_desc')}
            </div>
            <button onClick={() => navigate('/credits')} style={{
              background: '#F0FFF4', color: VERT, border: '1px solid ' + VERT,
              borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{restants ?? '...'} {lang === 'en' ? 'credits' : 'crédit'}{restants !== 1 ? 's' : ''} · {lang === 'en' ? 'History' : 'Historique'}</button>
            <button onClick={() => navigate('/projects/new')} style={{
              background: VERT, color: '#fff', border: 'none',
              borderRadius: 8, padding: '12px 28px', fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
            }}>
              {lang === 'en' ? '+ Create my first project' : '+ Créer mon premier projet'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {projets.map(projet => {
              const boq = projet.resultats_structure?.boq
              const budget_bas = boq?.total_bas_fcfa
              const budget_haut = boq?.total_haut_fcfa
              return (
                <div key={projet.id} style={{
                  background: '#fff', border: `1px solid ${GRIS2}`,
                  borderRadius: 10, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 16, cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ flex: 1 }} onClick={() => ouvrirProjet(projet)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{projet.nom}</span>
                      <span style={{
                        background: VERT_LIGHT, color: VERT, borderRadius: 4,
                        padding: '2px 8px', fontSize: 11, fontWeight: 600,
                      }}>
                        R+{(projet.nb_niveaux || 1) - 1}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: GRIS3, display: 'flex', gap: 16 }}>
                      <span>📍 {projet.ville}, {projet.pays}</span>
                      <span>📐 {projet.surface_emprise_m2} m²</span>
                      {budget_bas && <span>💰 {formatFcfa(budget_bas)} – {formatFcfa(budget_haut)}</span>}
                      <span>🕐 {formatDate(projet.created_at)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => ouvrirProjet(projet)} style={{
                      background: VERT_LIGHT, color: VERT, border: 'none',
                      borderRadius: 6, padding: '7px 14px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer',
                    }}>
                      {lang === 'en' ? 'Open' : 'Ouvrir'}
                    </button>
                    <button onClick={() => setConfirmDelete(projet.id)} style={{
                      background: '#FFF0F0', color: '#DC2626', border: 'none',
                      borderRadius: 6, padding: '7px 12px', fontSize: 12,
                      cursor: 'pointer',
                    }}>
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 28,
            maxWidth: 360, width: '90%', textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
              {lang === 'en' ? 'Delete this project?' : 'Supprimer ce projet ?'}
            </div>
            <div style={{ fontSize: 13, color: GRIS3, marginBottom: 24 }}>
              {t('dash_supprimer_desc')}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                background: GRIS1, border: `1px solid ${GRIS2}`, borderRadius: 7,
                padding: '9px 20px', fontSize: 13, cursor: 'pointer',
              }}>
                {t('dash_annuler')}
              </button>
              <button onClick={() => handleDelete(confirmDelete)} style={{
                background: '#DC2626', color: '#fff', border: 'none',
                borderRadius: 7, padding: '9px 20px', fontSize: 13,
                fontWeight: 700, cursor: 'pointer',
              }}>
                {t('dash_supprimer')}
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
