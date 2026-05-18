import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { getJobsByCompany } from '../firebaseConfig';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;}
.js-wrap{min-height:100vh;background:#0a0a0f;font-family:'Inter',sans-serif;padding:2rem;}
.js-header{display:flex;flex-direction:column;align-items:center;gap:1.25rem;margin-bottom:3rem;}
.js-nav-row{width:100%;max-width:1100px;display:flex;align-items:center;justify-content:space-between;}
.js-back{display:inline-flex;align-items:center;gap:.5rem;background:none;border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:.85rem;padding:.5rem 1rem;border-radius:8px;cursor:pointer;}
.js-badge{display:inline-flex;align-items:center;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);border-radius:50px;padding:.35rem .9rem;font-size:.72rem;color:#a5b4fc;font-weight:600;letter-spacing:.06em;text-transform:uppercase;}
.js-company{display:inline-flex;align-items:center;gap:.5rem;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.25);border-radius:8px;padding:.4rem .9rem;font-size:.85rem;color:#c084fc;font-weight:600;}
.js-title{font-size:2rem;font-weight:800;color:#f1f5f9;margin:0;}
.js-title span{background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.js-sub{color:#64748b;font-size:.95rem;margin:0;}
.js-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;max-width:1100px;margin:0 auto;}
.js-card{background:#0d0d16;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.75rem;cursor:pointer;transition:all .25s;}
.js-card:hover{border-color:rgba(99,102,241,.5);transform:translateY(-3px);box-shadow:0 12px 40px rgba(99,102,241,.12);}
.js-level{display:inline-block;padding:.25rem .7rem;border-radius:50px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.75rem;}
.js-level.fresher{background:rgba(52,211,153,.12);color:#34d399;border:1px solid rgba(52,211,153,.25);}
.js-level.junior{background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.25);}
.js-level.mid{background:rgba(99,102,241,.12);color:#818cf8;border:1px solid rgba(99,102,241,.25);}
.js-level.senior{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25);}
.js-jname{font-size:1.1rem;font-weight:700;color:#f1f5f9;margin-bottom:.6rem;}
.js-jdesc{font-size:.82rem;color:#64748b;line-height:1.55;margin-bottom:1rem;}
.js-skills{display:flex;flex-wrap:wrap;gap:.4rem;}
.js-skill{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:6px;padding:.2rem .55rem;font-size:.72rem;color:#a5b4fc;}
.js-btn{width:100%;margin-top:1.25rem;padding:.7rem;border:none;border-radius:10px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-size:.875rem;font-weight:600;cursor:pointer;transition:opacity .2s;}
.js-btn:hover{opacity:.88;}
.js-empty{text-align:center;padding:4rem;color:#475569;}
.js-loading{text-align:center;padding:4rem;color:#6366f1;}
.js-spinner{width:40px;height:40px;border:3px solid rgba(99,102,241,.2);border-top-color:#6366f1;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 1rem;}
@keyframes spin{to{transform:rotate(360deg);}}
`;

export default function JobSelect() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('selectedCompany') || 'null');
    const user = JSON.parse(localStorage.getItem('studentDetails') || 'null');
    if (!c || !user) { navigate('/select-company'); return; }
    setCompany(c);
    getJobsByCompany(c.id).then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, []);

  function selectJob(job) {
    localStorage.setItem('selectedJob', JSON.stringify(job));
    navigate('/upload-resume');
  }

  return (
    <div className="js-wrap">
      <style>{S}</style>
      <div className="js-header">
        <div className="js-nav-row">
          <button className="js-back" onClick={() => navigate('/select-company')}>Back to Companies</button>
          <div className="js-badge">Step 2 of 4</div>
          {company
            ? <div className="js-company"><Building2 size={14} style={{marginRight:4,verticalAlign:'middle'}} />{company.name}</div>
            : <div style={{width:120}} />}
        </div>
        <h1 className="js-title">Open <span>Positions</span></h1>
        <p className="js-sub">Select the role you want to apply for</p>
      </div>

      {loading ? (
        <div className="js-loading"><div className="js-spinner"/><p>Loading positions…</p></div>
      ) : jobs.length === 0 ? (
        <div className="js-empty">
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>💼</div>
          <p style={{fontWeight:600,color:'#94a3b8',marginBottom:'.5rem'}}>No open positions</p>
          <p style={{fontSize:'.85rem'}}>No active job openings for this company right now.</p>
        </div>
      ) : (
        <div className="js-grid">
          {jobs.map(job => (
            <div key={job.id} className="js-card">
              <span className={`js-level ${job.experience_level}`}>{job.experience_level}</span>
              <div className="js-jname">{job.title}</div>
              <div className="js-jdesc">{(job.description||'').substring(0,120)}{job.description?.length>120?'…':''}</div>
              <div className="js-skills">
                {(job.required_skills||[]).slice(0,6).map(s => (
                  <span key={s} className="js-skill">{s}</span>
                ))}
                {(job.required_skills||[]).length > 6 && <span className="js-skill">+{job.required_skills.length-6} more</span>}
              </div>
              <button className="js-btn" onClick={() => selectJob(job)}>Apply for this Role</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
