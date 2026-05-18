const API_BASE = import.meta.env.VITE_API_URL
  || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? '/api'
      : 'https://ai-interviewer-ozl5.onrender.com/api');

// ── Questions (legacy) ────────────────────────────────────────────────────────
export async function getQuestions() {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status}`);
  return res.json();
}
export async function saveQuestions(data) {
  const res = await fetch(`${API_BASE}/questions`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({data}) });
  if (!res.ok) throw new Error(`Failed to save questions: ${res.status}`);
  return res.json();
}

// ── Assessments (legacy) ──────────────────────────────────────────────────────
export async function getAssessments() {
  const res = await fetch(`${API_BASE}/assessments`);
  if (!res.ok) throw new Error(`Failed to fetch assessments: ${res.status}`);
  return res.json();
}
export async function getTerminatedAssessments() {
  const res = await fetch(`${API_BASE}/assessments/terminated`);
  if (!res.ok) throw new Error(`Failed to fetch terminated: ${res.status}`);
  return res.json();
}
export async function checkStudentStatus({ email, name, department, year }) {
  const res = await fetch(`${API_BASE}/assessments/check`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,name,department,year}) });
  if (!res.ok) throw new Error(`Failed to check student: ${res.status}`);
  return res.json();
}
export async function submitAssessment(payload) {
  const res = await fetch(`${API_BASE}/assessments`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Failed to submit assessment: ${res.status}`);
  return res.json();
}

// ── Companies ─────────────────────────────────────────────────────────────────
export async function getCompanies() {
  const res = await fetch(`${API_BASE}/companies`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}
export async function getAllCompanies() {
  const res = await fetch(`${API_BASE}/companies/all`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}
export async function createCompany(data) {
  const res = await fetch(`${API_BASE}/companies`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create company');
  return res.json();
}
export async function updateCompany(id, data) {
  const res = await fetch(`${API_BASE}/companies/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update company');
  return res.json();
}
export async function deleteCompany(id) {
  const res = await fetch(`${API_BASE}/companies/${id}`, { method:'DELETE' });
  if (!res.ok) throw new Error('Failed to delete company');
  return res.json();
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export async function getJobsByCompany(companyId) {
  const res = await fetch(`${API_BASE}/jobs/company/${companyId}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}
export async function getAllJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}
export async function getJob(id) {
  const res = await fetch(`${API_BASE}/jobs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}
export async function createJob(data) {
  const res = await fetch(`${API_BASE}/jobs`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}
export async function updateJob(id, data) {
  const res = await fetch(`${API_BASE}/jobs/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}
export async function deleteJob(id) {
  const res = await fetch(`${API_BASE}/jobs/${id}`, { method:'DELETE' });
  if (!res.ok) throw new Error('Failed to delete job');
  return res.json();
}

// ── Resume ────────────────────────────────────────────────────────────────────
export async function uploadResume(formData) {
  const res = await fetch(`${API_BASE}/resume/upload`, { method:'POST', body:formData });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
  return res.json();
}
export async function getResumeScan(email) {
  const res = await fetch(`${API_BASE}/resume/${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Failed to fetch scan');
  return res.json();
}
export async function getAllResumeScans() {
  const res = await fetch(`${API_BASE}/resume`);
  if (!res.ok) throw new Error('Failed to fetch scans');
  return res.json();
}

export async function deleteResumeScan(id) {
  const res = await fetch(`${API_BASE}/resume/${id}`, { method:'DELETE' });
  if (!res.ok) throw new Error('Failed to delete scan');
  return res.json();
}

// ── AI Assessment ─────────────────────────────────────────────────────────────
export async function generateAIQuestions(user_email, job_id) {
  const res = await fetch(`${API_BASE}/ai-assessment/generate`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_email,job_id}) });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Generation failed'); }
  return res.json();
}
export async function submitAIAssessment(payload) {
  const res = await fetch(`${API_BASE}/ai-assessment/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  if (!res.ok) throw new Error('Submission failed');
  return res.json();
}
export async function getAIAssessmentResult(email, jobId) {
  const res = await fetch(`${API_BASE}/ai-assessment/result/${encodeURIComponent(email)}/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch result');
  return res.json();
}
export async function getAllAIAssessments() {
  const res = await fetch(`${API_BASE}/ai-assessment/all`);
  if (!res.ok) throw new Error('Failed to fetch assessments');
  return res.json();
}

export async function deleteAIAssessment(id) {
  const res = await fetch(`${API_BASE}/ai-assessment/${id}`, { method:'DELETE' });
  if (!res.ok) throw new Error('Failed to delete assessment');
  return res.json();
}

// ── Question Templates ────────────────────────────────────────────────────────
export async function getAllTemplates() {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}
export async function getTemplate(id) {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  if (!res.ok) throw new Error('Failed to fetch template');
  return res.json();
}
export async function createTemplate(data) {
  const res = await fetch(`${API_BASE}/templates`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}
export async function updateTemplate(id, data) {
  const res = await fetch(`${API_BASE}/templates/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}
export async function saveTemplateQuestions(id, questions) {
  const res = await fetch(`${API_BASE}/templates/${id}/questions`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ questions }) });
  if (!res.ok) throw new Error('Failed to save questions');
  return res.json();
}
export async function deleteTemplate(id) {
  const res = await fetch(`${API_BASE}/templates/${id}`, { method:'DELETE' });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
}

// ── AI Config ─────────────────────────────────────────────────────────────────
export async function getAIConfig() {
  const res = await fetch(`${API_BASE}/templates/config/ai`);
  if (!res.ok) throw new Error('Failed to fetch AI config');
  return res.json();
}
export async function setAIConfig(ai_enabled) {
  const res = await fetch(`${API_BASE}/templates/config/ai`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ai_enabled }) });
  if (!res.ok) throw new Error('Failed to set AI config');
  return res.json();
}

// ── Student Auth ──────────────────────────────────────────────────────────────
export async function studentRegister({ name, email, password }) {
  const res = await fetch(`${API_BASE}/students/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, email, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}
export async function studentLogin({ email, password }) {
  const res = await fetch(`${API_BASE}/students/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}
export async function studentGoogleLogin({ name, email }) {
  const res = await fetch(`${API_BASE}/students/google`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, email }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Google Login failed');
  return data;
}
