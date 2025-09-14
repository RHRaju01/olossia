# Olossia - Enterprise Fashion E-commerce Platform

A scalable, enterprise-grade PERN (PostgreSQL, Express, React, Node.js) application for fashion e-commerce with JWT authentication and role-based access control.

## 🏗️ Architecture Overview

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Routing**: React Router v6 with protected routes
- **State Management**: Context API with useReducer for complex state
- **Styling**: TailwindCSS with custom design system
- **HTTP Client**: Axios with interceptors for token management
- **Data Fetching**: React Query for server state management

### Backend (Node.js + Express)
- **Framework**: Express.js with modular architecture
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Morgan for HTTP request logging

## 📁 Project Structure

```
├── server/                     # Backend application
│   ├── config/                 # Configuration files
│   │   ├── database.js         # Database connection & pool
│   │   └── auth.js            # JWT configuration
│   ├── controllers/           # Route controllers
│   │   ├── authController.js  # Authentication logic
│   │   └── productController.js # Product management
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication & authorization
│   │   ├── validation.js     # Input validation
│   │   └── security.js       # Security headers & rate limiting
│   ├── models/               # Data models
│   │   ├── User.js          # User model
│   │   └── Product.js       # Product model
│   ├── routes/              # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── products.js     # Product routes
│   │   └── index.js        # Route aggregation
│   ├── database/           # Database schema & migrations
│   │   └── schema.sql      # Complete database schema
│   └── server.js          # Application entry point
│
├── src/                      # Frontend application
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── AuthModal/      # Authentication modal
│   │   ├── CartDropdown/   # Shopping cart dropdown
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── PublicRoute.jsx    # Public route wrapper
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── CartContext.jsx # Shopping cart state
│   ├── hooks/              # Custom React hooks
│   │   └── useProducts.js  # Product data hooks
│   ├── layouts/            # Page layouts
│   │   └── MainLayout.jsx  # Main application layout
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Landing page
│   │   ├── LoginPage.jsx   # Login form
│   │   ├── RegisterPage.jsx # Registration form
│   │   └── AdminDashboard.jsx # Admin dashboard
│   ├── services/           # API services
│   │   └── api/           # API client & endpoints
│   │       ├── client.js   # Axios configuration
│   │       ├── authAPI.js  # Authentication API
│   │       ├── productAPI.js # Product API
│   │       └── cartAPI.js    # Cart API
│   ├── utils/              # Utility functions
│   │   └── tokenStorage.js # Token management
│   └── screens/            # Legacy screen components (to be refactored)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   npm install
   ```

2. **Database Setup**:
   ```bash
   # Create PostgreSQL database
   createdb olossia_db
   
   # Run the schema
   psql -d olossia_db -f database/schema.sql
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secrets
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

// Public routes (redirect if authenticated)
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with role-based access
- **roles**: System roles and permissions
- **products**: Product catalog with variants
- **categories**: Hierarchical product categories
- **brands**: Brand information and metadata
- **orders**: Order management with status tracking
- **cart_items**: Shopping cart persistence
- **wishlist_items**: User wishlists
- **reviews**: Product reviews and ratings
- **audit_logs**: System audit trail

### Key Features
- UUID primary keys for security
- JSONB columns for flexible metadata
- Full-text search capabilities
- Audit logging for compliance
- Optimized indexes for performance

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
```

### API Integration
- Centralized API client with interceptors
- Automatic token attachment
- Error handling and retry logic
- Request/response transformation

## 🔄 Development Workflow

### Code Organization
- **Feature-based structure** for scalability
- **Separation of concerns** between UI, logic, and data
- **Reusable components** with consistent props interface
- **Custom hooks** for business logic abstraction

### Best Practices
- TypeScript-ready architecture
- ESLint and Prettier configuration
- Git hooks for code quality
- Environment-based configuration
- Comprehensive error handling

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

This architecture provides a solid foundation for an enterprise-grade fashion e-commerce platform while maintaining the flexibility to evolve into a more complex system as business requirements grow.