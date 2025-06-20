const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all dogs with their size and owner's username
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
      ORDER BY u.username, d.name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch all dogs:', error);
    res.status(500).json({ error: 'Database error while fetching dogs' });
  }
});

module.exports = router; 