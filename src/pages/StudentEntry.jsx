import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, BarChart2, ShieldCheck, Zap, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { checkStudentStatus, studentRegister, studentLogin, studentGoogleLogin } from '../firebaseConfig';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import logoImg from '../assets/logo.png';

/* ─── scrollbar-killer injected once ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  html, body, #root {
    overflow: hidden !important;
    height: 100%;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
  * { box-sizing: border-box; }
  @keyframes se-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes se-spin   { to { transform: rotate(360deg); } }
  .se-slide-in { animation: se-fadein .25s ease forwards; }
`;

const FEATURES = [
  { Icon: Bot,         title: 'AI-Powered Interviews',  desc: 'Adaptive questioning engine' },
  { Icon: BarChart2,   title: 'Real-time Analytics',    desc: 'Instant score & breakdown' },
  { Icon: ShieldCheck, title: 'Secure Proctoring',      desc: 'Anti-cheat fullscreen mode' },
  { Icon: Zap,         title: '60-Question Exam',       desc: 'Technical · Domain · Soft skills' },
];

export default function StudentEntry() {
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [status,   setStatus]   = useState(null); // { type: 'err'|'ok', msg }
  const [busy,     setBusy]     = useState(false);
  const formRef = useRef(null);

  /* block back navigation during flow */
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const h = () => window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, []);

  /* clear status when switching tabs */
  function switchTab(t) {
    setTab(t);
    setStatus(null);
    setName('');
    setEmail('');
    setPassword('');
  }

  async function handleAuth(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);

    const trimEmail = email.trim().toLowerCase();
    const trimName  = name.trim();

    try {
      let user;

      if (tab === 'signup') {
        // ── REGISTER ───────────────────────────────────────────────────────────
        const r = await studentRegister({ name: trimName, email: trimEmail, password });
        user = r.user;
        setStatus({ type:'ok', msg: `Account created! Welcome, ${user.name}!` });
        await new Promise(res => setTimeout(res, 800));
      } else {
        // ── LOGIN ──────────────────────────────────────────────────────────────
        const r = await studentLogin({ email: trimEmail, password });
        user = r.user;
      }

      // Check if previously terminated / completed
      try {
        const check = await checkStudentStatus({ email: trimEmail, name: user.name, department: '', year: '' });
        if (check.isTerminated) {
          if (check.terminationReason) localStorage.setItem('terminationReason', check.terminationReason);
          navigate('/terminated');
          return;
        }
        if (check.isCompleted) {
          localStorage.setItem('studentDetails', JSON.stringify({ name: user.name, email: trimEmail, mobile: '', year: '', department: '' }));
          navigate('/completed');
          return;
        }
      } catch (_) { /* status check is best-effort */ }

      // Save to localStorage and proceed
      localStorage.setItem('studentDetails', JSON.stringify({
        id: user.id, name: user.name, email: trimEmail, mobile: user.mobile || '', year: '', department: ''
      }));
      ['testTerminated','terminationReason','scoreData','selectedCompany','selectedJob','resumeScan'].forEach(k => localStorage.removeItem(k));

      navigate('/select-company');

    } catch (err) {
      setStatus({ type:'err', msg: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleAuth() {
    setBusy(true);
    setStatus(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const r = await studentGoogleLogin({
        name: fbUser.displayName || 'Google User',
        email: fbUser.email
      });
      const user = r.user;

      try {
        const check = await checkStudentStatus({ email: user.email, name: user.name, department: '', year: '' });
        if (check.isTerminated) {
          if (check.terminationReason) localStorage.setItem('terminationReason', check.terminationReason);
          navigate('/terminated');
          return;
        }
        if (check.isCompleted) {
          localStorage.setItem('studentDetails', JSON.stringify({ name: user.name, email: user.email, mobile: '', year: '', department: '' }));
          navigate('/completed');
          return;
        }
      } catch (_) { /* status check is best-effort */ }

      localStorage.setItem('studentDetails', JSON.stringify({
        id: user.id, name: user.name, email: user.email, mobile: user.mobile || '', year: '', department: ''
      }));
      ['testTerminated','terminationReason','scoreData','selectedCompany','selectedJob','resumeScan'].forEach(k => localStorage.removeItem(k));

      navigate('/select-company');
    } catch (err) {
      console.error("Google Auth Error:", err);
      setStatus({ type:'err', msg: err.message || 'Google sign-in failed.' });
    } finally {
      setBusy(false);
    }
  }

  /* ── shared styles ── */
  const inputWrap = { position:'relative', display:'flex', alignItems:'center', marginBottom:11 };
  const iconSt    = { position:'absolute', left:10, color:'#94a3b8', pointerEvents:'none', display:'flex' };
  const inputSt   = { width:'100%', padding:'9px 10px 9px 34px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:14, color:'#1e293b', outline:'none', boxSizing:'border-box', fontFamily:"'Inter',sans-serif", transition:'border-color .2s' };

  return (
    <div style={{ height:'100vh', background:'linear-gradient(135deg,#ede9fe 0%,#f1f5f9 60%,#e0f2fe 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", padding:'1.5rem', overflow:'hidden' }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ display:'flex', width:'100%', maxWidth:780, height:540, background:'#fff', borderRadius:20, boxShadow:'0 8px 40px rgba(79,70,229,.13)', overflow:'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ width:320, flexShrink:0, background:'linear-gradient(150deg,#4f46e5 0%,#7c3aed 100%)', padding:'2rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
              <img src={logoImg} alt="GoGenix" style={{ width:30, height:30, borderRadius:7, objectFit:'contain', background:'rgba(255,255,255,.2)', padding:3 }} />
              <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>GoGenix AI</span>
            </div>

            <h1 style={{ fontSize:19, fontWeight:800, color:'#fff', lineHeight:1.3, margin:'0 0 7px' }}>
              AI-Powered Interview Platform
            </h1>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.72)', lineHeight:1.55, margin:'0 0 18px' }}>
              Smart, adaptive assessments that match you with the right opportunities.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} style={{ display:'flex', alignItems:'center', gap:9, background:'rgba(255,255,255,.1)', borderRadius:9, padding:'9px 11px' }}>
                  <div style={{ width:28, height:28, background:'rgba(255,255,255,.18)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={13} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{title}</div>
                    <div style={{ fontSize:10.5, color:'rgba(255,255,255,.6)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,.15)', paddingTop:12, marginTop:12 }}>
            {[['60','Questions'],['60m','Duration']].map(([v,l], i) => (
              <div key={l} style={{ flex:1, textAlign:'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,.15)' : 'none' }}>
                <div style={{ fontSize:20, fontWeight:800, color:'#fff' }}>{v}</div>
                <div style={{ fontSize:9.5, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex:1, padding:'2rem 2.5rem', display:'flex', flexDirection:'column', justifyContent:'center', overflow:'hidden' }}>

          {/* Tabs */}
          <div style={{ display:'flex', background:'#f1f5f9', borderRadius:9, padding:4, marginBottom:18 }}>
            {['login','signup'].map(t => (
              <button key={t} onClick={() => switchTab(t)}
                style={{ flex:1, padding:'7px 0', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .2s',
                  background: tab === t ? '#4f46e5' : 'transparent',
                  color:      tab === t ? '#fff' : '#94a3b8',
                  boxShadow:  tab === t ? '0 2px 8px rgba(79,70,229,.3)' : 'none' }}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div style={{ fontSize:16, fontWeight:700, color:'#1e293b', marginBottom:2 }}>
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', marginBottom:12 }}>
            {tab === 'login' ? 'Sign in to start your AI assessment' : 'Register to begin your AI interview'}
          </div>

          {/* Status message */}
          {status && (
            <div className="se-slide-in" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:8, fontSize:12.5, marginBottom:11,
              background: status.type === 'err' ? '#fee2e2' : '#d1fae5',
              border: `1px solid ${status.type === 'err' ? '#fca5a5' : '#6ee7b7'}`,
              color:   status.type === 'err' ? '#dc2626' : '#065f46' }}>
              {status.type === 'err' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
              {status.msg}
            </div>
          )}

          <form ref={formRef} onSubmit={handleAuth} style={{ display:'flex', flexDirection:'column' }}>

            {/* Name — only for signup */}
            {tab === 'signup' && (
              <div className="se-slide-in">
                <label style={{ display:'block', fontSize:11.5, fontWeight:500, color:'#64748b', marginBottom:4 }}>Full Name</label>
                <div style={inputWrap}>
                  <span style={iconSt}><User size={14} /></span>
                  <input style={inputSt} type="text" placeholder="John Doe" value={name}
                    onChange={e => setName(e.target.value)} required autoComplete="name" />
                </div>
              </div>
            )}

            <label style={{ display:'block', fontSize:11.5, fontWeight:500, color:'#64748b', marginBottom:4 }}>Email Address</label>
            <div style={inputWrap}>
              <span style={iconSt}><Mail size={14} /></span>
              <input style={inputSt} type="email" placeholder="john@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <label style={{ display:'block', fontSize:11.5, fontWeight:500, color:'#64748b', marginBottom:4 }}>Password</label>
            <div style={inputWrap}>
              <span style={iconSt}><Lock size={14} /></span>
              <input style={inputSt} type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
            </div>

            <button type="submit" disabled={busy}
              style={{ width:'100%', padding:'10px', border:'none', borderRadius:9, background: busy ? '#818cf8' : '#4f46e5', color:'#fff', fontSize:13.5, fontWeight:600, cursor: busy ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:"'Inter',sans-serif", marginTop:2, transition:'background .2s', boxShadow:'0 4px 14px rgba(79,70,229,.35)' }}>
              {busy
                ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'se-spin .7s linear infinite', display:'inline-block' }} /> Authenticating…</>
                : <>{tab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={14} /></>
              }
            </button>
          </form>

          {/* Divider + Google */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0 16px' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <span style={{ fontSize:12, color:'#94a3b8' }}>or</span>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={busy}
            style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, background:'#fff', color:'#374151', fontSize:13.5, fontWeight:600, cursor: busy ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:"'Inter',sans-serif", transition:'border-color .2s' }}>
            <svg width="15" height="15" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </div>

      </div>
    </div>
  );
}
