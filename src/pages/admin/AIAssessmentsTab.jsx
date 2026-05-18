import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, BarChart2, X, Zap, Download, Calendar, Trash2 } from 'lucide-react';
import { getAllAIAssessments, getAIConfig, setAIConfig, deleteAIAssessment } from '../../firebaseConfig';

const S = `
.tab-wrap{padding:1.5rem 0;}
.tab-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:1rem;}
.tab-title{font-size:1.1rem;font-weight:700;color:#f1f5f9;}
.ad-table{width:100%;border-collapse:collapse;}
.ad-table th{padding:.75rem 1rem;background:rgba(255,255,255,.04);color:#64748b;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);}
.ad-table td{padding:.85rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);font-size:.875rem;color:#cbd5e1;vertical-align:middle;}
.ad-table tr:hover td{background:rgba(99,102,241,.04);}
.verdict{padding:.2rem .65rem;border-radius:50px;font-size:.72rem;font-weight:700;}
.v-sel{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:#34d399;}
.v-hold{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);color:#fbbf24;}
.v-rej{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#f87171;}
.v-pend{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.2);color:#94a3b8;}
.score-bar{height:6px;background:rgba(255,255,255,.07);border-radius:50px;overflow:hidden;width:70px;display:inline-block;vertical-align:middle;margin-right:.5rem;}
.score-fill{height:100%;border-radius:50px;background:linear-gradient(90deg,#6366f1,#a855f7);}
.detail-btn{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:6px;padding:.25rem .6rem;color:#a5b4fc;cursor:pointer;font-size:.75rem;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem;}
.modal-box{background:#0d0d16;border:1px solid rgba(99,102,241,.25);border-radius:16px;padding:1.75rem;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;}
.modal-title{font-size:1.1rem;font-weight:700;color:#f1f5f9;margin-bottom:1rem;}
.m-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.85rem;}
.m-label{color:#64748b;}
.m-val{color:#e2e8f0;font-weight:600;}
.domain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin:.75rem 0;}
.domain-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:.75rem;text-align:center;}
.domain-score{font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.domain-name{font-size:.72rem;color:#64748b;margin-top:.2rem;}
.analysis-box{background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);border-radius:10px;padding:1rem;margin-top:.75rem;}
.analysis-label{font-size:.72rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem;}
.analysis-text{font-size:.825rem;color:#94a3b8;line-height:1.55;}
.tag-list{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem;}
.str-tag{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);color:#34d399;padding:.15rem .5rem;border-radius:5px;font-size:.72rem;}
.imp-tag{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);color:#fbbf24;padding:.15rem .5rem;border-radius:5px;font-size:.72rem;}
.refresh-btn{padding:.45rem .85rem;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);border-radius:8px;color:#a5b4fc;cursor:pointer;font-size:.82rem;display:flex;align-items:center;gap:.35rem;transition:background .2s;}
.refresh-btn:hover{background:rgba(99,102,241,.2);}
.dl-btn{padding:.45rem .85rem;background:linear-gradient(135deg,#34d399,#10b981);border:none;border-radius:8px;color:#064e3b;cursor:pointer;font-size:.82rem;font-weight:700;display:flex;align-items:center;gap:.35rem;box-shadow:0 4px 12px rgba(16,185,129,.3);transition:all .2s;}
.dl-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(16,185,129,.4);}
.empty-row{padding:2rem;text-align:center;color:#475569;}
.filter-group{display:flex;gap:.5rem;align-items:center;background:rgba(255,255,255,.03);padding:.35rem .6rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);}
.filter-sel, .filter-date{background:#0f172a;border:1px solid rgba(255,255,255,.1);color:#cbd5e1;padding:.35rem .6rem;border-radius:6px;font-size:.78rem;outline:none;}
`;

export default function AIAssessmentsTab() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  
  // Date Filters
  const [filterType, setFilterType] = useState('all'); // 'all', 'this_month', 'last_month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = () => { 
    setLoading(true); 
    Promise.all([getAllAIAssessments(), getAIConfig()])
      .then(([assessmentsData, configData]) => {
        setAssessments(assessmentsData);
        setAiEnabled(configData.ai_enabled);
      })
      .finally(() => setLoading(false)); 
  };
  useEffect(load, []);

  const toggleAI = async () => {
    try {
      const newVal = !aiEnabled;
      setAiEnabled(newVal);
      await setAIConfig(newVal);
    } catch(e) {
      alert("Failed to toggle AI");
      setAiEnabled(!aiEnabled);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await deleteAIAssessment(id);
      load();
    } catch(e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  const scoreColor = (p) => p >= 70 ? '#34d399' : p >= 40 ? '#fbbf24' : '#f87171';
  const verdictClass = (v) => v === 'Selected' ? 'verdict v-sel' : v === 'On Hold' ? 'verdict v-hold' : v === 'Rejected' ? 'verdict v-rej' : 'verdict v-pend';
  const verdictText = (a) => a?.ai_analysis?.verdict || (a.status === 'pending' ? 'Pending' : a.status === 'terminated' ? 'Terminated' : '—');

  const getFilteredAssessments = () => {
    let filtered = assessments;
    const now = new Date();
    
    if (filterType === 'this_month') {
      filtered = assessments.filter(a => {
        const d = new Date(a.completed_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filterType === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = assessments.filter(a => {
        const d = new Date(a.completed_at);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });
    } else if (filterType === 'custom' && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      filtered = assessments.filter(a => {
        const d = new Date(a.completed_at);
        return d >= s && d <= e;
      });
    }
    return filtered;
  };

  const exportExcel = () => {
    const filtered = getFilteredAssessments();
    if (filtered.length === 0) return alert('No records found for the selected date range.');

    const headers = ['Candidate Email', 'Job Role', 'Company', 'Score', 'Percentage', 'AI Verdict', 'Status', 'Time Taken (Sec)', 'Completion Date'];
    const rows = filtered.map(a => [
      `"${a.user_email}"`,
      `"${a.job_title||'-'}"`,
      `"${a.company_name||'-'}"`,
      a.score,
      a.percentage,
      `"${verdictText(a)}"`,
      `"${a.status}"`,
      a.time_taken || 0,
      `"${new Date(a.completed_at).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GoGenix_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAssessments = getFilteredAssessments();

  return (
    <div className="tab-wrap">
      <style>{S}</style>
      <div className="tab-toolbar">
        <span className="tab-title"><Bot size={18} /> AI Assessments ({filteredAssessments.length})</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
          
          {/* Filters */}
          <div className="filter-group">
            <Calendar size={14} color="#94a3b8" />
            <select className="filter-sel" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Date Range</option>
            </select>

            {filterType === 'custom' && (
              <>
                <input type="date" className="filter-date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span style={{ color:'#64748b', fontSize:'.8rem' }}>to</span>
                <input type="date" className="filter-date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </>
            )}
          </div>

          {/* AI Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: 'rgba(99,102,241,.1)', padding: '.35rem .75rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,.3)' }}>
            <span style={{ fontSize: '.8rem', color: '#a5b4fc', fontWeight: 600 }}>AI Auto-Pilot</span>
            <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
              <input type="checkbox" checked={aiEnabled} onChange={toggleAI} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, background: aiEnabled ? '#34d399' : '#475569', borderRadius: '20px', transition: '.3s' }}>
                <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: aiEnabled ? '19px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.3s' }} />
              </span>
            </label>
          </div>

          <button className="refresh-btn" onClick={load}><RefreshCw size={14} /> Refresh</button>
          <button className="dl-btn" onClick={exportExcel}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      {loading ? <p style={{color:'#6366f1',padding:'2rem'}}>Loading…</p> : (
        <div style={{overflowX:'auto'}}>
          <table className="ad-table">
            <thead><tr>
              <th>Email</th><th>Job</th><th>Company</th><th>Score</th><th>%</th><th>Verdict</th><th>Status</th><th>Date</th><th></th>
            </tr></thead>
            <tbody>
              {filteredAssessments.length === 0 && <tr><td colSpan="9" className="empty-row">No assessments found.</td></tr>}
              {filteredAssessments.map(a => (
                <tr key={a.id}>
                  <td style={{color:'#f1f5f9',fontWeight:500}}>{a.user_email}</td>
                  <td>{a.job_title||'-'}</td>
                  <td style={{color:'#a5b4fc'}}>{a.company_name||'-'}</td>
                  <td style={{fontWeight:700,color:scoreColor(a.percentage)}}>{a.score}</td>
                  <td>
                    <span className="score-bar"><span className="score-fill" style={{width:`${a.percentage}%`}} /></span>
                    <span style={{color:scoreColor(a.percentage)}}>{Number(a.percentage).toFixed(0)}%</span>
                  </td>
                  <td><span className={verdictClass(a?.ai_analysis?.verdict)}>{verdictText(a)}</span></td>
                  <td><span style={{color: a.status==='completed'?'#34d399':a.status==='terminated'?'#f87171':'#fbbf24',fontSize:'.78rem',fontWeight:600,textTransform:'uppercase'}}>{a.status}</span></td>
                  <td style={{color:'#475569',fontSize:'.78rem'}}>{new Date(a.completed_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="detail-btn" onClick={() => setSelected(a)}>Details</button>
                      <button className="detail-btn" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', padding: '.25rem .4rem' }} onClick={() => handleDelete(a.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title"><BarChart2 size={16} style={{verticalAlign:'middle',marginRight:'.4rem'}} /> Assessment Details</div>
            <div className="m-row"><span className="m-label">Candidate</span><span className="m-val">{selected.user_email}</span></div>
            <div className="m-row"><span className="m-label">Position</span><span className="m-val">{selected.job_title} @ {selected.company_name}</span></div>
            <div className="m-row"><span className="m-label">Score</span><span className="m-val" style={{color:scoreColor(selected.percentage)}}>{selected.score} / {selected.questions ? JSON.parse(selected.questions||'[]').length||60 : 60} ({Number(selected.percentage).toFixed(1)}%)</span></div>
            <div className="m-row"><span className="m-label">Time Taken</span><span className="m-val">{Math.floor((selected.time_taken||0)/60)}m {(selected.time_taken||0)%60}s</span></div>

            <div style={{margin:'.75rem 0 .5rem',color:'#64748b',fontSize:'.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em'}}>Domain Scores</div>
            <div className="domain-grid">
              {Object.entries(selected.domain_scores||{}).map(([d,s]) => (
                <div key={d} className="domain-card">
                  <div className="domain-score">{s}</div>
                  <div className="domain-name">{d}</div>
                </div>
              ))}
            </div>

            {selected.ai_analysis && (
              <div className="analysis-box">
                <div className="analysis-label"><Zap size={11} style={{verticalAlign:'middle',marginRight:'.3rem'}} /> AI Analysis</div>
                <div className="analysis-text">{selected.ai_analysis.performanceSummary}</div>
                {selected.ai_analysis.strengths?.length > 0 && <>
                  <div style={{marginTop:'.6rem',color:'#34d399',fontSize:'.72rem',fontWeight:700}}>Strengths</div>
                  <div className="tag-list">{selected.ai_analysis.strengths.map(s=><span key={s} className="str-tag">{s}</span>)}</div>
                </>}
                {selected.ai_analysis.improvements?.length > 0 && <>
                  <div style={{marginTop:'.6rem',color:'#fbbf24',fontSize:'.72rem',fontWeight:700}}>Improvements</div>
                  <div className="tag-list">{selected.ai_analysis.improvements.map(i=><span key={i} className="imp-tag">{i}</span>)}</div>
                </>}
                {selected.ai_analysis.nextSteps && <div className="analysis-text" style={{marginTop:'.6rem',borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:'.6rem'}}>📌 {selected.ai_analysis.nextSteps}</div>}
              </div>
            )}
            <button style={{width:'100%',marginTop:'1rem',padding:'.65rem',border:'1px solid rgba(255,255,255,.1)',borderRadius:'9px',background:'none',color:'#94a3b8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem'}} onClick={() => setSelected(null)}><X size={14} /> Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
