import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentEntry from './pages/StudentEntry';
import StudentAssessment from './pages/StudentAssessment';
import AdminDashboard from './pages/AdminDashboard';

import TerminatedStudent from './pages/TerminatedStudent';
import AssessmentCompleted from './pages/AssessmentCompleted';
import AdminLogin from './pages/AdminLogin';
import QuestionBank from './pages/QuestionBank';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentEntry />} />
        <Route path="/assessment" element={<StudentAssessment />} />
        <Route path="/completed" element={<AssessmentCompleted />} />
        <Route path="/terminated" element={<TerminatedStudent />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/question-bank" element={<QuestionBank />} />
      </Routes>
    </Router>
  );
};

export default App;
