const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await db.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4)',
      [name, email, phone, hash]
    );
    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ message: 'Login successful', token });
});

module.exports = router;

// // Middleware to verify token
// function verifyToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Missing token' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.userId = decoded.userId;
//     next();
//   });
// }

// Protected route
router.get('/profile', verifyToken, async (req, res) => {
  const result = await db.query('SELECT name, email FROM users WHERE id = $1', [req.userId]);
  const user = result.rows[0];
  res.json(user);
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
}

router.get('/bookings', verifyToken, async (req, res) => {
  const result = await db.query(
    'SELECT origin, destination, date FROM bookings WHERE user_id = $1',
    [req.userId]
  );
  res.json(result.rows);
});

router.get('/fleet', verifyToken, async (req, res) => {
  const result = await db.query(
    'SELECT plate, model, status FROM fleet'
  );
  res.json(result.rows);
});


router.post('/bookings', verifyToken, async (req, res) => {
  const { origin, destination, date } = req.body;
  try {
    await db.query(
      'INSERT INTO bookings (user_id, origin, destination, date) VALUES ($1, $2, $3, $4)',
      [req.userId, origin, destination, date]
    );
    res.json({ message: 'Booking created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
  console.log('Booking received:', origin, destination, date);
});