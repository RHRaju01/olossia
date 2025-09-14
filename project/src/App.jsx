import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Button } from './components/ui/button';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Main application routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  
                  {/* Auth routes - handled by overlay */}
                  <Route path="/login" element={<HomePage />} />
                  <Route path="/register" element={<HomePage />} />
                  
                  {/* Protected admin routes */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute roles={['admin']}>
                      <Routes>
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route path="*" element={<AdminDashboard />} />
                      </Routes>
                    </ProtectedRoute>
                  } />

                  {/* Protected seller routes */}
                  <Route path="/seller/*" element={
                    <ProtectedRoute roles={['admin', 'seller']}>
                      <div className="min-h-screen flex items-center justify-center">
                        <h1 className="text-2xl font-bold">Seller Dashboard Coming Soon</h1>
                      </div>
                    </ProtectedRoute>
                  } />

                  {/* Protected customer routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <div className="min-h-screen flex items-center justify-center">
                        <h1 className="text-2xl font-bold">User Profile Coming Soon</h1>
                      </div>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* 404 route */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-6">Page not found</p>
                      <Button onClick={() => window.history.back()}>
                        Go Back
                      </Button>
                    </div>
                  </div>
                } />
              </Routes>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;