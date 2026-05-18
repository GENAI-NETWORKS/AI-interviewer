import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanies } from '../firebaseConfig';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.cs-wrap{min-height:100vh;background:#0a0a0f;font-family:'Inter',sans-serif;padding:2rem;}
.cs-header{display:flex;flex-direction:column;align-items:center;gap:1.25rem;margin-bottom:3rem;}
.cs-nav-row{width:100%;max-width:1100px;display:flex;align-items:center;justify-content:space-between;}
.cs-back{display:inline-flex;align-items:center;gap:.5rem;background:none;border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:.85rem;padding:.5rem 1rem;border-radius:8px;cursor:pointer;}
.cs-badge{display:inline-flex;align-items:center;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);border-radius:50px;padding:.35rem .9rem;font-size:.72rem;color:#a5b4fc;font-weight:600;letter-spacing:.06em;text-transform:uppercase;}
.cs-title{font-size:2.2rem;font-weight:800;color:#f1f5f9;margin:0;}
.cs-title span{background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.cs-sub{color:#64748b;font-size:1rem;margin:0;}
.cs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;max-width:1100px;margin:0 auto;}
.cs-card{background:#0d0d16;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.75rem;cursor:pointer;transition:all .25s;position:relative;overflow:hidden;}
.cs-card:hover{border-color:rgba(99,102,241,.5);transform:translateY(-3px);box-shadow:0 12px 40px rgba(99,102,241,.15);}
.cs-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,.05),transparent);opacity:0;transition:opacity .25s;}
.cs-card:hover::before{opacity:1;}
.cs-logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:1rem;overflow:hidden;}
.cs-logo img{width:100%;height:100%;object-fit:cover;border-radius:14px;}
.cs-cname{font-size:1.15rem;font-weight:700;color:#f1f5f9;margin-bottom:.35rem;}
.cs-cdesc{font-size:.82rem;color:#64748b;line-height:1.5;}
.cs-arrow{position:absolute;top:1.5rem;right:1.5rem;color:#6366f1;opacity:0;transition:opacity .2s,transform .2s;}
.cs-card:hover .cs-arrow{opacity:1;transform:translateX(3px);}
.cs-empty{text-align:center;padding:4rem;color:#475569;}
.cs-empty-icon{font-size:3rem;margin-bottom:1rem;}
.cs-loading{text-align:center;padding:4rem;color:#6366f1;}
.cs-spinner{width:40px;height:40px;border:3px solid rgba(99,102,241,.2);border-top-color:#6366f1;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 1rem;}
@keyframes spin{to{transform:rotate(360deg);}}
`;

export default function CompanySelect() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState({});  // tracks which logos failed to load

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('studentDetails') || 'null');
    if (!user) { navigate('/'); return; }
    getCompanies().then(setCompanies).catch(console.error).finally(() => setLoading(false));
  }, []);

  function selectCompany(c) {
    localStorage.setItem('selectedCompany', JSON.stringify(c));
    navigate('/select-job');
  }

  const initials = (name) => name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();

  /** Auto-convert Google Drive share links to direct thumbnail URLs */
  function normalizeDriveUrl(url) {
    if (!url) return '';
    // Match: drive.google.com/file/d/<ID>/...
    const m = url.match(/drive\.google\.com\/file\/d\/([-\w]+)/);
    if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w300`;
    // Match: ?id=<ID> style links
    const m2 = url.match(/drive\.google\.com.*[?&]id=([-\w]+)/);
    if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w300`;
    return url;
  }

  return (
    <div className="cs-wrap">
      <style>{S}</style>
      <div className="cs-header">
        <div className="cs-nav-row">
          <button className="cs-back" onClick={() => navigate('/')}>Back</button>
          <div className="cs-badge">Step 1 of 4</div>
          <div style={{width:90}} />
        </div>
        <h1 className="cs-title">Select <span>Company</span></h1>
        <p className="cs-sub">Choose the company you want to interview for</p>
      </div>

      {loading ? (
        <div className="cs-loading"><div className="cs-spinner"/><p>Loading companies…</p></div>
      ) : companies.length === 0 ? (
        <div className="cs-empty">
          <div className="cs-empty-icon">🏢</div>
          <p style={{fontWeight:600,color:'#94a3b8',marginBottom:'.5rem'}}>No companies available</p>
          <p style={{fontSize:'.85rem'}}>Ask your admin to add companies in the admin panel.</p>
        </div>
      ) : (
        <div className="cs-grid">
          {companies.map(c => (
            <div key={c.id} className="cs-card" onClick={() => selectCompany(c)}>
              <div className="cs-logo">
                {c.logo_url && !imgErrors[c.id]
                  ? <img
                      src={normalizeDriveUrl(c.logo_url)}
                      alt={c.name}
                      onError={() => setImgErrors(prev => ({ ...prev, [c.id]: true }))}
                    />
                  : initials(c.name)}
              </div>
              <div className="cs-cname">{c.name}</div>
              <div className="cs-cdesc">{c.description || 'Click to view job openings'}</div>
              <svg className="cs-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
