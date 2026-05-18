import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import StudentEntry from './pages/StudentEntry';
import CompanySelect from './pages/CompanySelect';
import JobSelect from './pages/JobSelect';
import ResumeUpload from './pages/ResumeUpload';
import StudentAssessment from './pages/StudentAssessment';
import AssessmentCompleted from './pages/AssessmentCompleted';
import TerminatedStudent from './pages/TerminatedStudent';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import QuestionBank from './pages/QuestionBank';

const App = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Restrict to laptops/desktops only (typically 1024px and up)
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div style={{ height:'100vh', width:'100vw', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', fontFamily:"'Inter',sans-serif", boxSizing:'border-box' }}>
        <div style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'2.5rem 1.5rem', textAlign:'center', maxWidth:360, width:'100%', boxShadow:'0 10px 40px rgba(0,0,0,.3)' }}>
          <AlertCircle size={56} color="#ef4444" style={{ margin:'0 auto 1.5rem', display:'block' }} />
          <h2 style={{ color:'#f8fafc', fontWeight:800, fontSize:'1.3rem', marginBottom:'.75rem', marginTop:0 }}>Device Not Supported</h2>
          <p style={{ color:'#94a3b8', fontSize:'.95rem', lineHeight:1.6, margin:0 }}>
            Our platform is optimized for desktop and laptop environments. Please switch to a larger device to continue your session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Student flow */}
        <Route path="/" element={<StudentEntry />} />
        <Route path="/select-company" element={<CompanySelect />} />
        <Route path="/select-job" element={<JobSelect />} />
        <Route path="/upload-resume" element={<ResumeUpload />} />
        <Route path="/assessment" element={<StudentAssessment />} />
        <Route path="/completed" element={<AssessmentCompleted />} />
        <Route path="/terminated" element={<TerminatedStudent />} />
        {/* Admin */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/question-bank" element={<QuestionBank />} />
      </Routes>
    </Router>
  );
};

export default App;
