# Configuration Socket.IO pour Rooms Privées

## Backend Configuration (index.js)

```javascript
// Déjà configuré:
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});
```

## Frontend Configuration

### Vite.config.js (si nécessaire)

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true
      }
    }
  }
});
```

### Variables d'environnement (.env.local)

```
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

### Dans SocketContext.jsx (déjà configuré)

```javascript
const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:4000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## Backend Variables (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=vote_app

# Server
PORT=4000
NODE_ENV=development
SESSION_SECRET=your_secure_secret_key_here

# CORS
CLIENT_ORIGIN=http://localhost:5173

# Socket.IO (automatique via io variable)
# Voir configuration dans index.js
```

## Production Configuration

### Backend (Production)

```env
DB_HOST=prod-db-server
DB_USER=prod_user
DB_PASS=secure_password
DB_NAME=vote_app

PORT=4000
NODE_ENV=production
SESSION_SECRET=very_long_secure_secret_key

CLIENT_ORIGIN=https://yourdomain.com

# SSL/TLS
HTTPS=true
```

### Socket.IO (Production avec Nginx)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:4000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Démarrage Recommandé

### Terminal 1 - Backend
```bash
cd Backend
npm install
npm run dev
# Devrait afficher: Server running on http://localhost:4000
# Socket.IO is active
```

### Terminal 2 - Frontend
```bash
cd Frontend/voting-app
npm install
npm run dev
# Devrait afficher: Local: http://localhost:5173
```

### Vérification

1. Ouvrir http://localhost:5173
2. Ouvrir DevTools (F12)
3. Chercher dans la console:
   ```
   Socket connected: [socket-id]
   ```

## Troubleshooting

### Socket refuse de se connecter

1. Vérifier que le backend s'exécute: `http://localhost:4000`
2. Vérifier `CLIENT_ORIGIN` dans .env
3. Vérifier les logs de Socket.IO dans le terminal

### CORS Error

Vérifier que `CLIENT_ORIGIN` correspond à l'URL du frontend:
```env
# Si frontend sur localhost:5173
CLIENT_ORIGIN=http://localhost:5173

# Si frontend sur localhost:3000
CLIENT_ORIGIN=http://localhost:3000
```

### Votes ne se synchronisent pas

1. Vérifier la connexion Socket (console du navigateur)
2. Vérifier que les deux clients sont dans la même room:
   ```javascript
   // Room Socket: poll-{pollId}-room-{roomId}
   ```
3. Vérifier que le statut du sondage est "active"

---

**Maintenant prêt pour fonctionner! 🚀**
