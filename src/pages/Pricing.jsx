// Pricing.jsx — Page tarifs Tijan AI (abonnement mensuel 990 $ TTC)
// Affichage bi-devise : USD + monnaie locale selon le pays de connexion
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { VERT, BACKEND } from '../constants'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'
const PRIX_TTC = 990       // $ TTC / mois

/* ---------- Devises locales ---------- */
const CURRENCY_META = {
  XOF:  { symbol: 'FCFA', locale: 'fr-FR' },
  MAD:  { symbol: 'MAD',  locale: 'fr-MA' },
  NGN:  { symbol: '₦',    locale: 'en-NG' },
  GHS:  { symbol: 'GH₵',  locale: 'en-GH' },
}

// Fallback si l'API est injoignable (dernière MàJ manuelle : 2026-06-30)
const FALLBACK_RATES = { XOF: 610, MAD: 9.8, NGN: 1550, GHS: 15.5 }

// Timezone → code devise
const TZ_TO_CURRENCY = {
  'Africa/Dakar':      'XOF',
  'Africa/Abidjan':    'XOF',
  'Africa/Bamako':     'XOF',
  'Africa/Niamey':     'XOF',
  'Africa/Ouagadougou':'XOF',
  'Africa/Lome':       'XOF',
  'Africa/Conakry':    'XOF',
  'Africa/Bissau':     'XOF',
  'Africa/Casablanca': 'MAD',
  'Africa/Lagos':      'NGN',
  'Africa/Accra':      'GHS',
}

const RATES_CACHE_KEY = 'tijan_fx_rates'
const RATES_TTL_MS = 7 * 24 * 60 * 60 * 1000  // 7 jours

async function fetchRates() {
  // 1. Vérifier le cache local (TTL 7 jours)
  try {
    const cached = JSON.parse(localStorage.getItem(RATES_CACHE_KEY))
    if (cached && Date.now() - cached.ts < RATES_TTL_MS) return cached.rates
  } catch { /* cache invalide → on refetch */ }

  // 2. Fetch depuis l'API gratuite (open.er-api.com — pas de clé requise)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!res.ok) throw new Error(res.status)
    const data = await res.json()
    if (data.result !== 'success') throw new Error('api_error')
    const rates = {}
    for (const code of Object.keys(CURRENCY_META)) {
      if (data.rates[code]) rates[code] = data.rates[code]
    }
    // Persister en cache
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ ts: Date.now(), rates }))
    return rates
  } catch {
    // 3. Fallback hardcodé
    return FALLBACK_RATES
  }
}

function detectLocalCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TZ_TO_CURRENCY[tz] || null
  } catch { return null }
}

function formatUSD(n) {
  return n.toLocaleString('en-US') + ' $'
}

function formatLocal(n, currencyCode, rates) {
  const meta = CURRENCY_META[currencyCode]
  const rate = rates?.[currencyCode]
  if (!meta || !rate) return null
  const amount = Math.round(n * rate)
  return amount.toLocaleString(meta.locale) + ' ' + meta.symbol
}

const EXTRAS = [
  { id: 'review' },
  { id: 'edge' },
  { id: 'permis' },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLang()
  const [payLoading, setPayLoading] = useState(false)

  const [localCur, setLocalCur] = useState(null)  // code devise locale (XOF, MAD, NGN, GHS)
  const [fxRates, setFxRates] = useState(null)    // taux USD → devises locales

  const [showPromo, setShowPromo] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoResult, setPromoResult] = useState(null)
  const [promoError, setPromoError] = useState('')

  // Auto-fill from URL param ?promo=TIJAN-XXX-YYYY
  useState(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('promo')
    if (code) { setPromoCode(code.toUpperCase()); setShowPromo(true) }
  }, [])

  // Détection devise locale + fetch taux au montage
  useEffect(() => {
    const cur = detectLocalCurrency()
    setLocalCur(cur)
    if (cur) fetchRates().then(setFxRates)
  }, [])

  const validatePromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true); setPromoError(''); setPromoResult(null)
    try {
      const res = await fetch(`${BACKEND}/promo-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (data.valid) {
        setPromoResult(data)
      } else {
        setPromoError(data.reason || 'Code invalide')
      }
    } catch (e) {
      setPromoError('Erreur de connexion')
    } finally {
      setPromoLoading(false)
    }
  }

  const effectivePrice = promoResult ? promoResult.monthly_price : PRIX_TTC
  const formatPrice = formatUSD

  const handlePay = async () => {
    if (!user) { navigate('/login'); return }
    setPayLoading(true)
    try {
      const response = await fetch(`${BACKEND}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: 1,
          prix: effectivePrice,
          user_id: user.id,
          plan: 'projet_unique',
          promo_code: promoResult ? promoCode.trim().toUpperCase() : undefined,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        window.location.href = data.url
      } else {
        alert(t('pricing_err') + ': ' + (data.error || t('pricing_retry')))
      }
    } catch (e) {
      console.error('Payment error:', e)
      alert(t('pricing_no_server'))
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-block', background: '#FFF8E1', color: '#E65100',
            borderRadius: 20, padding: '5px 16px', fontSize: 11, fontWeight: 700,
            letterSpacing: 0.5, marginBottom: 16, border: '1px solid #FFE0B2',
          }}>
            VERSION BETA
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            Un abonnement. Projets illimités.
          </h1>
          <p style={{ fontSize: 15, color: '#666', maxWidth: 460, margin: '0 auto' }}>
            Dossier technique complet — structure, MEP, EDGE — pour 10x moins qu'un bureau d'études.
          </p>
        </div>

        {/* Carte prix unique */}
        <div style={{
          background: '#fff',
          border: `2px solid ${VERT}`,
          borderRadius: 16,
          padding: '36px 28px',
          marginBottom: 32,
          boxShadow: `0 0 0 6px ${VERT}18`,
        }}>
          {/* Prix */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {promoResult ? (
              <>
                <div style={{ fontSize: 22, color: '#999', textDecoration: 'line-through', lineHeight: 1 }}>
                  {formatUSD(PRIX_TTC)}
                </div>
                <div style={{ fontSize: 56, fontWeight: 800, color: VERT, marginBottom: 4, lineHeight: 1 }}>
                  {formatUSD(promoResult.monthly_price)}
                </div>
                {localCur && fxRates && (
                  <div style={{ fontSize: 18, color: '#888', marginTop: 4 }}>
                    ≈ {formatLocal(promoResult.monthly_price, localCur, fxRates)}
                  </div>
                )}
                <div style={{ fontSize: 13, color: VERT, fontWeight: 600, marginTop: 8 }}>
                  -{promoResult.discount_percent}% avec le code {promoCode}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 56, fontWeight: 800, color: NAVY, marginBottom: 4, lineHeight: 1 }}>
                  {formatUSD(PRIX_TTC)}
                </div>
                {localCur && fxRates && (
                  <div style={{ fontSize: 18, color: '#888', marginTop: 4 }}>
                    ≈ {formatLocal(PRIX_TTC, localCur, fxRates)}
                  </div>
                )}
              </>
            )}
            <div style={{ fontSize: 15, color: '#666', marginTop: 10 }}>
              TTC / mois — projets illimités
            </div>
          </div>

          {/* Comparaison BET */}
          <div style={{
            background: '#F0FFF4', borderRadius: 10, padding: '12px 16px',
            marginBottom: 24, textAlign: 'center',
            border: `1px solid ${VERT}30`,
          }}>
            <span style={{ fontSize: 13, color: '#333' }}>
              Un BET facture <strong>5 000 à 8 000 $</strong>{localCur && fxRates ? ` (${formatLocal(5000, localCur, fxRates)} – ${formatLocal(8000, localCur, fxRates)})` : ''} pour une seule étude.
            </span>
          </div>

          {/* Ce qui est inclus */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
              Inclus dans chaque projet
            </div>
            {[
              // Structure
              { icon: '📄', text: 'Note de calcul structure (EC2/EC8)' },
              { icon: '💰', text: 'BOQ Structure détaillé (7 lots)' },
              { icon: '🔀', text: 'Schémas structure (coffrage + ferraillage)' },
              { icon: '📝', text: 'DAO Lot Structure (CCTP + DPGF)' },
              // MEP
              { icon: '⚡', text: 'Note de calcul MEP complète' },
              { icon: '📊', text: 'BOQ MEP 3 gammes de prix' },
              { icon: '🔌', text: 'Schémas isométriques MEP' },
              { icon: '📝', text: 'DAO Lot MEP (CCTP + DPGF)' },
              // Finitions
              { icon: '🏠', text: 'BOQ Finitions (second œuvre)' },
              { icon: '📝', text: 'DAO Lot Finitions (CCTP + DPGF)' },
              // Synthèse
              { icon: '📋', text: 'Rapport exécutif maître d\'ouvrage' },
              { icon: '🌱', text: 'Certification EDGE IFC v3' },
              { icon: '📅', text: 'Planning d\'exécution (Gantt)' },
              { icon: '💸', text: 'Planning des dépenses (trésorerie)' },
              // Fiches
              { icon: '📑', text: 'Fiches techniques & Fournisseurs' },
              // Plans
              { icon: '🏗️', text: 'Plans BA (coffrage + ferraillage)', beta: true },
              { icon: '📐', text: 'Plans MEP tous niveaux', beta: true },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
                borderBottom: i < 16 ? '1px solid #F0F0F0' : 'none',
                fontSize: 14, color: item.comingSoon ? '#999' : '#333',
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.text}</span>
                {item.beta ? (
                  <span style={{ fontSize: 9, background: '#E3F2FD', color: '#1565C0', borderRadius: 8, padding: '1px 7px', fontWeight: 700 }}>En construction — gratuit</span>
                ) : (
                  <span style={{ color: VERT, fontWeight: 700, fontSize: 15 }}>✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Code promo */}
          <div style={{ marginBottom: 16 }}>
            {!showPromo ? (
              <button onClick={() => setShowPromo(true)} style={{
                background: 'none', border: 'none', color: VERT, fontSize: 13,
                cursor: 'pointer', fontWeight: 600, padding: 0,
              }}>
                J'ai un code partenaire
              </button>
            ) : (
              <div style={{ background: '#F7F8FA', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Code partenaire</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoResult(null) }}
                    placeholder="TIJAN-XXX-XXXX"
                    style={{
                      flex: 1, padding: '10px 12px', border: `1.5px solid ${promoError ? '#EF4444' : promoResult ? VERT : '#DDD'}`,
                      borderRadius: 8, fontSize: 14, fontFamily: 'monospace', letterSpacing: 1,
                    }}
                  />
                  <button
                    onClick={validatePromo}
                    disabled={promoLoading || !promoCode.trim()}
                    style={{
                      padding: '10px 18px', background: NAVY, color: '#fff', border: 'none',
                      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      opacity: promoLoading ? 0.7 : 1,
                    }}
                  >
                    {promoLoading ? '...' : 'Appliquer'}
                  </button>
                </div>
                {promoError && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>{promoError}</div>}
                {promoResult && (
                  <div style={{ color: VERT, fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                    Code valide — {promoResult.discount_percent}% de remise appliquée
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Récap prix */}
          <div style={{
            background: '#F7F8FA', borderRadius: 10,
            padding: '14px 16px', fontSize: 12, color: '#666', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: NAVY, fontSize: 14 }}>
              <span>Total TTC / mois</span><span>{formatUSD(effectivePrice)}</span>
            </div>
            {localCur && fxRates && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 12, marginTop: 4 }}>
                <span>Équivalent local</span><span>≈ {formatLocal(effectivePrice, localCur, fxRates)}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={payLoading}
            style={{
              width: '100%', background: VERT, color: '#fff',
              border: 'none', borderRadius: 10, padding: '16px 0',
              fontSize: 16, fontWeight: 700,
              cursor: payLoading ? 'not-allowed' : 'pointer',
              opacity: payLoading ? 0.7 : 1,
            }}
          >
            {payLoading ? t('pr_redirection') : `S'abonner — ${formatUSD(effectivePrice)}${localCur && fxRates ? ` (≈ ${formatLocal(effectivePrice, localCur, fxRates)})` : ''} /mois →`}
          </button>
          <div style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 10 }}>
            Paiement sécurisé via Wave · Orange Money · Free Money
          </div>
        </div>

        {/* Services premium */}
        <div style={{ background: NAVY, borderRadius: 14, padding: '28px 24px', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: VERT, marginBottom: 6 }}>
            {t('pr_extras_section')}
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>
            {t('pr_extras_titre')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {EXTRAS.map((extra, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 10,
                padding: '18px 16px', border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <div style={{
                  display: 'inline-block', background: VERT, color: NAVY,
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.6,
                  padding: '3px 8px', borderRadius: 999, marginBottom: 8, textTransform: 'uppercase',
                }}>
                  {t('bientot_dispo')}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                  {t(`pr_extra_${extra.id}`)}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  {t(`pr_extra_${extra.id}_desc`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#666' }}>
          {t('pr_enterprise_line')} <a href="mailto:malick@cepic.holdings?subject=Tijan Enterprise" style={{ color: VERT, fontWeight: 600, textDecoration: 'none' }}>malick@cepic.holdings</a>
        </div>

      </div>
    </div>
  )
}
