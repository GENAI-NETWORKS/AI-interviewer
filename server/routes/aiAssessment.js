const express = require('express');
const router = express.Router();
const pool = require('../db');
const { generateQuestions, analyzeScore } = require('../gemini');

// POST /api/ai-assessment/generate — generate or load 60 questions
router.post('/generate', async (req, res) => {
  try {
    const { user_email, job_id } = req.body;

    // Get job details
    const [jobs] = await pool.query(
      'SELECT j.*, c.name as company_name FROM job_openings j JOIN companies c ON j.company_id=c.id WHERE j.id=?',
      [job_id]
    );
    if (!jobs.length) return res.status(404).json({ error: 'Job not found' });
    const job = jobs[0];
    const requiredSkills = job.required_skills ? JSON.parse(job.required_skills) : [];

    // Check AI enabled flag
    const [[cfgRow]] = await pool.query("SELECT config_value FROM ai_config WHERE config_key='ai_enabled' LIMIT 1");
    const aiEnabled = cfgRow ? cfgRow.config_value === '1' : true;

    let questions = [];

    if (!aiEnabled) {
      // --- MANUAL MODE: load from linked template ---
      const [[tmpl]] = await pool.query(
        'SELECT id FROM question_templates WHERE JSON_CONTAINS(job_ids, ?) ORDER BY created_at DESC LIMIT 1',
        [String(job_id)]
      );
      if (!tmpl) return res.status(400).json({ error: 'AI is disabled and no question template is linked to this job. Please link a template in the Admin Panel.' });
      const [tqs] = await pool.query(
        'SELECT * FROM template_questions WHERE template_id=? ORDER BY domain, sort_order',
        [tmpl.id]
      );
      if (tqs.length < 60) return res.status(400).json({ error: `Template only has ${tqs.length} questions. Need 60 (20 per domain).` });
      
      const shuffle = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      let mappedQs = tqs.map((q, i) => {
        let opts = q.options ? JSON.parse(q.options) : [];
        let optObjs = opts.map((text, idx) => ({ text, isCorrect: idx === q.answer }));
        optObjs = shuffle(optObjs);
        
        return {
          id: `q${i+1}`, domain: q.domain, question: q.question,
          options: optObjs.map(x => x.text),
          answer: optObjs.findIndex(x => x.isCorrect),
          concept: q.concept || ''
        };
      });

      const tech = shuffle(mappedQs.filter(q => q.domain === 'Technical')).slice(0, 20);
      const dom  = shuffle(mappedQs.filter(q => q.domain === 'Domain')).slice(0, 20);
      const beh  = shuffle(mappedQs.filter(q => q.domain === 'Behavioral')).slice(0, 20);
      
      questions = [...tech, ...dom, ...beh];
      questions.forEach((q, i) => q.id = `q${i+1}`);
    } else {
      // --- AI MODE: generate via Pollinations ---
      const [scans] = await pool.query(
        'SELECT extracted_skills FROM resume_scans WHERE user_email=? AND job_id=? ORDER BY created_at DESC LIMIT 1',
        [user_email, job_id]
      );
      const extractedSkills = scans.length && scans[0].extracted_skills
        ? JSON.parse(scans[0].extracted_skills) : requiredSkills;
      questions = await generateQuestions(job.title, job.description, requiredSkills, extractedSkills);
    }

    // Save pending assessment
    await pool.query(
      `INSERT INTO ai_assessments (user_email, job_id, company_id, questions, status)
       VALUES (?,?,?,?,'pending')
       ON DUPLICATE KEY UPDATE questions=VALUES(questions), status='pending', answers=NULL`,
      [user_email, job_id, job.company_id, JSON.stringify(questions)]
    );

    res.json({ success: true, questions, jobTitle: job.title, companyName: job.company_name, aiEnabled });
  } catch(e) {
    console.error('Question generation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ai-assessment/submit — save answers + calculate score
router.post('/submit', async (req, res) => {
  try {
    const { user_email, job_id, answers, questions, timeTaken, status = 'completed', reason } = req.body;

    let score = 0;
    const domainScores = { Technical: 0, Domain: 0, Behavioral: 0 };

    if (status === 'completed' && questions && answers) {
      questions.forEach((q, idx) => {
        const userAns = answers[idx];
        if (userAns === q.answer) {
          score++;
          const domain = q.domain || 'Technical';
          if (domainScores[domain] !== undefined) domainScores[domain]++;
          else domainScores[domain] = (domainScores[domain] || 0) + 1;
        }
      });
    }

    const percentage = (questions && questions.length > 0) ? (score / questions.length) * 100 : 0;

    // AI analysis
    let aiAnalysis = null;
    if (status === 'completed') {
      try {
        aiAnalysis = await analyzeScore(
          'the position', score, domainScores, questions ? questions.length : 60
        );
      } catch(e) { console.warn('AI analysis skipped:', e.message); }
    }

    await pool.query(
      `UPDATE ai_assessments
       SET answers=?, score=?, domain_scores=?, percentage=?, status=?, reason=?,
           time_taken=?, ai_analysis=?, completed_at=NOW()
       WHERE user_email=? AND job_id=?`,
      [
        JSON.stringify(answers || {}),
        score, JSON.stringify(domainScores), percentage,
        status, reason || null, timeTaken || 0,
        aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        user_email, job_id
      ]
    );

    res.json({ success: true, score, domainScores, percentage, aiAnalysis });
  } catch(e) {
    console.error('Submit error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/ai-assessment/result/:email/:jobId
router.get('/result/:email/:jobId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, j.title as job_title, c.name as company_name
       FROM ai_assessments a
       LEFT JOIN job_openings j ON a.job_id=j.id
       LEFT JOIN companies c ON a.company_id=c.id
       WHERE a.user_email=? AND a.job_id=?
       ORDER BY a.completed_at DESC LIMIT 1`,
      [req.params.email, req.params.jobId]
    );
    if (!rows.length) return res.json(null);
    const r = rows[0];
    res.json({
      ...r,
      domain_scores: r.domain_scores ? JSON.parse(r.domain_scores) : {},
      ai_analysis: r.ai_analysis ? JSON.parse(r.ai_analysis) : null
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET all assessments (admin)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.user_email, a.score, a.percentage, a.status, a.reason,
              a.time_taken, a.completed_at, j.title as job_title, c.name as company_name,
              a.domain_scores, a.ai_analysis
       FROM ai_assessments a
       LEFT JOIN job_openings j ON a.job_id=j.id
       LEFT JOIN companies c ON a.company_id=c.id
       ORDER BY a.completed_at DESC`
    );
    res.json(rows.map(r => ({
      ...r,
      domain_scores: r.domain_scores ? JSON.parse(r.domain_scores) : {},
      ai_analysis: r.ai_analysis ? JSON.parse(r.ai_analysis) : null
    })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE AI Assessment
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ai_assessments WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
