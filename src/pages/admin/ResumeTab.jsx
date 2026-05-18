import React, { useState, useEffect } from 'react';
import { getAllResumeScans } from '../../firebaseConfig';

const S = `
.tab-wrap{padding:1.5rem 0;}
.tab-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;}
.tab-title{font-size:1.1rem;font-weight:700;color:#f1f5f9;}
.ad-table{width:100%;border-collapse:collapse;}
.ad-table th{padding:.75rem 1rem;background:rgba(255,255,255,.04);color:#64748b;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);}
.ad-table td{padding:.85rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);font-size:.875rem;color:#cbd5e1;vertical-align:middle;}
.ad-table tr:hover td{background:rgba(99,102,241,.04);}
.score-bar{height:6px;background:rgba(255,255,255,.07);border-radius:50px;overflow:hidden;width:80px;display:inline-block;vertical-align:middle;margin-right:.5rem;}
.score-fill{height:100%;border-radius:50px;}
.skills-wrap{display:flex;flex-wrap:wrap;gap:.3rem;}
.skill-tag{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:5px;padding:.15rem .45rem;font-size:.7rem;color:#a5b4fc;}
.empty-row{padding:2rem;text-align:center;color:#475569;}
.refresh-btn{padding:.5rem 1rem;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);border-radius:8px;color:#a5b4fc;cursor:pointer;font-size:.82rem;}
`;

export default function ResumeTab() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); getAllResumeScans().then(setScans).finally(() => setLoading(false)); };
  useEffect(load, []);

  const scoreColor = (s) => s >= 70 ? '#34d399' : s >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="tab-wrap">
      <style>{S}</style>
      <div className="tab-toolbar">
        <span className="tab-title">📄 Resume Scans ({scans.length})</span>
        <button className="refresh-btn" onClick={load}>↻ Refresh</button>
      </div>

      {loading ? <p style={{color:'#6366f1',padding:'2rem'}}>Loading…</p> : (
        <div style={{overflowX:'auto'}}>
          <table className="ad-table">
            <thead><tr>
              <th>Email</th><th>Job</th><th>Company</th><th>Match Score</th><th>Skills</th><th>Summary</th><th>Date</th>
            </tr></thead>
            <tbody>
              {scans.length === 0 && <tr><td colSpan="7" className="empty-row">No resume scans yet.</td></tr>}
              {scans.map(s => (
                <tr key={s.id}>
                  <td style={{color:'#f1f5f9',fontWeight:500}}>{s.user_email}</td>
                  <td>{s.job_title || '-'}</td>
                  <td style={{color:'#a5b4fc'}}>{s.company_name || '-'}</td>
                  <td>
                    <span className="score-bar"><span className="score-fill" style={{width:`${s.match_score}%`,background:scoreColor(s.match_score)}} /></span>
                    <strong style={{color:scoreColor(s.match_score)}}>{s.match_score}%</strong>
                  </td>
                  <td><div className="skills-wrap">{(s.extracted_skills||[]).slice(0,4).map(sk=><span key={sk} className="skill-tag">{sk}</span>)}{(s.extracted_skills||[]).length>4&&<span className="skill-tag">+{s.extracted_skills.length-4}</span>}</div></td>
                  <td style={{color:'#64748b',maxWidth:220,fontSize:'.78rem'}}>{(s.fit_summary||'').substring(0,80)}{s.fit_summary?.length>80?'…':''}</td>
                  <td style={{color:'#475569',fontSize:'.78rem'}}>{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
