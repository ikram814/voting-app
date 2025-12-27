# 📝 Comment ajouter les fichiers .env sur GitHub

## ✅ Étape 1 : Vérifier le contenu de vos .env

**⚠️ IMPORTANT** : Avant d'ajouter vos fichiers `.env`, vérifiez qu'ils ne contiennent pas de vrais mots de passe ou clés secrètes sensibles.

## 📋 Étape 2 : Ajouter les fichiers .env

Exécutez ces commandes dans PowerShell :

```powershell
# Ajouter le fichier .env du Backend
git add Backend/.env

# Ajouter le fichier .env du Frontend
git add Frontend/voting-app/.env

# Vérifier ce qui sera commité
git status

# Faire le commit
git commit -m "Add .env files"

# Pousser vers GitHub
git push
```

## 🔒 Alternative Sûre : Utiliser .env.example

Si vos fichiers `.env` contiennent de vraies informations sensibles, créez plutôt des fichiers `.env.example` avec des valeurs d'exemple :

**Backend/.env.example** :
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=votre_mot_de_passe
DB_NAME=vote_app
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=votre_jwt_secret
SESSION_SECRET=votre_session_secret
```

**Frontend/voting-app/.env.example** :
```env
VITE_API_URL=http://localhost:4000/api
```

Puis ajoutez seulement les fichiers `.env.example` :
```powershell
git add Backend/.env.example
git add Frontend/voting-app/.env.example
git commit -m "Add .env.example files"
git push
```

## ⚠️ Rappel de Sécurité

- Si votre dépôt est **Public**, n'ajoutez JAMAIS de vrais mots de passe
- Utilisez des valeurs d'exemple ou placez votre dépôt en **Private**
- Consultez `SECURITE_ENV.md` pour plus d'informations




