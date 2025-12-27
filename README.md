# Voting App - Application de Vote

Une application web complète de vote/sondage avec authentification, création de sondages, et statistiques en temps réel.

## 📋 Structure du Projet

```
Voting App/
├── Backend/          # API Node.js/Express
│   ├── routes/       # Routes API
│   ├── migrations/   # Migrations SQL
│   └── index.js      # Point d'entrée serveur
└── Frontend/         # Application React/Vite
    └── voting-app/   # Application frontend
```

## 🚀 Déploiement sur GitHub

### Étape 1 : Préparer le projet

1. **Vérifier que tous les fichiers sensibles sont ignorés**
   - Le fichier `.gitignore` à la racine ignore déjà les fichiers sensibles
   - Vérifiez qu'il n'y a pas de fichiers `.env` avec des mots de passe

### Étape 2 : Initialiser Git (si pas déjà fait)

Ouvrez PowerShell ou Terminal dans le dossier du projet et exécutez :

```powershell
# Naviguer vers le dossier du projet
cd "C:\Users\mahai\Desktop\Voting App"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "Initial commit: Voting App"
```

### Étape 3 : Créer un dépôt sur GitHub

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur le bouton **"+"** en haut à droite → **"New repository"**
3. Remplissez les informations :
   - **Repository name** : `voting-app` (ou le nom de votre choix)
   - **Description** : "Application de vote avec React et Node.js"
   - **Visibilité** : Public ou Private (selon votre préférence)
   - **NE PAS** cocher "Initialize with README" (vous avez déjà un README)
4. Cliquez sur **"Create repository"**

### Étape 4 : Connecter le projet local à GitHub

Après avoir créé le dépôt, GitHub vous donnera des commandes. Exécutez :

```powershell
# Ajouter le remote GitHub (remplacez USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/USERNAME/voting-app.git

# Renommer la branche principale en 'main' (si nécessaire)
git branch -M main

# Pousser le code vers GitHub
git push -u origin main
```

**Note** : Si vous utilisez HTTPS, GitHub vous demandera vos identifiants. Vous pouvez :
- Utiliser un **Personal Access Token** (recommandé)
- Ou utiliser **SSH** (plus sécurisé)

### Étape 5 : Configuration des secrets (pour le déploiement)

Si vous déployez l'application (Heroku, Vercel, etc.), vous devrez configurer les variables d'environnement :

#### Backend (.env)
- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `PORT`
- `JWT_SECRET`
- `SESSION_SECRET`
- `CLIENT_ORIGIN`

#### Frontend (.env)
- `VITE_API_URL`

## 📦 Installation et Développement Local

### Prérequis
- Node.js (v18 ou supérieur)
- MySQL
- npm ou yarn

### Backend

```bash
cd Backend

# Installer les dépendances
npm install

# Créer le fichier .env (copier depuis .env.example)
# Windows PowerShell:
Copy-Item .env.example .env
# Puis éditer .env avec vos informations

# Démarrer le serveur
npm run dev
```

Le serveur backend sera disponible sur `http://localhost:4000`

### Frontend

```bash
cd Frontend/voting-app

# Installer les dépendances
npm install

# Créer le fichier .env (copier depuis .env.example)
# Windows PowerShell:
Copy-Item .env.example .env
# Puis éditer .env avec l'URL de l'API

# Démarrer le serveur de développement
npm run dev
```

L'application frontend sera disponible sur `http://localhost:5173`

## 🗄️ Base de Données

1. Créer une base de données MySQL nommée `vote_app`
2. Exécuter les migrations SQL dans `Backend/migrations/`
3. Configurer les variables d'environnement dans `Backend/.env`

## 🛠️ Technologies Utilisées

### Backend
- Node.js
- Express.js
- MySQL2
- JWT (JSON Web Tokens)
- bcrypt
- express-session

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React (icônes)

## 📝 Commandes Utiles Git

```powershell
# Voir l'état des fichiers
git status

# Ajouter des fichiers
git add .

# Faire un commit
git commit -m "Description des changements"

# Pousser vers GitHub
git push

# Récupérer les dernières modifications
git pull

# Voir l'historique
git log
```

## 🔒 Sécurité

- ⚠️ **NE JAMAIS** commiter les fichiers `.env` contenant des mots de passe
- Utilisez des secrets forts pour `JWT_SECRET` et `SESSION_SECRET`
- En production, utilisez HTTPS
- Configurez correctement CORS pour votre domaine

## 📄 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

Votre nom

---

**Note** : N'oubliez pas de mettre à jour ce README avec vos informations personnelles et les détails spécifiques de votre projet.



