// routes/roomPolls.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');

// ============ CREATE POLL IN ROOM (Room admin only) ============
router.post('/:roomId/polls', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);
    const { question, option1, option2, option3, option4, duration_minutes, image } = req.body;

    if (!question || !option1 || !option2 || !duration_minutes) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if user is admin of room
    const [isAdmin] = await pool.query(
      `SELECT * FROM rooms WHERE id = ? AND created_by = ?`,
      [roomId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ message: 'Only room admin can create polls' });
    }

    // Create poll for room
    const end_time = new Date(Date.now() + duration_minutes * 60000).toISOString();

    const [pollResult] = await pool.query(
      `INSERT INTO polls (question, image, option1, option2, option3, option4, end_time, created_by, room_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [question, image || null, option1, option2, option3 || null, option4 || null, end_time, userId, roomId]
    );

    // Create room_poll entry
    const [roomPollResult] = await pool.query(
      `INSERT INTO room_polls (poll_id, room_id, duration_minutes, status) VALUES (?, ?, ?, ?)`,
      [pollResult.insertId, roomId, duration_minutes, 'pending']
    );

    res.status(201).json({
      message: 'Room poll created',
      pollId: pollResult.insertId,
      roomPollId: roomPollResult.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ START POLL IN ROOM (Room admin only) ============
router.post('/:roomId/polls/:pollId/start', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);
    const pollId = parseInt(req.params.pollId);

    // Check if user is admin of room
    const [isAdmin] = await pool.query(
      `SELECT * FROM rooms WHERE id = ? AND created_by = ?`,
      [roomId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ message: 'Only room admin can start polls' });
    }

    // Update room_poll status
    await pool.query(
      `UPDATE room_polls SET status = ?, started_at = NOW() WHERE poll_id = ? AND room_id = ?`,
      ['active', pollId, roomId]
    );

    res.json({ message: 'Poll started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ CLOSE POLL IN ROOM (Room admin only) ============
router.post('/:roomId/polls/:pollId/close', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);
    const pollId = parseInt(req.params.pollId);

    // Check if user is admin of room
    const [isAdmin] = await pool.query(
      `SELECT * FROM rooms WHERE id = ? AND created_by = ?`,
      [roomId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ message: 'Only room admin can close polls' });
    }

    // Update room_poll status
    await pool.query(
      `UPDATE room_polls SET status = ?, closed_at = NOW() WHERE poll_id = ? AND room_id = ?`,
      ['closed', pollId, roomId]
    );

    res.json({ message: 'Poll closed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ GET ROOM POLLS WITH RESULTS ============
router.get('/:roomId/polls', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);

    // Check if user is member of room
    const [isMember] = await pool.query(
      `SELECT r.* FROM rooms r
       WHERE r.id = ? AND (r.created_by = ? OR r.id IN (
         SELECT room_id FROM room_members WHERE user_id = ?
       ))`,
      [roomId, userId, userId]
    );

    if (!isMember.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all polls for room with vote counts
    const [polls] = await pool.query(
      `SELECT 
        p.*,
        rp.status as poll_status,
        rp.started_at,
        rp.closed_at,
        rp.duration_minutes,
        u.username as creator_username,
        COUNT(DISTINCT v.user_id) as total_votes,
        COALESCE(SUM(CASE WHEN v.option_selected = 1 THEN 1 ELSE 0 END), 0) as option1_count,
        COALESCE(SUM(CASE WHEN v.option_selected = 2 THEN 1 ELSE 0 END), 0) as option2_count,
        COALESCE(SUM(CASE WHEN v.option_selected = 3 THEN 1 ELSE 0 END), 0) as option3_count,
        COALESCE(SUM(CASE WHEN v.option_selected = 4 THEN 1 ELSE 0 END), 0) as option4_count,
        IF(EXISTS(SELECT 1 FROM votes WHERE poll_id = p.id AND user_id = ?), true, false) as user_voted
       FROM polls p
       LEFT JOIN room_polls rp ON p.id = rp.poll_id
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN votes v ON p.id = v.poll_id
       WHERE p.room_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId, roomId]
    );

    // Convertir les BigInt en Number pour éviter les problèmes de sérialisation
    const pollsWithNumbers = polls.map(poll => ({
      ...poll,
      total_votes: Number(poll.total_votes) || 0,
      option1_count: Number(poll.option1_count) || 0,
      option2_count: Number(poll.option2_count) || 0,
      option3_count: Number(poll.option3_count) || 0,
      option4_count: Number(poll.option4_count) || 0
    }));

    res.json({ polls: pollsWithNumbers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ VOTE IN ROOM POLL ============
router.post('/:roomId/polls/:pollId/vote', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const roomId = parseInt(req.params.roomId);
    const pollId = parseInt(req.params.pollId);
    const option_selected = parseInt(req.body.option_selected);

    console.log('Vote attempt:', { userId, roomId, pollId, option_selected });

    if (!option_selected || option_selected < 1 || option_selected > 4) {
      return res.status(400).json({ message: 'Invalid option (must be 1-4)' });
    }

    // Check if user is member of room
    const [isMember] = await pool.query(
      `SELECT * FROM room_members WHERE room_id = ? AND user_id = ?`,
      [roomId, userId]
    );

    if (!isMember.length) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }

    // Check if poll exists and is in room
    const [polls] = await pool.query(
      `SELECT p.*, rp.status as poll_status FROM polls p
       LEFT JOIN room_polls rp ON p.id = rp.poll_id
       WHERE p.id = ? AND p.room_id = ?`,
      [pollId, roomId]
    );

    if (!polls.length) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const poll = polls[0];

    // Check poll is active
    if (poll.poll_status !== 'active') {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    // Check if user is creator of poll - cannot vote on own poll
    if (poll.created_by === userId) {
      return res.status(403).json({ message: 'You cannot vote on your own poll' });
    }

    // Check if already voted
    const [existing] = await pool.query(
      `SELECT * FROM votes WHERE poll_id = ? AND user_id = ?`,
      [pollId, userId]
    );

    if (existing.length) {
      return res.status(400).json({ message: 'Already voted' });
    }

    // Record vote
    await pool.query(
      `INSERT INTO votes (poll_id, user_id, option_selected, voted_at) VALUES (?, ?, ?, NOW())`,
      [pollId, userId, option_selected]
    );

    res.json({ message: 'Vote recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
