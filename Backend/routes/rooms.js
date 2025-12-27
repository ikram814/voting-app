// routes/rooms.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');

// ============ CREATE ROOM (Admin Only) ============
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin only' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO rooms (name, description, created_by) VALUES (?, ?, ?)`,
      [name, description || null, user.id]
    );

    // Add creator as admin member
    await pool.query(
      `INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)`,
      [result.insertId, user.id, 'admin']
    );

    res.status(201).json({
      message: 'Room created successfully',
      roomId: result.insertId,
      room: {
        id: result.insertId,
        name,
        description: description || null,
        created_by: user.id,
        created_at: new Date()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ GET ALL ROOMS FOR USER ============
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;

    const [rooms] = await pool.query(
      `SELECT DISTINCT r.*, u.username as creator_username, COUNT(DISTINCT rm.user_id) as member_count
       FROM rooms r
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN room_members rm ON r.id = rm.room_id
       WHERE r.created_by = ? OR r.id IN (
         SELECT room_id FROM room_members WHERE user_id = ?
       )
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [userId, userId]
    );

    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ GET ROOM DETAILS ============
router.get('/:roomId', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);

    // Check if user has access to room
    const [access] = await pool.query(
      `SELECT r.* FROM rooms r
       WHERE r.id = ? AND (r.created_by = ? OR r.id IN (
         SELECT room_id FROM room_members WHERE user_id = ?
       ))`,
      [roomId, userId, userId]
    );

    if (!access.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const room = access[0];

    // Get members
    const [members] = await pool.query(
      `SELECT u.id, u.username, u.image, rm.role, rm.joined_at
       FROM room_members rm
       JOIN users u ON rm.user_id = u.id
       WHERE rm.room_id = ?
       ORDER BY rm.role DESC, rm.joined_at ASC`,
      [roomId]
    );

    res.json({ room, members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ UPDATE ROOM (Admin of room only) ============
router.put('/:roomId', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);
    const { name, description } = req.body;

    // Check if user is admin of room
    const [room] = await pool.query(
      `SELECT r.* FROM rooms r WHERE r.id = ? AND r.created_by = ?`,
      [roomId, userId]
    );

    if (!room.length) {
      return res.status(403).json({ message: 'Only room creator can update' });
    }

    await pool.query(
      `UPDATE rooms SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`,
      [name || null, description || null, roomId]
    );

    res.json({ message: 'Room updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ DELETE ROOM (Creator or Admin) ============
router.delete('/:roomId', authMiddleware, async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user?.id;
    const roomId = parseInt(req.params.roomId);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if room exists
    const [room] = await pool.query(
      `SELECT * FROM rooms WHERE id = ?`,
      [roomId]
    );

    if (!room.length) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is creator OR admin
    const isCreator = room[0].created_by === userId;
    // isAdmin peut être un booléen (true/false) ou un nombre (1/0)
    const isAdmin = user?.isAdmin === true || user?.isAdmin === 1;

    console.log('Delete room check:', { userId, roomCreator: room[0].created_by, isCreator, isAdmin, userIsAdmin: user?.isAdmin });

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only room creator or admin can delete' });
    }

    // Utiliser une transaction pour garantir la cohérence
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Récupérer TOUS les polls associés à cette room (via room_polls ET via room_id direct)
      // Utiliser une requête UNION pour être sûr de tout récupérer
      const [allPollsResult] = await connection.query(
        `SELECT DISTINCT p.id 
         FROM polls p
         WHERE p.room_id = ?
         UNION
         SELECT DISTINCT rp.poll_id as id
         FROM room_polls rp
         WHERE rp.room_id = ?`,
        [roomId, roomId]
      );

      const allPollIds = allPollsResult.map(p => p.id);

      console.log('Polls to delete:', allPollIds);

      // Supprimer tous les votes de tous les polls associés
      if (allPollIds.length > 0) {
        const placeholders = allPollIds.map(() => '?').join(',');
        await connection.query(`DELETE FROM votes WHERE poll_id IN (${placeholders})`, allPollIds);
        console.log('Votes deleted for polls:', allPollIds);
        
        // Supprimer tous les polls associés
        await connection.query(`DELETE FROM polls WHERE id IN (${placeholders})`, allPollIds);
        console.log('Polls deleted:', allPollIds);
      }

      // Supprimer les room_polls associés
      await connection.query(`DELETE FROM room_polls WHERE room_id = ?`, [roomId]);
      console.log('Room polls deleted');
      
      // Supprimer les room_members
      await connection.query(`DELETE FROM room_members WHERE room_id = ?`, [roomId]);
      console.log('Room members deleted');

      // Enfin, supprimer la room
      await connection.query(`DELETE FROM rooms WHERE id = ?`, [roomId]);
      console.log('Room deleted');

      // Commit la transaction
      await connection.commit();
    } catch (err) {
      // Rollback en cas d'erreur
      await connection.rollback();
      throw err;
    } finally {
      // Libérer la connexion
      connection.release();
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
