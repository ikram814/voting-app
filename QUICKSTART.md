# ⚡ QuickStart - Rooms Privées en 5 Minutes

## 🚀 Installation Rapide (5 min)

### Étape 1: Migration BD (1 min)
```bash
# Dans MySQL ou PhpMyAdmin
mysql -u root -p vote_app < Backend/migrations/create_rooms_tables.sql
```

### Étape 2: Backend (2 min)
```bash
cd Backend
npm install  # Déjà fait si socket.io est installé
npm run dev  # Démarrer le serveur
```

**✅ Vous devriez voir:**
```
Server running on http://localhost:4000
Socket.IO is active
```

### Étape 3: Frontend (2 min)
```bash
cd Frontend/voting-app
npm install  # Déjà fait si socket.io-client est installé
npm run dev  # Démarrer le dev server
```

**✅ Vous devriez voir:**
```
Local: http://localhost:5173
```

---

## 🧪 Test Rapide (2 min)

### En tant qu'Admin:
1. Se connecter sur http://localhost:5173
2. Cliquer "Rooms" dans le sidebar
3. Cliquer "Create Room"
4. Entrer un nom et créer
5. Cliquer "Manage Room"
6. Ajouter un utilisateur
7. Créer un sondage
8. Cliquer "Start"

### En tant que Membre:
1. Ouvrir un nouvel onglet/navigateur privé
2. Se connecter avec l'utilisateur ajouté
3. Cliquer "Rooms"
4. Cliquer sur la room
5. Cliquer sur le sondage
6. Voter
7. **✅ Les résultats devraient se mettre à jour en temps réel!**

---

## 🔧 Configuration (1 min)

**Si Socket.IO ne se connecte pas:**

1. Vérifier `.env` backend:
```env
CLIENT_ORIGIN=http://localhost:5173
```

2. Vérifier que le backend s'exécute sur le port 4000

3. Ouvrir DevTools (F12) et chercher dans la console:
```
Socket connected: [ID]
```

---

## 📊 Fichiers Créés

| Fichier | Lignes | Type |
|---------|--------|------|
| `routes/rooms.js` | 185 | Backend API |
| `routes/roomMembers.js` | 115 | Backend API |
| `routes/roomPolls.js` | 216 | Backend API |
| `context/SocketContext.jsx` | 117 | Frontend |
| `pages/Rooms.jsx` | 204 | Frontend |
| `pages/RoomDetail.jsx` | 446 | Frontend |
| `pages/RoomVoting.jsx` | 362 | Frontend |
| `pages/JoinRoom.jsx` | 106 | Frontend |
| `components/NotificationCenter.jsx` | 68 | Frontend |
| `create_rooms_tables.sql` | 60 | BD |

**Total:** 1,879 lignes

---

## 🎯 Fonctionnalités

✅ Créer des rooms privées  
✅ Ajouter/retirer des membres  
✅ Créer des sondages dans les rooms  
✅ Voter une seule fois  
✅ Voir les résultats en temps réel  
✅ Notifications en temps réel  
✅ Contrôle d'accès granulaire  
✅ Support multi-utilisateurs  

---

## 🆘 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| Socket ne se connecte pas | Vérifier `CLIENT_ORIGIN` + backend sur 4000 |
| Les votes ne se synchro | Vérifier que Socket est connecté (F12) |
| Erreur "Forbidden" | Vérifier que l'utilisateur est admin |
| Impossible de voter | Vérifier que le sondage est "active" |
| BD vide | Exécuter la migration create_rooms_tables.sql |

---

## 📚 Pour Plus D'Infos

- **Installation complète:** [ROOMS_IMPLEMENTATION_GUIDE.md](./ROOMS_IMPLEMENTATION_GUIDE.md)
- **Configuration Socket:** [SOCKET_IO_CONFIGURATION.md](./SOCKET_IO_CONFIGURATION.md)
- **Exemples API:** [API_EXAMPLES.md](./API_EXAMPLES.md)
- **Test complet:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Vue d'ensemble:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

## ✅ Checklist Finale

- [ ] Migration BD exécutée
- [ ] Backend lancé (port 4000)
- [ ] Frontend lancé (port 5173)
- [ ] Socket.IO connecté (console: "Socket connected")
- [ ] Créé une room
- [ ] Ajouté un utilisateur
- [ ] Créé un sondage
- [ ] Voté en temps réel
- [ ] Vu les résultats se mettre à jour

**Si tous les cases sont cochées = Succès! 🎉**

---

**Besoin d'aide? Consultez la [Documentation Complète](./DOCUMENTATION_INDEX.md)**
