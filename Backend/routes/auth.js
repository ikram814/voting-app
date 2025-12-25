// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const authMiddleware = require('../authMiddleware');

// ======================================== REGISTER
router.post('/register',
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res, next) => { 
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, image } = req.body;
      const hashed = await bcrypt.hash(password, 12);

      try {
        const [result] = await pool.query(
          'INSERT INTO users (username, email, password, image, isAdmin) VALUES (?,?,?,?,?)',
          [username, email, hashed, image || null, 0]
        );

        res.status(201).json({
          id: result.insertId,
          username,
          email,
          image: image || null
        });

      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'email already exists' });
        }
        throw err;
      }

    } catch (err) { next(err); }
  }
);

// ========================================LOGIN  
router.post('/login',
  body('username').notEmpty(),
  body('password').notEmpty(),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, username]
      );
      if (!rows.length)
        return res.status(401).json({ message: 'Invalid credentials' });
      const user = rows[0];

      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
        return res.status(401).json({ message: 'Invalid credentials' });

      // ==== STORE USER IN SESSION (avec image)
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin === 1
      };

      res.json({
        message: "Logged in",
        user: req.session.user
      });

    } catch (err) { next(err); }
  }
);

// ======================================== LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('session_id');
    res.json({ message: "Logged out" });
  });
});

// ====================================== CURRENT USER
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.session.user });
});

module.exports = router;