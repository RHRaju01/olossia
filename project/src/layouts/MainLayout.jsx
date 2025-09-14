import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HeaderSection } from '../screens/LandingPage/sections/HeaderSection/HeaderSection';
import { FooterSection } from '../screens/LandingPage/sections/FooterSection/FooterSection';
import { AuthOverlay } from '../components/AuthOverlay/AuthOverlay';
import { useAuth } from '../contexts/AuthContext';

export const MainLayout = () => {
  const [isAuthOverlayOpen, setIsAuthOverlayOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Check if current path is auth-related
  const isAuthPath = location.pathname === '/login' || location.pathname === '/register';

  // Open overlay when navigating to auth paths
  useEffect(() => {
    if (isAuthPath && !isAuthenticated) {
      setIsAuthOverlayOpen(true);
    }
  }, [isAuthPath, isAuthenticated]);

  // Close overlay and navigate to home when authenticated
  useEffect(() => {
    if (isAuthenticated && isAuthOverlayOpen) {
      setIsAuthOverlayOpen(false);
      if (isAuthPath) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAuthOverlayOpen, isAuthPath, navigate]);

  const handleAuthOverlayClose = () => {
    setIsAuthOverlayOpen(false);
    if (isAuthPath) {
      navigate('/', { replace: true });
    }
  };

  const handleAuthOverlayOpen = () => {
    setIsAuthOverlayOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <HeaderSection onAuthModalOpen={handleAuthOverlayOpen} />
      <main>
        <Outlet />
      </main>
      <FooterSection />
      <AuthOverlay 
        isOpen={isAuthOverlayOpen} 
        onClose={handleAuthOverlayClose} 
      />
    </div>
  );
};