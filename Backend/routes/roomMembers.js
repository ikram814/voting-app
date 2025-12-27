// routes/roomMembers.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');

// ============ ADD MEMBER TO ROOM (Room admin only) ============
router.post('/:roomId/members', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: 'Member ID required' });
    }

    // Check if user is admin of room
    const [isAdmin] = await pool.query(
      `SELECT * FROM rooms WHERE id = ? AND created_by = ?`,
      [roomId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ message: 'Only room admin can add members' });
    }

    // Check if member exists
    const [memberExists] = await pool.query(
      `SELECT * FROM users WHERE id = ?`,
      [memberId]
    );

    if (!memberExists.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add member to room
    try {
      await pool.query(
        `INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)`,
        [roomId, memberId, 'member']
      );

      res.status(201).json({
        message: 'Member added to room',
        member: {
          id: memberId,
          role: 'member'
        }
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'User already in room' });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ REMOVE MEMBER FROM ROOM (Room admin only) ============
router.delete('/:roomId/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);
    const memberId = parseInt(req.params.memberId);

    // Check if user is admin of room
    const [isAdmin] = await pool.query(
      `SELECT * FROM rooms WHERE id = ? AND created_by = ?`,
      [roomId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ message: 'Only room admin can remove members' });
    }

    // Cannot remove admin (room creator)
    if (memberId === userId) {
      return res.status(400).json({ message: 'Cannot remove yourself from room' });
    }

    await pool.query(
      `DELETE FROM room_members WHERE room_id = ? AND user_id = ?`,
      [roomId, memberId]
    );

    res.json({ message: 'Member removed from room' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ GET ALL USERS (for adding to room) ============
router.get('/:roomId/available-users', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);

    // Check if user is admin of room
    const [isAdmin] = await pool.query(
      `SELECT * FROM rooms WHERE id = ? AND created_by = ?`,
      [roomId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ message: 'Only room admin can view available users' });
    }

    // Get all users not in room
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.image
       FROM users u
       WHERE u.id NOT IN (SELECT user_id FROM room_members WHERE room_id = ?)
       AND u.id != ?
       ORDER BY u.username ASC`,
      [roomId, userId]
    );

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
