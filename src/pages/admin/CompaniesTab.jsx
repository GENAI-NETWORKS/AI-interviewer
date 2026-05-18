import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit3, Trash2, Power, PowerOff } from 'lucide-react';
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from '../../firebaseConfig';

const S = `
.tab-wrap{padding:1.5rem 0;}
.tab-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;}
.tab-title{font-size:1.1rem;font-weight:700;color:#f1f5f9;display:flex;align-items:center;gap:.5rem;}
.add-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:8px;color:#fff;font-size:.84rem;font-weight:600;cursor:pointer;}
.add-btn:hover{opacity:.88;}
.ad-table{width:100%;border-collapse:collapse;}
.ad-table th{padding:.75rem 1rem;background:rgba(255,255,255,.04);color:#64748b;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);}
.ad-table td{padding:.85rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);font-size:.875rem;color:#cbd5e1;vertical-align:middle;}
.ad-table tr:hover td{background:rgba(99,102,241,.04);}
.badge-active{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.25);color:#34d399;padding:.2rem .6rem;border-radius:50px;font-size:.7rem;font-weight:700;}
.badge-inactive{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;padding:.2rem .6rem;border-radius:50px;font-size:.7rem;font-weight:700;}
.icon-btn{background:none;border:none;cursor:pointer;padding:.35rem;border-radius:6px;transition:background .2s;display:inline-flex;align-items:center;}
.icon-btn:hover{background:rgba(255,255,255,.07);}
.icon-btn.edit:hover{background:rgba(99,102,241,.12);}
.icon-btn.del:hover{background:rgba(239,68,68,.1);}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem;}
.modal-box{background:#0d0d16;border:1px solid rgba(99,102,241,.25);border-radius:16px;padding:1.75rem;width:100%;max-width:460px;max-height:90vh;overflow-y:auto;}
.modal-title{font-size:1.05rem;font-weight:700;color:#f1f5f9;margin-bottom:1.25rem;}
.f-label{display:block;font-size:.75rem;font-weight:600;color:#94a3b8;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.04em;}
.f-input{width:100%;padding:.62rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#f1f5f9;font-size:.875rem;outline:none;box-sizing:border-box;margin-bottom:.85rem;}
.f-input:focus{border-color:#6366f1;}
.f-textarea{width:100%;padding:.62rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#f1f5f9;font-size:.875rem;outline:none;box-sizing:border-box;margin-bottom:.85rem;resize:vertical;min-height:80px;font-family:inherit;}
.f-textarea:focus{border-color:#6366f1;}
.f-row{display:flex;gap:.75rem;margin-top:.25rem;}
.f-cancel{flex:1;padding:.65rem;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:none;color:#94a3b8;cursor:pointer;font-size:.875rem;}
.f-save{flex:1;padding:.65rem;border:none;border-radius:9px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-weight:600;cursor:pointer;font-size:.875rem;}
.empty-row{padding:2rem;text-align:center;color:#475569;}
.logo-prev{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;color:#fff;overflow:hidden;flex-shrink:0;}
.logo-prev img{width:100%;height:100%;object-fit:cover;display:block;}
.logo-preview-box{display:flex;align-items:center;gap:.75rem;margin-bottom:.85rem;}
.logo-preview-large{width:52px;height:52px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;color:#fff;overflow:hidden;flex-shrink:0;border:2px solid rgba(99,102,241,.3);}
.logo-preview-large img{width:100%;height:100%;object-fit:cover;display:block;}
.desc-cell{color:#64748b;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
`;

const EMPTY = { name: '', logo_url: '', description: '', is_active: 1 };

/** Auto-converts any Google Drive share/view URL to a direct thumbnail URL */
function normalizeDriveUrl(url) {
  if (!url) return '';
  // Match: drive.google.com/file/d/<ID>/...
  const m = url.match(/drive\.google\.com\/file\/d\/([-\w]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w300`;
  // Match: drive.google.com/open?id=<ID> or ...?id=<ID>&...
  const m2 = url.match(/drive\.google\.com.*[?&]id=([\w-]+)/);
  if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w300`;
  return url; // not a Drive link — return as-is
}

export default function CompaniesTab() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => { getAllCompanies().then(setCompanies).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (c) => { setForm({ name: c.name, logo_url: c.logo_url || '', description: c.description || '', is_active: c.is_active }); setModal(c); };
  const initials = (n) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  async function handleSave() {
    setSaving(true);
    try {
      // Auto-convert Drive links before saving
      const saveForm = { ...form, logo_url: normalizeDriveUrl(form.logo_url) };
      if (modal === 'add') await createCompany(saveForm);
      else await updateCompany(modal.id, saveForm);
      setModal(null); load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this company and all its jobs?')) return;
    await deleteCompany(id); load();
  }

  async function toggleActive(c) {
    await updateCompany(c.id, { ...c, is_active: c.is_active ? 0 : 1 }); load();
  }

  return (
    <div className="tab-wrap">
      <style>{S}</style>
      <div className="tab-toolbar">
        <span className="tab-title"><Building2 size={18} /> Companies ({companies.length})</span>
        <button className="add-btn" onClick={openAdd}><Plus size={15} /> Add Company</button>
      </div>

      {loading ? <p style={{ color: '#6366f1', padding: '2rem' }}>Loading…</p> : (
        <table className="ad-table">
          <thead><tr>
            <th>Logo</th><th>Name</th><th>Description</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {companies.length === 0 && <tr><td colSpan="5" className="empty-row">No companies yet. Add one!</td></tr>}
            {companies.map(c => (
              <tr key={c.id}>
                <td><div className="logo-prev">{c.logo_url
                  ? <img src={normalizeDriveUrl(c.logo_url)} alt="" onError={e => { e.target.style.display='none'; e.target.parentNode.innerText = initials(c.name); }} />
                  : initials(c.name)}</div></td>
                <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{c.name}</td>
                <td className="desc-cell" title={c.description}>{c.description || '—'}</td>
                <td><span className={c.is_active ? 'badge-active' : 'badge-inactive'}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ display: 'flex', gap: '.35rem' }}>
                  <button className="icon-btn edit" title="Edit" onClick={() => openEdit(c)}><Edit3 size={15} color="#a5b4fc" /></button>
                  <button className="icon-btn" title="Toggle" onClick={() => toggleActive(c)}>
                    {c.is_active ? <PowerOff size={15} color="#fbbf24" /> : <Power size={15} color="#34d399" />}
                  </button>
                  <button className="icon-btn del" title="Delete" onClick={() => handleDelete(c.id)}><Trash2 size={15} color="#f87171" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal === 'add' ? 'Add Company' : `Edit: ${modal.name}`}</div>
            <label className="f-label">Company Name *</label>
            <input className="f-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Infosys" />
            <label className="f-label">Logo URL (optional)</label>
            <input className="f-input" value={form.logo_url}
              onChange={e => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://... or Google Drive share link" />
            {/* Drive link auto-convert hint */}
            {form.logo_url && normalizeDriveUrl(form.logo_url) !== form.logo_url && (
              <div style={{ fontSize:'.72rem', color:'#34d399', marginBottom:'.5rem', display:'flex', alignItems:'center', gap:4 }}>
                ✅ Google Drive link detected — will be auto-converted
              </div>
            )}
            {/* Live logo preview */}
            <div className="logo-preview-box">
              <div className="logo-preview-large">
                {form.logo_url
                  ? <img src={normalizeDriveUrl(form.logo_url)} alt="preview"
                      onError={e => { e.target.style.display='none'; e.target.parentNode.innerText = form.name ? initials(form.name) : '?'; }}
                      onLoad={e  => { e.target.style.display='block'; }}
                    />
                  : <span>{form.name ? initials(form.name) : '?'}</span>}
              </div>
              <span style={{ fontSize: '.75rem', color: '#64748b' }}>Logo preview — paste any image URL or Google Drive link</span>
            </div>
            <label className="f-label">Description</label>
            <textarea className="f-textarea" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the company, culture, domain…" rows={4} />
            <div className="f-row">
              <button className="f-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="f-save" onClick={handleSave} disabled={saving || !form.name}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
