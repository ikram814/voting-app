// index.js (Backend)
const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pollsRoutes = require('./routes/polls');

const app = express();

// ============ CORS Configuration ============
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:',
  credentials: true, // TRÈS IMPORTANT pour les cookies/sessions
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
  saveUninitialized: false, // IMPORTANT: false pour ne pas créer de session vide
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true en production avec HTTPS
    httpOnly: true, // Protection XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'session_id' // Nom du cookie
}));

// ============ Debug Middleware (à retirer en production) ============
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session User:', req.session?.user);
  next();
});

// ============ Routes ============
app.use('/api/auth', authRoutes);
// Mount user routes (profile updates, etc.)
app.use('/api/user', userRoutes);
// Mount polls routes
app.use('/api/polls', pollsRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
});