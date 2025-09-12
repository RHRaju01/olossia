import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from './components/ui/button';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CompareProvider } from './contexts/CompareContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages for better performance
const HomePage = lazy(() =>
  import('./pages/HomePage').then(module => ({ default: module.HomePage }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard }))
);
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then(module => ({ default: module.ProductsPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then(module => ({ default: module.CategoriesPage }))
);
const TrendingPage = lazy(() =>
  import('./pages/TrendingPage').then(module => ({ default: module.TrendingPage }))
);
const BrandsPage = lazy(() =>
  import('./pages/BrandsPage').then(module => ({ default: module.BrandsPage }))
);
const ProductDetailsPage = lazy(() =>
  import('./pages/ProductDetailsPage').then(module => ({ default: module.ProductDetailsPage }))
);
const WishlistPage = lazy(() =>
  import('./pages/WishlistPage').then(module => ({ default: module.WishlistPage }))
);
const CartPage = lazy(() =>
  import('./pages/CartPage').then(module => ({ default: module.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage }))
);
const OrderSuccessPage = lazy(() =>
  import('./pages/OrderSuccessPage').then(module => ({ default: module.OrderSuccessPage }))
);
const ComparePage = lazy(() =>
  import('./pages/ComparePage').then(module => ({ default: module.ComparePage }))
);
const UserProfilePage = lazy(() =>
  import('./pages/UserProfilePage').then(module => ({ default: module.UserProfilePage }))
);

// Loading component
const PageLoader = () => (
  <div className='flex min-h-screen items-center justify-center bg-gray-50'>
    <div className='text-center'>
      <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600'></div>
      <p className='font-medium text-gray-600'>Loading...</p>
    </div>
  </div>
);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CompareProvider>
            <CartProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Main application routes */}
                    <Route path='/' element={<MainLayout />}>
                      <Route index element={<HomePage />} />

                      {/* Auth routes - handled by overlay */}
                      <Route path='/login' element={<HomePage />} />
                      <Route path='/register' element={<HomePage />} />

                      {/* Product routes */}
                      <Route path='/products' element={<ProductsPage />} />
                      <Route path='/categories' element={<CategoriesPage />} />
                      <Route path='/brands' element={<BrandsPage />} />
                      <Route path='/trending' element={<TrendingPage />} />
                      <Route path='/product/:id' element={<ProductDetailsPage />} />

                      {/* Wishlist route */}
                      <Route path='/wishlist' element={<WishlistPage />} />

                      {/* Compare route */}
                      <Route path='/compare' element={<ComparePage />} />

                      {/* Cart route */}
                      <Route path='/cart' element={<CartPage />} />

                      {/* Checkout routes */}
                      <Route path='/checkout' element={<CheckoutPage />} />
                      <Route path='/order-success' element={<OrderSuccessPage />} />

                      {/* Protected admin routes */}
                      <Route
                        path='/admin/*'
                        element={
                          <ProtectedRoute roles={['admin']}>
                            <Routes>
                              <Route path='/dashboard' element={<AdminDashboard />} />
                              <Route path='*' element={<AdminDashboard />} />
                            </Routes>
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected seller routes */}
                      <Route
                        path='/seller/*'
                        element={
                          <ProtectedRoute roles={['admin', 'seller']}>
                            <div className='flex min-h-screen items-center justify-center'>
                              <h1 className='text-2xl font-bold'>Seller Dashboard Coming Soon</h1>
                            </div>
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected customer routes */}
                      <Route
                        path='/profile'
                        element={
                          <ProtectedRoute>
                            <UserProfilePage />
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    {/* 404 route */}
                    <Route
                      path='*'
                      element={
                        <div className='flex min-h-screen items-center justify-center'>
                          <div className='text-center'>
                            <h1 className='mb-4 text-4xl font-bold text-gray-900'>404</h1>
                            <p className='mb-6 text-gray-600'>Page not found</p>
                            <Button onClick={() => window.history.back()}>Go Back</Button>
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </Suspense>
              </Router>
            </CartProvider>
          </CompareProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
