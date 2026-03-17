# Tijan AI — Frontend

## Déploiement en 5 minutes

### 1. Prérequis
- Node.js 18+ installé (`node -v`)
- Compte GitHub (gratuit)
- Compte Vercel (gratuit, login avec GitHub)

### 2. Créer le repo GitHub
```bash
cd ~/Downloads/tijan-frontend
git init
git add -A
git commit -m "Tijan AI frontend v1"
# Sur github.com → New repository → "tijan-frontend" → Create
git remote add origin https://github.com/TON_USERNAME/tijan-frontend.git
git push -u origin main
```

### 3. Déployer sur Vercel
1. Aller sur vercel.com → New Project
2. Import le repo `tijan-frontend`
3. Framework: Vite (détecté automatiquement)
4. Deploy → URL prête en 1 minute

### 4. Test local
```bash
npm install
npm run dev
# Ouvre http://localhost:5173
```

## Architecture
- `src/pages/Landing.jsx` — Page d'accueil
- `src/pages/NewProject.jsx` — Upload + formulaire
- `src/pages/Results.jsx` — 9 onglets résultats
- `src/constants.js` — Config BACKEND_URL + helpers

## Backend
URL: https://build-ai-backend.onrender.com
Modifier dans src/constants.js si changement d'URL.
