// routes/users.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// ======================================== UPDATE USER PROFILE
// Route: PUT /api/user/update
router.put('/update',
  authMiddleware, // Protège la route
  body('email').optional().isEmail(),
  body('newPassword').optional().isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const userId = req.session.user.id;
      const { username, email, image, currentPassword, newPassword } = req.body;

      // Si changement de mot de passe: vérifier currentPassword
      if (newPassword) {
        if (!currentPassword)
          return res.status(400).json({ message: 'Current password required' });

        const [rows] = await pool.query(
          'SELECT password FROM users WHERE id = ?',
          [userId]
        );

        const user = rows[0];
        const ok = await bcrypt.compare(currentPassword, user.password);

        if (!ok)
          return res.status(401).json({ message: 'Current password incorrect' });
      }

      // Construire les champs à mettre à jour dynamiquement
      const fields = [];
      const values = [];

      if (username) {
        fields.push('username = ?');
        values.push(username);
      }

      if (email) {
        fields.push('email = ?');
        values.push(email);
      }

      if (image !== undefined) { // Permet de définir image à null
        fields.push('image = ?');
        values.push(image);
      }

      if (newPassword) {
        const hashed = await bcrypt.hash(newPassword, 12);
        fields.push('password = ?');
        values.push(hashed);
      }

      if (!fields.length)
        return res.status(400).json({ message: 'No fields to update' });

      values.push(userId);

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await pool.query(sql, values);

      // Récupérer l'utilisateur mis à jour
      const [updatedRows] = await pool.query(
        'SELECT id, username, email, image, isAdmin FROM users WHERE id = ?',
        [userId]
      );

      const updatedUser = updatedRows[0];

      // ✅ IMPORTANT: Mettre à jour la session
      req.session.user = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        image: updatedUser.image,
        isAdmin: updatedUser.isAdmin === 1
      };

      // ✅ IMPORTANT: Retourner l'utilisateur mis à jour
      res.json({ 
        message: 'Profile updated',
        user: req.session.user 
      });

    } catch (err) {
      // Gérer les doublons username/email
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'Username or email already used' });

      next(err);
    }
  }
);

// ======================================== UPDATE USER BY ID (ancienne route, garder pour compatibilité)
router.put('/:id',
  authMiddleware,
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const userId = parseInt(req.params.id);

      // SESSION-BASED PROTECTION
      if (req.session.user.id !== userId)
        return res.status(403).json({ message: 'Forbidden' });

      const { username, email, password, currentPassword } = req.body;

      // Si changement de mot de passe: vérifier currentPassword
      if (password) {
        if (!currentPassword)
          return res.status(400).json({ message: 'Current password required' });

        const [rows] = await pool.query(
          'SELECT password FROM users WHERE id = ?',
          [userId]
        );

        const user = rows[0];
        const ok = await bcrypt.compare(currentPassword, user.password);

        if (!ok)
          return res.status(401).json({ message: 'Current password incorrect' });
      }

      // Construire les champs SET dynamiquement
      const fields = [];
      const values = [];

      if (username) {
        fields.push('username = ?');
        values.push(username);
      }

      if (email) {
        fields.push('email = ?');
        values.push(email);
      }

      if (password) {
        const hashed = await bcrypt.hash(password, 12);
        fields.push('password = ?');
        values.push(hashed);
      }

      if (!fields.length)
        return res.status(400).json({ message: 'No fields to update' });

      values.push(userId);

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await pool.query(sql, values);

      // Mettre à jour la session
      req.session.user = {
        ...req.session.user,
        username: username ?? req.session.user.username,
        email: email ?? req.session.user.email
      };

      res.json({ message: 'Profile updated' });

    } catch (err) {
      // Gérer les doublons username/email
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'Username or email already used' });

      next(err);
    }
  }
);

module.exports = router;