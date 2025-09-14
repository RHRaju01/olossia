import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// Navigation state storage
const navigationState = {
  scrollPositions: new Map(),
  currentPath: '/'
};

// Custom hook for navigation with scroll management
export const useNavigateWithScroll = () => {
  const navigate = useNavigate();
  
  return useCallback((path, options = {}) => {
    // Save current scroll position
    navigationState.scrollPositions.set(navigationState.currentPath, window.scrollY);
    navigationState.currentPath = path;
    
    // Navigate and scroll to top
    navigate(path, options);
    setTimeout(() => window.scrollTo(0, 0), 0);
  }, [navigate]);
};

// Utility function for scroll to top navigation
export const navigateWithScroll = (navigate, path, options = {}) => {
  // Save current scroll position
  navigationState.scrollPositions.set(window.location.pathname, window.scrollY);
  
  // Navigate and scroll to top
  navigate(path, options);
  setTimeout(() => window.scrollTo(0, 0), 0);
};

// Hook to restore scroll position
export const useScrollRestoration = () => {
  return useCallback(() => {
    const savedPosition = navigationState.scrollPositions.get(window.location.pathname);
    if (savedPosition) {
      setTimeout(() => window.scrollTo(0, savedPosition), 100);
    }
  }, []);
};