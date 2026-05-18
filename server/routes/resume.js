const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const mammoth = require('mammoth');
const pool = require('../db');
const { scanResume } = require('../gemini');

const OCR_API_KEY = 'K81131136988957';

// Multer config - store in uploads/
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF/DOC/DOCX files allowed'));
  }
});

// Extract text from uploaded file
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    // Use OCR.space free API
    const form = new FormData();
    form.append('apikey', OCR_API_KEY);
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');
    form.append('OCREngine', '2');
    form.append('file', fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: 'application/pdf'
    });

    const response = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    const data = response.data;
    if (data.IsErroredOnProcessing) {
      throw new Error('OCR failed: ' + (data.ErrorMessage?.[0] || 'Unknown OCR error'));
    }
    const text = (data.ParsedResults || []).map(r => r.ParsedText || '').join('\n');
    return text;

  } else if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  return '';
}

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const { user_email, job_id } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Extract text
    const resumeText = await extractText(req.file.path);
    if (!resumeText || resumeText.trim().length < 50) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Could not extract text from resume. Try a text-based PDF.' });
    }

    // Get job details
    const [jobs] = await pool.query(
      'SELECT j.*, c.name as company_name FROM job_openings j JOIN companies c ON j.company_id=c.id WHERE j.id=?',
      [job_id]
    );
    if (!jobs.length) return res.status(404).json({ error: 'Job not found' });
    const job = jobs[0];
    const requiredSkills = job.required_skills ? JSON.parse(job.required_skills) : [];

    // Gemini AI scan
    const scanResult = await scanResume(resumeText, job.title, job.description, requiredSkills);

    // Save to DB
    const [r] = await pool.query(
      `INSERT INTO resume_scans (user_email, job_id, resume_text, extracted_skills, match_score, fit_summary, ai_raw_response)
       VALUES (?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         resume_text=VALUES(resume_text), extracted_skills=VALUES(extracted_skills),
         match_score=VALUES(match_score), fit_summary=VALUES(fit_summary),
         ai_raw_response=VALUES(ai_raw_response)`,
      [
        user_email, job_id, resumeText,
        JSON.stringify(scanResult.extractedSkills || []),
        scanResult.matchScore || 0,
        scanResult.fitSummary || '',
        JSON.stringify(scanResult)
      ]
    );

    // Cleanup file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      matchScore: scanResult.matchScore,
      fitSummary: scanResult.fitSummary,
      extractedSkills: scanResult.extractedSkills,
      strengths: scanResult.strengths || [],
      gaps: scanResult.gaps || [],
      jobTitle: job.title,
      companyName: job.company_name
    });
  } catch(e) {
    console.error('Resume upload error:', e);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/resume/:email  — latest scan for user
router.get('/:email', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM resume_scans WHERE user_email=? ORDER BY created_at DESC LIMIT 1',
      [req.params.email]
    );
    if (!rows.length) return res.json(null);
    const r = rows[0];
    res.json({
      ...r,
      extracted_skills: r.extracted_skills ? JSON.parse(r.extracted_skills) : [],
      ai_raw_response: r.ai_raw_response ? JSON.parse(r.ai_raw_response) : {}
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET all resume scans (admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rs.*, j.title as job_title, c.name as company_name
       FROM resume_scans rs
       LEFT JOIN job_openings j ON rs.job_id=j.id
       LEFT JOIN companies c ON j.company_id=c.id
       ORDER BY rs.created_at DESC`
    );
    res.json(rows.map(r => ({
      ...r,
      extracted_skills: r.extracted_skills ? JSON.parse(r.extracted_skills) : []
    })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE resume scan
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM resume_scans WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
