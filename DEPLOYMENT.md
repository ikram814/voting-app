# Guide de Déploiement GitHub - Voting App

## 🚀 Instructions étape par étape

### Étape 1 : Vérifier les fichiers sensibles

Avant de pousser sur GitHub, assurez-vous que :
- ✅ Aucun fichier `.env` n'est présent (ils sont ignorés par `.gitignore`)
- ✅ Aucun mot de passe n'est dans le code source
- ✅ Les `node_modules` sont ignorés

### Étape 2 : Initialiser Git

Ouvrez PowerShell dans le dossier du projet :

```powershell
# Naviguer vers le dossier
cd "C:\Users\mahai\Desktop\Voting App"

# Initialiser Git (si pas déjà fait)
git init

# Vérifier l'état
git status
```

### Étape 3 : Créer les fichiers .env.example (optionnel mais recommandé)

Créez manuellement ces fichiers pour documenter les variables nécessaires :

**Backend/.env.example** :
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password_here
DB_NAME=vote_app
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_SECRET=your_session_secret_here
```

**Frontend/voting-app/.env.example** :
```
VITE_API_URL=http://localhost:4000/api
```

### Étape 4 : Faire le premier commit

```powershell
# Ajouter tous les fichiers
git add .

# Vérifier ce qui sera commité
git status

# Faire le commit
git commit -m "Initial commit: Voting App with React and Node.js"
```

### Étape 5 : Créer le dépôt sur GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Cliquez sur le **"+"** en haut à droite → **"New repository"**
3. Remplissez :
   - **Name** : `voting-app` (ou votre choix)
   - **Description** : "Application de vote avec React et Node.js"
   - **Public** ou **Private**
   - **NE PAS** cocher "Add a README file" (vous en avez déjà un)
   - **NE PAS** cocher "Add .gitignore" (vous en avez déjà un)
4. Cliquez sur **"Create repository"**

### Étape 6 : Connecter et pousser vers GitHub

Après la création, GitHub affichera des instructions. Exécutez :

```powershell
# Ajouter le remote (remplacez USERNAME par votre nom d'utilisateur)
git remote add origin https://github.com/VOTRE_USERNAME/voting-app.git

# Renommer la branche en 'main'
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

**Si vous êtes demandé pour authentification :**

#### Option A : Personal Access Token (Recommandé)
1. Allez sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Cliquez "Generate new token"
3. Donnez un nom et sélectionnez les permissions : `repo`
4. Copiez le token généré
5. Utilisez-le comme mot de passe lors du `git push`

#### Option B : Utiliser SSH (Plus sécurisé)
```powershell
# Générer une clé SSH (si vous n'en avez pas)
ssh-keygen -t ed25519 -C "votre_email@example.com"

# Ajouter la clé à l'agent SSH
ssh-add ~/.ssh/id_ed25519

# Copier la clé publique
cat ~/.ssh/id_ed25519.pub
# Copiez le contenu et ajoutez-le sur GitHub : Settings → SSH and GPG keys → New SSH key

# Utiliser SSH pour le remote
git remote set-url origin git@github.com:VOTRE_USERNAME/voting-app.git
git push -u origin main
```

### Étape 7 : Vérifier

Allez sur votre dépôt GitHub et vérifiez que tous les fichiers sont présents.

## 📝 Commandes Git utiles

```powershell
# Voir l'état
git status

# Ajouter des fichiers
git add .
git add nom_fichier.js

# Commit
git commit -m "Description des changements"

# Pousser
git push

# Récupérer les modifications
git pull

# Voir l'historique
git log --oneline

# Créer une nouvelle branche
git checkout -b nom-branche

# Changer de branche
git checkout main
```

## 🔄 Mettre à jour le dépôt

Quand vous faites des modifications :

```powershell
git add .
git commit -m "Description des changements"
git push
```

## ⚠️ Important

- **NE JAMAIS** commiter les fichiers `.env` avec des mots de passe réels
- Utilisez `.env.example` pour documenter les variables nécessaires
- Les `node_modules` sont automatiquement ignorés
- Vérifiez toujours avec `git status` avant de commiter

## 🎉 C'est fait !

Votre projet est maintenant sur GitHub et vous pouvez :
- Partager le lien avec d'autres développeurs
- Collaborer avec d'autres personnes
- Utiliser GitHub Actions pour CI/CD
- Déployer sur des plateformes comme Vercel, Heroku, etc.

