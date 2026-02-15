import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Collections from './pages/Collections';
import { supabase } from './lib/supabase';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

function App() {
  const [session, setSession] = useState(null);
  const [isOwner, setIsOwner] = useState(localStorage.getItem('gnvi_owner_session') === 'active');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasAccess = session || isOwner;

  return (
    <Router>
      <CartProvider>
        <Toaster position="top-right" />
        <CartDrawer />
        <Routes>
          {/* Customer Side */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/collections" element={<Collections />} />

          {/* Admin Side */}
          <Route
            path="/login"
            element={hasAccess ? <Navigate to="/admin" /> : <Login />}
          />
          <Route
            path="/admin/*"
            element={hasAccess ? <AdminDashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
