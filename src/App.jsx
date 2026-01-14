import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AITools from './pages/AITools';

import Admin from './pages/Admin';

import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import MissionPage from './pages/MissionPage';

import News from './pages/News';
import NewsDetails from './pages/NewsDetails';
import WorkshopPopup from './components/popups/WorkshopPopup';
import LoginGateway from './pages/LoginGateway';

function App() {
  return (
    <Router>
      <WorkshopPopup />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetails />} />
          <Route path="/mission" element={<MissionPage />} />
          {/* New Intermediate Login Gateway */}
          <Route path="/login" element={<LoginGateway />} />
        </Route>
        <Route path="/Rasel7070AdminDeedox/*" element={<Admin />} />
        {/* Security: Redirect old /admin to Home or 404 */}
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/signup" element={<StudentLogin />} /> {/* Fallback to Login component for signup link */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
