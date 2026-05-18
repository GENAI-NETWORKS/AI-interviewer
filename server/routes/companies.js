const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all active companies
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM companies WHERE is_active=1 ORDER BY name');
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET all companies (admin)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST create company (admin)
router.post('/', async (req, res) => {
  try {
    const { name, logo_url, description } = req.body;
    const [r] = await pool.query(
      'INSERT INTO companies (name, logo_url, description) VALUES (?,?,?)',
      [name, logo_url||'', description||'']
    );
    res.json({ success: true, id: r.insertId });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT update company (admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, logo_url, description, is_active } = req.body;
    await pool.query(
      'UPDATE companies SET name=?, logo_url=?, description=?, is_active=? WHERE id=?',
      [name, logo_url, description, is_active, req.params.id]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE company (admin)
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
