const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '20mb' }));

// ── DB Init ──────────────────────────────────────────────────────────────────
async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS assessments (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL,
      email VARCHAR(255), mobile VARCHAR(50), year VARCHAR(100), department VARCHAR(255),
      score INT DEFAULT 0, total_questions INT DEFAULT 60, percentage DECIMAL(5,2) DEFAULT 0,
      domain_scores JSON, answers JSON,
      status ENUM('completed','terminated') DEFAULT 'completed',
      reason VARCHAR(500), completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      KEY idx_email(email), KEY idx_status(status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await conn.query(`CREATE TABLE IF NOT EXISTS question_bank (
      id INT AUTO_INCREMENT PRIMARY KEY, config_key VARCHAR(100) NOT NULL,
      data LONGTEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_config_key(config_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await conn.query(`CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL,
      logo_url VARCHAR(500) DEFAULT '', description TEXT,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await conn.query(`CREATE TABLE IF NOT EXISTS job_openings (
      id INT AUTO_INCREMENT PRIMARY KEY, company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL, description TEXT,
      required_skills JSON, experience_level ENUM('fresher','junior','mid','senior') DEFAULT 'fresher',
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await conn.query(`CREATE TABLE IF NOT EXISTS resume_scans (
      id INT AUTO_INCREMENT PRIMARY KEY, user_email VARCHAR(255) NOT NULL,
      job_id INT, resume_text LONGTEXT, extracted_skills JSON,
      match_score DECIMAL(5,2) DEFAULT 0, fit_summary TEXT, ai_raw_response LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_job(user_email, job_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await conn.query(`CREATE TABLE IF NOT EXISTS ai_assessments (
      id INT AUTO_INCREMENT PRIMARY KEY, user_email VARCHAR(255) NOT NULL,
      job_id INT, company_id INT, questions JSON, answers JSON,
      score INT DEFAULT 0, domain_scores JSON, percentage DECIMAL(5,2) DEFAULT 0,
      ai_analysis JSON, time_taken INT DEFAULT 0,
      status ENUM('pending','completed','terminated') DEFAULT 'pending',
      reason VARCHAR(500), completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_job(user_email, job_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await conn.query(`CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(64) NOT NULL,
      mobile VARCHAR(50) DEFAULT '',
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_email(email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await conn.query(`CREATE TABLE IF NOT EXISTS question_templates (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL,
      job_ids JSON DEFAULT NULL,
      domain_names JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Safely add domain_names column if it doesn't exist yet (migration)
    await conn.query(`ALTER TABLE question_templates ADD COLUMN IF NOT EXISTS domain_names JSON DEFAULT NULL`).catch(() => {});

    await conn.query(`CREATE TABLE IF NOT EXISTS template_questions (
      id INT AUTO_INCREMENT PRIMARY KEY, template_id INT NOT NULL,
      domain VARCHAR(100) DEFAULT 'Technical',
      question TEXT NOT NULL, options JSON NOT NULL,
      answer TINYINT NOT NULL DEFAULT 0, concept VARCHAR(255) DEFAULT '',
      sort_order INT DEFAULT 0,
      KEY idx_template(template_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Migrate domain column from ENUM to VARCHAR if needed
    await conn.query(`ALTER TABLE template_questions MODIFY COLUMN domain VARCHAR(100) DEFAULT 'Technical'`).catch(() => {});

    await conn.query(`CREATE TABLE IF NOT EXISTS ai_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      config_key VARCHAR(100) NOT NULL,
      config_value VARCHAR(500) NOT NULL DEFAULT '1',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_key(config_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    console.log('✅ All tables initialized');
  } finally { conn.release(); }
}

// ── Original routes (legacy question bank + assessments) ─────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.get('/api/questions', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT data FROM question_bank WHERE config_key='questions' LIMIT 1");
    res.json(rows.length ? { exists: true, data: JSON.parse(rows[0].data) } : { exists: false, data: null });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { data } = req.body;
    await pool.query(
      "INSERT INTO question_bank (config_key,data) VALUES ('questions',?) ON DUPLICATE KEY UPDATE data=VALUES(data)",
      [JSON.stringify(data)]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/assessments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id,name,email,mobile,year,department,score,total_questions,percentage,domain_scores,status,reason,completed_at FROM assessments ORDER BY score DESC');
    res.json(rows.map(r => ({ ...r, domainScores: r.domain_scores ? JSON.parse(r.domain_scores):{}, totalQuestions:r.total_questions, percentage:parseFloat(r.percentage) })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/assessments/terminated', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id,name,email,mobile,year,department,status,reason,completed_at FROM assessments WHERE status='terminated' ORDER BY completed_at DESC");
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/assessments/check', async (req, res) => {
  try {
    const { email, name, department, year } = req.body;
    const [byEmail] = await pool.query('SELECT id,status,reason FROM assessments WHERE email=? LIMIT 5', [email]);
    const [byDetails] = await pool.query('SELECT id,status,reason FROM assessments WHERE name=? AND department=? AND year=? LIMIT 5', [name, department, year]);
    const all = [...byEmail, ...byDetails];
    let isTerminated=false, isCompleted=false, terminationReason='';
    for (const r of all) {
      if (r.status==='terminated') { isTerminated=true; terminationReason=r.reason; }
      else if (r.status==='completed') isCompleted=true;
    }
    res.json({ isTerminated, isCompleted, terminationReason });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/assessments', async (req, res) => {
  try {
    const { name,email,mobile,year,department,score=0,totalQuestions=60,percentage=0,domainScores={},answers={},status='completed',reason=null } = req.body;
    const [r] = await pool.query(
      'INSERT INTO assessments (name,email,mobile,year,department,score,total_questions,percentage,domain_scores,answers,status,reason) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [name,email,mobile,year,department,score,totalQuestions,percentage,JSON.stringify(domainScores),JSON.stringify(answers),status,reason]
    );
    res.json({ success:true, id:r.insertId });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── New modular routes ────────────────────────────────────────────────────────
app.use('/api/companies', require('./routes/companies'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/ai-assessment', require('./routes/aiAssessment'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/students', require('./routes/students'));

// ── Start ─────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch(e => { console.error('❌ DB init failed:', e); process.exit(1); });
