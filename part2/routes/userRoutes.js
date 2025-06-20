const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// GET dogs for the current logged-in user
router.get('/me/dogs', async (req, res) => {
  // Ensure user is logged in
  if (!req.session.user || !req.session.user.user_id) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  try {
    const userId = req.session.user.user_id;
    const [dogs] = await db.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?', 
      [userId]
    );
    res.json(dogs);
  } catch (error) {
    console.error('Failed to fetch user dogs:', error);
    res.status(500).json({ error: 'Database error while fetching dogs' });
  }
});

// POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // TEMPORARY: Direct password comparison (insecure)
  // In a real application, you should hash the incoming password and compare it to the stored hash.
  // For example: const isMatch = await bcrypt.compare(password, user.password_hash);
  const tempPassCheck = password; 

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, tempPassCheck]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = rows[0]; // Save user info in session
    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // connect.sid is the default session cookie name
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;