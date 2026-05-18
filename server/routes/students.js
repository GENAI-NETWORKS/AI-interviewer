const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const crypto  = require('crypto');

const hash = (pwd) => crypto.createHash('sha256').update(pwd + 'gogenix_salt').digest('hex');

// POST /api/students/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const trimEmail = email.trim().toLowerCase();
    const [existing] = await pool.query('SELECT id FROM students WHERE email=? LIMIT 1', [trimEmail]);
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });

    const [r] = await pool.query(
      'INSERT INTO students (name, email, password_hash) VALUES (?,?,?)',
      [name.trim(), trimEmail, hash(password)]
    );
    res.json({ success: true, user: { id: r.insertId, name: name.trim(), email: trimEmail } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/students/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const trimEmail = email.trim().toLowerCase();
    const [rows] = await pool.query('SELECT * FROM students WHERE email=? LIMIT 1', [trimEmail]);
    if (!rows.length) return res.status(401).json({ error: 'No account found with this email. Please sign up.' });

    const student = rows[0];
    if (student.password_hash !== hash(password)) return res.status(401).json({ error: 'Incorrect password. Please try again.' });

    // Update last login
    await pool.query('UPDATE students SET last_login=NOW() WHERE id=?', [student.id]);

    res.json({ success: true, user: { id: student.id, name: student.name, email: student.email, mobile: student.mobile || '', created_at: student.created_at } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/students/google
router.post('/google', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const trimEmail = email.trim().toLowerCase();
    let [rows] = await pool.query('SELECT * FROM students WHERE email=? LIMIT 1', [trimEmail]);

    if (!rows.length) {
      const defaultName = name ? name.trim() : 'Google User';
      // Register with random password hash
      const [r] = await pool.query(
        'INSERT INTO students (name, email, password_hash) VALUES (?,?,?)',
        [defaultName, trimEmail, hash(crypto.randomBytes(16).toString('hex'))]
      );
      rows = [{ id: r.insertId, name: defaultName, email: trimEmail, mobile: '' }];
    } else {
      await pool.query('UPDATE students SET last_login=NOW() WHERE id=?', [rows[0].id]);
    }

    const student = rows[0];
    res.json({ success: true, user: { id: student.id, name: student.name, email: student.email, mobile: student.mobile || '' } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/students/:email — fetch profile
router.get('/:email', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, mobile, created_at, last_login FROM students WHERE email=? LIMIT 1', [req.params.email.toLowerCase()]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
