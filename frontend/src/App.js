import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import NaturalFlavors from './pages/NaturalFlavors';
import OurMission from './pages/OurMission';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentManager from './pages/admin/ContentManager';
import FlavorsManager from './pages/admin/FlavorsManager';
import SubmissionsManager from './pages/admin/SubmissionsManager';

import './App.css';

// Layout for public pages
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/flavors" element={<PublicLayout><NaturalFlavors /></PublicLayout>} />
          <Route path="/mission" element={<PublicLayout><OurMission /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/content" element={
            <ProtectedRoute><ContentManager /></ProtectedRoute>
          } />
          <Route path="/admin/flavors" element={
            <ProtectedRoute><FlavorsManager /></ProtectedRoute>
          } />
          <Route path="/admin/submissions" element={
            <ProtectedRoute><SubmissionsManager /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
