## Rooms API - Exemples de Requêtes

### Base URL
```
http://localhost:4000/api
```

---

## 🛏️ ROOMS API

### 1. Créer une Room (Admin)
```http
POST /rooms
Content-Type: application/json
Cookie: session_id=...

{
  "name": "Team Planning Session",
  "description": "Quarterly planning poll for the team"
}
```

**Response:**
```json
{
  "message": "Room created successfully",
  "roomId": 1,
  "room": {
    "id": 1,
    "name": "Team Planning Session",
    "description": "Quarterly planning poll for the team",
    "created_by": 1,
    "created_at": "2025-12-27T10:00:00.000Z"
  }
}
```

---

### 2. Obtenir Toutes les Rooms de l'Utilisateur
```http
GET /rooms
Cookie: session_id=...
```

**Response:**
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "Team Planning Session",
      "description": "Quarterly planning poll for the team",
      "created_by": 1,
      "creator_username": "admin",
      "member_count": 5,
      "created_at": "2025-12-27T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Obtenir Détails d'une Room
```http
GET /rooms/1
Cookie: session_id=...
```

**Response:**
```json
{
  "room": {
    "id": 1,
    "name": "Team Planning Session",
    "description": "Quarterly planning poll for the team",
    "created_by": 1,
    "created_at": "2025-12-27T10:00:00.000Z"
  },
  "members": [
    {
      "id": 1,
      "username": "admin",
      "image": "url_to_image",
      "role": "admin",
      "joined_at": "2025-12-27T10:00:00.000Z"
    },
    {
      "id": 2,
      "username": "user1",
      "image": "url_to_image",
      "role": "member",
      "joined_at": "2025-12-27T10:05:00.000Z"
    }
  ]
}
```

---

### 4. Mettre à Jour une Room (Admin)
```http
PUT /rooms/1
Content-Type: application/json
Cookie: session_id=...

{
  "name": "Updated Room Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "message": "Room updated"
}
```

---

### 5. Supprimer une Room (Creator)
```http
DELETE /rooms/1
Cookie: session_id=...
```

**Response:**
```json
{
  "message": "Room deleted"
}
```

---

## 👥 ROOM MEMBERS API

### 6. Ajouter un Membre à la Room (Admin)
```http
POST /rooms/1/members
Content-Type: application/json
Cookie: session_id=...

{
  "memberId": 2
}
```

**Response:**
```json
{
  "message": "Member added to room",
  "member": {
    "id": 2,
    "role": "member"
  }
}
```

---

### 7. Retirer un Membre de la Room (Admin)
```http
DELETE /rooms/1/members/2
Cookie: session_id=...
```

**Response:**
```json
{
  "message": "Member removed from room"
}
```

---

### 8. Obtenir Utilisateurs Disponibles (Admin)
```http
GET /rooms/1/available-users
Cookie: session_id=...
```

**Response:**
```json
{
  "users": [
    {
      "id": 3,
      "username": "user3",
      "email": "user3@example.com",
      "image": "url_to_image"
    },
    {
      "id": 4,
      "username": "user4",
      "email": "user4@example.com",
      "image": "url_to_image"
    }
  ]
}
```

---

## 🗳️ ROOM POLLS API

### 9. Créer un Sondage dans la Room (Admin)
```http
POST /rooms/1/polls
Content-Type: application/json
Cookie: session_id=...

{
  "question": "What's our priority for Q1?",
  "option1": "Feature A",
  "option2": "Feature B",
  "option3": "Bug fixes",
  "option4": "Performance optimization",
  "duration_minutes": 120,
  "image": "url_to_image_optional"
}
```

**Response:**
```json
{
  "message": "Room poll created",
  "pollId": 5,
  "roomPollId": 3
}
```

---

### 10. Obtenir les Sondages d'une Room
```http
GET /rooms/1/polls
Cookie: session_id=...
```

**Response:**
```json
{
  "polls": [
    {
      "id": 5,
      "question": "What's our priority for Q1?",
      "option1": "Feature A",
      "option2": "Feature B",
      "option3": "Bug fixes",
      "option4": "Performance optimization",
      "poll_status": "active",
      "started_at": "2025-12-27T10:30:00.000Z",
      "closed_at": null,
      "creator_username": "admin",
      "total_votes": 4,
      "option1_count": 1,
      "option2_count": 2,
      "option3_count": 1,
      "option4_count": 0,
      "user_voted": true
    }
  ]
}
```

---

### 11. Démarrer un Sondage (Admin)
```http
POST /rooms/1/polls/5/start
Cookie: session_id=...
```

**Response:**
```json
{
  "message": "Poll started"
}
```

---

### 12. Clôturer un Sondage (Admin)
```http
POST /rooms/1/polls/5/close
Cookie: session_id=...
```

**Response:**
```json
{
  "message": "Poll closed"
}
```

---

### 13. Voter dans un Sondage de Room (Member)
```http
POST /rooms/1/polls/5/vote
Content-Type: application/json
Cookie: session_id=...

{
  "option_selected": "option1"
}
```

**Response:**
```json
{
  "message": "Vote recorded"
}
```

---

## Socket.IO Events

### Client Events

#### 1. Rejoindre une Room de Sondage
```javascript
socket.emit('join-poll-room', {
  roomId: 1,
  pollId: 5,
  userId: 2,
  userName: "user1"
});
```

---

#### 2. Quitter une Room de Sondage
```javascript
socket.emit('leave-poll-room', {
  roomId: 1,
  pollId: 5
});
```

---

#### 3. Envoyer un Vote
```javascript
socket.emit('vote-cast', {
  roomId: 1,
  pollId: 5,
  userId: 2,
  totalVotes: 5,
  option1_count: 1,
  option2_count: 3,
  option3_count: 1,
  option4_count: 0
});
```

---

#### 4. Démarrer un Sondage
```javascript
socket.emit('poll-started', {
  roomId: 1,
  pollId: 5
});
```

---

#### 5. Clôturer un Sondage
```javascript
socket.emit('poll-closed', {
  roomId: 1,
  pollId: 5
});
```

---

### Server Events (à écouter)

#### 1. Mise à Jour des Votes
```javascript
socket.on('vote-updated', (data) => {
  console.log('Votes updated:', data);
  // {
  //   pollId: 5,
  //   roomId: 1,
  //   totalVotes: 5,
  //   option1_count: 1,
  //   option2_count: 3,
  //   option3_count: 1,
  //   option4_count: 0
  // }
});
```

---

#### 2. Changement de Statut du Sondage
```javascript
socket.on('poll-status-changed', (data) => {
  console.log('Poll status changed:', data);
  // {
  //   pollId: 5,
  //   status: "active" ou "closed",
  //   message: "Poll has ended" (si closed)
  // }
});
```

---

#### 3. Notification d'Arrivée d'Utilisateur
```javascript
socket.on('user-joined', (data) => {
  console.log('User joined:', data);
  // {
  //   userId: 3,
  //   userName: "user3"
  // }
});
```

---

## cURL Examples

### Créer une Room
```bash
curl -X POST http://localhost:4000/api/rooms \
  -H "Content-Type: application/json" \
  -b "session_id=YOUR_SESSION_ID" \
  -d '{
    "name": "Test Room",
    "description": "Testing the API"
  }'
```

### Ajouter un Membre
```bash
curl -X POST http://localhost:4000/api/rooms/1/members \
  -H "Content-Type: application/json" \
  -b "session_id=YOUR_SESSION_ID" \
  -d '{
    "memberId": 2
  }'
```

### Créer un Sondage
```bash
curl -X POST http://localhost:4000/api/rooms/1/polls \
  -H "Content-Type: application/json" \
  -b "session_id=YOUR_SESSION_ID" \
  -d '{
    "question": "Favorite color?",
    "option1": "Red",
    "option2": "Blue",
    "duration_minutes": 60
  }'
```

### Voter
```bash
curl -X POST http://localhost:4000/api/rooms/1/polls/5/vote \
  -H "Content-Type: application/json" \
  -b "session_id=YOUR_SESSION_ID" \
  -d '{
    "option_selected": "option1"
  }'
```

---

## Statuts d'Erreur Possibles

| Code | Message | Cause |
|------|---------|-------|
| 400 | Required fields missing | Données incomplètes |
| 403 | Forbidden: Admin only | Non admin |
| 403 | Access denied | Pas accès à la room |
| 404 | Poll not found | Sondage inexistant |
| 409 | User already in room | Membre déjà dans room |
| 500 | Server error | Erreur serveur |

---

**Test prêt! 🧪**
