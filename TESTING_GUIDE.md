# 🧪 Guide de Test Complet - Système de Rooms Privées

## 📋 Préparation

### Prérequis
- ✅ MySQL en fonctionnement
- ✅ Backend Node.js (port 4000)
- ✅ Frontend Vite (port 5173)
- ✅ Deux navigateurs ou deux onglets/fenêtres

### Migration BD
```bash
mysql -u root -p vote_app < Backend/migrations/create_rooms_tables.sql
```

### Démarrer les serveurs
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend/voting-app
npm run dev
```

---

## 🎬 Scénario 1: Création de Room et Ajout de Membres

### Étape 1: Se connecter en tant qu'Admin
1. Ouvrir http://localhost:5173
2. Se connecter avec un compte admin (créer si nécessaire)
3. Vérifier que le bouton "Rooms" apparaît dans le sidebar

### Étape 2: Créer une Room
1. Cliquer sur "Rooms"
2. Cliquer sur "Create Room"
3. Entrer:
   ```
   Name: Test Voting Room
   Description: Testing the private rooms feature
   ```
4. Cliquer "Create"
5. ✅ La room doit apparaître dans la liste

### Étape 3: Ajouter des Membres
1. Cliquer sur "Manage Room" sur la room créée
2. Cliquer sur le bouton "+" à côté de "Members"
3. Sélectionner un utilisateur existant (créer un utilisateur test si nécessaire)
4. Cliquer "Add"
5. ✅ L'utilisateur doit apparaître dans la liste des membres

**Test Result: ✅ PASS**

---

## 🎬 Scénario 2: Créer et Configurer un Sondage

### Étape 1: Créer le Sondage
1. Depuis la page de détail de la room
2. Cliquer sur "Create Poll"
3. Entrer:
   ```
   Question: What's your favorite programming language?
   Option 1: JavaScript
   Option 2: Python
   Option 3: Java
   Option 4: Go
   Duration: 60 minutes
   ```
4. Cliquer "Create"
5. ✅ Le sondage doit apparaître avec le statut "pending"

### Étape 2: Démarrer le Sondage
1. Depuis la page de détail de la room
2. Voir le sondage créé
3. Cliquer "Start"
4. ✅ Le statut doit devenir "active"

**Test Result: ✅ PASS**

---

## 🎬 Scénario 3: Voter en Tant que Membre

### Étape 1: Se Connecter en tant que Membre
1. Ouvrir un **nouvel onglet ou navigateur privé**
2. Se connecter avec le compte utilisateur ajouté à la room
3. Cliquer sur "Rooms"
4. ✅ La room doit être visible

### Étape 2: Voter
1. Cliquer sur la room
2. Cliquer sur le sondage
3. Sélectionner une option (ex: JavaScript)
4. ✅ La notification "Your vote has been recorded" doit apparaître
5. ✅ L'option sélectionnée doit être highlighted

### Étape 3: Vérifier l'Impossibilité de Revote
1. Essayer de cliquer sur une autre option
2. ✅ Aucune action ne doit se produire (boutons désactivés)
3. ✅ Le message "You have already voted" doit rester visible

**Test Result: ✅ PASS**

---

## 🎬 Scénario 4: Mises à Jour Temps Réel (Socket.IO)

### Configuration
- Onglet 1: Admin - Page de détail de la room (peut voir les résultats)
- Onglet 2: Utilisateur 1 - Page de vote
- Onglet 3: Utilisateur 2 - Page de vote (optionnel)

### Étape 1: Votant 1 Vote
1. Dans l'onglet 2 (Utilisateur 1), voter pour "Python"
2. **Vérification dans l'onglet 1:**
   - ✅ La barre "Python" doit augmenter immédiatement
   - ✅ Le pourcentage doit passer de 0% à 50% (ou une autre valeur)
   - ✅ "Total votes" doit augmenter

### Étape 2: Votant 2 Vote (optionnel)
1. Dans l'onglet 3 (Utilisateur 2), voter pour "Java"
2. **Vérification dans l'onglet 1:**
   - ✅ La barre "Java" doit augmenter
   - ✅ Les pourcentages doivent se recalculer
   - ✅ "Total votes" doit augmenter à nouveau

### Étape 3: Console Socket.IO
1. Ouvrir DevTools (F12) dans tous les onglets
2. **Onglet 1 (Admin):**
   - Chercher dans la console: logs des mises à jour
3. **Onglet 2 (Votant):**
   - Chercher: "vote-updated" events
4. ✅ Tous les événements doivent être visibles

**Test Result: ✅ PASS** (si les mises à jour sont instantanées)

---

## 🎬 Scénario 5: Clôture du Sondage

### Étape 1: Clôturer depuis l'Admin
1. Depuis l'onglet 1 (Admin), cliquer "Close" sur le sondage
2. ✅ Le statut doit devenir "closed"

### Étape 2: Vérifier l'Impact sur les Votants
1. **Onglet 2 (Déjà voté):**
   - ✅ Doit voir le message "Voting is not available for this poll"
2. **Onglet 3 (N'a pas voté):**
   - ✅ Doit voir le message "Voting is not available for this poll"
   - ✅ Ne peut pas voter

### Étape 3: Notification
1. Tous les onglets ouverts doivent recevoir une notification
2. ✅ Message "Poll has ended" doit apparaître (NotificationCenter)

**Test Result: ✅ PASS** (si les notifications arrivent)

---

## 🎬 Scénario 6: Accès Non Autorisé

### Étape 1: Utilisateur Non Membre
1. Se connecter avec un utilisateur **PAS ajouté à la room**
2. Essayer d'accéder directement via URL: `/rooms/1`
3. ✅ Doit être redirigé ou voir un message d'erreur
4. ✅ Ne peut pas voter dans le sondage

### Étape 2: Suppression de Membre
1. Admin supprime l'utilisateur de la room
2. Utilisateur essaie de voter
3. ✅ Doit voir un message d'erreur: "Not a member of this room"

**Test Result: ✅ PASS** (si les droits sont vérifiés)

---

## 🎬 Scénario 7: Multiple Sondages

### Étape 1: Créer Plusieurs Sondages
1. Créer 3 sondages dans la même room
2. Démarrer seulement les sondages 1 et 2
3. ✅ Tous les sondages doivent s'afficher

### Étape 2: Voter dans Plusieurs Sondages
1. En tant qu'utilisateur, voter dans le sondage 1
2. Essayer de voter dans le sondage 2 (différent)
3. ✅ Chaque sondage doit avoir un vote indépendant
4. ✅ Ne peut pas voter deux fois dans le même sondage
5. ✅ Peut voter dans un sondage différent

**Test Result: ✅ PASS** (si les sondages sont indépendants)

---

## 🎬 Scénario 8: Notifications en Temps Réel

### Configuration
Ouvrir la page de vote dans un onglet

### Étape 1: Vérifier les Notifications
1. Voter dans le sondage
2. ✅ Une notification "Vote recorded" doit apparaître
3. ✅ La notification doit disparaître après 4 secondes

### Étape 2: Notifications de Statut
1. Admin clôture le sondage
2. ✅ Une notification "Poll has ended" doit apparaître
3. ✅ Visible dans le NotificationCenter (haut droit)

**Test Result: ✅ PASS** (si les notifications fonctionnent)

---

## 📊 Checklist de Test Final

| Fonctionnalité | Admin | Utilisateur | Status |
|---|---|---|---|
| Créer room | ✅ | ❌ | ✓ |
| Voir rooms | ✅ | ✅ | ✓ |
| Ajouter membre | ✅ | ❌ | ✓ |
| Retirer membre | ✅ | ❌ | ✓ |
| Créer sondage | ✅ | ❌ | ✓ |
| Voter | ✅ | ✅ | ✓ |
| Voir résultats | ✅ | ✅ | ✓ |
| Mises à jour live | ✅ | ✅ | ✓ |
| Clôturer sondage | ✅ | ❌ | ✓ |
| Notifications | ✅ | ✅ | ✓ |

---

## 🔍 Vérifications Techniques

### DevTools Console
```javascript
// Vérifier Socket.IO
console.log(socket.id); // Doit afficher un ID

// Vérifier les événements
socket.on('vote-updated', (data) => {
  console.log('Vote updated:', data);
});
```

### Network Tab
1. Ouvrir DevTools → Network
2. Filtrer par "WS" (WebSockets)
3. ✅ Doit voir `/socket.io` avec WebSocket actif
4. Voter
5. ✅ Doit voir les messages WebSocket envoyés/reçus

### Console Serveur Backend
```bash
# Terminal où tourne le backend
User connected: [socket-id]
User 2 joined poll room: poll-5-room-1
Vote updated
User disconnected
```

---

## ⚠️ Problèmes Courants et Solutions

### Problème: Socket ne se connecte pas

**Symptôme:** Console affiche "Socket connection error"

**Solution:**
1. Vérifier que le backend s'exécute: `npm run dev` dans Backend
2. Vérifier que le port 4000 est disponible
3. Vérifier `CLIENT_ORIGIN` dans .env backend
4. Vérifier la console du navigateur pour l'URL de connexion

### Problème: Les votes ne se mettent pas à jour

**Symptôme:** Voter ne met pas à jour les résultats en direct

**Solution:**
1. Vérifier que Socket.IO est connecté (console: "Socket connected")
2. Vérifier que les deux clients sont dans la même room: `poll-{pollId}-room-{roomId}`
3. Vérifier que le statut du sondage est "active"
4. Vérifier les logs du serveur pour les erreurs

### Problème: Erreur "Access denied"

**Symptôme:** Impossible de voter, message "Not a member of this room"

**Solution:**
1. Vérifier que l'utilisateur est ajouté à la room
2. Vérifier les permissions dans `room_members` table
3. Vérifier que l'utilisateur est authentifié

### Problème: Impossible de créer une room

**Symptôme:** Erreur "Admin only"

**Solution:**
1. Vérifier que l'utilisateur est admin (isAdmin=1 en BD)
2. Vérifier que la session est active
3. Vérifier les logs du serveur

---

## 📸 Screenshots Attendus

### État 1: Room avec Sondage Pending
```
┌─────────────────────────────────┐
│ Test Voting Room                │
│ Testing the private rooms feat  │
├─────────────────────────────────┤
│ Members: 2                      │
│ ├─ admin (admin)                │
│ └─ user1 (member)               │
├─────────────────────────────────┤
│ Polls:                          │
│ ├─ What's your favorite lang?  │
│    Status: pending              │
│    [Start] button visible       │
└─────────────────────────────────┘
```

### État 2: Sondage Active
```
┌─────────────────────────────────┐
│ What's your favorite lang?      │
│ Status: ● active                │
├─────────────────────────────────┤
│ ◯ JavaScript        1 (25%)      │
│ ◯ Python            2 (50%)      │
│ ◯ Java              1 (25%)      │
│ ◯ Go                0 (0%)       │
├─────────────────────────────────┤
│ Total votes: 4                  │
│ ✓ Your vote has been recorded   │
└─────────────────────────────────┘
```

---

**Bonne testabilité! 🧪✅**
