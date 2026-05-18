const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── GET all templates (admin list)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.name, t.job_ids,
              t.created_at, t.updated_at,
              (SELECT COUNT(*) FROM template_questions tq WHERE tq.template_id=t.id) as question_count
       FROM question_templates t
       ORDER BY t.created_at DESC`
    );
    
    const [jobs] = await pool.query('SELECT j.id, j.title, c.name as company_name FROM job_openings j LEFT JOIN companies c ON j.company_id=c.id');
    const jobMap = {};
    jobs.forEach(j => jobMap[j.id] = `${j.title} @ ${j.company_name}`);

    const result = rows.map(r => {
      const ids = r.job_ids ? (typeof r.job_ids === 'string' ? JSON.parse(r.job_ids) : r.job_ids) : [];
      const jobLabels = ids.map(id => jobMap[id]).filter(Boolean);
      return { ...r, job_ids: ids, jobLabels };
    });
    
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── GET single template with questions
router.get('/:id', async (req, res) => {
  try {
    const [[tmpl]] = await pool.query('SELECT * FROM question_templates WHERE id=?', [req.params.id]);
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });
    const [questions] = await pool.query(
      'SELECT * FROM template_questions WHERE template_id=? ORDER BY domain, sort_order',
      [req.params.id]
    );
    res.json({
      ...tmpl,
      questions: questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      }))
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── GET template by job_id (used by student assessment)
router.get('/job/:jobId', async (req, res) => {
  try {
    const [[tmpl]] = await pool.query(
      'SELECT * FROM question_templates WHERE JSON_CONTAINS(job_ids, ?) ORDER BY created_at DESC LIMIT 1',
      [String(req.params.jobId)]
    );
    if (!tmpl) return res.json(null);
    const [questions] = await pool.query(
      'SELECT * FROM template_questions WHERE template_id=? ORDER BY domain, sort_order',
      [tmpl.id]
    );
    res.json({
      ...tmpl,
      questions: questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      }))
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST create blank template
router.post('/', async (req, res) => {
  try {
    const { name, job_ids } = req.body;
    const [r] = await pool.query(
      'INSERT INTO question_templates (name, job_ids) VALUES (?,?)',
      [name || 'Untitled Template', JSON.stringify(job_ids || [])]
    );
    res.json({ success: true, id: r.insertId });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── PUT update template meta (name, job_ids, domain_names)
router.put('/:id', async (req, res) => {
  try {
    const { name, job_ids, domain_names } = req.body;
    await pool.query(
      'UPDATE question_templates SET name=?, job_ids=?, domain_names=? WHERE id=?',
      [name, JSON.stringify(job_ids || []), JSON.stringify(domain_names || ['Technical','Domain','Behavioral']), req.params.id]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST save questions for a template (bulk replace)
router.post('/:id/questions', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { questions } = req.body; // array of { domain, question, options:[], answer, concept }
    await conn.query('DELETE FROM template_questions WHERE template_id=?', [req.params.id]);
    if (questions && questions.length) {
      const vals = questions.map((q, i) => [
        req.params.id, q.domain || 'Technical', q.question, JSON.stringify(q.options || []),
        q.answer ?? 0, q.concept || '', i
      ]);
      await conn.query(
        'INSERT INTO template_questions (template_id, domain, question, options, answer, concept, sort_order) VALUES ?',
        [vals]
      );
    }
    await conn.query('UPDATE question_templates SET updated_at=NOW() WHERE id=?', [req.params.id]);
    await conn.commit();
    res.json({ success: true });
  } catch(e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally { conn.release(); }
});

// ── DELETE template
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM template_questions WHERE template_id=?', [req.params.id]);
    await pool.query('DELETE FROM question_templates WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ────────────────────────────────────────────────────────────────────────────
// AI CONFIG
// ────────────────────────────────────────────────────────────────────────────

// GET ai config
router.get('/config/ai', async (req, res) => {
  try {
    const [[row]] = await pool.query("SELECT * FROM ai_config WHERE config_key='ai_enabled' LIMIT 1");
    res.json({ ai_enabled: row ? row.config_value === '1' : true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST toggle ai
router.post('/config/ai', async (req, res) => {
  try {
    const val = req.body.ai_enabled ? '1' : '0';
    await pool.query(
      "INSERT INTO ai_config (config_key, config_value) VALUES ('ai_enabled',?) ON DUPLICATE KEY UPDATE config_value=?",
      [val, val]
    );
    res.json({ success: true, ai_enabled: req.body.ai_enabled });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
