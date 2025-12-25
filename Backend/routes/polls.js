// routes/polls.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');

// Create Poll (Admin Only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.isAdmin)
      return res.status(403).json({ message: 'Forbidden: Admin only' });

    const { question, option1, option2, option3, option4, end_time, image } = req.body;

    if (!question || !option1 || !option2 || !end_time)
      return res.status(400).json({ message: 'Required fields missing' });

    const [result] = await pool.query(
      `INSERT INTO polls (question, image, option1, option2, option3, option4, end_time, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question,
        image || null,
        option1,
        option2,
        option3 || null,
        option4 || null,
        end_time,
        user.id
      ]
    );

    res.status(201).json({ message: 'Poll created', pollId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote
router.post('/:pollId/vote', authMiddleware, async (req, res) => {
  try {
    const user = req.session.user;
    const pollId = parseInt(req.params.pollId);
    const { option_selected } = req.body; 

    if (!option_selected)
      return res.status(400).json({ message: 'Option required' });

    // Check poll exists
    const [polls] = await pool.query('SELECT * FROM polls WHERE id = ?', [pollId]);
    if (!polls.length)
      return res.status(404).json({ message: 'Poll not found' });

    const poll = polls[0];

    // Check poll still open
    const now = new Date();
    if (now > new Date(poll.end_time))
      return res.status(400).json({ message: 'Poll ended' });

    // Check if already voted
    const [existing] = await pool.query(
      'SELECT * FROM votes WHERE poll_id = ? AND user_id = ?',
      [pollId, user.id]
    );
    if (existing.length)
      return res.status(400).json({ message: 'Already voted' });

    // Insert vote
    await pool.query(
      `INSERT INTO votes (poll_id, user_id, option_selected, voted_at)
       VALUES (?, ?, ?, NOW())`,
      [pollId, user.id, option_selected]
    );

    res.json({ message: 'Vote recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Active Polls WITH CREATOR INFO AND VOTE COUNTS
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const now = new Date();
    
    // Query avec LEFT JOIN pour récupérer les infos du créateur
    const [polls] = await pool.query(
      `SELECT 
        p.*,
        u.username as creator_username,
        u.email as creator_email,
        u.image as creator_image,
        v.option_selected as user_vote
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN votes v ON p.id = v.poll_id AND v.user_id = ?
      WHERE p.end_time > ?
      ORDER BY p.created_at DESC`,
      [userId, now]
    );

    // Calculer les votes pour chaque poll
    const pollsWithVotes = await Promise.all(polls.map(async (poll) => {
      const [votes] = await pool.query(
        'SELECT option_selected FROM votes WHERE poll_id = ?',
        [poll.id]
      );
      
      // Compter les votes pour chaque option
      poll.votes_option1 = votes.filter(v => v.option_selected === 1).length;
      poll.votes_option2 = votes.filter(v => v.option_selected === 2).length;
      poll.votes_option3 = votes.filter(v => v.option_selected === 3).length;
      poll.votes_option4 = votes.filter(v => v.option_selected === 4).length;
      
      return poll;
    }));

    res.json(pollsWithVotes);
  } catch (err) {
    console.error('Erreur /active:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// My Polls - Get polls created by the current user
router.get('/my-polls', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Query pour récupérer uniquement les polls créés par l'utilisateur connecté
    const [polls] = await pool.query(
      `SELECT 
        p.*,
        u.username as creator_username,
        u.email as creator_email,
        u.image as creator_image,
        v.option_selected as user_vote
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN votes v ON p.id = v.poll_id AND v.user_id = ?
      WHERE p.created_by = ?
      ORDER BY p.created_at DESC`,
      [userId, userId]
    );

    // Calculer les votes pour chaque poll
    const pollsWithVotes = await Promise.all(polls.map(async (poll) => {
      const [votes] = await pool.query(
        'SELECT option_selected FROM votes WHERE poll_id = ?',
        [poll.id]
      );
      
      // Compter les votes pour chaque option
      poll.votes_option1 = votes.filter(v => v.option_selected === 1).length;
      poll.votes_option2 = votes.filter(v => v.option_selected === 2).length;
      poll.votes_option3 = votes.filter(v => v.option_selected === 3).length;
      poll.votes_option4 = votes.filter(v => v.option_selected === 4).length;
      
      return poll;
    }));

    res.json(pollsWithVotes);
  } catch (err) {
    console.error('Erreur /my-polls:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Polls finished
router.get('/finished', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const now = new Date();
    
    const [polls] = await pool.query(
      `SELECT 
        p.*,
        u.username as creator_username,
        u.email as creator_email,
        u.image as creator_image,
        v.option_selected as user_vote
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
      INNER JOIN votes v ON p.id = v.poll_id AND v.user_id = ?
      WHERE p.end_time <= ?
      ORDER BY p.end_time DESC`,
      [userId, now]
    );

    // Calculer les votes pour chaque poll
    const pollsWithVotes = await Promise.all(polls.map(async (poll) => {
      const [votes] = await pool.query(
        'SELECT option_selected FROM votes WHERE poll_id = ?',
        [poll.id]
      );
      
      poll.votes_option1 = votes.filter(v => v.option_selected === 1).length;
      poll.votes_option2 = votes.filter(v => v.option_selected === 2).length;
      poll.votes_option3 = votes.filter(v => v.option_selected === 3).length;
      poll.votes_option4 = votes.filter(v => v.option_selected === 4).length;
      
      return poll;
    }));

    res.json(pollsWithVotes);
  } catch (err) {
    console.error('Erreur /finished:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single poll by ID
router.get('/:pollId', authMiddleware, async (req, res) => {
  try {
    const pollId = parseInt(req.params.pollId);
    const userId = req.session.user?.id;
    
    const [polls] = await pool.query(
      `SELECT 
        p.*,
        u.username as creator_username,
        u.email as creator_email,
        u.image as creator_image,
        v.option_selected as user_vote
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN votes v ON p.id = v.poll_id AND v.user_id = ?
      WHERE p.id = ?`,
      [userId, pollId]
    );

    if (!polls.length) 
      return res.status(404).json({ message: 'Poll not found' });

    const poll = polls[0];

    // Calculer les votes
    const [votes] = await pool.query(
      'SELECT option_selected FROM votes WHERE poll_id = ?',
      [pollId]
    );
    
    poll.votes_option1 = votes.filter(v => v.option_selected === 1).length;
    poll.votes_option2 = votes.filter(v => v.option_selected === 2).length;
    poll.votes_option3 = votes.filter(v => v.option_selected === 3).length;
    poll.votes_option4 = votes.filter(v => v.option_selected === 4).length;

    res.json(poll);
  } catch (err) {
    console.error('Erreur /:pollId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Poll Results
router.get('/:pollId/results', authMiddleware, async (req, res) => {
  try {
    const pollId = parseInt(req.params.pollId);

    // fetch poll
    const [polls] = await pool.query('SELECT * FROM polls WHERE id = ?', [pollId]);
    if (!polls.length) 
      return res.status(404).json({ message: 'Poll not found' });

    const poll = polls[0];
    const now = new Date();

    if (now < new Date(poll.end_time)) {
      return res.status(403).json({ message: 'Poll still active, results unavailable' });
    }

    // fetch votes grouped by option
    const [votes] = await pool.query(
      `SELECT option_selected, COUNT(*) AS count
       FROM votes
       WHERE poll_id = ?
       GROUP BY option_selected`,
      [pollId]
    );

    res.json(votes);
  } catch (err) {
    console.error('Erreur /results:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE Poll (Admin only)
router.delete('/:pollId', authMiddleware, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.isAdmin)
      return res.status(403).json({ message: 'Forbidden: Admin only' });

    const pollId = parseInt(req.params.pollId);

    // Vérifier que le poll existe
    const [polls] = await pool.query('SELECT * FROM polls WHERE id = ?', [pollId]);
    if (!polls.length)
      return res.status(404).json({ message: 'Poll not found' });

    // Supprimer d'abord tous les votes associés
    await pool.query('DELETE FROM votes WHERE poll_id = ?', [pollId]);
    
    // Ensuite supprimer le poll
    await pool.query('DELETE FROM polls WHERE id = ?', [pollId]);

    res.json({ message: 'Poll deleted successfully' });
  } catch (err) {
    console.error('Erreur DELETE:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;