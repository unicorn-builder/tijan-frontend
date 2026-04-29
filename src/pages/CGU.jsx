import Header from '../components/Header'
const NAVY = '#1B2A4A'
const VERT = '#43A956'

export default function CGU() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Conditions Générales d'Utilisation</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 32 }}>Dernière mise à jour : 22 avril 2026</p>

        {[
          { titre: "1. Présentation de la plateforme", contenu: "Tijan AI est une plateforme SaaS d'ingénierie assistée par intelligence artificielle, éditée par CEPIC Holdings, Dakar, Sénégal. La plateforme génère automatiquement des études structurelles et MEP (Mécanique, Électricité, Plomberie) pour les projets de construction, sur la base des plans architecturaux et paramètres fournis par l'utilisateur." },
          { titre: "2. Acceptation des conditions", contenu: "L'utilisation de la plateforme tijan.ai implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme." },
          { titre: "3. Nature des outputs — Limitation de responsabilité", contenu: "Les études, calculs, plans, BOQ et documents générés par Tijan AI sont des documents d'aide à la décision produits par intelligence artificielle. Ils ne constituent pas des études d'ingénierie certifiées et ne peuvent pas remplacer la signature et le visa d'un ingénieur agréé pour les dossiers soumis aux autorités compétentes. CEPIC Holdings décline toute responsabilité en cas d'utilisation des outputs sans validation préalable par un ingénieur certifié. L'utilisateur est seul responsable de l'utilisation qui est faite des documents générés." },
          { titre: "4. Précision des calculs", contenu: "Les calculs sont réalisés selon les Eurocodes EC2/EC8 et les données de marché africaines disponibles. La précision des estimations budgétaires est de ±15%. Tijan AI ne garantit pas l'exactitude absolue des résultats et recommande une validation par un bureau d'études agréé pour tout projet soumis à permis de construire ou financement bancaire." },
          { titre: "5. Abonnement et paiement", contenu: "L'abonnement mensuel est facturé 250 000 FCFA TTC par mois, donnant droit à 3 études complètes par mois. Le paiement est effectué en début de période via les moyens de paiement disponibles (Wave, Orange Money, Free Money, carte bancaire). L'abonnement est sans engagement et peut être résilié à tout moment. Aucun remboursement n'est effectué pour les études déjà générées." },
          { titre: "6. Données personnelles", contenu: "Tijan AI collecte les données nécessaires au fonctionnement du service : email, nom, données de projet. Ces données sont stockées de manière sécurisée sur des serveurs Supabase et ne sont jamais vendues à des tiers. L'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données en contactant malicktall@gmail.com." },
          { titre: "7. Propriété intellectuelle", contenu: "Les documents générés par Tijan AI appartiennent à l'utilisateur qui les a commandés. La plateforme, ses algorithmes, son moteur de calcul et ses interfaces sont la propriété exclusive de CEPIC Holdings et sont protégés par le droit de la propriété intellectuelle." },
          { titre: "8. Disponibilité du service", contenu: "Tijan AI s'engage à maintenir la plateforme disponible 24h/24, 7j/7, sous réserve de maintenances programmées ou d'incidents techniques. En cas d'indisponibilité prolongée, les crédits non utilisés sont reportés au mois suivant." },
          { titre: "9. Résiliation", contenu: "L'utilisateur peut résilier son abonnement à tout moment depuis son espace client ou en contactant le support. CEPIC Holdings se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes CGU." },
          { titre: "10. Droit applicable", contenu: "Les présentes CGU sont soumises au droit sénégalais. Tout litige sera soumis à la compétence exclusive des tribunaux de Dakar, Sénégal." },
          { titre: "11. Contact", contenu: "Pour toute question relative aux présentes CGU : malicktall@gmail.com — CEPIC Holdings, Dakar, Sénégal." },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{section.titre}</h2>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.8 }}>{section.contenu}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
