// index.js (Backend) - VERSION SIMPLIFIÉE
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const setupSocketHandlers = require('./socketHandler'); // NOUVEAU
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pollsRoutes = require('./routes/polls');
const roomsRoutes = require('./routes/rooms');
const roomMembersRoutes = require('./routes/roomMembers');
const roomPollsRoutes = require('./routes/roomPolls');

const app = express();
const server = http.createServer(app);

// ============ SOCKET.IO Configuration ============
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// ============ SETUP SOCKET HANDLERS ============
setupSocketHandlers(io); // NOUVEAU - Remplace tout le code Socket.IO

// ============ CORS Configuration ============
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============ Body Parser ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ Session Configuration ============
app.use(session({
  secret: process.env.SESSION_SECRET || 'nadaikramjwtsecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'session_id'
}));

// ============ Routes ============
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/rooms', roomMembersRoutes);
app.use('/api/rooms', roomPollsRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    session: req.session?.user || 'No session'
  });
});

// ============ Error Handler ============
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ============ 404 Handler ============
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ============ Start Server ============
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO is active`);
  console.log(`🌍 CORS enabled for: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
});