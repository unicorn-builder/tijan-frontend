// translations.js — Tijan AI
// Toutes les strings FR/EN du frontend

export const T = {
  fr: {
    // Navigation
    home: 'Accueil',
    back: '← Accueil',
    beta: 'Version bêta',
    engineering: 'Engineering Intelligence for Africa',

    // NewProject
    new_project: 'Nouveau projet',
    new_project_sub: 'Nommez votre projet et déposez vos plans',
    project_name: 'Nom du projet',
    project_name_ph: 'ex: Résidence Sakho',
    city: 'Ville',
    city_ph: 'Dakar',
    terrain_surface: 'Surface du terrain (m²)',
    terrain_surface_ph: 'ex: 1400',
    terrain_note: "L'emprise bâtie sera estimée à 70% si non détectée depuis les plans.",
    plans: 'Plans architecturaux',
    plans_required: '*',
    plans_drop: 'Déposez vos plans ou cliquez pour choisir',
    plans_formats: 'PDF, DWG, DXF',
    plans_change: 'Cliquez pour changer',
    soil_study: 'Étude de sol',
    soil_optional: '(optionnel)',
    soil_add: 'Ajouter une étude de sol (PDF)',
    launch: "Lancer l'analyse",
    launch_note: "Si vos plans ne sont pas lisibles, l'analyse sera lancée avec des paramètres standards.",
    reading_plans: 'Lecture des plans...',
    analysing: 'Tijan analyse votre projet...',
    error_name: 'Veuillez nommer votre projet.',
    error_city: 'Veuillez indiquer la ville.',
    error_file: 'Veuillez uploader vos plans.',
    error_terrain: 'Veuillez indiquer la surface du terrain.',
    error_calc: 'Erreur lors du calcul.',
    error_conn: 'Erreur de connexion.',
    retry: 'Réessayer',

    // Tabs
    tab_structure: 'Note de calcul structure',
    tab_boq_structure: 'BOQ Structure',
    tab_note_mep: 'Note de calcul MEP',
    tab_boq_mep: 'BOQ MEP',
    tab_edge: 'Conformité EDGE',
    tab_rapport: 'Rapport exécutif',
    tab_fiches_structure: 'Fiches techniques structure',
    tab_fiches_mep: 'Fiches techniques MEP',
    tab_chat: 'Discuter avec Tijan',
    tab_plans_ba: 'Plans BA',
    tab_plans_mep: 'Plans MEP',
    soon: 'Bientôt',

    // Results — structure
    project: 'PROJET',
    location: 'LOCALISATION',
    built_surface: 'SURFACE BÂTIE',
    hab_surface: 'SURFACE HABITABLE',
    concrete_steel: 'BÉTON / ACIER',
    auto_selected: 'Auto-sélectionné',
    footprint: 'Emprise',
    levels: 'niveaux',
    ec2_compliance: 'CONFORMITÉ EC2',
    compliant: 'Conforme',
    to_check: 'À vérifier',
    load_descent: 'Descente de charges — Poteaux (EC2/EC8)',
    foundations: 'Fondations',
    attention: "Points d'attention",
    recommendations: 'Recommandations',
    diameter: 'Diamètre',
    length: 'Longueur',
    reinforcement: 'Armatures',
    nb_piles: 'Nb pieux',

    // BOQ Structure
    struct_cost_low: 'COÛT STRUCTURE (BAS)',
    struct_cost_high: 'COÛT STRUCTURE (HAUT)',
    cost_per_m2: 'COÛT / m² BÂTI',
    struct_only: 'Structure seule (hors MEP, finitions, VRD)',
    estimate_note: 'Estimation ±15% — BOQ détaillé disponible en téléchargement.',

    // MEP
    installed_power: 'PUISSANCE INSTALLÉE',
    transformer: 'TRANSFORMATEUR',
    daily_water: 'BESOIN EAU/JOUR',
    cooling: 'PUISSANCE FRIGO',
    elevators: 'ASCENSEURS',
    elec_title: 'Électricité (NF C 15-100)',
    plumb_title: 'Plomberie (DTU 60.11)',
    cvc_title: 'CVC (EN 12831)',
    fire_title: 'Sécurité incendie (IT 246)',
    indicator: 'Indicateur',
    value: 'Valeur',

    // BOQ MEP
    basic: 'BASIC',
    high_end: 'HIGH-END',
    luxury: 'LUXURY',
    mep_cost_m2: 'COÛT MEP / m² BÂTI',
    recommendation: 'Recommandation',
    detail_pdf: 'Détail complet disponible dans le PDF',

    // EDGE
    edge_verdict: 'VERDICT EDGE BASIQUE',
    edge_certifiable: '✓ Certifiable EDGE Basique',
    edge_not_certifiable: '✗ Non certifiable',
    energy_saving: 'ÉCONOMIE ÉNERGIE',
    water_saving: 'ÉCONOMIE EAU',
    mat_saving: 'ÉCONOMIE MATÉRIAUX',
    edge_threshold: 'Seuil EDGE : 20%',
    edge_note: "Certification IFC/World Bank — 20% d'économie requis sur les 3 piliers",
    optimize_btn: '⚡ Optimiser vers certification EDGE',
    optimizing: 'Optimisation en cours...',
    optimize_note: 'Active LED, isolation, WC économiques et robinetterie éco sur ce projet',
    optimized_title: 'Projet optimisé EDGE',
    surcost: "Surcoût d'optimisation",
    back_original: 'Revenir au projet original',
    action_plan: "Plan d'action — Optimisation vers certification",
    conformity_cost: 'Coût de mise en conformité estimé',
    roi: 'ROI',
    energy_measures: 'Mesures énergie',
    water_measures: 'Mesures eau',
    mat_measures: 'Mesures matériaux',

    // Rapport exécutif
    exec_report_title: 'Rapport de synthèse exécutif',
    global_budget: 'Budget global estimé',
    engineer_note: 'Note de synthèse ingénieur',
    strengths: 'Points forts',
    exec_disclaimer: "Ce rapport est destiné au maître d'ouvrage. Téléchargez le PDF complet ci-dessous.",

    // Chat
    chat_active: 'Tijan AI — Ingénieur virtuel actif sur',
    context_loaded: 'Contexte projet chargé ✓',
    chat_placeholder: 'Posez une question sur votre projet... (Entrée pour envoyer)',
    chat_disclaimer: 'Tijan AI est un assistant d\'ingénierie ±15%. Validez avec un BET agréé avant travaux.',

    // Download
    download_pdf: '↓ Télécharger le PDF',
    generating: 'Génération en cours...',

    // Misc
    no_result: 'Aucun résultat disponible.',
    new_project_btn: 'Nouveau projet',
    retry_btn: 'Réessayer',
    mep_unavailable: 'Données MEP non disponibles.',
    soon_label: 'Disponible prochainement',
  },

  en: {
    // Navigation
    home: 'Home',
    back: '← Home',
    beta: 'Beta version',
    engineering: 'Engineering Intelligence for Africa',

    // NewProject
    new_project: 'New project',
    new_project_sub: 'Name your project and upload your plans',
    project_name: 'Project name',
    project_name_ph: 'e.g. Sakho Residence',
    city: 'City',
    city_ph: 'Lagos',
    terrain_surface: 'Land area (m²)',
    terrain_surface_ph: 'e.g. 1400',
    terrain_note: 'Built footprint will be estimated at 70% if not detected from plans.',
    plans: 'Architectural plans',
    plans_required: '*',
    plans_drop: 'Drop your plans here or click to select',
    plans_formats: 'PDF, DWG, DXF',
    plans_change: 'Click to change',
    soil_study: 'Soil study',
    soil_optional: '(optional)',
    soil_add: 'Add a soil investigation report (PDF)',
    launch: 'Run analysis',
    launch_note: 'If your plans are not readable, the analysis will run with standard parameters.',
    reading_plans: 'Reading plans...',
    analysing: 'Tijan is analysing your project...',
    error_name: 'Please name your project.',
    error_city: 'Please enter the city.',
    error_file: 'Please upload your plans.',
    error_terrain: 'Please enter the land area.',
    error_calc: 'Calculation error.',
    error_conn: 'Connection error.',
    retry: 'Try again',

    // Tabs
    tab_structure: 'Structural calculation note',
    tab_boq_structure: 'Structure BOQ',
    tab_note_mep: 'MEP calculation note',
    tab_boq_mep: 'MEP BOQ',
    tab_edge: 'EDGE Compliance',
    tab_rapport: 'Executive report',
    tab_fiches_structure: 'Structure data sheets',
    tab_fiches_mep: 'MEP data sheets',
    tab_chat: 'Chat with Tijan',
    tab_plans_ba: 'RC plans',
    tab_plans_mep: 'MEP plans',
    soon: 'Soon',

    // Results — structure
    project: 'PROJECT',
    location: 'LOCATION',
    built_surface: 'BUILT AREA',
    hab_surface: 'HABITABLE AREA',
    concrete_steel: 'CONCRETE / STEEL',
    auto_selected: 'Auto-selected',
    footprint: 'Footprint',
    levels: 'levels',
    ec2_compliance: 'EC2 COMPLIANCE',
    compliant: 'Compliant',
    to_check: 'To verify',
    load_descent: 'Load descent — Columns (EC2/EC8)',
    foundations: 'Foundations',
    attention: 'Points of attention',
    recommendations: 'Recommendations',
    diameter: 'Diameter',
    length: 'Length',
    reinforcement: 'Reinforcement',
    nb_piles: 'No. of piles',

    // BOQ Structure
    struct_cost_low: 'STRUCTURE COST (LOW)',
    struct_cost_high: 'STRUCTURE COST (HIGH)',
    cost_per_m2: 'COST / m² BUILT',
    struct_only: 'Structure only (excl. MEP, finishes, utilities)',
    estimate_note: 'Estimate ±15% — detailed BOQ available for download.',

    // MEP
    installed_power: 'INSTALLED POWER',
    transformer: 'TRANSFORMER',
    daily_water: 'DAILY WATER NEED',
    cooling: 'COOLING CAPACITY',
    elevators: 'ELEVATORS',
    elec_title: 'Electrical (NF C 15-100)',
    plumb_title: 'Plumbing (DTU 60.11)',
    cvc_title: 'HVAC (EN 12831)',
    fire_title: 'Fire safety (IT 246)',
    indicator: 'Indicator',
    value: 'Value',

    // BOQ MEP
    basic: 'BASIC',
    high_end: 'HIGH-END',
    luxury: 'LUXURY',
    mep_cost_m2: 'MEP COST / m² BUILT',
    recommendation: 'Recommendation',
    detail_pdf: 'Full breakdown available in the PDF',

    // EDGE
    edge_verdict: 'EDGE BASIC VERDICT',
    edge_certifiable: '✓ EDGE Basic Certifiable',
    edge_not_certifiable: '✗ Not certifiable',
    energy_saving: 'ENERGY SAVING',
    water_saving: 'WATER SAVING',
    mat_saving: 'MATERIALS SAVING',
    edge_threshold: 'EDGE threshold: 20%',
    edge_note: 'IFC/World Bank certification — 20% savings required on all 3 pillars',
    optimize_btn: '⚡ Optimise for EDGE certification',
    optimizing: 'Optimising...',
    optimize_note: 'Activates LED lighting, insulation, water-efficient fixtures and fittings',
    optimized_title: 'EDGE-optimised project',
    surcost: 'Optimisation cost',
    back_original: 'Revert to original project',
    action_plan: 'Action plan — Optimisation towards certification',
    conformity_cost: 'Estimated compliance cost',
    roi: 'ROI',
    energy_measures: 'Energy measures',
    water_measures: 'Water measures',
    mat_measures: 'Materials measures',

    // Rapport exécutif
    exec_report_title: 'Executive summary report',
    global_budget: 'Global budget estimate',
    engineer_note: "Engineer's summary note",
    strengths: 'Key strengths',
    exec_disclaimer: 'This report is for the project owner. Download the full PDF below.',

    // Chat
    chat_active: 'Tijan AI — Virtual engineer active on',
    context_loaded: 'Project context loaded ✓',
    chat_placeholder: 'Ask a question about your project... (Enter to send)',
    chat_disclaimer: 'Tijan AI is an engineering assistant ±15%. Validate with a licensed engineer before construction.',

    // Download
    download_pdf: '↓ Download PDF',
    generating: 'Generating...',

    // Misc
    no_result: 'No results available.',
    new_project_btn: 'New project',
    retry_btn: 'Try again',
    mep_unavailable: 'MEP data unavailable.',
    soon_label: 'Coming soon',
  }
}

export function useTranslation(lang = 'fr') {
  return T[lang] || T['fr']
}


// Hook useLang — compatible avec le bouton FR/EN du Header

export function useLang() {
  const [lang, setLang] = useState(localStorage.getItem('tijan_lang') || 'fr')
  useEffect(() => {
    const handler = () => setLang(localStorage.getItem('tijan_lang') || 'fr')
    window.addEventListener('tijan_lang_change', handler)
    return () => window.removeEventListener('tijan_lang_change', handler)
  }, [])
  const t = (key) => T[lang]?.[key] || T['fr']?.[key] || key
  return { lang, t }
}
