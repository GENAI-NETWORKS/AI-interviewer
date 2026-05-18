import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp, Link2, FileQuestion,
  CheckCircle, Circle, Edit3, X, AlertCircle, Loader2, MoreVertical
} from 'lucide-react';
import {
  getAllTemplates, getTemplate, createTemplate, updateTemplate,
  saveTemplateQuestions, deleteTemplate, getAllJobs
} from '../../firebaseConfig';

const S = `
.tab-wrap{padding:1.5rem 0;}
.tab-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:.75rem;}
.tab-title{font-size:1.1rem;font-weight:700;color:#f1f5f9;display:flex;align-items:center;gap:.5rem;}
.add-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:8px;color:#fff;font-size:.84rem;font-weight:600;cursor:pointer;transition:opacity .2s;}
.add-btn:hover{opacity:.88;}
.tmpl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-bottom:1.5rem;}
.tmpl-card{background:#0d0d16;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem;cursor:pointer;transition:all .2s;position:relative;}
.tmpl-card:hover{border-color:rgba(99,102,241,.4);transform:translateY(-2px);}
.tmpl-card.active{border-color:#6366f1;background:rgba(99,102,241,.06);}
.tmpl-name{font-size:.95rem;font-weight:700;color:#f1f5f9;margin-bottom:.4rem;padding-right:1.5rem;}
.tmpl-meta{font-size:.75rem;color:#64748b;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;}
.tmpl-badge{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);border-radius:5px;padding:.15rem .45rem;font-size:.7rem;color:#a5b4fc;}
.tmpl-menu-btn{position:absolute;top:.8rem;right:.8rem;background:none;border:none;color:#64748b;cursor:pointer;padding:.3rem;border-radius:6px;transition:all .2s;display:flex;align-items:center;justify-content:center;}
.tmpl-menu-btn:hover{background:rgba(255,255,255,.1);color:#f1f5f9;}
.tmpl-dropdown{position:absolute;top:2.2rem;right:.8rem;background:#1e1e2d;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.3rem;min-width:120px;box-shadow:0 8px 24px rgba(0,0,0,.3);z-index:10;}
.t-btn{display:flex;align-items:center;gap:.4rem;width:100%;padding:.45rem .6rem;border-radius:5px;font-size:.78rem;font-weight:500;cursor:pointer;border:none;transition:all .2s;text-align:left;background:none;}
.t-btn-edit{color:#a5b4fc;}
.t-btn-edit:hover{background:rgba(99,102,241,.15);}
.t-btn-del{color:#f87171;}
.t-btn-del:hover{background:rgba(239,68,68,.15);}

/* editor */
.editor-wrap{background:#0d0d16;border:1px solid rgba(99,102,241,.2);border-radius:16px;padding:1.5rem;}
.editor-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid rgba(255,255,255,.06);}
.editor-title{font-size:1rem;font-weight:700;color:#f1f5f9;}
.f-label{display:block;font-size:.75rem;font-weight:600;color:#94a3b8;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.04em;}
.f-input{width:100%;padding:.6rem .85rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:8px;color:#f1f5f9;font-size:.875rem;outline:none;box-sizing:border-box;}
.f-input:focus{border-color:#6366f1;}
.f-select{width:100%;padding:.6rem .85rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:8px;color:#f1f5f9;font-size:.875rem;outline:none;box-sizing:border-box;}
/* domain section */
.domain-section{margin-bottom:1.25rem;}
.domain-header{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.15);border-radius:10px;cursor:pointer;margin-bottom:.5rem;}
.domain-header:hover{background:rgba(99,102,241,.12);}
.domain-label{font-size:.875rem;font-weight:700;color:#a5b4fc;display:flex;align-items:center;gap:.5rem;}
.domain-count{font-size:.72rem;color:#64748b;background:rgba(255,255,255,.06);padding:.15rem .45rem;border-radius:5px;}
/* question card */
.q-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1rem;margin-bottom:.65rem;}
.q-num{font-size:.7rem;color:#6366f1;font-weight:700;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.04em;}
.q-input{width:100%;padding:.55rem .8rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;color:#f1f5f9;font-size:.84rem;outline:none;box-sizing:border-box;resize:vertical;min-height:56px;font-family:inherit;}
.q-input:focus{border-color:rgba(99,102,241,.5);}
.opts-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:.6rem 0;}
.opt-row{display:flex;align-items:center;gap:.4rem;}
.opt-letter{width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#64748b;flex-shrink:0;}
.opt-letter.correct{background:#6366f1;color:#fff;}
.opt-inp{flex:1;padding:.4rem .6rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:6px;color:#f1f5f9;font-size:.8rem;outline:none;}
.opt-inp:focus{border-color:rgba(99,102,241,.4);}
.opt-radio{accent-color:#6366f1;cursor:pointer;}
.q-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.5rem;}
.concept-inp{flex:1;padding:.35rem .6rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:6px;color:#64748b;font-size:.75rem;outline:none;margin-right:.5rem;}
.q-del-btn{background:none;border:none;color:#f87171;cursor:pointer;padding:.25rem;border-radius:5px;display:flex;align-items:center;}
.q-del-btn:hover{background:rgba(239,68,68,.1);}
.add-q-btn{display:flex;align-items:center;gap:.35rem;width:100%;padding:.55rem;border:1px dashed rgba(99,102,241,.25);border-radius:8px;background:none;color:#6366f1;font-size:.82rem;cursor:pointer;justify-content:center;transition:all .2s;margin-bottom:.5rem;}
.add-q-btn:hover{border-color:#6366f1;background:rgba(99,102,241,.05);}
.save-bar{display:flex;align-items:center;justify-content:flex-end;gap:.75rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06);}
.btn-cancel{padding:.55rem 1.1rem;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:none;color:#94a3b8;cursor:pointer;font-size:.85rem;}
.btn-save{display:inline-flex;align-items:center;gap:.4rem;padding:.55rem 1.25rem;background:linear-gradient(135deg,#059669,#10b981);border:none;border-radius:8px;color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;}
.btn-save:disabled{opacity:.4;cursor:not-allowed;}
.empty-state{text-align:center;padding:3rem 1rem;color:#475569;}
.empty-icon{margin:0 auto 1rem;opacity:.4;}
.msg-box{display:flex;align-items:center;gap:.5rem;padding:.65rem 1rem;border-radius:8px;font-size:.82rem;margin-bottom:1rem;}
.msg-ok{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);color:#34d399;}
.msg-err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#f87171;}
.meta-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem;}
`;

const DEFAULT_DOMAINS = ['Technical', 'Domain', 'Behavioral'];
const LETTERS = ['A', 'B', 'C', 'D'];

function blankQ(domain) {
  return { domain, question: '', options: ['', '', '', ''], answer: 0, concept: '' };
}

function initQuestions(domains) {
  return domains.flatMap(d => Array.from({ length: 20 }, () => blankQ(d)));
}

export default function QuestionsTemplateTab() {
  const [templates, setTemplates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // null | { id, name, job_id, questions[], domains[] }
  const [open, setOpen] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingDomain, setRenamingDomain] = useState(null); // index being renamed

  const load = async () => {
    setLoading(true);
    try {
      const [t, j] = await Promise.all([getAllTemplates(), getAllJobs()]);
      setTemplates(t); setJobs(j);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }

  async function handleCreate() {
    const name = prompt('Template name (e.g. "Frontend Developer — Batch 1"):');
    if (!name?.trim()) return;
    const r = await createTemplate({ name: name.trim() });
    await load();
    handleEdit(r.id);
  }

  async function handleEdit(id) {
    const data = await getTemplate(id);

    // Parse saved domain names or fall back to defaults
    let domains = DEFAULT_DOMAINS;
    if (data.domain_names) {
      try { domains = typeof data.domain_names === 'string' ? JSON.parse(data.domain_names) : data.domain_names; }
      catch(_) {}
    }

    const qs = data.questions && data.questions.length > 0
      ? data.questions
      : initQuestions(domains);
    
    // Ensure job_ids is parsed
    let jobIds = [];
    if (data.job_ids) {
      jobIds = typeof data.job_ids === 'string' ? JSON.parse(data.job_ids) : data.job_ids;
    }

    // Build open state from domains
    const openState = {};
    domains.forEach((d, i) => { openState[i] = i === 0; });
    setOpen(openState);
    setEditing({ id: data.id, name: data.name, job_ids: jobIds, questions: qs, domains });
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Delete this template and all its questions?')) return;
    await deleteTemplate(id);
    if (editing?.id === id) setEditing(null);
    load();
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateTemplate(editing.id, { name: editing.name, job_ids: editing.job_ids || [], domain_names: editing.domains });
      await saveTemplateQuestions(editing.id, editing.questions);
      showMsg('ok', 'Template saved successfully!');
      load();
    } catch(e) {
      showMsg('err', e.message);
    } finally { setSaving(false); }
  }

  function updateQ(idx, field, val) {
    setEditing(prev => {
      const qs = [...prev.questions];
      qs[idx] = { ...qs[idx], [field]: val };
      return { ...prev, questions: qs };
    });
  }

  function updateOpt(qIdx, oIdx, val) {
    setEditing(prev => {
      const qs = [...prev.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = val;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...prev, questions: qs };
    });
  }

  function addQuestion(domain) {
    setEditing(prev => ({ ...prev, questions: [...prev.questions, blankQ(domain)] }));
  }

  function removeQuestion(idx) {
    setEditing(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
  }

  function domainQs(domain) {
    return editing.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.domain === domain);
  }

  function renameDomain(domainIdx, newName) {
    const oldName = editing.domains[domainIdx];
    const newDomains = [...editing.domains];
    newDomains[domainIdx] = newName;
    // Rename all questions of this domain too
    const newQs = editing.questions.map(q => q.domain === oldName ? { ...q, domain: newName } : q);
    setEditing(prev => ({ ...prev, domains: newDomains, questions: newQs }));
  }

  if (loading) return <div style={{ color: '#6366f1', padding: '2rem' }}>Loading templates…</div>;

  return (
    <div className="tab-wrap">
      <style>{S}</style>

      {msg && (
        <div className={`msg-box ${msg.type === 'ok' ? 'msg-ok' : 'msg-err'}`}>
          {msg.type === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
        </div>
      )}

      <div className="tab-toolbar">
        <span className="tab-title"><FileQuestion size={18} /> Question Templates ({templates.length})</span>
        <button className="add-btn" onClick={handleCreate}><Plus size={15} /> Create Template</button>
      </div>

      {/* Template list */}
      {!editing && (
        <>
          {templates.length === 0 ? (
            <div className="empty-state">
              <FileQuestion size={48} className="empty-icon" style={{ margin: '0 auto 1rem', display: 'block', opacity: .3 }} />
              <div style={{ color: '#94a3b8', marginBottom: '.5rem' }}>No templates yet</div>
              <div style={{ fontSize: '.82rem' }}>Click "Create Template" to build your first question set</div>
            </div>
          ) : (
            <div className="tmpl-grid">
              {templates.map(t => (
                <div key={t.id} className="tmpl-card" onClick={() => handleEdit(t.id)}>
                  <div className="tmpl-name">{t.name}</div>
                  
                  <button className="tmpl-menu-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id); }}>
                    <MoreVertical size={16} />
                  </button>

                  {openMenuId === t.id && (
                    <div className="tmpl-dropdown" onClick={e => e.stopPropagation()}>
                      <button className="t-btn t-btn-edit" onClick={() => { setOpenMenuId(null); handleEdit(t.id); }}>
                        <Edit3 size={14} /> Edit Template
                      </button>
                      <button className="t-btn t-btn-del" onClick={e => { setOpenMenuId(null); handleDelete(t.id, e); }}>
                        <Trash2 size={14} /> Delete Template
                      </button>
                    </div>
                  )}

                  <div className="tmpl-meta">
                    <span><FileQuestion size={12} /> {t.question_count || 0} questions</span>
                  </div>
                  {t.jobLabels && t.jobLabels.length > 0 && (
                    <div className="tmpl-meta" style={{ marginTop: '.3rem' }}>
                      {t.jobLabels.map((lbl, idx) => (
                        <span key={idx} className="tmpl-badge" style={{ marginBottom: '.2rem' }}><Link2 size={10} /> {lbl}</span>
                      ))}
                    </div>
                  )}
                  <div className="tmpl-meta" style={{ marginTop: '.4rem' }}>
                    Updated {new Date(t.updated_at || t.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Editor */}
      {editing && (
        <div className="editor-wrap">
          <div className="editor-head">
            <div className="editor-title">
              <Edit3 size={16} style={{ marginRight: '.4rem', verticalAlign: 'middle' }} />
              Editing Template
            </div>
            <button className="btn-cancel" onClick={() => setEditing(null)}>
              <X size={14} style={{ verticalAlign: 'middle' }} /> Close
            </button>
          </div>

          {/* Meta */}
          <div className="meta-row">
            <div>
              <label className="f-label">Template Name *</label>
              <input className="f-input" value={editing.name}
                onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Frontend Developer — Batch 1" />
            </div>
            <div>
              <label className="f-label"><Link2 size={11} style={{verticalAlign:'middle'}} /> Link to Job Roles (Multi-select)</label>
              <div style={{ position: 'relative' }}>
                <select className="f-select" value=""
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (val && !(editing.job_ids || []).includes(val)) {
                      setEditing(p => ({ ...p, job_ids: [...(p.job_ids || []), val] }));
                    }
                  }}>
                  <option value="">— Add a job role —</option>
                  {jobs.filter(j => !(editing.job_ids || []).includes(j.id)).map(j => (
                    <option key={j.id} value={j.id}>{j.title} ({j.company_name})</option>
                  ))}
                </select>
                {/* selected tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.5rem' }}>
                  {(editing.job_ids || []).map(id => {
                    const j = jobs.find(x => x.id === id);
                    if (!j) return null;
                    return (
                      <div key={id} style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)', borderRadius: '6px', padding: '.2rem .5rem', fontSize: '.75rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                        {j.title} @ {j.company_name}
                        <button onClick={() => setEditing(p => ({ ...p, job_ids: p.job_ids.filter(x => x !== id) }))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Domain sections */}
          {(editing.domains || DEFAULT_DOMAINS).map((domain, domainIdx) => {
            const dqs = domainQs(domain);
            const isOpen = open[domainIdx];
            return (
              <div key={domainIdx} className="domain-section">
                <div className="domain-header" onClick={() => setOpen(p => ({ ...p, [domainIdx]: !p[domainIdx] }))}>
                  <span className="domain-label">
                    {renamingDomain === domainIdx ? (
                      <input
                        autoFocus
                        style={{ background:'rgba(255,255,255,.1)', border:'1px solid #6366f1', borderRadius:5, color:'#f1f5f9', padding:'.2rem .5rem', fontSize:'.82rem', width:130, outline:'none' }}
                        value={domain}
                        onClick={e => e.stopPropagation()}
                        onChange={e => renameDomain(domainIdx, e.target.value)}
                        onBlur={() => setRenamingDomain(null)}
                        onKeyDown={e => { if(e.key==='Enter') setRenamingDomain(null); e.stopPropagation(); }}
                      />
                    ) : (
                      <span
                        title="Click to rename domain"
                        onClick={e => { e.stopPropagation(); setRenamingDomain(domainIdx); }}
                        style={{ cursor:'text', borderBottom:'1px dashed rgba(165,180,252,.4)', paddingBottom:1 }}
                      >
                        {domain} Domain
                      </span>
                    )}
                    <span className="domain-count">{dqs.length}/20</span>
                    {dqs.length === 20 && <CheckCircle size={14} color="#34d399" />}
                    {dqs.length !== 20 && <AlertCircle size={14} color="#fbbf24" />}
                  </span>
                  {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </div>

                {isOpen && (
                  <>
                    {dqs.map(({ q, i }, num) => (
                      <div key={i} className="q-card">
                        <div className="q-num">{domain} Q{num + 1}</div>

                        <textarea className="q-input" value={q.question}
                          onChange={e => updateQ(i, 'question', e.target.value)}
                          placeholder="Enter the question text…" rows={2} />

                        <div className="opts-grid">
                          {[0, 1, 2, 3].map(o => (
                            <div key={o} className="opt-row">
                              <label className={`opt-letter${q.answer === o ? ' correct' : ''}`} title="Mark as correct">
                                <input type="radio" className="opt-radio" name={`ans-${i}`} checked={q.answer === o}
                                  onChange={() => updateQ(i, 'answer', o)} style={{ display: 'none' }} />
                                {LETTERS[o]}
                              </label>
                              <input className="opt-inp" value={q.options[o] || ''}
                                onChange={e => updateOpt(i, o, e.target.value)}
                                placeholder={`Option ${LETTERS[o]}`} />
                            </div>
                          ))}
                        </div>

                        <div className="q-footer">
                          <input className="concept-inp" value={q.concept || ''}
                            onChange={e => updateQ(i, 'concept', e.target.value)}
                            placeholder="Topic / concept tag (optional)" />
                          <button className="q-del-btn" title="Remove question" onClick={() => removeQuestion(i)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {dqs.length < 20 && (
                      <button className="add-q-btn" onClick={() => addQuestion(domain)}>
                        <Plus size={14} /> Add {domain} Question ({20 - dqs.length} more needed)
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <div className="save-bar">
            <span style={{ fontSize: '.78rem', color: '#64748b' }}>
              Total: {editing.questions.length}/60 questions
            </span>
            <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-save" onClick={handleSave} disabled={saving || !editing.name}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              {saving ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
