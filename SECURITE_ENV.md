# ⚠️ Avertissement de Sécurité - Fichiers .env

## ⚠️ ATTENTION IMPORTANTE

Vous avez choisi d'inclure les fichiers `.env` dans votre dépôt GitHub. Cela signifie que **TOUS vos mots de passe, clés secrètes et informations sensibles seront visibles publiquement** sur GitHub.

## 🔒 Recommandations de Sécurité

### Option 1 : Utiliser des valeurs d'exemple (RECOMMANDÉ)
Avant de commiter vos fichiers `.env`, remplacez les vraies valeurs par des exemples :

**Backend/.env** :
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=exemple_password
DB_NAME=vote_app
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=exemple_jwt_secret_key
SESSION_SECRET=exemple_session_secret
```

**Frontend/voting-app/.env** :
```env
VITE_API_URL=http://localhost:4000/api
```

### Option 2 : Utiliser GitHub Secrets (Pour déploiement)
Si vous déployez sur une plateforme (Vercel, Heroku, etc.), utilisez les variables d'environnement de la plateforme au lieu de commiter les `.env`.

### Option 3 : Dépôt privé
Assurez-vous que votre dépôt GitHub est en mode **Private** si vous incluez des informations sensibles.

## ✅ Vérifications avant de commiter

- [ ] Aucun vrai mot de passe de base de données
- [ ] Aucune vraie clé secrète (JWT_SECRET, SESSION_SECRET)
- [ ] Aucune information personnelle sensible
- [ ] Dépôt GitHub en mode Private (si informations sensibles)

## 🔄 Si vous changez d'avis

Pour ignorer à nouveau les fichiers `.env`, modifiez `.gitignore` et décommentez les lignes :
```
.env
.env.local
```

Puis supprimez les fichiers `.env` de l'historique Git :
```powershell
git rm --cached Backend/.env
git rm --cached Frontend/voting-app/.env
git commit -m "Remove .env files from repository"
```




