/**
 * AI Module — powered by Pollinations.ai (free, no key required)
 */
const fetch = require('node-fetch');

const ENDPOINT = 'https://text.pollinations.ai/';
const MODELS   = ['openai-large', 'openai', 'mistral', 'llama'];

/* ─── Core AI call ─── */
async function callAI(prompt, maxRetry = 3) {
  let lastErr;
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model,
            seed: 42,
            jsonMode: true,
            private: true
          }),
          timeout: 120000
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (text && text.trim().length > 20) {
          console.log(`✅ AI via Pollinations/${model} (attempt ${attempt})`);
          return text.trim();
        }
        throw new Error('Empty response');
      } catch (e) {
        lastErr = e;
        const wait = e.message?.includes('429') ? attempt * 20000 : 3000;
        if (attempt < maxRetry) {
          console.warn(`⚠️  ${model} attempt ${attempt}: ${e.message} — retry in ${wait/1000}s`);
          await new Promise(r => setTimeout(r, wait));
        }
      }
    }
    console.warn(`⚠️  ${model} exhausted — next model`);
  }
  throw lastErr || new Error('All AI models failed');
}

/* ─── Robust JSON parser ─── */
function parseJSON(raw) {
  // 1. Strip markdown fences
  let text = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();

  // 2. Find the first { or [
  const start = text.search(/[{[]/);
  if (start > 0) text = text.slice(start);

  // 3. Find matching closing bracket
  const openChar  = text[0];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0, end = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === openChar)  depth++;
    if (text[i] === closeChar) { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end !== -1) text = text.slice(0, end + 1);

  // 4. Fix common AI JSON mistakes
  text = text
    .replace(/,\s*([}\]])/g, '$1')          // trailing commas
    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // unquoted keys
    .replace(/:\s*'([^']*)'/g, ': "$1"')    // single-quoted values
    .replace(/\/\/[^\n]*/g, '')              // line comments
    .replace(/\/\*[\s\S]*?\*\//g, '');       // block comments

  try {
    return JSON.parse(text);
  } catch (e) {
    // Last resort: try to recover by truncating at last complete object
    const lastComma = text.lastIndexOf('},');
    if (lastComma > 0) {
      try {
        return JSON.parse(text.slice(0, lastComma + 1) + ']}');
      } catch {}
    }
    throw new Error(`JSON parse failed: ${e.message} | raw: ${text.substring(0, 200)}`);
  }
}

/* ─── Resume scanner ─── */
async function scanResume(resumeText, jobTitle, jobDescription, requiredSkills) {
  const skills = Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills;
  const prompt = `You are an expert HR AI. Analyze this resume for the job opening.

JOB: ${jobTitle}
DESCRIPTION: ${(jobDescription || '').substring(0, 500)}
REQUIRED SKILLS: ${skills}

RESUME:
${resumeText.substring(0, 5000)}

Reply with ONLY this JSON (no extra text):
{"extractedSkills":["skill1","skill2"],"matchScore":75,"fitSummary":"2-3 sentence summary","strengths":["s1","s2"],"gaps":["g1","g2"]}`;

  const text = await callAI(prompt);
  return parseJSON(text);
}

/* ─── Question generator — 3 batches of 20 ─── */
async function generateQuestions(jobTitle, jobDescription, requiredSkills, extractedSkills, onProgress) {
  const rSkills = Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills;
  const eSkills = Array.isArray(extractedSkills) ? extractedSkills.join(', ') : extractedSkills;

  const domainPrompt = `You are an expert HR AI. Based on the job title '${jobTitle}' and the candidate's skills '${eSkills}', define exactly 3 interview domain topics to assess this candidate. 
Reply with ONLY this JSON:
{"domains":[{"name":"Topic 1","focus":"what to ask"},{"name":"Topic 2","focus":"what to ask"},{"name":"Topic 3","focus":"what to ask"}]}`;

  let domains = [];
  try {
    const text = await callAI(domainPrompt);
    const parsed = parseJSON(text);
    if (parsed.domains && parsed.domains.length === 3) {
      domains = parsed.domains;
    } else {
      throw new Error('Invalid domains generated');
    }
  } catch(e) {
    console.warn('⚠️ Domain generation failed, using defaults', e.message);
    domains = [
      { name: 'Technical', focus: `technical concepts for ${jobTitle}, skills: ${rSkills}` },
      { name: 'Domain', focus: `role-specific knowledge for ${jobTitle}` },
      { name: 'Behavioral', focus: 'soft skills, situational scenarios' }
    ];
  }

  const allQuestions = [];
  let qNum = 1;

  for (let di = 0; di < domains.length; di++) {
    const { name, focus } = domains[di];
    const count = 20;
    if (onProgress) onProgress(di + 1); // step 1,2,3

    const prompt = `Generate exactly ${count} multiple-choice questions about: ${focus}.
Candidate skills: ${eSkills}

Rules:
- Each question has EXACTLY 4 options
- "answer" is index 0-3 of correct option
- Use double quotes for ALL strings
- No trailing commas

Return ONLY valid JSON:
{"questions":[{"id":"q${qNum}","domain":"${name}","question":"Question text?","options":["A","B","C","D"],"answer":0,"concept":"topic"}]}`;

    try {
      const text = await callAI(prompt);
      const parsed = parseJSON(text);
      let qs = (parsed.questions || []).slice(0, count);
      if (qs.length < count) {
        console.warn(`⚠️  Generated only ${qs.length} questions for ${name}, padding...`);
        for (let i = qs.length; i < count; i++) {
          qs.push({
            question: `${name} placeholder question ${i+1}?`,
            options: ['A', 'B', 'C', 'D'],
            answer: 0,
            concept: name
          });
        }
      }
      qs.forEach(q => { q.id = `q${qNum++}`; q.domain = name; allQuestions.push(q); });
      console.log(`✅ Finalized ${qs.length} ${name} questions`);
    } catch(e) {
      console.warn(`⚠️  Failed ${name} batch: ${e.message} — using placeholders`);
      for (let i = 0; i < count; i++) {
        allQuestions.push({
          id: `q${qNum++}`, domain: name,
          question: `${name} question ${i+1} for ${jobTitle}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: 0, concept: name
        });
      }
    }
  }
  if (onProgress) onProgress(4); // step 4 = saving
  return allQuestions;
}

/* ─── Score analyser ─── */
async function analyzeScore(jobTitle, score, domainScores, totalQuestions) {
  const pct = ((score / totalQuestions) * 100).toFixed(1);
  const dsText = Object.entries(domainScores || {}).map(([d, s]) => `${d}: ${s}/20`).join(', ');
  
  const prompt = `Candidate completed AI interview for: ${jobTitle}
Score: ${score}/${totalQuestions} (${pct}%)
Domain Breakdown: ${dsText}

Reply with ONLY this JSON:
{"verdict":"Selected","performanceSummary":"2-3 sentence summary","strengths":["s1","s2"],"improvements":["i1","i2"],"nextSteps":"recommended action"}

verdict MUST be exactly: "Selected" (>=70%), "On Hold" (40-69%), or "Rejected" (<40%)`;

  const text = await callAI(prompt);
  return parseJSON(text);
}

module.exports = { scanResume, generateQuestions, analyzeScore };
