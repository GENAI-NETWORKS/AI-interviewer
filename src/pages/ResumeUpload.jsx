import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle2, FileText, AlertTriangle, Bot, Loader2, Circle, XCircle, ArrowRight } from 'lucide-react';
import { uploadResume } from '../firebaseConfig';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;}
html,body{scrollbar-width:none;-ms-overflow-style:none;overflow-x:hidden;}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;}
.ru-wrap{min-height:100vh;background:#0a0a0f;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;padding:2rem;overflow-x:hidden;}
.ru-box{width:100%;max-width:620px;}
.ru-nav-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;}
.ru-back{display:inline-flex;align-items:center;gap:.5rem;background:none;border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:.85rem;padding:.5rem 1rem;border-radius:8px;cursor:pointer;}
.ru-badge{display:inline-flex;align-items:center;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);border-radius:50px;padding:.35rem .9rem;font-size:.72rem;color:#a5b4fc;font-weight:600;letter-spacing:.06em;text-transform:uppercase;}
.ru-title{font-size:2rem;font-weight:800;color:#f1f5f9;margin-bottom:.4rem;}
.ru-title span{background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.ru-sub{color:#64748b;font-size:.9rem;margin-bottom:2rem;}
.ru-job-info{background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;gap:.75rem;align-items:center;}
.ru-job-icon{font-size:1.5rem;}
.ru-job-title{font-size:.95rem;font-weight:700;color:#e2e8f0;}
.ru-job-company{font-size:.8rem;color:#6366f1;}
.ru-drop{border:2px dashed rgba(99,102,241,.3);border-radius:16px;padding:3rem 2rem;text-align:center;cursor:pointer;transition:all .25s;background:rgba(99,102,241,.03);}
.ru-drop.drag{border-color:#6366f1;background:rgba(99,102,241,.08);}
.ru-drop-icon{font-size:2.5rem;margin-bottom:1rem;}
.ru-drop-text{font-size:1rem;font-weight:600;color:#e2e8f0;margin-bottom:.35rem;}
.ru-drop-sub{font-size:.8rem;color:#64748b;}
.ru-file-btn{display:inline-block;margin-top:1rem;padding:.6rem 1.25rem;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);border-radius:8px;color:#a5b4fc;font-size:.85rem;font-weight:600;cursor:pointer;}
.ru-selected{margin-top:1rem;padding:.75rem 1rem;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:10px;display:flex;align-items:center;gap:.6rem;font-size:.875rem;color:#34d399;}
.ru-btn{width:100%;margin-top:1.5rem;padding:.85rem;border:none;border-radius:12px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-size:.95rem;font-weight:700;cursor:pointer;transition:opacity .2s;}
.ru-btn:disabled{opacity:.45;cursor:not-allowed;}
.ru-scanning{text-align:center;padding:2rem;}
.ru-scan-icon{display:flex;justify-content:center;margin-bottom:1rem;animation:scan-pulse 1.5s ease-in-out infinite;}
@keyframes scan-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
@keyframes spin-icon{to{transform:rotate(360deg);}}
.ru-spin{animation:spin-icon .8s linear infinite;display:inline-flex;}
.ru-drop-icon{display:flex;justify-content:center;margin-bottom:1rem;}
.ru-blocked-icon{display:flex;justify-content:center;margin-bottom:1rem;}
.ru-scan-steps{text-align:left;margin-top:1.5rem;}
.ru-step{display:flex;align-items:center;gap:.75rem;padding:.5rem 0;font-size:.875rem;color:#64748b;transition:color .3s;}
.ru-step.done{color:#34d399;}
.ru-step.active{color:#a5b4fc;}
/* RESULT */
.ru-result{background:#0d0d16;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.75rem;margin-top:1.5rem;}
.ru-match-score{text-align:center;margin-bottom:1.5rem;}
.ru-score-num{font-size:3.5rem;font-weight:800;line-height:1;}
.ru-score-label{font-size:.85rem;color:#64748b;margin-top:.25rem;}
.ru-score-bar{height:8px;background:rgba(255,255,255,.07);border-radius:50px;overflow:hidden;margin:.75rem 0;}
.ru-score-fill{height:100%;border-radius:50px;transition:width 1s ease;}
.ru-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem;}
.ru-tag{padding:.25rem .65rem;border-radius:6px;font-size:.72rem;font-weight:600;}
.ru-tag.skill{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#a5b4fc;}
.ru-tag.gap{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;}
.ru-section-label{font-size:.78rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem;}
.ru-summary{font-size:.875rem;color:#94a3b8;line-height:1.6;padding:.75rem;background:rgba(255,255,255,.03);border-radius:8px;}
.ru-blocked{text-align:center;padding:2rem;}
.ru-err{padding:.75rem 1rem;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:10px;color:#f87171;font-size:.875rem;margin-top:1rem;}
`;

const STEPS = ['Uploading resume…', 'Extracting text…', 'AI scanning skills…', 'Matching with job…'];

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [stage, setStage] = useState('idle'); // idle|scanning|result|blocked
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const j = JSON.parse(localStorage.getItem('selectedJob') || 'null');
    const u = JSON.parse(localStorage.getItem('studentDetails') || 'null');
    if (!j || !u) { navigate('/select-job'); return; }
    setJob(j); setUser(u);
  }, []);

  const handleDrop = (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); };
  const scoreColor = (s) => s >= 70 ? '#34d399' : s >= 40 ? '#fbbf24' : '#f87171';

  async function handleUpload() {
    if (!file || !job || !user) return;
    setStage('scanning'); setError(''); setScanStep(0);
    const stepTimer = setInterval(() => setScanStep(p => Math.min(p+1, STEPS.length-1)), 2000);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('user_email', user.email);
      fd.append('job_id', job.id);
      const data = await uploadResume(fd);
      clearInterval(stepTimer);
      setScanStep(STEPS.length);
      setResult(data);
      if (data.matchScore < 30) { setStage('blocked'); }
      else { setStage('result'); }
    } catch(e) {
      clearInterval(stepTimer);
      setError(e.message || 'Scan failed. Try again.');
      setStage('idle');
    }
  }

  function proceedToAssessment() {
    localStorage.setItem('resumeScan', JSON.stringify(result));
    navigate('/assessment');
  }

  return (
    <div className="ru-wrap">
      <style>{S}</style>
      <div className="ru-box">
        <div className="ru-nav-row">
          <button className="ru-back" onClick={() => navigate('/select-job')}>Back to Jobs</button>
          <div className="ru-badge">Step 3 of 4</div>
        </div>
        <h1 className="ru-title">Upload <span>Resume</span></h1>
        <p className="ru-sub">Our AI will scan your resume and match it with the job requirements</p>

        {job && (
          <div className="ru-job-info">
            <Briefcase size={20} color="#6366f1" style={{flexShrink:0}} />
            <div>
              <div className="ru-job-title">{job.title}</div>
              <div className="ru-job-company">{job.company_name}</div>
            </div>
          </div>
        )}

        {stage === 'idle' && (
          <>
            <div className={`ru-drop${drag?' drag':''}`}
              onDragOver={e=>{e.preventDefault();setDrag(true);}}
              onDragLeave={()=>setDrag(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('ru-input').click()}>
              <div className="ru-drop-icon"><FileText size={42} color="#6366f1" /></div>
              <div className="ru-drop-text">Drag & drop your resume here</div>
              <div className="ru-drop-sub">Supports PDF, DOC, DOCX — Max 5MB</div>
              <div className="ru-file-btn">Browse File</div>
            </div>
            <input id="ru-input" type="file" accept=".pdf,.doc,.docx" style={{display:'none'}}
              onChange={e => { if(e.target.files[0]) setFile(e.target.files[0]); }} />
            {file && (
              <div className="ru-selected"><CheckCircle2 size={15} style={{flexShrink:0}} /> {file.name} <span style={{color:'#64748b',marginLeft:'auto'}}>{(file.size/1024).toFixed(0)} KB</span></div>
            )}
            {error && <div className="ru-err" style={{display:'flex',alignItems:'center',gap:'.5rem'}}><AlertTriangle size={14} style={{flexShrink:0}} /> {error}</div>}
            <button className="ru-btn" onClick={handleUpload} disabled={!file}>
              Scan Resume with AI
            </button>
          </>
        )}

        {stage === 'scanning' && (
          <div className="ru-scanning">
            <div className="ru-scan-icon"><Bot size={52} color="#a5b4fc" /></div>
            <div style={{color:'#a5b4fc',fontWeight:700,fontSize:'1.1rem'}}>AI Scanning Resume…</div>
            <div style={{color:'#64748b',fontSize:'.85rem',marginTop:'.4rem'}}>This takes about 60 seconds</div>
            <div className="ru-scan-steps">
              {STEPS.map((s,i) => (
                <div key={i} className={`ru-step${i<scanStep?' done':i===scanStep?' active':''}`}>
                  {i < scanStep
                    ? <CheckCircle2 size={16} color="#34d399" style={{flexShrink:0}} />
                    : i === scanStep
                    ? <Loader2 size={16} color="#a5b4fc" className="ru-spin" style={{flexShrink:0}} />
                    : <Circle size={16} color="#475569" style={{flexShrink:0}} />}
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 'result' && result && (
          <div className="ru-result">
            <div className="ru-match-score">
              <div className="ru-score-num" style={{color: scoreColor(result.matchScore)}}>{result.matchScore}%</div>
              <div className="ru-score-label">Resume Match Score</div>
              <div className="ru-score-bar">
                <div className="ru-score-fill" style={{width:`${result.matchScore}%`, background: scoreColor(result.matchScore)}} />
              </div>
            </div>
            <div className="ru-section-label">Extracted Skills</div>
            <div className="ru-tags" style={{marginBottom:'1rem'}}>
              {(result.extractedSkills||[]).map(s => <span key={s} className="ru-tag skill">{s}</span>)}
            </div>
            {(result.gaps||[]).length > 0 && <>
              <div className="ru-section-label">Skill Gaps</div>
              <div className="ru-tags" style={{marginBottom:'1rem'}}>
                {result.gaps.map(g => <span key={g} className="ru-tag gap">{g}</span>)}
              </div>
            </>}
            <div className="ru-section-label">AI Summary</div>
            <div className="ru-summary">{result.fitSummary}</div>
            <button className="ru-btn" style={{marginTop:'1.5rem'}} onClick={proceedToAssessment}>
              Proceed to AI Assessment
            </button>
          </div>
        )}

        {stage === 'blocked' && result && (
          <div className="ru-blocked">
            <div className="ru-blocked-icon"><XCircle size={52} color="#f87171" /></div>
            <div style={{fontSize:'1.2rem',fontWeight:700,color:'#f87171',marginBottom:'.5rem'}}>Profile Not Matching</div>
            <div style={{color:'#64748b',fontSize:'.9rem',marginBottom:'1rem',lineHeight:1.6}}>{result.fitSummary}</div>
            <div style={{color:'#475569',fontSize:'.8rem'}}>Match Score: <strong style={{color:'#f87171'}}>{result.matchScore}%</strong> (Minimum 30% required)</div>
            <button className="ru-btn" style={{marginTop:'1.5rem'}} onClick={() => navigate('/select-job')}>
              Try Another Position
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
