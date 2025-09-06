# Olossia - Enterprise Fashion E-commerce Platform

A scalable, enterprise-grade fashion e-commerce platform built with React, Node.js, and flexible database support (Supabase/PostgreSQL) featuring JWT authentication and role-based access control.

## 🏗️ Architecture Overview

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Routing**: React Router v6 with protected routes
- **State Management**: Context API with useReducer for complex state
- **Styling**: TailwindCSS with custom design system
- **HTTP Client**: Axios with interceptors for token management
- **Data Fetching**: React Query for server state management
- **Performance**: Lazy loading, memoization, and code splitting

### Backend (Node.js + Express)
- **Framework**: Express.js with modular architecture
- **Database**: Flexible support for Supabase or PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Morgan for HTTP request logging

## 📁 Project Structure

```
├── server/                     # Backend application
│   ├── config/                 # Configuration files
│   │   ├── database.js         # Database abstraction layer
│   │   ├── supabase.js         # Supabase configuration
│   │   ├── postgresql.js       # PostgreSQL configuration
│   │   └── auth.js            # JWT configuration
│   ├── controllers/           # Route controllers
│   │   ├── authController.js  # Authentication logic
│   │   └── productController.js # Product management
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication & authorization
│   │   ├── validation.js     # Input validation
│   │   └── security.js       # Security headers & rate limiting
│   ├── models/               # Data models (database agnostic)
│   │   ├── User.js          # User model
│   │   └── Product.js       # Product model
│   ├── routes/              # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── products.js     # Product routes
│   │   └── index.js        # Route aggregation
│   └── server.js          # Application entry point
│
├── src/                      # Frontend application
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── common/         # Shared components
│   │   │   ├── SearchBar/  # Search functionality
│   │   │   ├── ProductCard/ # Product display
│   │   │   └── ProductActions/ # Product interaction buttons
│   │   ├── sections/       # Page sections (refactored from screens)
│   │   │   ├── HeroSection.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── FeaturedSection.jsx
│   │   │   ├── BrandsSection.jsx
│   │   │   ├── TrendingSection.jsx
│   │   │   ├── NewsletterSection.jsx
│   │   │   ├── FooterSection.jsx
│   │   │   └── HeaderSection.jsx
│   │   ├── AuthOverlay/    # Authentication modal
│   │   ├── CartDropdown/   # Shopping cart dropdown
│   │   ├── WishlistDropdown/ # Wishlist dropdown
│   │   ├── CompareDropdown/ # Product comparison dropdown
│   │   ├── NotificationDropdown/ # Notifications dropdown
│   │   ├── ProductDetailsOverlay/ # Quick view overlay
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.jsx # Authentication state
│   │   ├── CartContext.jsx # Shopping cart state
│   │   ├── WishlistContext.jsx # Wishlist state
│   │   └── CompareContext.jsx # Product comparison state
│   ├── hooks/              # Custom React hooks
│   │   └── useProducts.js  # Product data hooks
│   ├── layouts/            # Page layouts
│   │   └── MainLayout.jsx  # Main application layout
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Landing page
│   │   ├── ProductsPage.jsx # Product listing
│   │   ├── ProductDetailsPage.jsx # Product details
│   │   ├── CategoriesPage.jsx # Category browser
│   │   ├── BrandsPage.jsx  # Brand browser
│   │   ├── TrendingPage.jsx # Trending products
│   │   ├── WishlistPage.jsx # User wishlist
│   │   ├── CartPage.jsx    # Shopping cart
│   │   ├── CheckoutPage.jsx # Checkout process
│   │   ├── OrderSuccessPage.jsx # Order confirmation
│   │   ├── ComparePage.jsx # Product comparison
│   │   └── AdminDashboard.jsx # Admin dashboard
│   ├── services/           # API services
│   │   └── api/           # API client & endpoints
│   │       ├── client.js   # Axios configuration
│   │       ├── supabaseClient.js # Supabase client
│   │       ├── authAPI.js  # Authentication API
│   │       ├── productAPI.js # Product API
│   │       └── cartAPI.js    # Cart API
│   ├── utils/              # Utility functions
│   │   ├── tokenStorage.js # Token management
│   │   └── navigation.js   # Navigation utilities
│   └── lib/                # Library utilities
│       └── utils.js        # General utilities
│
├── supabase/               # Supabase configuration
│   └── migrations/         # Database migrations
│       └── 20250903023457_empty_harbor.sql
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+ (if using local database)
- Supabase account (if using Supabase)
- npm or yarn

### Database Configuration

**🔄 Switch Between Databases:**

Edit `server/.env` and change this single variable:

```env
# For Supabase (recommended)
DATABASE_TYPE=supabase

# For Local PostgreSQL
DATABASE_TYPE=postgresql
```

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**:

   **For Supabase:**
   - Set up your Supabase project
   - Add your Supabase URL and keys to `.env`
   - Database schema is automatically applied

   **For Local PostgreSQL:**
   ```bash
   # Create PostgreSQL database
   createdb olossia_db
   
   # Run the schema (convert from Supabase migration)
   psql -d olossia_db -f supabase/migrations/20250903023457_empty_harbor.sql
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Configure API URL and other settings
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, user management, analytics
- **Seller**: Product management, order viewing, inventory control
- **Customer**: Shopping, order history, profile management

### JWT Implementation
- Access tokens (7 days) for API authentication
- Refresh tokens (30 days) for seamless token renewal
- Automatic token refresh on API calls
- Secure token storage in localStorage

### Route Protection
```jsx
// Protect routes by role
<ProtectedRoute roles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>

// Protect routes for authenticated users
<ProtectedRoute>
  <UserProfile />
</ProtectedRoute>
```

## 🗄️ Database Flexibility

### Dual Database Support
The application supports both **Supabase** and **local PostgreSQL** with a single configuration change:

```env
# In server/.env
DATABASE_TYPE=supabase    # Use Supabase
# OR
DATABASE_TYPE=postgresql  # Use local PostgreSQL
```

### Database Models
- **User.js**: Handles user operations for both databases
- **Product.js**: Manages product data with database abstraction
- **Database.js**: Provides unified interface for both database types

### Migration Strategy
- Supabase migrations in `supabase/migrations/`
- PostgreSQL schema can be generated from Supabase migrations
- Consistent data models across both platforms

## 🛡️ Security Features

### Backend Security
- **Helmet**: Security headers
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Express-validator for data sanitization
- **CORS**: Configured for specific origins
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection Protection**: Parameterized queries

### Frontend Security
- **Token Management**: Secure storage and automatic refresh
- **Route Protection**: Role-based access control
- **Input Sanitization**: Client-side validation
- **HTTPS Enforcement**: Production security headers

## 📊 State Management

### Context Architecture
```jsx
// Authentication state
const { user, isAuthenticated, login, logout, hasRole } = useAuth();

// Shopping cart state
const { items, totals, addItem, removeItem, clearCart } = useCart();

// Wishlist state
const { items, addItem, removeItem, isInWishlist } = useWishlist();

// Product comparison state
const { items, addItem, removeItem, isInCompare } = useCompare();
```

### Performance Optimizations
- **React.memo**: Memoized components to prevent unnecessary re-renders
- **useCallback**: Memoized event handlers
- **useMemo**: Memoized computed values
- **Lazy Loading**: Code splitting for pages
- **Image Optimization**: Lazy loading and responsive images

## 🔄 Development Workflow

### Code Organization
- **Component-based architecture** for reusability
- **Separation of concerns** between UI, logic, and data
- **Custom hooks** for business logic abstraction
- **Consistent naming conventions** and file structure

### Best Practices
- TypeScript-ready architecture
- ESLint and Prettier configuration
- Environment-based configuration
- Comprehensive error handling
- Performance monitoring ready

## 🚀 Deployment Considerations

### Production Readiness
- Environment variable management
- Database connection pooling
- Error logging and monitoring
- Performance optimization
- Security hardening

### Scalability Features
- Modular backend architecture
- Stateless authentication
- Database indexing strategy
- Caching layer ready
- Microservices migration path

## 🔮 Future Enhancements

### Technical Roadmap
- **GraphQL API**: Replace REST for better performance
- **Microservices**: Split into domain-specific services
- **Redis Caching**: Session and data caching
- **WebSocket**: Real-time features (live shopping, notifications)
- **CDN Integration**: Asset optimization and delivery
- **Search Engine**: Elasticsearch for advanced product search
- **Payment Integration**: Stripe, PayPal, and other gateways
- **Analytics**: User behavior tracking and business intelligence

### Business Features
- Multi-vendor marketplace
- Subscription services
- Loyalty programs
- AI-powered recommendations
- Social commerce features
- Mobile app (React Native)

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register    # User registration
POST /api/v1/auth/login       # User login
GET  /api/v1/auth/profile     # Get user profile
POST /api/v1/auth/logout      # User logout
POST /api/v1/auth/refresh     # Refresh access token
```

### Product Endpoints
```
GET    /api/v1/products           # Get products with filters
GET    /api/v1/products/:id       # Get single product
GET    /api/v1/products/featured  # Get featured products
POST   /api/v1/products           # Create product (admin/seller)
PUT    /api/v1/products/:id       # Update product (admin/seller)
DELETE /api/v1/products/:id       # Delete product (admin)
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Olossia
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (server/.env):**
```env
# Database Configuration
DATABASE_TYPE=supabase  # or 'postgresql'

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL Configuration (when DATABASE_TYPE=postgresql)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=olossia_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## 🎯 Key Features

### User Experience
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Progressive Web App**: Fast loading and offline capabilities
- **Accessibility**: WCAG 2.1 compliant
- **Performance**: Optimized for Core Web Vitals

### Shopping Features
- **Product Catalog**: Advanced filtering and search
- **Wishlist**: Save items for later
- **Product Comparison**: Side-by-side feature comparison
- **Shopping Cart**: Persistent cart with quantity management
- **Quick View**: Product preview without page navigation
- **Live Shopping**: Real-time shopping events

### Admin Features
- **Dashboard**: Comprehensive analytics and management
- **Product Management**: CRUD operations for products
- **User Management**: Role-based user administration
- **Order Management**: Order tracking and fulfillment

This architecture provides a solid foundation for an enterprise-grade fashion e-commerce platform with the flexibility to scale and adapt to changing business requirements.