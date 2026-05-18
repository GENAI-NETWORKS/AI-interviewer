import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Building2, Briefcase, FileText, Bot, XCircle, FileQuestion,
  LogOut, RefreshCw, Users, CheckCircle2, AlertTriangle, Zap, ZapOff
} from 'lucide-react';
import { getAssessments, getTerminatedAssessments, getAIConfig, setAIConfig } from '../firebaseConfig';
import CompaniesTab    from './admin/CompaniesTab';
import JobsTab         from './admin/JobsTab';
import ResumeTab       from './admin/ResumeTab';
import AIAssessmentsTab from './admin/AIAssessmentsTab';
import QuestionsTemplateTab from './admin/QuestionsTemplateTab';
import logoImg from '../assets/logo.png';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;}
.ad-wrap{min-height:100vh;background:#0a0a0f;font-family:'Inter',sans-serif;color:#f1f5f9;}
.ad-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;border-bottom:1px solid rgba(255,255,255,.06);background:#0d0d16;gap:1rem;flex-wrap:wrap;}
.ad-logo{display:flex;align-items:center;gap:.65rem;}
.ad-logo img{width:36px;height:36px;border-radius:9px;object-fit:contain;}
.ad-logo-name{font-size:1rem;font-weight:700;color:#f1f5f9;}
.ad-header-right{display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;}
.ad-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:.38rem .85rem;font-size:.8rem;color:#94a3b8;display:flex;align-items:center;gap:.35rem;}
.ad-stat strong{color:#f1f5f9;}
.ad-logout{display:flex;align-items:center;gap:.4rem;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:.38rem .85rem;color:#f87171;font-size:.8rem;cursor:pointer;font-weight:600;}
.ad-logout:hover{background:rgba(239,68,68,.18);}
/* AI Toggle */
.ai-toggle{display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:.38rem .85rem;font-size:.8rem;cursor:pointer;transition:all .25s;}
.ai-toggle.on{border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.06);color:#34d399;}
.ai-toggle.off{border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.05);color:#f87171;}
.ai-switch{width:34px;height:18px;border-radius:50px;position:relative;transition:background .25s;}
.ai-switch.on{background:#34d399;}
.ai-switch.off{background:rgba(239,68,68,.4);}
.ai-switch::after{content:'';position:absolute;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left .25s;box-shadow:0 1px 3px rgba(0,0,0,.4);}
.ai-switch.on::after{left:18px;}
.ai-switch.off::after{left:2px;}
/* Nav */
.ad-nav{display:flex;gap:0;padding:0 2rem;background:#0d0d16;border-bottom:1px solid rgba(255,255,255,.06);overflow-x:auto;}
.ad-tab{display:inline-flex;align-items:center;gap:.4rem;padding:.8rem 1.1rem;font-size:.845rem;font-weight:500;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .2s;background:none;border-top:none;border-left:none;border-right:none;}
.ad-tab:hover{color:#94a3b8;}
.ad-tab.active{color:#a5b4fc;border-bottom-color:#6366f1;}
.ad-body{padding:2rem;max-width:1400px;margin:0 auto;}
/* Tables */
.ad-table{width:100%;border-collapse:collapse;}
.ad-table th{padding:.75rem 1rem;background:rgba(255,255,255,.04);color:#64748b;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);}
.ad-table td{padding:.85rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);font-size:.875rem;color:#cbd5e1;vertical-align:middle;}
.ad-table tr:hover td{background:rgba(99,102,241,.04);}
.rank-badge{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;}
.score-bar-wrap{display:flex;align-items:center;gap:.5rem;}
.score-bar{height:6px;width:80px;background:rgba(255,255,255,.07);border-radius:50px;overflow:hidden;}
.score-fill{height:100%;background:linear-gradient(90deg,#6366f1,#a855f7);border-radius:50px;}
.icon-btn{background:none;border:none;cursor:pointer;padding:.35rem;border-radius:6px;transition:background .2s;color:#6366f1;}
.icon-btn:hover{background:rgba(99,102,241,.1);}
/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem;}
.modal-box{background:#0d0d16;border:1px solid rgba(99,102,241,.3);border-radius:16px;width:100%;max-width:580px;max-height:88vh;overflow-y:auto;}
.modal-header{padding:1.5rem;border-bottom:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:start;}
.modal-name{font-size:1.4rem;font-weight:800;color:#f1f5f9;}
.modal-close{background:none;border:none;color:#64748b;cursor:pointer;padding:.25rem;}
.modal-body{padding:1.5rem;}
.domain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin:.75rem 0;}
.domain-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:.85rem;text-align:center;}
.domain-score{font-size:1.4rem;font-weight:800;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.domain-name{font-size:.75rem;color:#64748b;margin-top:.2rem;}
.term-badge{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;padding:.2rem .6rem;border-radius:50px;font-size:.7rem;font-weight:700;}
.empty-row{padding:2rem;text-align:center;color:#475569;}
@keyframes spin{to{transform:rotate(360deg);}}
`;

const TABS = [
  { id: 'results',    icon: BarChart2,      label: 'Results' },
  { id: 'companies',  icon: Building2,      label: 'Companies' },
  { id: 'jobs',       icon: Briefcase,      label: 'Jobs' },
  { id: 'templates',  icon: FileQuestion,   label: 'Questions Template' },
  { id: 'resume',     icon: FileText,       label: 'Resumes' },
  { id: 'ai',         icon: Bot,            label: 'AI Assessments' },
  { id: 'terminated', icon: XCircle,        label: 'Terminated' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('results');
  const [students, setStudents] = useState([]);
  const [terminated, setTerminated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiToggling, setAiToggling] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('adminAuthenticated')) { navigate('/admin-login'); return; }
    Promise.all([getAssessments(), getTerminatedAssessments(), getAIConfig()])
      .then(([all, term, cfg]) => {
        setTotalCount(all.length + term.length);
        const ranked = all.filter(d => d.status !== 'terminated')
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map((s, i) => ({ ...s, rank: i + 1, totalQuestions: s.totalQuestions || 60, percentage: s.percentage ?? ((s.score || 0) / (s.totalQuestions || 60)) * 100 }));
        setStudents(ranked);
        setTerminated(term);
        setAiEnabled(cfg.ai_enabled);
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const logout = () => { localStorage.removeItem('adminAuthenticated'); navigate('/admin-login'); };

  async function toggleAI() {
    setAiToggling(true);
    try {
      const r = await setAIConfig(!aiEnabled);
      setAiEnabled(r.ai_enabled);
    } catch (e) { console.error(e); }
    finally { setAiToggling(false); }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontFamily: 'Inter,sans-serif', fontSize: '1.1rem' }}>
      Loading Dashboard…
    </div>
  );

  return (
    <div className="ad-wrap">
      <style>{S}</style>

      {/* Header */}
      <div className="ad-header">
        <div className="ad-logo">
          <img src={logoImg} alt="GoGenix" />
          <span className="ad-logo-name">GoGenix Admin</span>
        </div>
        <div className="ad-header-right">
          <div className="ad-stat"><Users size={13} /> Total <strong>{totalCount}</strong></div>
          <div className="ad-stat"><CheckCircle2 size={13} color="#34d399" /> Completed <strong>{students.length}</strong></div>
          <div className="ad-stat"><AlertTriangle size={13} color="#f87171" /> Terminated <strong>{terminated.length}</strong></div>

          {/* AI Toggle */}
          <button
            className={`ai-toggle ${aiEnabled ? 'on' : 'off'}`}
            onClick={toggleAI}
            disabled={aiToggling}
            title={aiEnabled ? 'AI Generation ON — click to disable' : 'AI Generation OFF — click to enable'}
          >
            {aiEnabled ? <Zap size={14} /> : <ZapOff size={14} />}
            AI {aiEnabled ? 'Enabled' : 'Disabled'}
            <span className={`ai-switch ${aiEnabled ? 'on' : 'off'}`} />
          </button>

          <button className="ad-logout" onClick={logout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ad-nav">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`ad-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="ad-body">
        {tab === 'companies'  && <CompaniesTab />}
        {tab === 'jobs'       && <JobsTab />}
        {tab === 'resume'     && <ResumeTab />}
        {tab === 'ai'         && <AIAssessmentsTab />}
        {tab === 'templates'  && <QuestionsTemplateTab />}

        {tab === 'results' && (
          <table className="ad-table">
            <thead><tr>
              <th>Rank</th><th>Name</th><th>Email</th><th>Score</th><th>%</th><th>Dept</th><th>Year</th><th></th>
            </tr></thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan="8" className="empty-row">No assessments yet.</td></tr>}
              {students.map(s => (
                <tr key={s.id}>
                  <td><div className="rank-badge" style={{ background: s.rank === 1 ? 'rgba(234,179,8,.15)' : s.rank === 2 ? 'rgba(148,163,184,.1)' : s.rank === 3 ? 'rgba(180,83,9,.15)' : 'rgba(255,255,255,.05)', color: s.rank === 1 ? '#eab308' : s.rank === 2 ? '#94a3b8' : s.rank === 3 ? '#b45309' : '#64748b' }}>{s.rank}</div></td>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.name}</td>
                  <td>{s.email || '-'}</td>
                  <td style={{ fontWeight: 700, color: '#818cf8' }}>{s.score}/{s.totalQuestions}</td>
                  <td><div className="score-bar-wrap"><div className="score-bar"><div className="score-fill" style={{ width: `${s.percentage}%` }} /></div><span style={{ fontSize: '.8rem', color: '#64748b' }}>{Number(s.percentage).toFixed(0)}%</span></div></td>
                  <td>{s.department || '-'}</td>
                  <td>{s.year || '-'}</td>
                  <td><button className="icon-btn" onClick={() => setSelected(s)}><BarChart2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'terminated' && (
          <table className="ad-table">
            <thead><tr>
              <th>Name</th><th>Email</th><th>Dept</th><th>Year</th><th>Reason</th><th>Time</th>
            </tr></thead>
            <tbody>
              {terminated.length === 0 && <tr><td colSpan="6" className="empty-row">No terminated students.</td></tr>}
              {terminated.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.name}</td>
                  <td>{s.email || '-'}</td>
                  <td>{s.department || '-'}</td>
                  <td>{s.year || '-'}</td>
                  <td><span className="term-badge">{s.reason}</span></td>
                  <td style={{ color: '#475569', fontSize: '.78rem' }}>{s.completedAt ? new Date(s.completedAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Detail Modal */}
      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-name">{selected.name}</div>
                <div style={{ color: '#64748b', fontSize: '.85rem', marginTop: '.25rem' }}>{selected.email} · {selected.department} · {selected.year}</div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{selected.score}/{selected.totalQuestions}</div>
                <div style={{ color: '#64748b', fontSize: '.85rem' }}>{Number(selected.percentage).toFixed(1)}% Score</div>
              </div>
              <div className="domain-grid">
                {Object.entries(selected.domainScores || {}).map(([d, sc]) => (
                  <div key={d} className="domain-card"><div className="domain-score">{sc}</div><div className="domain-name">{d}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
