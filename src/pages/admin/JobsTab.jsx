import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit3, Trash2, Power, PowerOff } from 'lucide-react';
import { getAllCompanies, getAllJobs, createJob, updateJob, deleteJob } from '../../firebaseConfig';

const S = `
.tab-wrap{padding:1.5rem 0;}
.tab-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:.75rem;}
.tab-title{font-size:1.1rem;font-weight:700;color:#f1f5f9;}
.add-btn{padding:.55rem 1.1rem;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:8px;color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;}
.filter-sel{padding:.5rem .8rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#94a3b8;font-size:.85rem;outline:none;}
.ad-table{width:100%;border-collapse:collapse;}
.ad-table th{padding:.75rem 1rem;background:rgba(255,255,255,.04);color:#64748b;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);}
.ad-table td{padding:.85rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);font-size:.875rem;color:#cbd5e1;vertical-align:middle;}
.ad-table tr:hover td{background:rgba(99,102,241,.04);}
.lvl{padding:.2rem .6rem;border-radius:50px;font-size:.7rem;font-weight:700;}
.lvl-f{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.25);color:#34d399;}
.lvl-j{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);color:#fbbf24;}
.lvl-m{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);color:#818cf8;}
.lvl-s{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;}
.badge-active{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.25);color:#34d399;padding:.2rem .6rem;border-radius:50px;font-size:.7rem;font-weight:700;}
.badge-inactive{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;padding:.2rem .6rem;border-radius:50px;font-size:.7rem;font-weight:700;}
.icon-btn{background:none;border:none;cursor:pointer;padding:.35rem;border-radius:6px;transition:background .2s;}
.icon-btn:hover{background:rgba(255,255,255,.07);}
.skills-wrap{display:flex;flex-wrap:wrap;gap:.3rem;}
.skill-tag{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:5px;padding:.15rem .45rem;font-size:.7rem;color:#a5b4fc;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem;}
.modal-box{background:#0d0d16;border:1px solid rgba(99,102,241,.25);border-radius:16px;padding:1.75rem;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;}
.modal-title{font-size:1.1rem;font-weight:700;color:#f1f5f9;margin-bottom:1.25rem;}
.f-label{display:block;font-size:.78rem;font-weight:500;color:#94a3b8;margin-bottom:.35rem;}
.f-input{width:100%;padding:.65rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#f1f5f9;font-size:.875rem;outline:none;box-sizing:border-box;margin-bottom:.85rem;}
.f-input:focus{border-color:#6366f1;}
.f-select{width:100%;padding:.65rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#f1f5f9;font-size:.875rem;outline:none;box-sizing:border-box;margin-bottom:.85rem;}
.f-textarea{width:100%;padding:.65rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#f1f5f9;font-size:.875rem;outline:none;box-sizing:border-box;margin-bottom:.85rem;resize:vertical;min-height:80px;}
.skills-input-row{display:flex;gap:.5rem;margin-bottom:.5rem;}
.skills-input{flex:1;padding:.55rem .8rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#f1f5f9;font-size:.85rem;outline:none;}
.skills-add{padding:.55rem .9rem;background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.3);border-radius:8px;color:#a5b4fc;cursor:pointer;font-size:.85rem;}
.skills-list{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.85rem;}
.skill-chip{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);border-radius:6px;padding:.2rem .5rem;font-size:.75rem;color:#a5b4fc;display:flex;align-items:center;gap:.3rem;}
.skill-chip button{background:none;border:none;color:#f87171;cursor:pointer;font-size:.8rem;padding:0;}
.f-row{display:flex;gap:.75rem;margin-top:.25rem;}
.f-cancel{flex:1;padding:.65rem;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:none;color:#94a3b8;cursor:pointer;font-size:.875rem;}
.f-save{flex:1;padding:.65rem;border:none;border-radius:9px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-weight:600;cursor:pointer;font-size:.875rem;}
.empty-row{padding:2rem;text-align:center;color:#475569;}
`;

const EMPTY = { company_id:'', title:'', description:'', required_skills:[], experience_level:'fresher', is_active:1 };

export default function JobsTab() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getAllJobs(), getAllCompanies()]).then(([j, c]) => { setJobs(j); setCompanies(c); }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter === 'all' ? jobs : jobs.filter(j => String(j.company_id) === filter);
  const openAdd = () => { setForm(EMPTY); setSkillInput(''); setModal('add'); };
  const openEdit = (j) => { setForm({ company_id:j.company_id, title:j.title, description:j.description||'', required_skills:j.required_skills||[], experience_level:j.experience_level, is_active:j.is_active }); setSkillInput(''); setModal(j); };

  const addSkill = () => { const s = skillInput.trim(); if (s && !form.required_skills.includes(s)) setForm({...form, required_skills:[...form.required_skills, s]}); setSkillInput(''); };
  const removeSkill = (s) => setForm({...form, required_skills: form.required_skills.filter(x => x !== s)});

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === 'add') await createJob(form);
      else await updateJob(modal.id, form);
      setModal(null); load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this job opening?')) return;
    await deleteJob(id); load();
  }

  async function toggleActive(j) {
    await updateJob(j.id, { ...j, required_skills: j.required_skills||[], is_active: j.is_active ? 0 : 1 }); load();
  }

  const lvlClass = { fresher:'lvl lvl-f', junior:'lvl lvl-j', mid:'lvl lvl-m', senior:'lvl lvl-s' };

  return (
    <div className="tab-wrap">
      <style>{S}</style>
      <div className="tab-toolbar">
        <span className="tab-title"><Briefcase size={18} /> Job Openings ({filtered.length})</span>
        <div style={{display:'flex',gap:'.75rem',alignItems:'center'}}>
          <select className="filter-sel" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Companies</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="add-btn" onClick={openAdd}><Plus size={15} /> Add Job</button>
        </div>
      </div>

      {loading ? <p style={{color:'#6366f1',padding:'2rem'}}>Loading…</p> : (
        <table className="ad-table">
          <thead><tr>
            <th>Company</th><th>Title</th><th>Level</th><th>Skills</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan="6" className="empty-row">No jobs found.</td></tr>}
            {filtered.map(j => (
              <tr key={j.id}>
                <td style={{color:'#a5b4fc',fontWeight:600}}>{j.company_name}</td>
                <td style={{fontWeight:600,color:'#f1f5f9'}}>{j.title}</td>
                <td><span className={lvlClass[j.experience_level]||'lvl lvl-f'}>{j.experience_level}</span></td>
                <td><div className="skills-wrap">{(j.required_skills||[]).slice(0,3).map(s=><span key={s} className="skill-tag">{s}</span>)}{(j.required_skills||[]).length>3&&<span className="skill-tag">+{j.required_skills.length-3}</span>}</div></td>
                <td><span className={j.is_active?'badge-active':'badge-inactive'}>{j.is_active?'Active':'Inactive'}</span></td>
                <td style={{display:'flex',gap:'.35rem'}}>
                  <button className="icon-btn" onClick={() => openEdit(j)}><Edit3 size={15} color="#a5b4fc" /></button>
                  <button className="icon-btn" onClick={() => toggleActive(j)}>{j.is_active ? <PowerOff size={15} color="#fbbf24" /> : <Power size={15} color="#34d399" />}</button>
                  <button className="icon-btn" onClick={() => handleDelete(j.id)}><Trash2 size={15} color="#f87171" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal === 'add' ? 'Add Job Opening' : `Edit: ${modal.title}`}</div>
            <label className="f-label">Company *</label>
            <select className="f-select" value={form.company_id} onChange={e => setForm({...form, company_id:e.target.value})}>
              <option value="">Select company…</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="f-label">Job Title *</label>
            <input className="f-input" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Frontend Developer" />
            <label className="f-label">Description</label>
            <textarea className="f-textarea" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Job responsibilities…" />
            <label className="f-label">Experience Level</label>
            <select className="f-select" value={form.experience_level} onChange={e => setForm({...form, experience_level:e.target.value})}>
              {['fresher','junior','mid','senior'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <label className="f-label">Required Skills</label>
            <div className="skills-input-row">
              <input className="skills-input" value={skillInput} onChange={e=>setSkillInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addSkill()} placeholder="e.g. React" />
              <button className="skills-add" onClick={addSkill}>Add</button>
            </div>
            <div className="skills-list">
              {form.required_skills.map(s => <span key={s} className="skill-chip">{s}<button onClick={()=>removeSkill(s)}>×</button></span>)}
            </div>
            <div className="f-row">
              <button className="f-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="f-save" onClick={handleSave} disabled={saving||!form.title||!form.company_id}>{saving?'Saving…':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
