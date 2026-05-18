import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Clock, Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API = '/api';

/* ─── CSS ─── */
const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{scrollbar-width:none;-ms-overflow-style:none;overflow-x:hidden;background:#0a0a0f;}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;}
.sa-wrap{min-height:100vh;background:#0a0a0f;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;padding:1.5rem;}
.sa-card{background:#0d0d16;border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:2rem;width:100%;max-width:760px;}
/* loading */
.sa-spin{width:48px;height:48px;border:3px solid rgba(99,102,241,.2);border-top-color:#6366f1;border-radius:50%;animation:sa-rotate .8s linear infinite;margin:0 auto 1.25rem;}
@keyframes sa-rotate{to{transform:rotate(360deg);}}
/* instructions */
.sa-rule{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1rem 1.25rem;margin-bottom:.75rem;}
.sa-rule-title{font-size:.85rem;font-weight:700;color:#e2e8f0;margin-bottom:.3rem;}
.sa-rule-text{font-size:.8rem;color:#64748b;line-height:1.5;}
/* header bar */
.sa-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid rgba(255,255,255,.07);}
.sa-domain-badge{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);border-radius:50px;padding:.3rem .8rem;font-size:.72rem;color:#a5b4fc;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}
.sa-timer{display:inline-flex;align-items:center;gap:.5rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:.4rem .85rem;font-family:monospace;font-size:1.1rem;font-weight:700;color:#f1f5f9;}
.sa-timer.warn{border-color:rgba(251,191,36,.4);color:#fbbf24;}
.sa-timer.danger{border-color:rgba(239,68,68,.4);color:#f87171;animation:sa-blink 1s ease-in-out infinite;}
@keyframes sa-blink{0%,100%{opacity:1;}50%{opacity:.5;}}
/* progress */
.sa-progress-bar{height:4px;background:rgba(255,255,255,.07);border-radius:50px;margin-bottom:1.5rem;overflow:hidden;}
.sa-progress-fill{height:100%;background:linear-gradient(90deg,#6366f1,#a855f7);border-radius:50px;transition:width .4s ease;}
/* question */
.sa-q-num{font-size:.78rem;color:#64748b;margin-bottom:.6rem;}
.sa-q-text{font-size:1rem;font-weight:600;color:#f1f5f9;line-height:1.6;margin-bottom:1.25rem;padding:1rem;background:rgba(99,102,241,.05);border:1px solid rgba(99,102,241,.15);border-radius:12px;}
.sa-code{font-family:monospace;font-size:.85rem;background:#0a0a0f;border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:.75rem;margin-top:.5rem;color:#a5b4fc;white-space:pre-wrap;display:block;}
/* options */
.sa-options{display:flex;flex-direction:column;gap:.65rem;}
.sa-option{display:flex;align-items:flex-start;gap:.75rem;padding:.85rem 1rem;border:1px solid rgba(255,255,255,.07);border-radius:12px;cursor:pointer;transition:all .2s;color:#94a3b8;font-size:.9rem;line-height:1.5;}
.sa-option:hover{border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.05);color:#e2e8f0;}
.sa-option.selected{border-color:#6366f1;background:rgba(99,102,241,.12);color:#e2e8f0;}
.sa-opt-letter{width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;flex-shrink:0;color:#64748b;}
.sa-option.selected .sa-opt-letter{background:#6366f1;color:#fff;}
/* nav */
.sa-nav{display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.07);}
.sa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.65rem 1.25rem;border-radius:10px;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;border:none;font-family:'Inter',sans-serif;}
.sa-btn-prev{background:rgba(255,255,255,.05);color:#94a3b8;}
.sa-btn-prev:hover:not(:disabled){background:rgba(255,255,255,.1);color:#e2e8f0;}
.sa-btn-next{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;}
.sa-btn-next:hover:not(:disabled){opacity:.88;}
.sa-btn:disabled{opacity:.35;cursor:not-allowed;}
.sa-btn-submit{background:linear-gradient(135deg,#059669,#10b981);color:#fff;}
/* warning overlay */
.sa-warn-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:999;padding:1.5rem;}
.sa-warn-box{background:#0d0d16;border:1px solid rgba(251,191,36,.3);border-radius:20px;padding:2rem;max-width:420px;text-align:center;}
/* result */
.sa-result-score{font-size:4rem;font-weight:800;line-height:1;margin-bottom:.25rem;}
.sa-domain-row{display:flex;justify-content:space-between;align-items:center;padding:.6rem 0;border-bottom:1px solid rgba(255,255,255,.05);}
.sa-domain-row:last-child{border-bottom:none;}
/* counters */
.sa-q-counter{font-size:.78rem;color:#64748b;}
/* domain stepper */
.sa-dstepper{display:flex;gap:.5rem;margin-bottom:1rem;}
.sa-dstep{flex:1;height:5px;border-radius:50px;background:rgba(255,255,255,.07);transition:background .4s;}
.sa-dstep.done{background:#6366f1;}
.sa-dstep.active{background:linear-gradient(90deg,#6366f1,#a855f7);}
/* domain complete */
.sa-dc-wrap{text-align:center;padding:2rem 0;}
.sa-dc-icon{width:64px;height:64px;border-radius:50%;background:rgba(99,102,241,.15);border:2px solid rgba(99,102,241,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;}
`;

const LETTERS = ['A', 'B', 'C', 'D'];

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function parseQuestion(text) {
  const markers = /(python|javascript|js|sql|java|c\+\+|typescript)\s*:/i;
  const m = text.match(markers);
  if (!m) return { pre: text, code: null };
  return { pre: text.slice(0, m.index).trim(), code: text.slice(m.index + m[0].length).trim() };
}

export default function StudentAssessment() {
  const navigate = useNavigate();

  /* ── state ── */
  const [stage, setStage]         = useState('loading'); // loading|instructions|test|submitting|result|terminated
  const [questions, setQuestions] = useState([]);
  const [jobTitle, setJobTitle]   = useState('');
  const [answers, setAnswers]     = useState({});          // { qIndex: optionIndex }
  const [domainIdx, setDomainIdx]  = useState(0); // 0=Technical 1=Domain 2=Behavioral
  const [qInDomain, setQInDomain]  = useState(0); // 0-19 within domain
  const [timer, setTimer]         = useState(3600);
  const [warnMsg, setWarnMsg]     = useState('');
  const [result, setResult]       = useState(null);
  const [loadErr, setLoadErr]     = useState('');
  const [loadStep, setLoadStep]   = useState(0);

  const timerRef   = useRef(null);
  const terminated = useRef(false);
  const userRef    = useRef(null);
  const jobRef     = useRef(null);

  /* ── load questions ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('studentDetails') || 'null');
    const job  = JSON.parse(localStorage.getItem('selectedJob')    || 'null');
    if (!user || !job) { navigate('/'); return; }
    userRef.current = user;
    jobRef.current  = job;

    setJobTitle(job.title || 'Assessment');
    setLoadStep(1);

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 280000); // 4m40s

    fetch(`${API}/ai-assessment/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: user.email, job_id: job.id }),
      signal: ctrl.signal
    })
      .then(r => { if (!r.ok) return r.json().then(e => { throw new Error(e.error || `Server error ${r.status}`) }); return r.json(); })
      .then(data => {
        clearTimeout(timeout);
        if (data.error) throw new Error(data.error);
        const qs = data.questions || [];
        setQuestions(qs);
        setLoadStep(4);
        setTimeout(() => setStage('instructions'), 1200);
      })
      .catch(e => {
        clearTimeout(timeout);
        const msg = e.name === 'AbortError' ? 'Request timed out — AI took too long. Please try again.' : e.message;
        setLoadErr(msg);
      });
  }, [navigate]);

  /* ── timer ── */
  useEffect(() => {
    if (stage !== 'test') return;
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTerminate('Time Limit Exceeded'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  /* ── anti-cheat ── */
  const handleTerminate = useCallback(async (reason) => {
    if (terminated.current) return;
    terminated.current = true;
    clearInterval(timerRef.current);
    setStage('terminated');
    const user = userRef.current;
    const job  = jobRef.current;
    if (user && job) {
      try {
        await fetch(`${API}/ai-assessment/submit`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: user.email, job_id: job.id, status: 'terminated', reason, answers: {}, questions: [] })
        });
      } catch {}
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (stage !== 'test') return;
    const onHide = () => handleTerminate('Tab Switch / Window Minimised');
    const onBlur = () => handleTerminate('Window Focus Lost');
    const onFs   = () => { if (!document.fullscreenElement) handleTerminate('Exited Fullscreen'); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [stage, handleTerminate]);

  /* ── actions ── */
  function startTest() {
    document.documentElement.requestFullscreen?.().catch(() => {});
    setStage('test');
  }

  function selectOption(idx) {
    setAnswers(prev => ({ ...prev, [current]: idx }));
  }

  function goPrev() {
    if (qInDomain > 0) setQInDomain(q => q - 1);
    else if (domainIdx > 0) { setDomainIdx(d => d - 1); setQInDomain(19); }
  }

  function goNext() {
    if (answers[current] === undefined) { setWarnMsg('Please select an answer before continuing.'); return; }
    if (qInDomain < domainQuestions.length - 1) setQInDomain(q => q + 1);
  }

  function nextDomain() {
    if (answers[current] === undefined) { setWarnMsg('Please answer the last question before proceeding to the next domain.'); return; }
    setDomainIdx(d => d + 1);
    setQInDomain(0);
  }

  async function handleSubmit() {
    if (answers[current] === undefined) { setWarnMsg('Please select an answer before submitting.'); return; }
    clearInterval(timerRef.current);
    setStage('submitting');
    const user = userRef.current;
    const job  = jobRef.current;
    try {
      const res = await fetch(`${API}/ai-assessment/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email, job_id: job.id,
          answers, questions, timeTaken: 3600 - timer, status: 'completed'
        })
      });
      const data = await res.json();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setResult(data);
      setStage('result');
    } catch(e) {
      setStage('test');
      setWarnMsg('Submit failed: ' + e.message);
    }
  }

  /* ─── helpers ─── */
  const DOMAIN_NAMES    = questions.length ? [...new Set(questions.map(q => q.domain))] : ['Topic 1', 'Topic 2', 'Topic 3'];
  const current         = domainIdx * 20 + qInDomain;
  const domainQuestions = questions.slice(domainIdx * 20, domainIdx * 20 + 20);
  const q               = domainQuestions[qInDomain];
  const isLastInDomain  = domainQuestions.length > 0 && qInDomain === domainQuestions.length - 1;
  const isLastDomain    = domainIdx === 2;
  const progress        = domainQuestions.length ? ((qInDomain + 1) / domainQuestions.length) * 100 : 0;
  const timerClass      = timer < 300 ? 'sa-timer danger' : timer < 600 ? 'sa-timer warn' : 'sa-timer';

  /* ─── renders ─── */

  // LOADING
  if (stage === 'loading') {
    const LOAD_STEPS = [
      'Connecting and analyzing resume…',
      'Generating questions for Domain 1 (1/3)…',
      'Generating questions for Domain 2 (2/3)…',
      'Generating questions for Domain 3 (3/3)…',
      'Saving assessment…'
    ];
    return (
      <div className="sa-wrap"><style>{S}</style>
        <div className="sa-card" style={{ textAlign:'center', padding:'3rem' }}>
          {loadErr ? (
            <>
              <XCircle size={48} color="#f87171" style={{ margin:'0 auto 1rem' }} />
              <div style={{ color:'#f87171', fontWeight:700, fontSize:'1.1rem', marginBottom:'.5rem' }}>Generation Failed</div>
              <div style={{ color:'#64748b', fontSize:'.85rem', marginBottom:'1.5rem', lineHeight:1.6 }}>{loadErr}</div>
              <button className="sa-btn sa-btn-next" onClick={() => window.location.reload()}>Try Again</button>
            </>
          ) : (
            <>
              <div className="sa-spin" />
              <div style={{ color:'#a5b4fc', fontWeight:700, fontSize:'1.1rem', marginBottom:'.4rem' }}>Generating Your Assessment…</div>
              <div style={{ color:'#64748b', fontSize:'.82rem', marginBottom:'1.5rem' }}>AI crafting 60 personalised questions · 1–3 mins</div>
              <div style={{ textAlign:'left', maxWidth:320, margin:'0 auto' }}>
                {LOAD_STEPS.map((s, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.35rem 0', fontSize:'.82rem',
                    color: i < loadStep ? '#34d399' : i === loadStep ? '#a5b4fc' : '#334155' }}>
                    {i < loadStep
                      ? <CheckCircle size={14} color="#34d399" style={{flexShrink:0}} />
                      : i === loadStep
                      ? <Loader2 size={14} color="#a5b4fc" style={{ animation:'sa-rotate .8s linear infinite', flexShrink:0 }} />
                      : <div style={{ width:14, height:14, borderRadius:'50%', border:'1px solid #334155', flexShrink:0 }} />}
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // INSTRUCTIONS
  if (stage === 'instructions') return (
    <div className="sa-wrap"><style>{S}</style>
      <div className="sa-card">
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', background:'rgba(99,102,241,.12)', border:'1px solid rgba(99,102,241,.3)', borderRadius:50, padding:'.35rem .9rem', fontSize:'.72rem', color:'#a5b4fc', fontWeight:600, textTransform:'uppercase', marginBottom:'1rem' }}>Step 4 of 4</div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', marginBottom:'.4rem' }}>Assessment <span style={{ background:'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Instructions</span></h1>
          <p style={{ color:'#64748b', fontSize:'.875rem' }}>{jobTitle} — 60 Questions · 60 Minutes</p>
        </div>

        {[
          ['Fullscreen Mode', 'The test runs in fullscreen. Exiting fullscreen will immediately terminate your test.'],
          ['No Tab Switching', 'Switching tabs or minimising the window will terminate the test automatically.'],
          ['Stay Focused', 'Clicking outside the test window will also terminate the test.'],
          ['Answer All Questions', 'You must answer each question before moving to the next.'],
          ['Time Limit', 'You have exactly 60 minutes. The timer starts when you click "Start Test".'],
        ].map(([t, d]) => (
          <div key={t} className="sa-rule">
            <div className="sa-rule-title"><Shield size={12} style={{ marginRight:5, verticalAlign:'middle' }} />{t}</div>
            <div className="sa-rule-text">{d}</div>
          </div>
        ))}

        <button className="sa-btn sa-btn-next" style={{ width:'100%', justifyContent:'center', marginTop:'1rem', padding:'.85rem' }} onClick={startTest}>
          I Understand — Start Test <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // SUBMITTING
  if (stage === 'submitting') return (
    <div className="sa-wrap"><style>{S}</style>
      <div className="sa-card" style={{ textAlign:'center', padding:'3rem' }}>
        <div className="sa-spin" />
        <div style={{ color:'#a5b4fc', fontWeight:700, fontSize:'1.1rem', marginBottom:'.4rem' }}>Submitting Assessment…</div>
        <div style={{ color:'#64748b', fontSize:'.85rem' }}>Calculating your score and generating AI feedback.</div>
      </div>
    </div>
  );

  // RESULT
  if (stage === 'result' && result) {
    const pct = result.percentage?.toFixed(1) ?? 0;
    const verdict = result.aiAnalysis?.verdict || (pct >= 70 ? 'Selected' : pct >= 40 ? 'On Hold' : 'Rejected');
    const verdictColor = verdict === 'Selected' ? '#34d399' : verdict === 'On Hold' ? '#fbbf24' : '#f87171';
    return (
      <div className="sa-wrap"><style>{S}</style>
        <div className="sa-card">
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div className="sa-result-score" style={{ color: verdictColor }}>{result.score}<span style={{ fontSize:'1.5rem', color:'#475569' }}>/{questions.length}</span></div>
            <div style={{ fontSize:'.85rem', color:'#64748b', marginBottom:'.75rem' }}>Total Score · {pct}%</div>
            <div style={{ display:'inline-block', padding:'.3rem .9rem', borderRadius:50, fontSize:'.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', background: verdictColor + '22', color: verdictColor, border: `1px solid ${verdictColor}55` }}>{verdict}</div>
          </div>

          <div style={{ background:'rgba(255,255,255,.03)', borderRadius:12, padding:'1rem', marginBottom:'1rem' }}>
            {Object.entries(result.domainScores || {}).map(([d, s]) => (
              <div key={d} className="sa-domain-row">
                <span style={{ color:'#94a3b8', fontSize:'.875rem' }}>{d}</span>
                <span style={{ color:'#f1f5f9', fontWeight:700 }}>{s}/20</span>
              </div>
            ))}
          </div>

          {result.aiAnalysis?.performanceSummary && (
            <div style={{ background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.15)', borderRadius:12, padding:'1rem', marginBottom:'1rem', fontSize:'.875rem', color:'#94a3b8', lineHeight:1.6 }}>
              {result.aiAnalysis.performanceSummary}
            </div>
          )}

          <button className="sa-btn sa-btn-next" style={{ width:'100%', justifyContent:'center', padding:'.85rem' }} onClick={() => navigate('/')}>
            <CheckCircle size={16} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  // TEST
  if (stage !== 'test' || !q) return null;

  const parsed = parseQuestion(q.question || '');

  return (
    <div className="sa-wrap"><style>{S}</style>
      {warnMsg && (
        <div className="sa-warn-overlay">
          <div className="sa-warn-box">
            <AlertTriangle size={40} color="#fbbf24" style={{ margin:'0 auto 1rem' }} />
            <div style={{ color:'#fbbf24', fontWeight:700, fontSize:'1rem', marginBottom:'.5rem' }}>Attention</div>
            <div style={{ color:'#94a3b8', fontSize:'.875rem', marginBottom:'1.25rem' }}>{warnMsg}</div>
            <button className="sa-btn sa-btn-next" style={{ width:'100%', justifyContent:'center' }} onClick={() => setWarnMsg('')}>OK, Got it</button>
          </div>
        </div>
      )}

      <div className="sa-card">
        {/* domain stepper */}
        <div className="sa-dstepper">
          {DOMAIN_NAMES.map((d,i) => (
            <div key={d} className={`sa-dstep${i < domainIdx ? ' done' : i === domainIdx ? ' active' : ''}`} title={d} />
          ))}
        </div>

        {/* header */}
        <div className="sa-header">
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
            <span className="sa-domain-badge">{DOMAIN_NAMES[domainIdx]}</span>
            <span className="sa-q-counter">Domain {domainIdx + 1}/3 &nbsp;·&nbsp; Q {qInDomain + 1}/20</span>
          </div>
          <div className={timerClass}>
            <Clock size={14} />
            {formatTime(timer)}
          </div>
        </div>

        {/* progress within domain */}
        <div className="sa-progress-bar">
          <div className="sa-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* question */}
        <div className="sa-q-num">Question {qInDomain + 1} of 20 &nbsp;·&nbsp; {DOMAIN_NAMES[domainIdx]} Domain</div>
        <div className="sa-q-text">
          {parsed.pre}
          {parsed.code && <code className="sa-code">{parsed.code}</code>}
        </div>

        {/* options */}
        <div className="sa-options">
          {(q.options || []).map((opt, i) => (
            <div
              key={i}
              className={`sa-option${answers[current] === i ? ' selected' : ''}`}
              onClick={() => selectOption(i)}
            >
              <span className="sa-opt-letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </div>
          ))}
        </div>

        {/* navigation */}
        <div className="sa-nav">
          <button className="sa-btn sa-btn-prev" onClick={goPrev} disabled={domainIdx === 0 && qInDomain === 0}>
            <ChevronLeft size={16} /> Previous
          </button>
          {isLastInDomain && isLastDomain ? (
            <button className="sa-btn sa-btn-next sa-btn-submit" onClick={handleSubmit}>
              <CheckCircle size={16} /> Submit Assessment
            </button>
          ) : isLastInDomain ? (
            <button
              className="sa-btn sa-btn-next"
              style={{ background:'linear-gradient(135deg,#059669,#10b981)', gap:'.5rem' }}
              onClick={nextDomain}
            >
              Next Domain: {DOMAIN_NAMES[domainIdx + 1]} <ChevronRight size={16} />
            </button>
          ) : (
            <button className="sa-btn sa-btn-next" onClick={goNext}>
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
