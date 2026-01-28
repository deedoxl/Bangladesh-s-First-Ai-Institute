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
import OurPrograms from './components/sections/OurPrograms';
import Testimonials from './components/sections/Testimonials';
import UnderConstruction from './pages/UnderConstruction';
import LoginGateway from './pages/LoginGateway';
import PrivacyPolicy from './pages/PrivacyPolicy';

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

          {/* Core Platform & Programs */}
          <Route path="/programs" element={<OurPrograms />} />
          <Route path="/programs/*" element={<UnderConstruction />} />
          <Route path="/register" element={<Navigate to="/student/signup" replace />} />

          {/* Institute Pages */}
          <Route path="/testimonials" element={<Testimonials />} />

          {/* Blog */}
          <Route path="/blog" element={<Navigate to="/news" replace />} />

          {/* Regions */}
          <Route path="/regions/*" element={<UnderConstruction />} />

          {/* Support & Legal */}
          <Route path="/support" element={<UnderConstruction />} />
          <Route path="/faq" element={<UnderConstruction />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<UnderConstruction />} />
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
