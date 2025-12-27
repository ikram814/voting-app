# 🎯 Système de Rooms Privées - Guide d'Implémentation

## 📋 Vue d'ensemble

Ce guide détaille l'implémentation complète du système de **rooms privées** pour votre application de vote. Cette fonctionnalité permet aux admins de créer des espaces de vote privés avec contrôle d'accès et mises à jour en temps réel via Socket.IO.

---

## ✅ Étapes d'Installation

### 1️⃣ **Configuration de la Base de Données**

Exécutez la migration SQL pour créer les tables nécessaires:

```bash
# Dans votre client MySQL ou PhpMyAdmin
mysql -u root -p vote_app < Backend/migrations/create_rooms_tables.sql
```

**Tables créées:**
- `rooms` - Stockage des rooms privées
- `room_members` - Gestion des membres et leurs rôles
- `room_polls` - Configuration spécifique aux sondages de room

### 2️⃣ **Dépendances Backend**

Les dépendances Socket.IO ont déjà été installées:

```bash
cd Backend
npm install socket.io
```

### 3️⃣ **Dépendances Frontend**

Les dépendances ont été installées:

```bash
cd Frontend/voting-app
npm install socket.io-client
```

### 4️⃣ **Vérifier les Fichiers Modifiés/Créés**

**Backend:**
- ✅ `index.js` - Configuration Socket.IO
- ✅ `routes/rooms.js` - API CRUD pour les rooms
- ✅ `routes/roomMembers.js` - Gestion des membres
- ✅ `routes/roomPolls.js` - Gestion des sondages de room
- ✅ `migrations/create_rooms_tables.sql` - Schéma BD

**Frontend:**
- ✅ `context/SocketContext.jsx` - Contexte Socket.IO
- ✅ `api.js` - Endpoints API pour les rooms
- ✅ `pages/Dashboard/Rooms.jsx` - Page d'administration des rooms
- ✅ `pages/Dashboard/RoomDetail.jsx` - Détails et gestion d'une room
- ✅ `pages/Dashboard/RoomVoting.jsx` - Interface de vote en temps réel
- ✅ `pages/Dashboard/JoinRoom.jsx` - Accès aux rooms pour utilisateurs
- ✅ `components/NotificationCenter.jsx` - Notifications en temps réel
- ✅ `components/Sidebar.jsx` - Bouton "Rooms" ajouté
- ✅ `App.jsx` - Routes et SocketProvider intégrés

---

## 🚀 Utilisation

### Pour les Admins

1. **Créer une Room:**
   - Cliquez sur "Rooms" dans le sidebar
   - Cliquez sur "Create Room"
   - Entrez le nom et la description
   - Validez

2. **Gérer une Room:**
   - Depuis la page Rooms, cliquez sur "Manage Room"
   - **Ajouter des membres:**
     - Cliquez sur le bouton "+"
     - Sélectionnez un utilisateur existant
   - **Retirer des membres:**
     - Cliquez sur l'icône poubelle

3. **Créer un Sondage dans une Room:**
   - Depuis la page de détail de la room
   - Cliquez sur "Create Poll"
   - Remplissez les détails:
     - Question
     - Options (min. 2)
     - Durée en minutes
   - Validez

4. **Gérer un Sondage:**
   - **Démarrer:** Cliquez sur "Start" (status: pending → active)
   - **Clôturer:** Cliquez sur "Close" (status: active → closed)

### Pour les Utilisateurs

1. **Accéder aux Rooms:**
   - Cliquez sur "Rooms" dans le sidebar
   - Voyez toutes les rooms auxquelles vous avez accès

2. **Voter:**
   - Sélectionnez une room
   - Cliquez sur un sondage
   - Choisissez une option et votez
   - Votre vote est enregistré immédiatement

3. **Voir les Résultats en Temps Réel:**
   - Les pourcentages se mettent à jour en direct
   - Indicateur vert de mise à jour temps réel

---

## 🔌 Architecture Socket.IO

### Events Implémentés

**Client → Server:**
- `join-poll-room` - Rejoindre une room de sondage
- `leave-poll-room` - Quitter une room
- `vote-cast` - Envoyer un vote
- `poll-started` - Démarrer un sondage
- `poll-closed` - Clôturer un sondage

**Server → Client:**
- `vote-updated` - Mise à jour des résultats des votes
- `poll-status-changed` - Changement du statut du sondage
- `user-joined` - Notification qu'un utilisateur a rejoint

### Format des Données

**join-poll-room:**
```javascript
{
  roomId: number,
  pollId: number,
  userId: number,
  userName: string
}
```

**vote-cast:**
```javascript
{
  roomId: number,
  pollId: number,
  userId: number,
  totalVotes: number,
  option1_count: number,
  option2_count: number,
  option3_count: number,
  option4_count: number
}
```

**vote-updated (émis par le serveur):**
```javascript
{
  pollId: number,
  roomId: number,
  totalVotes: number,
  option1_count: number,
  option2_count: number,
  option3_count: number,
  option4_count: number
}
```

---

## 🛡️ Contrôle d'Accès

### Permissions

| Action | Admin Room | Membre Room | Non-membre |
|--------|-----------|-----------|-----------|
| Créer room | ✅ | ❌ | ❌ |
| Voir room | ✅ | ✅ | ❌ |
| Ajouter membre | ✅ | ❌ | ❌ |
| Retirer membre | ✅ | ❌ | ❌ |
| Créer sondage | ✅ | ❌ | ❌ |
| Voter | ✅ | ✅ | ❌ |
| Démarrer sondage | ✅ | ❌ | ❌ |
| Clôturer sondage | ✅ | ❌ | ❌ |

---

## 📊 Schéma des Tables

### `rooms`
```sql
- id (PK)
- name (VARCHAR)
- description (TEXT)
- created_by (FK users)
- created_at (TIMESTAMP)
- is_active (BOOLEAN)
```

### `room_members`
```sql
- id (PK)
- room_id (FK rooms)
- user_id (FK users)
- role (ENUM: admin, member)
- joined_at (TIMESTAMP)
- UNIQUE(room_id, user_id)
```

### `room_polls`
```sql
- id (PK)
- poll_id (FK polls)
- room_id (FK rooms)
- duration_minutes (INT)
- status (ENUM: pending, active, closed)
- started_at (TIMESTAMP)
- closed_at (TIMESTAMP)
- UNIQUE(poll_id, room_id)
```

### `polls` (modifié)
```sql
- room_id (FK rooms) - NULL pour les sondages publics
```

---

## 🎨 Styling

Tous les composants utilisent le design **Black & Gold** existant:
- Couleur principale: `#fbbf24` (amber-400)
- Fond: `#000000` (black)
- Accents: Dégradés gold et gris foncé

---

## 🧪 Test de la Fonctionnalité

### Scénario de Test 1: Créer et Voter

1. Connectez-vous en tant qu'admin
2. Créez une room: "Test Room"
3. Ajoutez un utilisateur membre
4. Créez un sondage: "Quelle est votre couleur préférée?"
5. Lancez le sondage
6. Connectez-vous en tant qu'utilisateur ajouté
7. Accédez à la room et votez
8. Vérifiez les mises à jour temps réel

### Scénario de Test 2: Temps Réel

1. Ouvrez le sondage dans deux onglets/navigateurs
2. Votez dans un onglet
3. L'autre onglet doit se mettre à jour immédiatement
4. Vérifiez que les pourcentages changent

### Scénario de Test 3: Clôture

1. Votez dans un sondage
2. En tant qu'admin, cliquez "Close"
3. Vérifiez que personne ne peut plus voter
4. Vérifiez la notification de fin

---

## ⚙️ Variables d'Environnement

Assurez-vous que votre `.env` contient:

```env
# Backend
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=vote_app
PORT=4000
SESSION_SECRET=your_secret_key
CLIENT_ORIGIN=http://localhost:5173

# Frontend (.env.local ou vite.config.js)
VITE_API_URL=http://localhost:4000/api
```

---

## 🐛 Dépannage

### Socket.IO ne se connecte pas

1. Vérifiez que le serveur backend s'exécute: `npm run dev`
2. Vérifiez les logs du serveur pour les erreurs Socket.IO
3. Vérifiez que `VITE_API_URL` pointe vers le bon serveur

### Les votes ne s'actualisent pas

1. Vérifiez la connexion Socket: Cherchez "Socket connected" dans la console
2. Vérifiez que vous êtes dans la même room
3. Contrôlez la connexion réseau

### Accès refusé aux rooms

1. Vérifiez que l'utilisateur est ajouté à la room
2. Vérifiez les permissions dans la base de données
3. Vérifiez les logs du serveur pour les erreurs d'authentification

---

## 📝 Prochaines Améliorations Possibles

- [ ] Archivage des sondages clôturés
- [ ] Export des résultats en CSV
- [ ] Permissions granulaires (modérateur, etc.)
- [ ] Historique d'accès aux rooms
- [ ] Invitations par email
- [ ] Webhooks pour intégrations externes
- [ ] Analyses avancées des votes

---

## 📞 Support

Pour toute question ou problème, consultez:
1. Les logs du navigateur (F12)
2. Les logs du serveur (terminal backend)
3. La console des outils de développement

**Bonne implémentation! 🎉**
