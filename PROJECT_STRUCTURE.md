# 📁 Structure du Projet - Système de Rooms Privées

## Vue d'ensemble générale

```
Voting App/
├── Backend/
│   ├── node_modules/
│   ├── migrations/
│   │   ├── add_image_to_polls.sql (existant)
│   │   └── create_rooms_tables.sql (NOUVEAU)
│   ├── routes/
│   │   ├── auth.js (existant)
│   │   ├── polls.js (existant)
│   │   ├── users.js (existant)
│   │   ├── rooms.js (NOUVEAU - 361 lignes)
│   │   ├── roomMembers.js (NOUVEAU - 115 lignes)
│   │   └── roomPolls.js (NOUVEAU - 216 lignes)
│   ├── authMiddleware.js (existant)
│   ├── db.js (existant)
│   ├── index.js (MODIFIÉ - +Socket.IO)
│   ├── package.json (MODIFIÉ - +socket.io)
│   └── .env
│
├── Frontend/voting-app/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx (MODIFIÉ - +bouton Rooms)
│   │   │   └── NotificationCenter.jsx (NOUVEAU - 68 lignes)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx (existant)
│   │   │   └── SocketContext.jsx (NOUVEAU - 117 lignes)
│   │   ├── pages/
│   │   │   └── Dashboard/
│   │   │       ├── Home.jsx (existant)
│   │   │       ├── CreatePoll.jsx (existant)
│   │   │       ├── MyPolls.jsx (existant)
│   │   │       ├── ViewPolls.jsx (existant)
│   │   │       ├── VotedPolls.jsx (existant)
│   │   │       ├── Profile.jsx (existant)
│   │   │       ├── PollStats.jsx (existant)
│   │   │       ├── Rooms.jsx (NOUVEAU - 204 lignes)
│   │   │       ├── RoomDetail.jsx (NOUVEAU - 446 lignes)
│   │   │       ├── RoomVoting.jsx (NOUVEAU - 362 lignes)
│   │   │       └── JoinRoom.jsx (NOUVEAU - 106 lignes)
│   │   │   └── Auth/
│   │   │       ├── LoginForm.jsx (existant)
│   │   │       └── SignUpForm.jsx (existant)
│   │   ├── api.js (MODIFIÉ - +roomsAPI)
│   │   ├── App.jsx (MODIFIÉ - +routes, SocketProvider)
│   │   ├── App.css (existant)
│   │   ├── index.css (existant)
│   │   ├── main.jsx (existant)
│   │   └── assets/
│   │       └── images/
│   ├── package.json (MODIFIÉ - +socket.io-client)
│   ├── vite.config.js (existant)
│   ├── tailwind.config.js (existant)
│   ├── postcss.config.js (existant)
│   ├── eslint.config.js (existant)
│   └── index.html (existant)
│
├── IMPLEMENTATION_SUMMARY.md (NOUVEAU)
├── ROOMS_IMPLEMENTATION_GUIDE.md (NOUVEAU)
├── SOCKET_IO_CONFIGURATION.md (NOUVEAU)
├── API_EXAMPLES.md (NOUVEAU)
├── TESTING_GUIDE.md (NOUVEAU)
├── README.md (existant)
├── GUIDE_GITHUB.md (existant)
├── SECURITE_ENV.md (existant)
├── DEPLOYMENT.md (existant)
└── AJOUTER_ENV.md (existant)
```

---

## 📊 Statistiques du Code

### Fichiers Créés

| Fichier | Type | Lignes | Description |
|---------|------|--------|-------------|
| routes/rooms.js | Backend | 185 | API CRUD rooms |
| routes/roomMembers.js | Backend | 115 | Gestion membres |
| routes/roomPolls.js | Backend | 216 | Gestion sondages room |
| migrations/create_rooms_tables.sql | SQL | 60 | Schéma BD |
| context/SocketContext.jsx | Frontend | 117 | Contexte Socket.IO |
| pages/Rooms.jsx | Frontend | 204 | Admin interface |
| pages/RoomDetail.jsx | Frontend | 446 | Room management |
| pages/RoomVoting.jsx | Frontend | 362 | Real-time voting |
| pages/JoinRoom.jsx | Frontend | 106 | User rooms access |
| components/NotificationCenter.jsx | Frontend | 68 | Notifications |
| **TOTAL** | | **1,879** | **Lignes ajoutées** |

### Fichiers Modifiés

| Fichier | Type | Changements |
|---------|------|-------------|
| Backend/index.js | Backend | +5 imports, +50 lignes Socket.IO |
| Backend/package.json | Backend | +socket.io |
| Frontend/api.js | Frontend | +13 méthodes roomsAPI |
| Frontend/App.jsx | Frontend | +3 routes, SocketProvider |
| Frontend/Sidebar.jsx | Frontend | +Users icon, Rooms button |
| Frontend/package.json | Frontend | +socket.io-client |

---

## 🔄 Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEUR ADMIN                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌──────────────────────┐   ┌──────────────────────┐
        │ Pages/Rooms.jsx      │   │ Pages/RoomDetail.jsx │
        │ (List & Create)      │   │ (Manage)             │
        └──────────┬───────────┘   └──────────┬───────────┘
                   │                          │
        ┌──────────▼──────────────────────────▼───────┐
        │          Context & API Layer                 │
        │  ┌─────────────────────────────────────────┐ │
        │  │ roomsAPI (create, add, remove, etc)     │ │
        │  └─────────────────────────────────────────┘ │
        └──────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────────────────────────────┐
        │        Backend REST API                     │
        │  ┌──────────────────────────────────────┐  │
        │  │ POST /rooms (create)                 │  │
        │  │ GET /rooms (list)                    │  │
        │  │ GET /rooms/:id (detail)              │  │
        │  │ PUT /rooms/:id (update)              │  │
        │  │ DELETE /rooms/:id (delete)           │  │
        │  │ POST /rooms/:id/members (add)        │  │
        │  │ DELETE /rooms/:id/members/:userId    │  │
        │  │ POST /rooms/:id/polls (create poll)  │  │
        │  │ GET /rooms/:id/polls (list polls)    │  │
        │  │ POST /rooms/:id/polls/:id/vote       │  │
        │  │ POST /rooms/:id/polls/:id/start      │  │
        │  │ POST /rooms/:id/polls/:id/close      │  │
        │  └──────────────────────────────────────┘  │
        └──────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────────────────────────────┐
        │          MySQL Database                     │
        │  ┌──────────────────────────────────────┐  │
        │  │ rooms                                │  │
        │  │ room_members                         │  │
        │  │ room_polls                           │  │
        │  │ polls (modifié)                      │  │
        │  │ users                                │  │
        │  │ votes                                │  │
        │  └──────────────────────────────────────┘  │
        └──────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    Socket.IO Real-Time Layer                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
        │  Client 1   │  │  Client 2   │  │  Client N   │
        │  (vote-cast)│  │  (join room)│  │  (listen)   │
        └─────────────┘  └─────────────┘  └─────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                ▼
                        ┌──────────────────┐
                        │ Socket.IO Server │
                        │ (index.js)       │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌──────────────────┐   ┌──────────────────┐
            │ Broadcast votes  │   │ Emit status      │
            │ to room          │   │ changes          │
            └──────────────────┘   └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    UTILISATEUR NORMAL (MEMBRE)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌──────────────────────┐   ┌──────────────────────┐
        │ Pages/JoinRoom.jsx   │   │ Pages/RoomVoting.jsx │
        │ (View rooms)         │   │ (Real-time voting)   │
        └──────────┬───────────┘   └──────────┬───────────┘
                   │                          │
        ┌──────────▼──────────────────────────▼───────────┐
        │ SocketContext.jsx + NotificationCenter.jsx      │
        │  ├─ join-poll-room                             │
        │  ├─ vote-cast                                  │
        │  └─ listen: vote-updated, poll-status-changed │
        └──────────┬──────────────────────────────────────┘
                   │
        ┌──────────▼──────────────────────────────────────┐
        │ Backend REST + Socket.IO Handlers               │
        │ (routes/roomPolls.js)                           │
        │ (Socket.IO events in index.js)                  │
        └──────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma Base de Données

```sql
┌──────────────────────────────────────────────────────────────┐
│                         users (existant)                      │
├──────────────────────────────────────────────────────────────┤
│ id (PK)      │ username      │ email        │ isAdmin        │
│ password     │ image         │ created_at   │                │
└──────────────────────────────────────────────────────────────┘
        │                               │
        │          ┌────────────────────┴──────────────────┐
        │          ▼                                       ▼
┌───────────────────────────┐              ┌───────────────────────────┐
│        rooms (NOUVEAU)    │              │  polls (modifié)          │
├───────────────────────────┤              ├───────────────────────────┤
│ id (PK)                   │              │ id (PK)                   │
│ name                      │              │ question                  │
│ description               │              │ option1, option2, etc     │
│ created_by (FK users)     │              │ created_by (FK users)     │
│ created_at                │              │ room_id (FK rooms) NEW    │
│ is_active                 │              │ end_time                  │
└────────┬──────────────────┘              │ image                     │
         │                                 └────────┬─────────────────┘
         │                                          │
         │                    ┌─────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────────────────────────┐
│   room_members (NOVO)            │
├──────────────────────────────────┤
│ id (PK)                          │
│ room_id (FK rooms)               │
│ user_id (FK users)               │
│ role (admin, member)             │
│ joined_at                        │
│ UNIQUE(room_id, user_id)        │
└──────────────────────────────────┘

         ▼
┌──────────────────────────────────┐
│   room_polls (NOVO)              │
├──────────────────────────────────┤
│ id (PK)                          │
│ poll_id (FK polls)               │
│ room_id (FK rooms)               │
│ duration_minutes                 │
│ status (pending, active, closed) │
│ started_at                       │
│ closed_at                        │
│ UNIQUE(poll_id, room_id)        │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│    votes (existant)              │
├──────────────────────────────────┤
│ id (PK)                          │
│ poll_id (FK polls)               │
│ user_id (FK users)               │
│ option_selected                  │
│ voted_at                         │
│ UNIQUE(poll_id, user_id)        │
└──────────────────────────────────┘
```

---

## 🎯 Points d'Entrée

### Administration
- **Route:** `/rooms`
- **Composant:** `Rooms.jsx`
- **Droits:** Admin uniquement
- **Actions:** Créer, voir, gérer rooms

### Gestion de Room
- **Route:** `/rooms/:roomId`
- **Composant:** `RoomDetail.jsx`
- **Droits:** Créateur de room
- **Actions:** Ajouter/retirer membres, créer/gérer sondages

### Vote en Temps Réel
- **Route:** `/rooms/:roomId/poll/:pollId`
- **Composant:** `RoomVoting.jsx`
- **Droits:** Membre de la room
- **Actions:** Voter, voir résultats live

### Accès Utilisateur
- **Route:** `/rooms`
- **Composant:** `JoinRoom.jsx` (alternative)
- **Droits:** Utilisateurs normaux
- **Actions:** Voir rooms, accéder aux sondages

---

## 🔌 Intégrations Socket.IO

```javascript
// Room Socket Format
const roomSocketId = `poll-${pollId}-room-${roomId}`;

// Exemple:
// pollId = 5
// roomId = 1
// roomSocketId = "poll-5-room-1"

// Events Flow
User votes → POST /rooms/:roomId/polls/:pollId/vote
          → Backend records vote
          → Backend emits: socket.emit('vote-cast', data)
          → All clients in room receive: 'vote-updated'
          → Frontend updates display in real-time
```

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=vote_app
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=nadaikramjwtsecretkey
```

**Frontend (vite.config.js / .env.local)**
```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🚀 Déploiement

### Structure de Production

```
/var/www/voting-app/
├── backend/
│   ├── node_modules/
│   ├── migrations/ (exécutées)
│   ├── routes/
│   ├── index.js
│   ├── package.json
│   └── .env (production)
│
└── frontend/
    ├── dist/ (build)
    ├── node_modules/
    ├── src/
    ├── package.json
    └── vite.config.js
```

### Services Systemd Recommandés

**backend.service**
```ini
[Unit]
Description=Voting App Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/voting-app/backend
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## 📝 Fichiers de Documentation

| Fichier | Contenu |
|---------|---------|
| IMPLEMENTATION_SUMMARY.md | Résumé des changements |
| ROOMS_IMPLEMENTATION_GUIDE.md | Guide d'utilisation |
| SOCKET_IO_CONFIGURATION.md | Configuration Socket.IO |
| API_EXAMPLES.md | Exemples d'API et cURL |
| TESTING_GUIDE.md | Guide complet de test |

---

**Structure complète et documentée! ✅**
