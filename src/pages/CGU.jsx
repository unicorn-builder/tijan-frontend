// CGU.jsx — Conditions Générales d'Utilisation Tijan AI
import Header from '../components/Header'
import { useLang } from '../i18n.jsx'

const NAVY = '#1B2A4A'

export default function CGU() {
  const { lang } = useLang()
  const content = lang === 'en' ? EN : FR
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{content.title}</h1>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 28 }}>{content.version}</div>
        {content.sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{s.h}</h2>
            {s.p.map((para, j) => (
              <p key={j} style={{ fontSize: 14, color: '#333', lineHeight: 1.65, marginBottom: 10 }}>{para}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

const FR = {
  title: "Conditions Générales d'Utilisation",
  version: 'Version 1.0 — en vigueur au 14 avril 2026',
  sections: [
    {
      h: '1. Objet',
      p: [
        "Tijan AI (ci-après « Tijan », « nous » ou « la Plateforme ») est un bureau d'études automatisé qui génère des notes de calcul, des bordereaux quantitatifs (BOQ), des plans BA et MEP, et des rapports de conformité EDGE pour des projets de construction en Afrique de l'Ouest, sur la base des documents et paramètres fournis par l'Utilisateur.",
        "Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de la Plateforme, accessible via tijan.ai. En créant un compte, l'Utilisateur accepte sans réserve l'ensemble des CGU.",
      ],
    },
    {
      h: '2. Nature des livrables — Estimations d\'ingénierie',
      p: [
        "Les livrables fournis par Tijan sont des ESTIMATIONS d'ingénierie générées par algorithmes, avec une précision attendue de ±15%. Ils sont conformes aux Eurocodes 2 et 8 ainsi qu'aux DTU français, mais doivent OBLIGATOIREMENT être validés, annotés et signés par un ingénieur ou bureau d'études agréé dans le pays d'exécution avant toute utilisation pour la construction, le dépôt de permis ou l'engagement de dépenses.",
        "Tijan ne remplace pas l'expertise d'un ingénieur structure ou MEP agréé. L'Utilisateur reconnaît cette limite et s'engage à ne pas utiliser les livrables comme substituts à une étude d'exécution officielle.",
      ],
    },
    {
      h: '3. Responsabilité',
      p: [
        "Tijan fournit ses livrables « en l'état ». L'Utilisateur est seul responsable de la véracité des données d'entrée (plans, surfaces, hauteurs, etc.) et de l'interprétation des résultats.",
        "En aucun cas Tijan ne pourra être tenu responsable des dommages directs, indirects, matériels, financiers ou corporels résultant d'une utilisation des livrables sans validation par un professionnel agréé. Les livrables ne constituent ni un engagement contractuel de construction, ni une garantie de faisabilité, ni un dossier d'exécution officiel.",
      ],
    },
    {
      h: '4. Crédits et paiement',
      p: [
        "L'accès aux livrables se fait via des crédits prépayés. 1 crédit = 500 000 FCFA TTC (TVA 18% Sénégal incluse) = 1 projet complet. L'achat de 5 crédits donne droit à 1 crédit bonus offert, et ainsi de suite par tranche de 5.",
        "Les crédits n'expirent pas. En cas d'erreur du moteur de calcul empêchant la production d'un livrable, l'Utilisateur doit contacter le support (malick@cepic.holdings ou WhatsApp +221 75 550 00 00) pour traitement du remboursement par le back-office.",
        "Les paiements sont traités via PayDunya (Wave, Orange Money, Free Money, carte bancaire). Tijan ne stocke pas les données bancaires.",
      ],
    },
    {
      h: '5. Propriété intellectuelle',
      p: [
        "L'Utilisateur reste propriétaire des plans et documents qu'il téléverse. Il concède à Tijan une licence non exclusive d'utilisation aux seules fins de génération des livrables.",
        "Les livrables générés appartiennent à l'Utilisateur une fois le crédit consommé. Les algorithmes, moteurs de calcul, méthodologies et interfaces de Tijan restent la propriété exclusive de Tijan.",
      ],
    },
    {
      h: '6. Données personnelles',
      p: [
        "Tijan collecte nom, email et historique de projets dans le seul but de fournir le service. Les plans téléversés sont stockés de façon sécurisée (Supabase) et ne sont jamais partagés avec des tiers.",
        "L'Utilisateur peut demander la suppression de son compte et de ses données à tout moment en écrivant à malick@cepic.holdings.",
      ],
    },
    {
      h: '7. Support et réclamations',
      p: [
        "Pour toute question, réclamation ou demande de remboursement : malick@cepic.holdings — WhatsApp +221 75 550 00 00.",
      ],
    },
    {
      h: '8. Modification des CGU',
      p: [
        "Tijan se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés par email au moins 15 jours avant l'entrée en vigueur des modifications.",
      ],
    },
    {
      h: '9. Droit applicable',
      p: [
        "Les présentes CGU sont régies par le droit sénégalais. Tout litige sera soumis aux tribunaux compétents de Dakar.",
      ],
    },
  ],
}

const EN = {
  title: 'Terms of Service',
  version: 'Version 1.0 — effective April 14, 2026',
  sections: [
    {
      h: '1. Purpose',
      p: [
        "Tijan AI (hereinafter \"Tijan\", \"we\" or \"the Platform\") is an automated engineering bureau that generates structural calculations, bills of quantities (BOQ), RC and MEP drawings, and EDGE compliance reports for construction projects in West Africa, based on documents and parameters provided by the User.",
        "These Terms of Service (\"ToS\") govern access to and use of the Platform, accessible at tijan.ai. By creating an account, the User unconditionally accepts the entirety of these ToS.",
      ],
    },
    {
      h: '2. Nature of deliverables — Engineering estimates',
      p: [
        "Deliverables provided by Tijan are algorithmically generated ENGINEERING ESTIMATES, with an expected accuracy of ±15%. They comply with Eurocodes 2 and 8 as well as French DTU standards, but MUST be validated, annotated and signed by a certified engineer or engineering firm in the country of execution before any use for construction, permit filing, or expenditure commitment.",
        "Tijan does not replace the expertise of a certified structural or MEP engineer. The User acknowledges this limitation and agrees not to use the deliverables as substitutes for an official execution study.",
      ],
    },
    {
      h: '3. Liability',
      p: [
        "Tijan provides its deliverables \"as is\". The User is solely responsible for the accuracy of input data (plans, surfaces, heights, etc.) and for the interpretation of results.",
        "Under no circumstances shall Tijan be held liable for any direct, indirect, material, financial or bodily damages resulting from the use of deliverables without validation by a certified professional. Deliverables constitute neither a construction contractual commitment, nor a feasibility guarantee, nor an official execution dossier.",
      ],
    },
    {
      h: '4. Credits and payment',
      p: [
        "Access to deliverables is via prepaid credits. 1 credit = 500,000 FCFA incl. VAT (18% Senegal VAT included) = 1 complete project. Purchase of 5 credits grants 1 free bonus credit, and so on per bracket of 5.",
        "Credits do not expire. In case of calculation engine error preventing delivery, the User must contact support (malick@cepic.holdings or WhatsApp +221 75 550 00 00) for refund processing by the back-office.",
        "Payments are processed via PayDunya (Wave, Orange Money, Free Money, bank card). Tijan does not store banking data.",
      ],
    },
    {
      h: '5. Intellectual property',
      p: [
        "The User retains ownership of plans and documents uploaded. They grant Tijan a non-exclusive license for the sole purpose of generating deliverables.",
        "Generated deliverables belong to the User once the credit is consumed. Tijan's algorithms, calculation engines, methodologies and interfaces remain the exclusive property of Tijan.",
      ],
    },
    {
      h: '6. Personal data',
      p: [
        "Tijan collects name, email and project history solely to deliver the service. Uploaded plans are stored securely (Supabase) and are never shared with third parties.",
        "The User may request account and data deletion at any time by writing to malick@cepic.holdings.",
      ],
    },
    {
      h: '7. Support and claims',
      p: [
        "For any question, claim or refund request: malick@cepic.holdings — WhatsApp +221 75 550 00 00.",
      ],
    },
    {
      h: '8. Amendments',
      p: [
        "Tijan reserves the right to amend these ToS. Users will be notified by email at least 15 days before amendments take effect.",
      ],
    },
    {
      h: '9. Governing law',
      p: [
        "These ToS are governed by Senegalese law. Any dispute shall be submitted to the competent courts of Dakar.",
      ],
    },
  ],
}
