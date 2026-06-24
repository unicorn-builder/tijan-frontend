#!/bin/bash
# Apply all Tijan frontend fixes — run from ~/Downloads/tijan-frontend
cd "$(dirname "$0")"

echo "=== Applying fixes to tijan-frontend ==="

# 1. ChatTijan.jsx — add projectId prop + fix Supabase save
sed -i '' 's/export default function ChatTijan({ params, resultatsStructure, resultatsMep, savedChat, onUpdateChat, onModify, lang: langProp })/export default function ChatTijan({ params, resultatsStructure, resultatsMep, savedChat, onUpdateChat, onModify, projectId, lang: langProp })/' src/components/ChatTijan.jsx

sed -i '' "s/\/\/ Sauvegarder dans Supabase/\/\/ Sauvegarder dans Supabase (par projectId UUID)/" src/components/ChatTijan.jsx
sed -i '' "s/if (supabase \&\& user \&\& params?.nom) {/if (supabase \&\& user \&\& projectId) {/" src/components/ChatTijan.jsx
sed -i '' "s/.eq('nom', params.nom)/.eq('id', projectId)/" src/components/ChatTijan.jsx
sed -i '' "/.eq('user_id', user.id)/d" src/components/ChatTijan.jsx
sed -i '' "s/.then(() => {})/.then(({ error }) => { if (error) console.error('Chat save failed:', error.message) })/" src/components/ChatTijan.jsx

echo "✓ ChatTijan.jsx updated"

# 2. Results.jsx — pass projectId to ChatTijan
sed -i '' 's/<ChatTijan params={params} resultatsStructure/<ChatTijan params={params} projectId={projectId} resultatsStructure/' src/pages/Results.jsx

echo "✓ Results.jsx — projectId prop added"

echo ""
echo "=== Done! Now run: ==="
echo "git add src/components/ChatTijan.jsx src/pages/Results.jsx"
echo 'git commit -m "fix: chat persistence uses projectId UUID"'
echo "git push"
