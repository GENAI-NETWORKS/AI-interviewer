const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET jobs by company
router.get('/company/:companyId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT j.*, c.name as company_name FROM job_openings j JOIN companies c ON j.company_id=c.id WHERE j.company_id=? AND j.is_active=1 ORDER BY j.created_at DESC',
      [req.params.companyId]
    );
    const formatted = rows.map(r => ({
      ...r, required_skills: r.required_skills ? JSON.parse(r.required_skills) : []
    }));
    res.json(formatted);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET single job
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT j.*, c.name as company_name FROM job_openings j JOIN companies c ON j.company_id=c.id WHERE j.id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    res.json({ ...r, required_skills: r.required_skills ? JSON.parse(r.required_skills) : [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET all jobs (admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT j.*, c.name as company_name FROM job_openings j JOIN companies c ON j.company_id=c.id ORDER BY j.created_at DESC'
    );
    const formatted = rows.map(r => ({
      ...r, required_skills: r.required_skills ? JSON.parse(r.required_skills) : []
    }));
    res.json(formatted);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST create job (admin)
router.post('/', async (req, res) => {
  try {
    const { company_id, title, description, required_skills, experience_level } = req.body;
    const [r] = await pool.query(
      'INSERT INTO job_openings (company_id, title, description, required_skills, experience_level) VALUES (?,?,?,?,?)',
      [company_id, title, description||'', JSON.stringify(required_skills||[]), experience_level||'fresher']
    );
    res.json({ success: true, id: r.insertId });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT update job (admin)
router.put('/:id', async (req, res) => {
  try {
    const { company_id, title, description, required_skills, experience_level, is_active } = req.body;
    await pool.query(
      'UPDATE job_openings SET company_id=?, title=?, description=?, required_skills=?, experience_level=?, is_active=? WHERE id=?',
      [company_id, title, description, JSON.stringify(required_skills||[]), experience_level, is_active, req.params.id]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE job (admin)
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM job_openings WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
