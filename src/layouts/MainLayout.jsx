import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HeaderSection } from '../components/sections/HeaderSection';
import { FooterSection } from '../components/sections/FooterSection';
import { AuthOverlay } from '../components/AuthOverlay/AuthOverlay';
import { useAuth } from '../contexts/AuthContext';

// Memoized header component
const MemoizedHeader = React.memo(({ onAuthModalOpen }) => (
  <HeaderSection onAuthModalOpen={onAuthModalOpen} />
));

MemoizedHeader.displayName = 'MemoizedHeader';

// Memoized footer component
const MemoizedFooter = React.memo(() => (
  <FooterSection />
));

MemoizedFooter.displayName = 'MemoizedFooter';

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

  const handleAuthOverlayClose = useCallback(() => {
    setIsAuthOverlayOpen(false);
    if (isAuthPath) {
      navigate('/', { replace: true });
    }
  }, [isAuthPath, navigate]);

  const handleAuthOverlayOpen = useCallback(() => {
    setIsAuthOverlayOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <MemoizedHeader onAuthModalOpen={handleAuthOverlayOpen} />
      <main>
        <Outlet />
      </main>
      <MemoizedFooter />
      <AuthOverlay 
        isOpen={isAuthOverlayOpen} 
        onClose={handleAuthOverlayClose} 
      />
    </div>
  );
};