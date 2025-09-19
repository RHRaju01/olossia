/*
  # Create Custom Enum Types
  
  1. Enum Types
     - `order_status` - For tracking order lifecycle
     - `payment_status` - For payment processing states
     - `product_status` - For product availability states  
     - `user_status` - For user account states
  
  2. Purpose
     - Ensures data consistency with predefined values
     - Improves query performance
     - Provides clear business logic constraints
*/

-- Create custom enum types
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed', 
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded'
);

CREATE TYPE product_status AS ENUM (
  'draft',
  'active',
  'inactive',
  'discontinued',
  'out_of_stock'
);

CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'pending_verification'
);




/*
  # Create Core Tables - Users, Roles, and Categories
  
  1. New Tables
     - `roles` - User permission management
     - `users` - Customer and admin accounts
     - `categories` - Product categorization with hierarchy
     - `brands` - Product brand management
  
  2. Features
     - UUID primary keys for better security and scalability
     - Proper foreign key relationships
     - Default timestamps and status values
     - Self-referencing categories for hierarchy
     - Email uniqueness constraints
  
  3. Security
     - Enable RLS on all tables
     - Add policies for user data access
*/

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL UNIQUE,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table  
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  password_hash varchar(255),
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  phone varchar(20),
  date_of_birth date,
  role_id uuid REFERENCES roles(id),
  status user_status DEFAULT 'pending_verification',
  email_verified boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table (with hierarchy support)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  slug varchar(100) NOT NULL UNIQUE,
  description text,
  logo_url text,
  website_url text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for public readable tables
CREATE POLICY "Categories are publicly readable"
  ON categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Brands are publicly readable"
  ON brands
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Roles are readable by authenticated users"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- Authentication: Refresh tokens table
-- Created: 2025-09-20
-- Purpose: store refresh token hashes for rotation/revocation
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL, -- store HMAC-SHA256(token, PEPPER)
  ip_address inet,
  user_agent text,
  is_revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  expires_at timestamptz NOT NULL,
  UNIQUE(user_id, token_hash)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);


/*
  # Create Product Management Tables
  
  1. New Tables
     - `products` - Main product catalog
     - `product_variants` - Product variations (size, color, etc.)
     - `reviews` - Customer product reviews
     - `wishlist_items` - User wishlist functionality
  
  2. Features
     - Comprehensive product attributes (pricing, inventory, SEO)
     - Product variants for different options
     - Review system with verification and approval
     - Array support for tags and image collections
     - JSON storage for flexible attributes
  
  3. Constraints
     - Rating constraints (1-5 stars)
     - Price validation (non-negative)
     - Stock quantity tracking
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  slug varchar(200) NOT NULL UNIQUE,
  description text,
  short_description text,
  sku varchar(100) UNIQUE,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_price numeric(10,2) CHECK (compare_price >= 0),
  cost_price numeric(10,2) CHECK (cost_price >= 0),
  brand_id uuid REFERENCES brands(id),
  category_id uuid REFERENCES categories(id),
  seller_id uuid REFERENCES users(id),
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  weight numeric(10,3) CHECK (weight >= 0),
  dimensions jsonb DEFAULT '{}',
  images jsonb DEFAULT '[]',
  specifications jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_digital boolean DEFAULT false,
  status product_status DEFAULT 'draft',
  seo_title varchar(200),
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  sku varchar(100) UNIQUE,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  attributes jsonb DEFAULT '{}',
  images jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid, -- Will reference orders table
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title varchar(200),
  comment text,
  images jsonb DEFAULT '[]',
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  helpful_count integer DEFAULT 0 CHECK (helpful_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Products are publicly readable"
  ON products
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Product variants are publicly readable"
  ON product_variants
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Approved reviews are publicly readable"
  ON reviews
  FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can read own reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own wishlist"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);




/*
  # Create Order Management Tables
  
  1. New Tables
     - `orders` - Main order records with pricing and addresses
     - `order_items` - Individual products in each order
     - `payments` - Payment processing and transaction history
     - `cart_items` - Shopping cart functionality
     - `user_addresses` - Customer address management
  
  2. Features
     - Complete order lifecycle tracking
     - Detailed pricing breakdown (subtotal, tax, shipping, discounts)
     - Payment gateway integration support
     - Shopping cart persistence
     - Multiple address management per user
     - Product snapshot preservation in order items
  
  3. Financial Data
     - Precise decimal handling for monetary values
     - Currency support for international orders
     - Payment status tracking with gateway responses
*/

-- User addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(20) NOT NULL DEFAULT 'shipping',
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  company varchar(100),
  address_line_1 varchar(255) NOT NULL,
  address_line_2 varchar(255),
  city varchar(100) NOT NULL,
  state varchar(100) NOT NULL,
  postal_code varchar(20) NOT NULL,
  country varchar(100) NOT NULL,
  phone varchar(20),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number varchar(50) NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id),
  status order_status DEFAULT 'pending',
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount numeric(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_amount numeric(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
  discount_amount numeric(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  currency varchar(3) DEFAULT 'USD',
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  product_snapshot jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method varchar(50) NOT NULL,
  payment_intent_id varchar(255),
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  currency varchar(3) DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  gateway_response jsonb DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own addresses"
  ON user_addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own cart"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Add foreign key constraint for reviews.order_id now that orders table exists
ALTER TABLE reviews 
ADD CONSTRAINT fk_reviews_order_id 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;




/*
  # Create Audit Logging Table
  
  1. New Table
     - `audit_logs` - Comprehensive audit trail for all database changes
  
  2. Features
     - Track all CRUD operations across any table
     - Store old and new values for complete change history
     - Capture user context (user_id, IP address, user agent)
     - Flexible JSON storage for different data structures
     - Timestamped entries for chronological tracking
  
  3. Security
     - Read-only access for regular users
     - Admin-level access for audit review
     - Secure storage of sensitive change data
*/

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name varchar(100) NOT NULL,
  record_id uuid NOT NULL,
  action varchar(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES users(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (restrictive - only for admin access)
CREATE POLICY "Admin users can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);




/*
  # Create Performance Indexes
  
  1. Purpose
     - Optimize query performance for common operations
     - Speed up foreign key lookups
     - Improve search and filtering capabilities
     - Enhance user experience with faster load times
  
  2. Index Categories
     - Foreign key indexes for joins
     - Search indexes for product discovery
     - Status and filtering indexes
     - Unique constraint indexes
     - Timestamp indexes for ordering
*/

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Brands table indexes
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_is_featured ON brands(is_featured);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Product variants table indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON payments(payment_intent_id);

-- Cart items table indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- User addresses table indexes
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(is_default);

-- Wishlist items table indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);




/*
  # Insert Default System Data
  
  1. Default Data
     - System roles (admin, customer, seller)
     - Sample categories for basic structure
     - Default admin user (for system setup)
  
  2. Purpose
     - Bootstrap the system with essential data
     - Provide working examples for development
     - Ensure proper role-based access control
  
  Note: Change default passwords before production use!
*/

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'System administrator with full access', '{"*": ["create", "read", "update", "delete"]}'),
('customer', 'Regular customer account', '{"orders": ["create", "read"], "reviews": ["create", "read", "update"], "cart": ["*"], "wishlist": ["*"]}'),
('seller', 'Product seller account', '{"products": ["create", "read", "update"], "orders": ["read"], "reviews": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets', 1),
('Clothing', 'clothing', 'Fashion and apparel', 2),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies', 3),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 4),
('Books', 'books', 'Books and educational materials', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample subcategories
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Smartphones', 'smartphones', 'Mobile phones and accessories', 
  (SELECT id FROM categories WHERE slug = 'electronics'), 1),
('Laptops', 'laptops', 'Portable computers and accessories',
  (SELECT id FROM categories WHERE slug = 'electronics'), 2),
('Men''s Clothing', 'mens-clothing', 'Clothing for men',
  (SELECT id FROM categories WHERE slug = 'clothing'), 1),
('Women''s Clothing', 'womens-clothing', 'Clothing for women',
  (SELECT id FROM categories WHERE slug = 'clothing'), 2)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample brands
INSERT INTO brands (name, slug, description, is_featured) VALUES
('TechCorp', 'techcorp', 'Leading technology brand', true),
('FashionStyle', 'fashionstyle', 'Modern fashion brand', false),
('HomeComfort', 'homecomfort', 'Quality home products', false)
ON CONFLICT (slug) DO NOTHING;

-- Note: In a real application, you would create the admin user through your authentication system
-- This is just for reference - do not use in production with a real password hash
/*
INSERT INTO users (email, first_name, last_name, role_id, status, email_verified) VALUES
('admin@example.com', 'System', 'Administrator', 
  (SELECT id FROM roles WHERE name = 'admin'), 'active', true)
ON CONFLICT (email) DO NOTHING;
*/



/*
  # Create Enterprise-Level Enum Types
  
  1. Additional Enum Types
     - `discount_type` - For coupon and promotion types
     - `shipping_method` - For delivery options
     - `inventory_status` - For stock management
     - `notification_type` - For system notifications
     - `subscription_status` - For recurring services
     - `refund_reason` - For return management
     - `tax_type` - For tax calculations
  
  2. Purpose
     - Support advanced e-commerce features
     - Enable complex business logic
     - Provide standardized status values
*/

-- Discount and promotion types
CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed_amount',
  'buy_x_get_y',
  'free_shipping',
  'bulk_discount'
);

-- Shipping methods
CREATE TYPE shipping_method AS ENUM (
  'standard',
  'express',
  'overnight',
  'same_day',
  'pickup',
  'digital'
);

-- Inventory management
CREATE TYPE inventory_status AS ENUM (
  'in_stock',
  'low_stock',
  'out_of_stock',
  'backordered',
  'discontinued',
  'pre_order'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'order_confirmation',
  'shipping_update',
  'delivery_confirmation',
  'price_drop',
  'back_in_stock',
  'promotion',
  'review_request',
  'account_update'
);

-- Subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',
  'paused',
  'cancelled',
  'expired',
  'trial'
);

-- Refund reasons
CREATE TYPE refund_reason AS ENUM (
  'defective_product',
  'wrong_item',
  'not_as_described',
  'damaged_shipping',
  'changed_mind',
  'duplicate_order',
  'other'
);

-- Tax types
CREATE TYPE tax_type AS ENUM (
  'sales_tax',
  'vat',
  'gst',
  'import_duty',
  'service_tax'
);

-- Currency types (for multi-currency support)
CREATE TYPE currency_code AS ENUM (
  'BDT', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'
);





/*
  # Create Marketing and Promotion Tables
  
  1. New Tables
     - `coupons` - Discount codes and promotions
     - `promotions` - Marketing campaigns and sales
     - `email_campaigns` - Email marketing management
     - `customer_segments` - Customer categorization
     - `loyalty_programs` - Customer loyalty and rewards
     - `referrals` - Referral program management
  
  2. Features
     - Advanced discount and promotion system
     - Customer segmentation for targeted marketing
     - Email campaign tracking
     - Loyalty points and rewards
     - Referral tracking and rewards
*/

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  description text,
  discount_type discount_type NOT NULL,
  discount_value numeric(10,2) NOT NULL CHECK (discount_value >= 0),
  minimum_order_amount numeric(10,2) DEFAULT 0,
  maximum_discount_amount numeric(10,2),
  usage_limit integer,
  usage_count integer DEFAULT 0,
  usage_limit_per_customer integer DEFAULT 1,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  applicable_categories uuid[],
  applicable_products uuid[],
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (valid_from < valid_until),
  CHECK (usage_count <= usage_limit OR usage_limit IS NULL)
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  description text,
  promotion_type varchar(50) NOT NULL,
  discount_type discount_type,
  discount_value numeric(10,2),
  conditions jsonb DEFAULT '{}',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  applicable_categories uuid[],
  applicable_products uuid[],
  target_segments uuid[],
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (start_date < end_date)
);

-- Customer segments table
CREATE TABLE IF NOT EXISTS customer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  description text,
  criteria jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  subject varchar(255) NOT NULL,
  content text NOT NULL,
  template_id uuid,
  target_segments uuid[],
  scheduled_at timestamptz,
  sent_at timestamptz,
  status varchar(20) DEFAULT 'draft',
  total_recipients integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  unsubscribed_count integer DEFAULT 0,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loyalty programs table
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  description text,
  points_per_dollar numeric(5,2) DEFAULT 1.00,
  points_redemption_value numeric(5,4) DEFAULT 0.01,
  minimum_points_redemption integer DEFAULT 100,
  tier_thresholds jsonb DEFAULT '{}',
  benefits jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer loyalty points table
CREATE TABLE IF NOT EXISTS customer_loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES loyalty_programs(id),
  points_balance integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  current_tier varchar(50),
  tier_progress jsonb DEFAULT '{}',
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id),
  referee_id uuid REFERENCES users(id),
  referral_code varchar(50) NOT NULL UNIQUE,
  email varchar(255),
  status varchar(20) DEFAULT 'pending',
  reward_amount numeric(10,2),
  reward_given boolean DEFAULT false,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Coupons are publicly readable when active"
  ON coupons FOR SELECT TO public
  USING (is_active = true AND valid_from <= now() AND valid_until >= now());

CREATE POLICY "Promotions are publicly readable when active"
  ON promotions FOR SELECT TO public
  USING (is_active = true AND start_date <= now() AND end_date >= now());

CREATE POLICY "Loyalty programs are publicly readable when active"
  ON loyalty_programs FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Users can read own loyalty points"
  ON customer_loyalty_points FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own referrals"
  ON referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);




/*
  # Create Advanced Inventory Management Tables
  
  1. New Tables
     - `warehouses` - Multi-warehouse inventory management
     - `inventory_locations` - Stock locations within warehouses
     - `inventory_movements` - Stock movement tracking
     - `suppliers` - Vendor and supplier management
     - `purchase_orders` - Procurement management
     - `stock_alerts` - Automated inventory alerts
  
  2. Features
     - Multi-location inventory tracking
     - Automated reorder points and alerts
     - Supplier relationship management
     - Purchase order workflow
     - Real-time stock movement tracking
*/

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  code varchar(20) NOT NULL UNIQUE,
  address jsonb NOT NULL,
  manager_id uuid REFERENCES users(id),
  is_active boolean DEFAULT true,
  capacity_info jsonb DEFAULT '{}',
  operating_hours jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory locations within warehouses
CREATE TABLE IF NOT EXISTS inventory_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  location_code varchar(50) NOT NULL,
  location_type varchar(20) DEFAULT 'shelf',
  aisle varchar(10),
  shelf varchar(10),
  bin varchar(10),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(warehouse_id, location_code)
);

-- Product inventory by location
CREATE TABLE IF NOT EXISTS product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  location_id uuid REFERENCES inventory_locations(id),
  quantity_available integer DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved integer DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_damaged integer DEFAULT 0 CHECK (quantity_damaged >= 0),
  reorder_point integer DEFAULT 0,
  max_stock_level integer,
  last_counted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, variant_id, warehouse_id, location_id)
);

-- Inventory movements tracking
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  location_id uuid REFERENCES inventory_locations(id),
  movement_type varchar(20) NOT NULL,
  quantity_change integer NOT NULL,
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  reference_type varchar(50),
  reference_id uuid,
  reason varchar(100),
  notes text,
  performed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  code varchar(50) UNIQUE,
  contact_person varchar(100),
  email varchar(255),
  phone varchar(20),
  address jsonb,
  payment_terms varchar(100),
  lead_time_days integer DEFAULT 0,
  minimum_order_amount numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  rating numeric(3,2) CHECK (rating >= 0 AND rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number varchar(50) NOT NULL UNIQUE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  status varchar(20) DEFAULT 'draft',
  order_date timestamptz DEFAULT now(),
  expected_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  subtotal numeric(12,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  shipping_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  currency varchar(3) DEFAULT 'USD',
  notes text,
  created_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity_ordered integer NOT NULL CHECK (quantity_ordered > 0),
  quantity_received integer DEFAULT 0 CHECK (quantity_received >= 0),
  unit_cost numeric(10,2) NOT NULL CHECK (unit_cost >= 0),
  total_cost numeric(12,2) NOT NULL CHECK (total_cost >= 0),
  created_at timestamptz DEFAULT now()
);

-- Stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  alert_type varchar(20) NOT NULL,
  threshold_value integer NOT NULL,
  current_value integer NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin/Manager access for inventory management)
CREATE POLICY "Inventory data readable by staff"
  ON warehouses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name IN ('admin', 'manager', 'inventory_staff')
    )
  );

-- Similar policies for other inventory tables...
CREATE POLICY "Product inventory readable by staff"
  ON product_inventory FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name IN ('admin', 'manager', 'inventory_staff')
    )
  );





/*
  # Create Analytics and Reporting Tables
  
  1. New Tables
     - `page_views` - Website traffic tracking
     - `product_views` - Product page analytics
     - `search_queries` - Search behavior analysis
     - `abandoned_carts` - Cart abandonment tracking
     - `customer_analytics` - Customer behavior metrics
     - `sales_analytics` - Sales performance data
  
  2. Features
     - Comprehensive user behavior tracking
     - Product performance analytics
     - Search and conversion optimization
     - Customer lifetime value tracking
     - Sales reporting and insights
*/

-- Page views tracking
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar(100),
  user_id uuid REFERENCES users(id),
  page_url text NOT NULL,
  page_title varchar(255),
  referrer_url text,
  user_agent text,
  ip_address inet,
  country varchar(2),
  device_type varchar(20),
  browser varchar(50),
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Product views tracking
CREATE TABLE IF NOT EXISTS product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  user_id uuid REFERENCES users(id),
  session_id varchar(100),
  view_duration_seconds integer,
  came_from varchar(100),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Search queries tracking
CREATE TABLE IF NOT EXISTS search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  user_id uuid REFERENCES users(id),
  session_id varchar(100),
  results_count integer DEFAULT 0,
  clicked_product_id uuid REFERENCES products(id),
  clicked_position integer,
  filters_applied jsonb DEFAULT '{}',
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Abandoned carts tracking
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  session_id varchar(100),
  cart_value numeric(10,2),
  items_count integer,
  cart_data jsonb,
  abandonment_stage varchar(50),
  recovery_email_sent boolean DEFAULT false,
  recovered_at timestamptz,
  recovery_order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now()
);

-- Customer analytics summary
CREATE TABLE IF NOT EXISTS customer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_orders integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  average_order_value numeric(10,2) DEFAULT 0,
  first_order_date timestamptz,
  last_order_date timestamptz,
  days_since_last_order integer,
  lifetime_value numeric(12,2) DEFAULT 0,
  predicted_ltv numeric(12,2),
  churn_risk_score numeric(3,2),
  favorite_categories uuid[],
  preferred_brands uuid[],
  last_calculated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Sales analytics (daily aggregates)
CREATE TABLE IF NOT EXISTS sales_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total_orders integer DEFAULT 0,
  total_revenue numeric(12,2) DEFAULT 0,
  total_items_sold integer DEFAULT 0,
  average_order_value numeric(10,2) DEFAULT 0,
  new_customers integer DEFAULT 0,
  returning_customers integer DEFAULT 0,
  conversion_rate numeric(5,4),
  top_selling_products jsonb DEFAULT '[]',
  top_categories jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own analytics data"
  ON customer_analytics FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own abandoned carts"
  ON abandoned_carts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin access for analytics
CREATE POLICY "Analytics readable by admin"
  ON sales_analytics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name IN ('admin', 'manager')
    )
  );





/*
  # Create Customer Support and Service Tables
  
  1. New Tables
     - `support_tickets` - Customer service tickets
     - `ticket_messages` - Support conversation history
     - `faqs` - Frequently asked questions
     - `returns` - Return and refund management
     - `return_items` - Individual items in returns
     - `shipping_carriers` - Delivery service providers
     - `tracking_updates` - Package tracking information
  
  2. Features
     - Complete customer support system
     - Return and refund workflow
     - FAQ management
     - Shipping and tracking integration
     - Multi-channel support communication
*/

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number varchar(50) NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id),
  order_id uuid REFERENCES orders(id),
  subject varchar(255) NOT NULL,
  description text NOT NULL,
  category varchar(50) NOT NULL,
  priority varchar(20) DEFAULT 'medium',
  status varchar(20) DEFAULT 'open',
  assigned_to uuid REFERENCES users(id),
  resolution text,
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  first_response_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ticket messages/conversation
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  message text NOT NULL,
  attachments jsonb DEFAULT '[]',
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category varchar(100),
  tags text[],
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Returns management
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number varchar(50) NOT NULL UNIQUE,
  order_id uuid NOT NULL REFERENCES orders(id),
  user_id uuid NOT NULL REFERENCES users(id),
  reason refund_reason NOT NULL,
  description text,
  status varchar(20) DEFAULT 'requested',
  return_type varchar(20) DEFAULT 'refund',
  refund_amount numeric(10,2) DEFAULT 0,
  restocking_fee numeric(10,2) DEFAULT 0,
  shipping_label_url text,
  tracking_number varchar(100),
  received_at timestamptz,
  processed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Return items
CREATE TABLE IF NOT EXISTS return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  condition varchar(50),
  reason text,
  refund_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Shipping carriers
CREATE TABLE IF NOT EXISTS shipping_carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  code varchar(20) NOT NULL UNIQUE,
  tracking_url_template text,
  api_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipping methods (enhanced)
CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES shipping_carriers(id),
  name varchar(100) NOT NULL,
  code varchar(50) NOT NULL,
  description text,
  delivery_time varchar(50),
  price numeric(10,2) DEFAULT 0,
  free_shipping_threshold numeric(10,2),
  weight_limit numeric(10,3),
  size_limits jsonb DEFAULT '{}',
  available_countries text[],
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Package tracking updates
CREATE TABLE IF NOT EXISTS tracking_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  tracking_number varchar(100) NOT NULL,
  carrier_id uuid REFERENCES shipping_carriers(id),
  status varchar(50) NOT NULL,
  description text,
  location varchar(255),
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own support tickets"
  ON support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets"
  ON support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own ticket messages"
  ON ticket_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "FAQs are publicly readable"
  ON faqs FOR SELECT TO public
  USING (is_published = true);

CREATE POLICY "Users can read own returns"
  ON returns FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Shipping methods are publicly readable"
  ON shipping_methods FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Users can read tracking for own orders"
  ON tracking_updates FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = tracking_updates.order_id 
      AND orders.user_id = auth.uid()
    )
  );





/*
  # Create Content Management Tables
  
  1. New Tables
     - `pages` - CMS pages and content
     - `blog_posts` - Blog and article management
     - `media_files` - File and image management
     - `seo_settings` - SEO optimization data
     - `site_settings` - Global site configuration
     - `notifications` - System notifications
     - `email_templates` - Email template management
  
  2. Features
     - Complete CMS functionality
     - Blog and content marketing
     - Media library management
     - SEO optimization tools
     - System notifications
     - Email template system
*/

-- CMS Pages
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  content text,
  excerpt text,
  meta_title varchar(255),
  meta_description text,
  meta_keywords text,
  template varchar(100) DEFAULT 'default',
  status varchar(20) DEFAULT 'draft',
  is_homepage boolean DEFAULT false,
  parent_id uuid REFERENCES pages(id),
  sort_order integer DEFAULT 0,
  featured_image_url text,
  author_id uuid REFERENCES users(id),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  featured_image_url text,
  meta_title varchar(255),
  meta_description text,
  tags text[],
  category varchar(100),
  status varchar(20) DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  author_id uuid NOT NULL REFERENCES users(id),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media files management
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename varchar(255) NOT NULL,
  original_filename varchar(255) NOT NULL,
  file_path text NOT NULL,
  file_url text NOT NULL,
  file_size integer NOT NULL,
  mime_type varchar(100) NOT NULL,
  file_type varchar(50) NOT NULL,
  dimensions jsonb,
  alt_text varchar(255),
  caption text,
  uploaded_by uuid REFERENCES users(id),
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- SEO settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type varchar(50) NOT NULL,
  page_id uuid,
  title_template varchar(255),
  meta_description_template text,
  canonical_url text,
  robots_meta varchar(100),
  og_title varchar(255),
  og_description text,
  og_image_url text,
  twitter_title varchar(255),
  twitter_description text,
  twitter_image_url text,
  schema_markup jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key varchar(100) NOT NULL UNIQUE,
  setting_value text,
  setting_type varchar(20) DEFAULT 'text',
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  subject varchar(255) NOT NULL,
  html_content text NOT NULL,
  text_content text,
  template_variables jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Published pages are publicly readable"
  ON pages FOR SELECT TO public
  USING (status = 'published');

CREATE POLICY "Published blog posts are publicly readable"
  ON blog_posts FOR SELECT TO public
  USING (status = 'published');

CREATE POLICY "Public media files are readable"
  ON media_files FOR SELECT TO public
  USING (is_public = true);

CREATE POLICY "Public site settings are readable"
  ON site_settings FOR SELECT TO public
  USING (is_public = true);

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);





/*
  # Create Additional Performance Indexes
  
  1. Purpose
     - Optimize queries for new enterprise tables
     - Improve search and filtering performance
     - Speed up analytics and reporting queries
     - Enhance user experience with faster operations
  
  2. Index Categories
     - Marketing and promotion indexes
     - Inventory management indexes
     - Analytics and reporting indexes
     - Support and service indexes
     - Content management indexes
*/

-- Marketing table indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_loyalty_points_user_id ON customer_loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- Inventory table indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_is_active ON warehouses(is_active);

CREATE INDEX IF NOT EXISTS idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_warehouse_id ON product_inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_quantity ON product_inventory(quantity_available);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_warehouse_id ON inventory_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);

CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);

CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user_id ON abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON abandoned_carts(created_at);

CREATE INDEX IF NOT EXISTS idx_customer_analytics_user_id ON customer_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_date ON sales_analytics(date);

-- Support table indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender_id ON ticket_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);

CREATE INDEX IF NOT EXISTS idx_tracking_updates_order_id ON tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_updates_tracking_number ON tracking_updates(tracking_number);

-- Content table indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);






/*
  # Create Enhanced Role System
  
  1. Additional Roles
     - Enhanced role system for enterprise operations
     - Granular permissions for different departments
     - Support for multi-tenant operations
  
  2. New Role Types
     - Manager roles for different departments
     - Staff roles with specific permissions
     - Vendor and partner access roles
*/

-- Insert additional enterprise roles
INSERT INTO roles (name, description, permissions) VALUES
('manager', 'Department manager with team oversight', '{"users": ["read"], "orders": ["read", "update"], "products": ["read", "update"], "inventory": ["read", "update"], "reports": ["read"]}'),
('inventory_staff', 'Inventory management specialist', '{"inventory": ["*"], "products": ["read", "update"], "suppliers": ["read"], "purchase_orders": ["*"]}'),
('customer_service', 'Customer support representative', '{"support_tickets": ["*"], "orders": ["read", "update"], "returns": ["*"], "customers": ["read"]}'),
('marketing_manager', 'Marketing and promotions manager', '{"promotions": ["*"], "coupons": ["*"], "email_campaigns": ["*"], "analytics": ["read"], "content": ["*"]}'),
('content_editor', 'Content and blog editor', '{"pages": ["*"], "blog_posts": ["*"], "media_files": ["*"], "seo": ["*"]}'),
('vendor', 'External vendor/supplier account', '{"products": ["create", "read", "update"], "orders": ["read"], "inventory": ["read"]}'),
('warehouse_staff', 'Warehouse operations staff', '{"inventory": ["read", "update"], "orders": ["read", "update"], "shipping": ["*"]}'),
('finance_manager', 'Financial operations manager', '{"orders": ["read"], "payments": ["read"], "returns": ["read"], "analytics": ["read"], "reports": ["*"]}')
ON CONFLICT (name) DO NOTHING;

-- Create department-specific permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource varchar(50) NOT NULL,
  actions text[] NOT NULL,
  conditions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, resource)
);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Role permissions readable by authenticated users"
  ON role_permissions FOR SELECT TO authenticated
  USING (true);





/*
  # Insert Enterprise Sample Data
  
  1. Sample Data
     - Default shipping carriers and methods
     - Common FAQ categories and questions
     - Email templates for common scenarios
     - Site settings for basic configuration
     - Sample warehouses and locations
  
  2. Purpose
     - Bootstrap enterprise features
     - Provide working examples
     - Enable immediate testing and development
*/

-- Insert default shipping carriers
INSERT INTO shipping_carriers (name, code, tracking_url_template, is_active) VALUES
('FedEx', 'FEDEX', 'https://www.fedex.com/fedextrack/?trknbr={tracking_number}', true),
('UPS', 'UPS', 'https://www.ups.com/track?tracknum={tracking_number}', true),
('USPS', 'USPS', 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={tracking_number}', true),
('DHL', 'DHL', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}', true)
ON CONFLICT (code) DO NOTHING;

-- Insert default shipping methods
INSERT INTO shipping_methods (carrier_id, name, code, description, delivery_time, price, is_active) VALUES
((SELECT id FROM shipping_carriers WHERE code = 'FEDEX'), 'FedEx Ground', 'FEDEX_GROUND', 'Reliable ground delivery', '1-5 business days', 9.99, true),
((SELECT id FROM shipping_carriers WHERE code = 'FEDEX'), 'FedEx Express', 'FEDEX_EXPRESS', 'Fast express delivery', '1-2 business days', 24.99, true),
((SELECT id FROM shipping_carriers WHERE code = 'UPS'), 'UPS Ground', 'UPS_GROUND', 'Standard ground shipping', '1-5 business days', 8.99, true),
((SELECT id FROM shipping_carriers WHERE code = 'USPS'), 'USPS Priority', 'USPS_PRIORITY', 'Priority mail delivery', '2-3 business days', 12.99, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample FAQ categories and questions
INSERT INTO faqs (question, answer, category, is_published) VALUES
('How do I track my order?', 'You can track your order by logging into your account and viewing your order history, or by using the tracking number provided in your shipping confirmation email.', 'Shipping', true),
('What is your return policy?', 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some restrictions apply for certain product categories.', 'Returns', true),
('How long does shipping take?', 'Standard shipping typically takes 3-7 business days. Express shipping options are available for faster delivery.', 'Shipping', true),
('Do you ship internationally?', 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by destination.', 'Shipping', true),
('How can I change or cancel my order?', 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact customer service for assistance.', 'Orders', true)
ON CONFLICT (question) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, text_content, template_variables) VALUES
('order_confirmation', 'Order Confirmation - #{order_number}', 
 '<h1>Thank you for your order!</h1><p>Your order #{order_number} has been confirmed and is being processed.</p><p>Order Total: ${total_amount}</p>', 
 'Thank you for your order! Your order #{order_number} has been confirmed and is being processed. Order Total: ${total_amount}',
 '{"order_number": "string", "total_amount": "number", "customer_name": "string"}'
),
('shipping_notification', 'Your order has shipped - #{order_number}', 
 '<h1>Your order is on the way!</h1><p>Your order #{order_number} has been shipped.</p><p>Tracking Number: {tracking_number}</p>', 
 'Your order is on the way! Your order #{order_number} has been shipped. Tracking Number: {tracking_number}',
 '{"order_number": "string", "tracking_number": "string", "estimated_delivery": "date"}'
),
('password_reset', 'Reset your password', 
 '<h1>Password Reset Request</h1><p>Click the link below to reset your password:</p><a href="{reset_link}">Reset Password</a>', 
 'Password Reset Request. Click the link below to reset your password: {reset_link}',
 '{"reset_link": "string", "customer_name": "string"}'
)
ON CONFLICT (name) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Enterprise E-commerce', 'text', 'Website name', true),
('site_description', 'Your premier online shopping destination', 'text', 'Website description', true),
('contact_email', 'support@example.com', 'email', 'Main contact email', true),
('contact_phone', '+1-800-123-4567', 'text', 'Main contact phone', true),
('currency', 'USD', 'text', 'Default currency', true),
('tax_rate', '0.08', 'number', 'Default tax rate', false),
('free_shipping_threshold', '50.00', 'number', 'Free shipping minimum order', true),
('max_cart_items', '50', 'number', 'Maximum items per cart', false),
('session_timeout', '3600', 'number', 'Session timeout in seconds', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample warehouse
INSERT INTO warehouses (name, code, address, is_active) VALUES
('Main Warehouse', 'WH001', '{"street": "123 Warehouse St", "city": "Commerce City", "state": "CO", "zip": "80022", "country": "USA"}', true),
('East Coast Distribution', 'WH002', '{"street": "456 Distribution Ave", "city": "Atlanta", "state": "GA", "zip": "30309", "country": "USA"}', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample inventory locations
INSERT INTO inventory_locations (warehouse_id, location_code, location_type, aisle, shelf, bin) VALUES
((SELECT id FROM warehouses WHERE code = 'WH001'), 'A1-01-01', 'shelf', 'A1', '01', '01'),
((SELECT id FROM warehouses WHERE code = 'WH001'), 'A1-01-02', 'shelf', 'A1', '01', '02'),
((SELECT id FROM warehouses WHERE code = 'WH001'), 'A1-02-01', 'shelf', 'A1', '02', '01'),
((SELECT id FROM warehouses WHERE code = 'WH002'), 'B1-01-01', 'shelf', 'B1', '01', '01')
ON CONFLICT (warehouse_id, location_code) DO NOTHING;

-- Insert default loyalty program
INSERT INTO loyalty_programs (name, description, points_per_dollar, points_redemption_value, is_active) VALUES
('VIP Rewards', 'Earn points on every purchase and get exclusive benefits', 1.00, 0.01, true)
ON CONFLICT (name) DO NOTHING;





/*
  # Create Social Commerce Features
  
  1. New Tables
     - `brand_api_configs` - Third-party brand API configurations
     - `api_sync_logs` - Track synchronization status and errors
     - `product_mappings` - Map external product IDs to internal products
     - `conversations` - Chat conversations between users
     - `messages` - Individual chat messages
     - `user_friends` - Friend relationships
     - `group_purchases` - Collaborative buying groups
     - `group_members` - Members in group purchases
     - `real_time_events` - Event queue for real-time updates
  
  2. Features
     - Third-party API integration tracking
     - Real-time chat system
     - Social networking features
     - Group purchasing functionality
     - Event-driven real-time updates
*/

-- Brand API configurations
CREATE TABLE IF NOT EXISTS brand_api_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  api_name varchar(100) NOT NULL,
  api_version varchar(20),
  base_url text NOT NULL,
  auth_type varchar(50) NOT NULL, -- 'api_key', 'oauth', 'bearer_token'
  auth_config jsonb NOT NULL, -- Store API keys, tokens, etc.
  rate_limit_per_minute integer DEFAULT 60,
  rate_limit_per_hour integer DEFAULT 1000,
  webhook_url text,
  webhook_secret varchar(255),
  field_mappings jsonb NOT NULL, -- Map external fields to internal schema
  sync_frequency_minutes integer DEFAULT 15,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, api_name)
);

-- API synchronization logs
CREATE TABLE IF NOT EXISTS api_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_api_config_id uuid NOT NULL REFERENCES brand_api_configs(id),
  sync_type varchar(50) NOT NULL, -- 'full', 'incremental', 'webhook'
  status varchar(20) NOT NULL, -- 'started', 'completed', 'failed', 'partial'
  records_processed integer DEFAULT 0,
  records_created integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  error_details jsonb,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Product mappings for external APIs
CREATE TABLE IF NOT EXISTS product_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  external_product_id varchar(255) NOT NULL,
  brand_api_config_id uuid NOT NULL REFERENCES brand_api_configs(id),
  external_data jsonb, -- Store original API response
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(external_product_id, brand_api_config_id)
);

-- Chat conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type varchar(20) NOT NULL DEFAULT 'direct', -- 'direct', 'group', 'group_purchase'
  name varchar(255), -- For group conversations
  description text,
  avatar_url text,
  created_by uuid NOT NULL REFERENCES users(id),
  group_purchase_id uuid, -- Will reference group_purchases table
  is_active boolean DEFAULT true,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'member', -- 'admin', 'member'
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz,
  is_muted boolean DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  message_type varchar(20) DEFAULT 'text', -- 'text', 'image', 'file', 'product', 'system'
  content text,
  attachments jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}', -- For product shares, system messages, etc.
  reply_to_id uuid REFERENCES messages(id),
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User friend relationships
CREATE TABLE IF NOT EXISTS user_friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  requested_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Group purchases
CREATE TABLE IF NOT EXISTS group_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  organizer_id uuid NOT NULL REFERENCES users(id),
  target_quantity integer NOT NULL CHECK (target_quantity > 0),
  current_quantity integer DEFAULT 0,
  unit_price numeric(10,2) NOT NULL,
  group_discount_percentage numeric(5,2) DEFAULT 0,
  final_price_per_unit numeric(10,2),
  minimum_participants integer DEFAULT 2,
  maximum_participants integer,
  deadline timestamptz NOT NULL,
  status varchar(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'expired'
  conversation_id uuid REFERENCES conversations(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Group purchase members
CREATE TABLE IF NOT EXISTS group_purchase_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_purchase_id uuid NOT NULL REFERENCES group_purchases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  status varchar(20) DEFAULT 'joined', -- 'joined', 'confirmed', 'paid', 'cancelled'
  joined_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  payment_intent_id varchar(255),
  UNIQUE(group_purchase_id, user_id)
);

-- Real-time events queue
CREATE TABLE IF NOT EXISTS real_time_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type varchar(50) NOT NULL,
  entity_type varchar(50) NOT NULL, -- 'message', 'group_purchase', 'product', etc.
  entity_id uuid NOT NULL,
  user_ids uuid[], -- Target users for the event
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE brand_api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_purchase_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- API configs - Admin only
CREATE POLICY "API configs readable by admin"
  ON brand_api_configs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name = 'admin'
    )
  );

-- Conversations - Participants only
CREATE POLICY "Users can read conversations they participate in"
  ON conversations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = conversations.id 
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Messages - Conversation participants only
CREATE POLICY "Users can read messages in their conversations"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = messages.conversation_id 
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = messages.conversation_id 
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Friend relationships
CREATE POLICY "Users can read their friend relationships"
  ON user_friends FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friend requests"
  ON user_friends FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend requests they received"
  ON user_friends FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id);

-- Group purchases
CREATE POLICY "Group purchases are publicly readable"
  ON group_purchases FOR SELECT TO public
  USING (status = 'active' AND deadline > now());

CREATE POLICY "Users can create group purchases"
  ON group_purchases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

-- Group purchase members
CREATE POLICY "Users can read group purchase members"
  ON group_purchase_members FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM group_purchases 
      WHERE group_purchases.id = group_purchase_members.group_purchase_id 
      AND group_purchases.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can join group purchases"
  ON group_purchase_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add foreign key constraint for conversations.group_purchase_id
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_group_purchase_id 
FOREIGN KEY (group_purchase_id) REFERENCES group_purchases(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_api_configs_brand_id ON brand_api_configs(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_api_configs_next_sync ON brand_api_configs(next_sync_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_api_sync_logs_config_id ON api_sync_logs(brand_api_config_id);
CREATE INDEX IF NOT EXISTS idx_api_sync_logs_started_at ON api_sync_logs(started_at);

CREATE INDEX IF NOT EXISTS idx_product_mappings_internal_id ON product_mappings(internal_product_id);
CREATE INDEX IF NOT EXISTS idx_product_mappings_external_id ON product_mappings(external_product_id, brand_api_config_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_user_friends_requester ON user_friends(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_addressee ON user_friends(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON user_friends(status);

CREATE INDEX IF NOT EXISTS idx_group_purchases_status ON group_purchases(status);
CREATE INDEX IF NOT EXISTS idx_group_purchases_deadline ON group_purchases(deadline);
CREATE INDEX IF NOT EXISTS idx_group_purchases_product_id ON group_purchases(product_id);

CREATE INDEX IF NOT EXISTS idx_group_purchase_members_group_id ON group_purchase_members(group_purchase_id);
CREATE INDEX IF NOT EXISTS idx_group_purchase_members_user_id ON group_purchase_members(user_id);

CREATE INDEX IF NOT EXISTS idx_real_time_events_processed ON real_time_events(processed, created_at) WHERE NOT processed;
CREATE INDEX IF NOT EXISTS idx_real_time_events_user_ids ON real_time_events USING GIN(user_ids);






/*
  # Enhanced Seller Management for Hybrid Platform
  
  1. New Tables
     - `seller_plans` - Subscription plans for manual sellers
     - `seller_subscriptions` - Active seller subscriptions
     - `seller_commissions` - Commission structure per seller
     - `product_approvals` - Automated approval tracking
     - `coupon_conflicts` - Track coupon conflicts and resolutions
     - `revenue_tracking` - Commission and fee tracking
  
  2. Features
     - Multi-tier subscription plans
     - Flexible commission structures
     - Automated product approval
     - Coupon conflict management
     - Revenue tracking and reporting
*/

-- Seller subscription plans
CREATE TABLE IF NOT EXISTS seller_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  description text,
  monthly_fee numeric(10,2) DEFAULT 0,
  product_limit integer, -- NULL for unlimited
  commission_rate numeric(5,2) NOT NULL, -- Percentage
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seller subscriptions
CREATE TABLE IF NOT EXISTS seller_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES seller_plans(id),
  status varchar(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean DEFAULT true,
  payment_method_id varchar(255),
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced seller commission tracking
CREATE TABLE IF NOT EXISTS seller_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_type varchar(20) NOT NULL, -- 'api_integrated', 'manual'
  commission_rate numeric(5,2) NOT NULL,
  flat_fee numeric(10,2) DEFAULT 0,
  cross_border_fee numeric(5,2) DEFAULT 0,
  currency_conversion_fee numeric(5,2) DEFAULT 0,
  effective_from timestamptz DEFAULT now(),
  effective_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Product approval tracking
CREATE TABLE IF NOT EXISTS product_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES users(id),
  approval_type varchar(20) DEFAULT 'automated', -- 'automated', 'manual'
  status varchar(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'requires_review'
  automated_checks jsonb DEFAULT '{}',
  rejection_reasons text[],
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coupon conflict management
CREATE TABLE IF NOT EXISTS coupon_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_coupon_id uuid NOT NULL REFERENCES coupons(id),
  conflicting_coupon_id uuid NOT NULL REFERENCES coupons(id),
  conflict_type varchar(50) NOT NULL, -- 'overlapping_products', 'date_overlap', 'discount_conflict'
  resolution_strategy varchar(50), -- 'highest_discount', 'seller_priority', 'first_applied'
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(primary_coupon_id, conflicting_coupon_id)
);

-- Revenue and commission tracking
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  seller_id uuid NOT NULL REFERENCES users(id),
  seller_type varchar(20) NOT NULL,
  gross_amount numeric(12,2) NOT NULL,
  commission_rate numeric(5,2) NOT NULL,
  commission_amount numeric(12,2) NOT NULL,
  flat_fee numeric(10,2) DEFAULT 0,
  cross_border_fee numeric(10,2) DEFAULT 0,
  currency_conversion_fee numeric(10,2) DEFAULT 0,
  net_seller_amount numeric(12,2) NOT NULL,
  platform_revenue numeric(12,2) NOT NULL,
  currency varchar(3) DEFAULT 'USD',
  payment_status varchar(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Seller analytics summary
CREATE TABLE IF NOT EXISTS seller_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_orders integer DEFAULT 0,
  total_revenue numeric(12,2) DEFAULT 0,
  commission_paid numeric(12,2) DEFAULT 0,
  products_sold integer DEFAULT 0,
  active_products integer DEFAULT 0,
  pending_approvals integer DEFAULT 0,
  conversion_rate numeric(5,4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(seller_id, date)
);

-- Enable RLS
ALTER TABLE seller_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Seller plans are publicly readable
CREATE POLICY "Seller plans are publicly readable"
  ON seller_plans FOR SELECT TO public
  USING (is_active = true);

-- Sellers can read their own subscriptions
CREATE POLICY "Sellers can read own subscriptions"
  ON seller_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

-- Sellers can read their own commission structure
CREATE POLICY "Sellers can read own commissions"
  ON seller_commissions FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

-- Sellers can read their own product approvals
CREATE POLICY "Sellers can read own product approvals"
  ON product_approvals FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

-- Sellers can read their own revenue tracking
CREATE POLICY "Sellers can read own revenue tracking"
  ON revenue_tracking FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

-- Sellers can read their own analytics
CREATE POLICY "Sellers can read own analytics"
  ON seller_analytics FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

-- Admin policies for management
CREATE POLICY "Admin can manage seller plans"
  ON seller_plans FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_seller_id ON seller_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_status ON seller_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_expires_at ON seller_subscriptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_seller_commissions_seller_id ON seller_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_commissions_effective_dates ON seller_commissions(effective_from, effective_until);

CREATE INDEX IF NOT EXISTS idx_product_approvals_product_id ON product_approvals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_approvals_seller_id ON product_approvals(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_approvals_status ON product_approvals(status);

CREATE INDEX IF NOT EXISTS idx_revenue_tracking_order_id ON revenue_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_seller_id ON revenue_tracking(seller_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_created_at ON revenue_tracking(created_at);

CREATE INDEX IF NOT EXISTS idx_seller_analytics_seller_date ON seller_analytics(seller_id, date);




/*
  # Enhance Existing Tables for Hybrid Seller Model
  
  1. Table Modifications
     - Add seller_type and source_type to products
     - Add plan restrictions to users
     - Enhance coupons for seller-specific promotions
     - Add approval workflow to products
  
  2. Features
     - Product source tracking
     - Seller type identification
     - Enhanced coupon management
     - Automated approval workflow
*/

-- Add seller type and source tracking to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_type varchar(20) DEFAULT 'manual';
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_type varchar(20) DEFAULT 'manual';
ALTER TABLE products ADD COLUMN IF NOT EXISTS approval_status varchar(20) DEFAULT 'pending';
ALTER TABLE products ADD COLUMN IF NOT EXISTS auto_approval_score numeric(3,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_manual_review boolean DEFAULT false;

-- Add seller plan tracking to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS seller_type varchar(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_plan_id uuid REFERENCES seller_plans(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS products_uploaded integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_limit_reached boolean DEFAULT false;

-- Enhance coupons for seller-specific promotions
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES users(id);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_seller_coupon boolean DEFAULT false;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS priority_level integer DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS conflict_resolution varchar(50) DEFAULT 'stackable';

-- Add brand transition tracking
CREATE TABLE IF NOT EXISTS brand_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id),
  from_type varchar(20) NOT NULL, -- 'manual', 'api_integrated'
  to_type varchar(20) NOT NULL,
  transition_date timestamptz DEFAULT now(),
  products_affected integer DEFAULT 0,
  products_migrated integer DEFAULT 0,
  status varchar(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE brand_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policy for brand transitions
CREATE POLICY "Admin can manage brand transitions"
  ON brand_transitions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name = 'admin'
    )
  );

-- Update existing RLS policies for enhanced products table
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
CREATE POLICY "Approved products are publicly readable"
  ON products FOR SELECT TO public
  USING (status = 'active' AND approval_status = 'approved');

-- Add seller-specific coupon policies
CREATE POLICY "Sellers can manage own coupons"
  ON coupons FOR ALL TO authenticated
  USING (
    auth.uid() = seller_id OR
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = auth.uid() 
      AND roles.name IN ('admin', 'manager')
    )
  );

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_type ON products(seller_type);
CREATE INDEX IF NOT EXISTS idx_products_source_type ON products(source_type);
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON products(approval_status);
CREATE INDEX IF NOT EXISTS idx_products_seller_id_status ON products(seller_id, approval_status);

CREATE INDEX IF NOT EXISTS idx_users_seller_type ON users(seller_type);
CREATE INDEX IF NOT EXISTS idx_users_current_plan ON users(current_plan_id);

CREATE INDEX IF NOT EXISTS idx_coupons_seller_id ON coupons(seller_id);
CREATE INDEX IF NOT EXISTS idx_coupons_is_seller_coupon ON coupons(is_seller_coupon);
CREATE INDEX IF NOT EXISTS idx_coupons_priority_level ON coupons(priority_level);

CREATE INDEX IF NOT EXISTS idx_brand_transitions_brand_id ON brand_transitions(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_transitions_status ON brand_transitions(status);




/*
  # Insert Default Seller Plans
  
  1. Default Plans
     - Free Plan (Starter): Limited uploads, higher commission
     - Basic Plan: Moderate uploads and commission
     - Pro Plan: Unlimited uploads, lower commission
  
  2. Commission Structures
     - Different rates for manual vs API sellers
     - Flat fees and additional charges
*/

-- Insert default seller plans
INSERT INTO seller_plans (name, description, monthly_fee, product_limit, commission_rate, features) VALUES
(
  'Free Plan (Starter)',
  'Perfect for testing the platform with limited product uploads',
  0.00,
  20,
  18.00,
  '{
    "max_products": 20,
    "analytics": "basic",
    "support": "community",
    "promotional_tools": false,
    "bulk_upload": false,
    "api_access": false,
    "priority_listing": false
  }'
),
(
  'Basic Plan',
  'Ideal for growing businesses with moderate product catalogs',
  29.00,
  500,
  14.00,
  '{
    "max_products": 500,
    "analytics": "standard",
    "support": "email",
    "promotional_tools": true,
    "bulk_upload": true,
    "api_access": false,
    "priority_listing": false,
    "coupon_creation": true
  }'
),
(
  'Pro Plan',
  'For established brands with unlimited uploads and premium features',
  99.00,
  null,
  9.00,
  '{
    "max_products": "unlimited",
    "analytics": "advanced",
    "support": "priority",
    "promotional_tools": true,
    "bulk_upload": true,
    "api_access": true,
    "priority_listing": true,
    "coupon_creation": true,
    "custom_branding": true,
    "dedicated_account_manager": true
  }'
)
ON CONFLICT (name) DO NOTHING;

-- Insert default commission structures for different seller types
INSERT INTO seller_commissions (seller_id, seller_type, commission_rate, flat_fee, cross_border_fee, currency_conversion_fee) 
SELECT 
  u.id,
  'manual',
  CASE 
    WHEN sp.name = 'Free Plan (Starter)' THEN 18.00
    WHEN sp.name = 'Basic Plan' THEN 14.00
    WHEN sp.name = 'Pro Plan' THEN 9.00
    ELSE 15.00
  END,
  2.50, -- Flat fee per order
  1.50, -- Cross-border fee percentage
  0.75  -- Currency conversion fee percentage
FROM users u
CROSS JOIN seller_plans sp
WHERE u.seller_type = 'manual'
AND NOT EXISTS (
  SELECT 1 FROM seller_commissions sc 
  WHERE sc.seller_id = u.id AND sc.seller_type = 'manual'
)
LIMIT 0; -- This won't insert anything but sets up the structure

-- Insert API seller commission structure (lower rates)
-- This would be populated when API sellers are onboarded
INSERT INTO seller_commissions (seller_id, seller_type, commission_rate, flat_fee, cross_border_fee, currency_conversion_fee)
SELECT 
  u.id,
  'api_integrated',
  5.00, -- Lower commission for API sellers
  1.00, -- Lower flat fee
  1.00, -- Lower cross-border fee
  0.50  -- Lower currency conversion fee
FROM users u
WHERE u.seller_type = 'api_integrated'
AND NOT EXISTS (
  SELECT 1 FROM seller_commissions sc 
  WHERE sc.seller_id = u.id AND sc.seller_type = 'api_integrated'
)
LIMIT 0; -- This won't insert anything but sets up the structure

-- Update existing seller role with enhanced permissions
UPDATE roles 
SET permissions = '{
  "products": ["create", "read", "update"],
  "orders": ["read"],
  "reviews": ["read"],
  "coupons": ["create", "read", "update"],
  "analytics": ["read"],
  "inventory": ["read", "update"],
  "customers": ["read"]
}'
WHERE name = 'seller';

-- Insert enhanced seller role for manual sellers
INSERT INTO roles (name, description, permissions) VALUES
(
  'manual_seller',
  'Manual seller with dashboard access and product management',
  '{
    "products": ["create", "read", "update", "delete"],
    "product_variants": ["create", "read", "update", "delete"],
    "orders": ["read"],
    "reviews": ["read"],
    "coupons": ["create", "read", "update", "delete"],
    "promotions": ["create", "read", "update"],
    "analytics": ["read"],
    "inventory": ["read", "update"],
    "customers": ["read"],
    "dashboard": ["access"],
    "bulk_operations": ["upload", "update"]
  }'
)
ON CONFLICT (name) DO NOTHING;




/*
  # Social Media Features - Live Streams & Reels
  
  1. New Tables
     - `live_streams` - Live streaming sessions by sellers/brands
     - `reels` - Short video content by sellers/brands and customers
     - `content_metrics` - Unified metrics tracking for all content types
     - `content_interactions` - Likes, shares, comments on content
     - `content_hashtags` - Hashtag management and tracking
     - `content_product_links` - Product references in content
  
  2. Features
     - Live streaming with real-time metrics
     - Reels with engagement tracking
     - Unified content interaction system
     - Hashtag and product linking
     - Performance analytics
*/

-- Live streaming sessions
CREATE TABLE IF NOT EXISTS live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  thumbnail_url text,
  stream_url text,
  status varchar(20) DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  max_concurrent_viewers integer DEFAULT 0,
  total_unique_viewers integer DEFAULT 0,
  is_recorded boolean DEFAULT true,
  recording_url text,
  featured_products uuid[], -- Array of product IDs
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Short video content (reels)
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255),
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  aspect_ratio varchar(10) DEFAULT '9:16', -- '9:16', '1:1', '16:9'
  resolution varchar(20), -- '1080x1920', '720x1280', etc.
  file_size_bytes bigint,
  status varchar(20) DEFAULT 'active', -- 'active', 'archived', 'reported', 'removed'
  is_featured boolean DEFAULT false,
  featured_products uuid[], -- Array of product IDs
  music_track varchar(255),
  music_start_time integer DEFAULT 0,
  effects_used text[],
  filters_applied text[],
  location varchar(255),
  privacy_setting varchar(20) DEFAULT 'public', -- 'public', 'followers', 'private'
  allow_comments boolean DEFAULT true,
  allow_duets boolean DEFAULT true,
  allow_downloads boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unified content metrics for lives and reels
CREATE TABLE IF NOT EXISTS content_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  metric_date date NOT NULL,
  views integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  likes integer DEFAULT 0,
  shares integer DEFAULT 0,
  comments integer DEFAULT 0,
  saves integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement_rate numeric(5,4) DEFAULT 0,
  watch_time_seconds bigint DEFAULT 0,
  average_watch_time_seconds integer DEFAULT 0,
  completion_rate numeric(5,4) DEFAULT 0,
  click_through_rate numeric(5,4) DEFAULT 0,
  conversion_rate numeric(5,4) DEFAULT 0,
  revenue_generated numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, metric_date)
);

-- Content interactions (likes, shares, comments)
CREATE TABLE IF NOT EXISTS content_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  interaction_type varchar(20) NOT NULL, -- 'like', 'share', 'comment', 'save', 'report'
  comment_text text,
  parent_comment_id uuid REFERENCES content_interactions(id),
  reaction_emoji varchar(10), -- For emoji reactions
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id, interaction_type) WHERE interaction_type IN ('like', 'save')
);

-- Hashtag management
CREATE TABLE IF NOT EXISTS hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag varchar(100) NOT NULL UNIQUE,
  usage_count integer DEFAULT 0,
  trending_score numeric(10,2) DEFAULT 0,
  category varchar(50),
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content hashtag relationships
CREATE TABLE IF NOT EXISTS content_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  hashtag_id uuid NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, hashtag_id)
);

-- Product links in content
CREATE TABLE IF NOT EXISTS content_product_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  link_type varchar(20) DEFAULT 'featured', -- 'featured', 'mentioned', 'tagged'
  timestamp_seconds integer, -- For video content, when product appears
  position_data jsonb, -- For positioning overlays
  click_count integer DEFAULT 0,
  conversion_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, product_id)
);

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_product_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Live streams - public readable when live/ended, creators can manage own
CREATE POLICY "Live streams are publicly readable when active"
  ON live_streams FOR SELECT TO public
  USING (status IN ('live', 'ended'));

CREATE POLICY "Hosts can manage own live streams"
  ON live_streams FOR ALL TO authenticated
  USING (auth.uid() = host_id);

-- Reels - public readable based on privacy, creators can manage own
CREATE POLICY "Public reels are readable"
  ON reels FOR SELECT TO public
  USING (privacy_setting = 'public' AND status = 'active');

CREATE POLICY "Creators can manage own reels"
  ON reels FOR ALL TO authenticated
  USING (auth.uid() = creator_id);

-- Content interactions - users can interact and read interactions
CREATE POLICY "Users can read content interactions"
  ON content_interactions FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can create interactions"
  ON content_interactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON content_interactions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Hashtags are publicly readable
CREATE POLICY "Hashtags are publicly readable"
  ON hashtags FOR SELECT TO public
  USING (NOT is_banned);

-- Content metrics readable by content creators and admins
CREATE POLICY "Content creators can read own metrics"
  ON content_metrics FOR SELECT TO authenticated
  USING (
    (content_type = 'live_stream' AND EXISTS (
      SELECT 1 FROM live_streams WHERE id = content_metrics.content_id AND host_id = auth.uid()
    )) OR
    (content_type = 'reel' AND EXISTS (
      SELECT 1 FROM reels WHERE id = content_metrics.content_id AND creator_id = auth.uid()
    ))
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_streams_host_id ON live_streams(host_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled_at ON live_streams(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_live_streams_started_at ON live_streams(started_at);

CREATE INDEX IF NOT EXISTS idx_reels_creator_id ON reels(creator_id);
CREATE INDEX IF NOT EXISTS idx_reels_status ON reels(status);
CREATE INDEX IF NOT EXISTS idx_reels_privacy_setting ON reels(privacy_setting);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_is_featured ON reels(is_featured);

CREATE INDEX IF NOT EXISTS idx_content_metrics_content ON content_metrics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_date ON content_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_content_interactions_content ON content_interactions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_user ON content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_type ON content_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON hashtags(trending_score DESC);

CREATE INDEX IF NOT EXISTS idx_content_hashtags_content ON content_hashtags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_hashtags_hashtag ON content_hashtags(hashtag_id);

CREATE INDEX IF NOT EXISTS idx_content_product_links_content ON content_product_links(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_product_links_product ON content_product_links(product_id);





/*
  # Enhanced Messaging System
  
  1. New Tables
     - `message_reactions` - Emoji reactions to messages
     - `message_read_receipts` - Track message read status
     - `message_attachments` - File attachments in messages
     - `conversation_settings` - Per-conversation settings
  
  2. Enhancements
     - Message reactions and read receipts
     - File attachment support
     - Conversation-level settings
     - Group purchase integration
*/

-- Message reactions (emoji reactions)
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_emoji varchar(10) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_emoji)
);

-- Message read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Message attachments (files, images, videos)
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name varchar(255) NOT NULL,
  file_url text NOT NULL,
  file_type varchar(50) NOT NULL, -- 'image', 'video', 'audio', 'document'
  file_size_bytes bigint,
  mime_type varchar(100),
  thumbnail_url text,
  duration_seconds integer, -- For audio/video files
  dimensions jsonb, -- For images/videos: {"width": 1920, "height": 1080}
  created_at timestamptz DEFAULT now()
);

-- Conversation settings and preferences
CREATE TABLE IF NOT EXISTS conversation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_muted boolean DEFAULT false,
  muted_until timestamptz,
  notification_level varchar(20) DEFAULT 'all', -- 'all', 'mentions', 'none'
  custom_name varchar(255), -- User's custom name for the conversation
  is_pinned boolean DEFAULT false,
  theme_color varchar(7), -- Hex color code
  background_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Message forwarding tracking
CREATE TABLE IF NOT EXISTS message_forwards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id uuid NOT NULL REFERENCES messages(id),
  forwarded_message_id uuid NOT NULL REFERENCES messages(id),
  forwarded_by uuid NOT NULL REFERENCES users(id),
  forwarded_to_conversation uuid NOT NULL REFERENCES conversations(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_forwards ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Message reactions - users can react and see reactions in their conversations
CREATE POLICY "Users can read reactions in their conversations"
  ON message_reactions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reactions"
  ON message_reactions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
    )
  );

-- Read receipts - users can mark messages as read and see read status
CREATE POLICY "Users can read receipts in their conversations"
  ON message_read_receipts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_read_receipts.message_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create read receipts"
  ON message_read_receipts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_read_receipts.message_id AND cp.user_id = auth.uid()
    )
  );

-- Message attachments - users can see attachments in their conversations
CREATE POLICY "Users can read attachments in their conversations"
  ON message_attachments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid()
    )
  );

-- Conversation settings - users can manage their own settings
CREATE POLICY "Users can manage own conversation settings"
  ON conversation_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_type ON message_attachments(file_type);

CREATE INDEX IF NOT EXISTS idx_conversation_settings_conversation_id ON conversation_settings(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user_id ON conversation_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_is_pinned ON conversation_settings(is_pinned);





/*
  # Ad Campaigns & Promotions System
  
  1. New Tables
     - `ad_campaigns` - Marketing campaigns by sellers/brands
     - `ad_creatives` - Ad content (images, videos, copy)
     - `ad_placements` - Where ads are shown
     - `ad_metrics` - Performance tracking
     - `ad_budgets` - Budget management and spending
     - `ad_audiences` - Target audience definitions
  
  2. Features
     - Comprehensive campaign management
     - Multi-format ad creatives
     - Detailed performance analytics
     - Budget control and optimization
     - Audience targeting
*/

-- Ad campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  objective varchar(50) NOT NULL, -- 'awareness', 'traffic', 'conversions', 'engagement'
  status varchar(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'cancelled'
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  daily_budget numeric(10,2),
  total_budget numeric(12,2),
  bid_strategy varchar(30) DEFAULT 'automatic', -- 'automatic', 'manual_cpc', 'manual_cpm'
  target_audience_id uuid,
  optimization_goal varchar(50), -- 'clicks', 'impressions', 'conversions', 'reach'
  is_evergreen boolean DEFAULT false,
  priority_level integer DEFAULT 1,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ad creatives (images, videos, copy)
CREATE TABLE IF NOT EXISTS ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  creative_type varchar(20) NOT NULL, -- 'image', 'video', 'carousel', 'text'
  headline varchar(255),
  description text,
  call_to_action varchar(50), -- 'shop_now', 'learn_more', 'sign_up', 'download'
  media_urls jsonb DEFAULT '[]', -- Array of media URLs
  thumbnail_url text,
  dimensions jsonb, -- {"width": 1200, "height": 628}
  duration_seconds integer, -- For video creatives
  file_size_bytes bigint,
  landing_url text,
  product_ids uuid[], -- Featured products in the ad
  status varchar(20) DEFAULT 'active', -- 'active', 'paused', 'rejected'
  approval_status varchar(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason text,
  performance_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ad placements (where ads are shown)
CREATE TABLE IF NOT EXISTS ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  description text,
  placement_type varchar(30) NOT NULL, -- 'homepage_banner', 'product_feed', 'search_results', 'reel_feed'
  dimensions jsonb, -- Required dimensions for this placement
  max_file_size_mb integer,
  supported_formats text[], -- ['image/jpeg', 'video/mp4']
  base_cpm numeric(8,2) DEFAULT 0, -- Base cost per mille
  base_cpc numeric(8,2) DEFAULT 0, -- Base cost per click
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Campaign placement assignments
CREATE TABLE IF NOT EXISTS campaign_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  placement_id uuid NOT NULL REFERENCES ad_placements(id) ON DELETE CASCADE,
  creative_id uuid NOT NULL REFERENCES ad_creatives(id) ON DELETE CASCADE,
  bid_amount numeric(8,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, placement_id, creative_id)
);

-- Ad performance metrics
CREATE TABLE IF NOT EXISTS ad_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  creative_id uuid REFERENCES ad_creatives(id) ON DELETE CASCADE,
  placement_id uuid REFERENCES ad_placements(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spend numeric(12,2) DEFAULT 0,
  reach integer DEFAULT 0,
  frequency numeric(5,2) DEFAULT 0,
  ctr numeric(8,4) DEFAULT 0, -- Click-through rate
  cpm numeric(8,2) DEFAULT 0, -- Cost per mille
  cpc numeric(8,2) DEFAULT 0, -- Cost per click
  cpa numeric(10,2) DEFAULT 0, -- Cost per acquisition
  roas numeric(8,2) DEFAULT 0, -- Return on ad spend
  engagement_rate numeric(5,4) DEFAULT 0,
  video_views integer DEFAULT 0,
  video_completion_rate numeric(5,4) DEFAULT 0,
  revenue_generated numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, creative_id, placement_id, metric_date)
);

-- Budget tracking and spending
CREATE TABLE IF NOT EXISTS ad_budget_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date date NOT NULL,
  allocated_budget numeric(10,2) NOT NULL,
  spent_amount numeric(10,2) DEFAULT 0,
  remaining_budget numeric(10,2) DEFAULT 0,
  budget_utilization numeric(5,4) DEFAULT 0,
  auto_pause_triggered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Target audiences
CREATE TABLE IF NOT EXISTS ad_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  audience_type varchar(30) DEFAULT 'custom', -- 'custom', 'lookalike', 'saved'
  targeting_criteria jsonb NOT NULL, -- Demographics, interests, behaviors
  estimated_size integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for target_audience_id
ALTER TABLE ad_campaigns 
ADD CONSTRAINT fk_ad_campaigns_target_audience_id 
FOREIGN KEY (target_audience_id) REFERENCES ad_audiences(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_audiences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Advertisers can manage their own campaigns
CREATE POLICY "Advertisers can manage own campaigns"
  ON ad_campaigns FOR ALL TO authenticated
  USING (auth.uid() = advertiser_id);

-- Advertisers can manage their own creatives
CREATE POLICY "Advertisers can manage own creatives"
  ON ad_creatives FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ad_campaigns 
      WHERE ad_campaigns.id = ad_creatives.campaign_id 
      AND ad_campaigns.advertiser_id = auth.uid()
    )
  );

-- Ad placements are publicly readable
CREATE POLICY "Ad placements are publicly readable"
  ON ad_placements FOR SELECT TO public
  USING (is_active = true);

-- Advertisers can read their own metrics
CREATE POLICY "Advertisers can read own metrics"
  ON ad_metrics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ad_campaigns 
      WHERE ad_campaigns.id = ad_metrics.campaign_id 
      AND ad_campaigns.advertiser_id = auth.uid()
    )
  );

-- Advertisers can manage their own audiences
CREATE POLICY "Advertisers can manage own audiences"
  ON ad_audiences FOR ALL TO authenticated
  USING (auth.uid() = advertiser_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser_id ON ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_start_date ON ad_campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_end_date ON ad_campaigns(end_date);

CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign_id ON ad_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_status ON ad_creatives(status);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_approval_status ON ad_creatives(approval_status);

CREATE INDEX IF NOT EXISTS idx_campaign_placements_campaign_id ON campaign_placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_placements_placement_id ON campaign_placements(placement_id);

CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign_id ON ad_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_date ON ad_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_creative_id ON ad_metrics(creative_id);

CREATE INDEX IF NOT EXISTS idx_ad_budget_tracking_campaign_id ON ad_budget_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_budget_tracking_date ON ad_budget_tracking(date);

CREATE INDEX IF NOT EXISTS idx_ad_audiences_advertiser_id ON ad_audiences(advertiser_id);




/*
  # Social Features - Following, Feeds, Notifications
  
  1. New Tables
     - `user_follows` - Following relationships between users
     - `user_feeds` - Personalized content feeds
     - `feed_items` - Individual items in feeds
     - `user_interests` - User interests and preferences
     - `content_reports` - Content reporting system
     - `trending_topics` - Trending hashtags and topics
  
  2. Features
     - Follow/unfollow system
     - Personalized content feeds
     - Interest tracking
     - Content moderation
     - Trending content discovery
*/

-- User following relationships
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_at timestamptz DEFAULT now(),
  notification_enabled boolean DEFAULT true,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- User personalized feeds
CREATE TABLE IF NOT EXISTS user_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feed_type varchar(30) NOT NULL, -- 'home', 'following', 'explore', 'products'
  algorithm_version varchar(20) DEFAULT 'v1.0',
  last_updated_at timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feed_type)
);

-- Individual feed items
CREATE TABLE IF NOT EXISTS feed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES user_feeds(id) ON DELETE CASCADE,
  content_type varchar(20) NOT NULL, -- 'reel', 'live_stream', 'product', 'promotion'
  content_id uuid NOT NULL,
  score numeric(8,4) DEFAULT 0, -- Relevance score for ranking
  reason varchar(100), -- Why this item was included
  position_in_feed integer,
  shown_at timestamptz,
  clicked_at timestamptz,
  engaged_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User interests and preferences
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_type varchar(30) NOT NULL, -- 'category', 'brand', 'hashtag', 'style'
  interest_value varchar(255) NOT NULL, -- The actual interest (category name, brand name, etc.)
  interest_id uuid, -- Reference to specific entity (category_id, brand_id, etc.)
  confidence_score numeric(5,4) DEFAULT 0, -- How confident we are about this interest
  source varchar(30) DEFAULT 'implicit', -- 'explicit', 'implicit', 'imported'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_type, interest_value)
);

-- Content reporting system
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type varchar(20) NOT NULL, -- 'reel', 'live_stream', 'comment', 'message'
  content_id uuid NOT NULL,
  report_reason varchar(50) NOT NULL, -- 'spam', 'inappropriate', 'harassment', 'copyright'
  description text,
  status varchar(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  resolution_action varchar(50), -- 'no_action', 'content_removed', 'user_warned', 'user_suspended'
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trending topics and hashtags
CREATE TABLE IF NOT EXISTS trending_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_type varchar(20) NOT NULL, -- 'hashtag', 'product', 'brand', 'category'
  topic_value varchar(255) NOT NULL,
  topic_id uuid, -- Reference to specific entity
  trend_score numeric(10,2) DEFAULT 0,
  usage_count integer DEFAULT 0,
  growth_rate numeric(8,4) DEFAULT 0,
  peak_time timestamptz,
  trend_date date NOT NULL,
  region varchar(10) DEFAULT 'global', -- 'global', 'US', 'EU', etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(topic_type, topic_value, trend_date, region)
);

-- User activity tracking for feed algorithm
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type varchar(30) NOT NULL, -- 'view', 'like', 'share', 'comment', 'purchase', 'search'
  content_type varchar(20), -- 'reel', 'product', 'live_stream'
  content_id uuid,
  duration_seconds integer, -- How long they engaged
  metadata jsonb DEFAULT '{}', -- Additional context
  created_at timestamptz DEFAULT now()
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type varchar(50) NOT NULL,
  is_enabled boolean DEFAULT true,
  delivery_method varchar(20) DEFAULT 'in_app', -- 'in_app', 'email', 'push', 'sms'
  frequency varchar(20) DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly', 'never'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, notification_type, delivery_method)
);

-- Enable RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can manage their own follows
CREATE POLICY "Users can manage own follows"
  ON user_follows FOR ALL TO authenticated
  USING (auth.uid() = follower_id);

-- Users can see who follows them
CREATE POLICY "Users can see their followers"
  ON user_follows FOR SELECT TO authenticated
  USING (auth.uid() = following_id OR auth.uid() = follower_id);

-- Users can manage their own feeds
CREATE POLICY "Users can manage own feeds"
  ON user_feeds FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Users can see their own feed items
CREATE POLICY "Users can see own feed items"
  ON feed_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_feeds 
      WHERE user_feeds.id = feed_items.feed_id 
      AND user_feeds.user_id = auth.uid()
    )
  );

-- Users can manage their own interests
CREATE POLICY "Users can manage own interests"
  ON user_interests FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Users can create reports
CREATE POLICY "Users can create content reports"
  ON content_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Trending topics are publicly readable
CREATE POLICY "Trending topics are publicly readable"
  ON trending_topics FOR SELECT TO public
  USING (true);

-- Users can manage their own activity logs
CREATE POLICY "Users can manage own activity logs"
  ON user_activity_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage own notification preferences"
  ON user_notification_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_at ON user_follows(followed_at);

CREATE INDEX IF NOT EXISTS idx_user_feeds_user_id ON user_feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feeds_feed_type ON user_feeds(feed_type);

CREATE INDEX IF NOT EXISTS idx_feed_items_feed_id ON feed_items(feed_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_content ON feed_items(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_score ON feed_items(score DESC);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_type ON user_interests(interest_type);
CREATE INDEX IF NOT EXISTS idx_user_interests_confidence ON user_interests(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON content_reports(reporter_id);

CREATE INDEX IF NOT EXISTS idx_trending_topics_date ON trending_topics(trend_date);
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON trending_topics(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_type ON trending_topics(topic_type);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);




/*
  # AI-Powered Personalization System
  
  1. New Tables
     - `user_behavior_profiles` - AI-generated user profiles
     - `product_recommendations` - Personalized product suggestions
     - `style_profiles` - Fashion style preferences
     - `ai_insights` - AI-generated insights and predictions
     - `recommendation_feedback` - User feedback on recommendations
     - `personalization_models` - ML model versions and performance
  
  2. Features
     - Behavioral profiling and segmentation
     - Personalized product recommendations
     - Style and preference learning
     - AI-driven insights and predictions
     - Recommendation feedback loop
*/

-- User behavior profiles generated by AI
CREATE TABLE IF NOT EXISTS user_behavior_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_version varchar(20) DEFAULT 'v1.0',
  behavioral_segments text[], -- ['fashion_forward', 'price_conscious', 'brand_loyal']
  shopping_patterns jsonb DEFAULT '{}', -- Purchase frequency, timing, etc.
  style_preferences jsonb DEFAULT '{}', -- Colors, styles, brands, etc.
  price_sensitivity numeric(5,4) DEFAULT 0.5, -- 0 = price insensitive, 1 = very price sensitive
  brand_affinity jsonb DEFAULT '{}', -- Brand preferences and scores
  category_preferences jsonb DEFAULT '{}', -- Category preferences and scores
  seasonal_patterns jsonb DEFAULT '{}', -- Seasonal shopping behavior
  engagement_score numeric(5,4) DEFAULT 0, -- Overall platform engagement
  churn_risk_score numeric(5,4) DEFAULT 0, -- Likelihood to churn
  lifetime_value_prediction numeric(12,2) DEFAULT 0,
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, profile_version)
);

-- Personalized product recommendations
CREATE TABLE IF NOT EXISTS product_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommendation_type varchar(30) NOT NULL, -- 'homepage', 'similar', 'trending', 'style_match'
  confidence_score numeric(5,4) DEFAULT 0,
  reasoning jsonb DEFAULT '{}', -- Why this product was recommended
  context varchar(50), -- 'browsing_history', 'purchase_history', 'similar_users'
  position_rank integer,
  shown_at timestamptz,
  clicked_at timestamptz,
  purchased_at timestamptz,
  dismissed_at timestamptz,
  model_version varchar(20) DEFAULT 'v1.0',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User style profiles for fashion recommendations
CREATE TABLE IF NOT EXISTS style_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style_categories text[], -- ['minimalist', 'bohemian', 'classic', 'trendy']
  color_preferences jsonb DEFAULT '{}', -- Preferred colors and combinations
  fit_preferences jsonb DEFAULT '{}', -- Size and fit preferences
  occasion_styles jsonb DEFAULT '{}', -- Work, casual, formal preferences
  body_type varchar(20), -- For better fit recommendations
  style_inspiration_ids uuid[], -- Users they follow for style
  favorite_brands uuid[], -- Preferred brand IDs
  avoided_styles text[], -- Styles they don't like
  budget_range jsonb DEFAULT '{}', -- Price range preferences
  sustainability_preference numeric(3,2) DEFAULT 0, -- Eco-friendly preference score
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- AI-generated insights and predictions
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  insight_type varchar(50) NOT NULL, -- 'trend_prediction', 'style_suggestion', 'price_alert'
  insight_category varchar(30), -- 'personal', 'market', 'product'
  title varchar(255) NOT NULL,
  description text NOT NULL,
  confidence_level varchar(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  actionable_data jsonb DEFAULT '{}', -- Data to act on the insight
  related_products uuid[], -- Related product IDs
  expires_at timestamptz,
  is_shown boolean DEFAULT false,
  shown_at timestamptz,
  user_reaction varchar(20), -- 'helpful', 'not_helpful', 'ignored'
  model_version varchar(20) DEFAULT 'v1.0',
  created_at timestamptz DEFAULT now()
);

-- User feedback on recommendations
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id uuid REFERENCES product_recommendations(id) ON DELETE CASCADE,
  feedback_type varchar(20) NOT NULL, -- 'like', 'dislike', 'not_interested', 'purchased'
  feedback_reason varchar(100), -- 'wrong_style', 'too_expensive', 'already_own'
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comments text,
  created_at timestamptz DEFAULT now()
);

-- ML model versions and performance tracking
CREATE TABLE IF NOT EXISTS personalization_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name varchar(100) NOT NULL,
  model_version varchar(20) NOT NULL,
  model_type varchar(50) NOT NULL, -- 'recommendation', 'style_matching', 'churn_prediction'
  algorithm varchar(50), -- 'collaborative_filtering', 'content_based', 'deep_learning'
  training_data_size integer,
  accuracy_score numeric(5,4),
  precision_score numeric(5,4),
  recall_score numeric(5,4),
  f1_score numeric(5,4),
  deployment_date timestamptz,
  is_active boolean DEFAULT false,
  performance_metrics jsonb DEFAULT '{}',
  hyperparameters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(model_name, model_version)
);

-- Product similarity scores for recommendations
CREATE TABLE IF NOT EXISTS product_similarities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_a_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_b_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  similarity_score numeric(5,4) NOT NULL,
  similarity_type varchar(30) DEFAULT 'overall', -- 'overall', 'visual', 'style', 'price'
  calculated_at timestamptz DEFAULT now(),
  model_version varchar(20) DEFAULT 'v1.0',
  UNIQUE(product_a_id, product_b_id, similarity_type),
  CHECK (product_a_id != product_b_id)
);

-- User search and browse history for AI learning
CREATE TABLE IF NOT EXISTS user_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_query text NOT NULL,
  search_type varchar(20) DEFAULT 'text', -- 'text', 'image', 'voice'
  filters_applied jsonb DEFAULT '{}',
  results_count integer DEFAULT 0,
  clicked_products uuid[],
  session_id varchar(100),
  search_duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own behavior profiles
CREATE POLICY "Users can read own behavior profiles"
  ON user_behavior_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can see their own recommendations
CREATE POLICY "Users can see own recommendations"
  ON product_recommendations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can manage their own style profiles
CREATE POLICY "Users can manage own style profiles"
  ON style_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Users can see their own AI insights
CREATE POLICY "Users can see own AI insights"
  ON ai_insights FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can provide feedback on their recommendations
CREATE POLICY "Users can provide recommendation feedback"
  ON recommendation_feedback FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Product similarities are publicly readable
CREATE POLICY "Product similarities are publicly readable"
  ON product_similarities FOR SELECT TO public
  USING (true);

-- Users can manage their own search history
CREATE POLICY "Users can manage own search history"
  ON user_search_history FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_behavior_profiles_user_id ON user_behavior_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_profiles_updated_at ON user_behavior_profiles(last_updated_at);

CREATE INDEX IF NOT EXISTS idx_product_recommendations_user_id ON product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product_id ON product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_type ON product_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_confidence ON product_recommendations(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_style_profiles_user_id ON style_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires_at ON ai_insights(expires_at);

CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);

CREATE INDEX IF NOT EXISTS idx_personalization_models_active ON personalization_models(is_active);
CREATE INDEX IF NOT EXISTS idx_personalization_models_type ON personalization_models(model_type);

CREATE INDEX IF NOT EXISTS idx_product_similarities_product_a ON product_similarities(product_a_id);
CREATE INDEX IF NOT EXISTS idx_product_similarities_product_b ON product_similarities(product_b_id);
CREATE INDEX IF NOT EXISTS idx_product_similarities_score ON product_similarities(similarity_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_created_at ON user_search_history(created_at);







/*
  # Community & Challenges System
  
  1. New Tables
     - `subscription_tiers` - Different subscription levels
     - `user_subscriptions` - User subscription management
     - `challenges` - Community challenges and contests
     - `challenge_participants` - User participation in challenges
     - `challenge_submissions` - User submissions for challenges
     - `rewards` - Reward system for challenges
     - `user_rewards` - Rewards earned by users
     - `community_posts` - Community content and discussions
  
  2. Features
     - Subscription tier management
     - Challenge creation and participation
     - Reward system with points and prizes
     - Community engagement features
     - Premium content access control
*/

-- Subscription tiers for premium features
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  description text,
  monthly_price numeric(10,2) DEFAULT 0,
  yearly_price numeric(10,2) DEFAULT 0,
  features jsonb DEFAULT '{}', -- List of included features
  limits jsonb DEFAULT '{}', -- Usage limits
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id),
  status varchar(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'paused'
  billing_cycle varchar(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean DEFAULT true,
  payment_method_id varchar(255),
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text NOT NULL,
  challenge_type varchar(30) NOT NULL, -- 'style', 'product_use', 'social', 'creative'
  difficulty_level varchar(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  creator_id uuid REFERENCES users(id),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  max_participants integer,
  current_participants integer DEFAULT 0,
  entry_requirements jsonb DEFAULT '{}', -- Subscription tier, follower count, etc.
  submission_requirements jsonb DEFAULT '{}', -- What users need to submit
  judging_criteria jsonb DEFAULT '{}', -- How submissions are evaluated
  prizes jsonb DEFAULT '{}', -- Reward structure
  status varchar(20) DEFAULT 'upcoming', -- 'upcoming', 'active', 'judging', 'completed', 'cancelled'
  is_featured boolean DEFAULT false,
  hashtags text[],
  banner_image_url text,
  rules text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Challenge participation
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  status varchar(20) DEFAULT 'active', -- 'active', 'completed', 'disqualified'
  completion_percentage numeric(5,2) DEFAULT 0,
  points_earned integer DEFAULT 0,
  rank_position integer,
  UNIQUE(challenge_id, user_id)
);

-- Challenge submissions
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES challenge_participants(id) ON DELETE CASCADE,
  submission_type varchar(20) NOT NULL, -- 'image', 'video', 'text', 'reel'
  content_url text,
  caption text,
  hashtags text[],
  submission_data jsonb DEFAULT '{}', -- Additional submission details
  votes_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  judge_score numeric(5,2),
  judge_feedback text,
  is_winner boolean DEFAULT false,
  award_category varchar(50), -- 'first_place', 'most_creative', 'peoples_choice'
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- Reward system
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  reward_type varchar(30) NOT NULL, -- 'points', 'coupon', 'product', 'badge', 'feature'
  reward_value jsonb NOT NULL, -- Points amount, coupon details, product info, etc.
  rarity varchar(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  image_url text,
  requirements jsonb DEFAULT '{}', -- What's needed to earn this reward
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User rewards earned
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES rewards(id),
  challenge_id uuid REFERENCES challenges(id),
  earned_at timestamptz DEFAULT now(),
  claimed_at timestamptz,
  expires_at timestamptz,
  status varchar(20) DEFAULT 'earned', -- 'earned', 'claimed', 'expired', 'revoked'
  metadata jsonb DEFAULT '{}'
);

-- Community posts and discussions
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type varchar(20) DEFAULT 'text', -- 'text', 'image', 'video', 'poll'
  title varchar(255),
  content text,
  media_urls jsonb DEFAULT '[]',
  hashtags text[],
  mentioned_users uuid[],
  challenge_id uuid REFERENCES challenges(id),
  is_pinned boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  status varchar(20) DEFAULT 'published', -- 'draft', 'published', 'archived', 'removed'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User wardrobe (for subscribers)
CREATE TABLE IF NOT EXISTS user_wardrobes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id),
  purchase_date timestamptz,
  purchase_price numeric(10,2),
  size_purchased varchar(20),
  color_purchased varchar(50),
  condition varchar(20) DEFAULT 'new', -- 'new', 'good', 'fair', 'worn'
  wear_count integer DEFAULT 0,
  last_worn_at timestamptz,
  style_tags text[],
  personal_rating integer CHECK (personal_rating >= 1 AND personal_rating <= 5),
  notes text,
  is_favorite boolean DEFAULT false,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, order_id)
);

-- Premium content for subscribers
CREATE TABLE IF NOT EXISTS premium_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  content_type varchar(20) NOT NULL, -- 'video', 'article', 'tutorial', 'lookbook'
  content_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer,
  required_tier_id uuid REFERENCES subscription_tiers(id),
  creator_id uuid REFERENCES users(id),
  category varchar(50),
  tags text[],
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  status varchar(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wardrobes ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Subscription tiers are publicly readable
CREATE POLICY "Subscription tiers are publicly readable"
  ON subscription_tiers FOR SELECT TO public
  USING (is_active = true);

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Challenges are publicly readable when active
CREATE POLICY "Active challenges are publicly readable"
  ON challenges FOR SELECT TO public
  USING (status IN ('active', 'upcoming', 'judging'));

-- Users can participate in challenges
CREATE POLICY "Users can participate in challenges"
  ON challenge_participants FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Challenge submissions are publicly readable
CREATE POLICY "Challenge submissions are publicly readable"
  ON challenge_submissions FOR SELECT TO public
  USING (true);

-- Users can create submissions for their participations
CREATE POLICY "Users can create own submissions"
  ON challenge_submissions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM challenge_participants 
      WHERE challenge_participants.id = challenge_submissions.participant_id 
      AND challenge_participants.user_id = auth.uid()
    )
  );

-- Rewards are publicly readable
CREATE POLICY "Rewards are publicly readable"
  ON rewards FOR SELECT TO public
  USING (is_active = true);

-- Users can read their own rewards
CREATE POLICY "Users can read own rewards"
  ON user_rewards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Community posts are publicly readable
CREATE POLICY "Published community posts are publicly readable"
  ON community_posts FOR SELECT TO public
  USING (status = 'published');

-- Users can manage their own posts
CREATE POLICY "Users can manage own community posts"
  ON community_posts FOR ALL TO authenticated
  USING (auth.uid() = author_id);

-- Users can manage their own wardrobe
CREATE POLICY "Users can manage own wardrobe"
  ON user_wardrobes FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Premium content access based on subscription
CREATE POLICY "Premium content access for subscribers"
  ON premium_content FOR SELECT TO authenticated
  USING (
    status = 'published' AND (
      required_tier_id IS NULL OR
      EXISTS (
        SELECT 1 FROM user_subscriptions us
        JOIN subscription_tiers st ON us.tier_id = st.id
        WHERE us.user_id = auth.uid() 
        AND us.status = 'active'
        AND (us.tier_id = premium_content.required_tier_id OR st.sort_order >= (
          SELECT sort_order FROM subscription_tiers WHERE id = premium_content.required_tier_id
        ))
      )
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON subscription_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(is_featured);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge_id ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_participant_id ON challenge_submissions(participant_id);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);

CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_wardrobes_user_id ON user_wardrobes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wardrobes_product_id ON user_wardrobes(product_id);

CREATE INDEX IF NOT EXISTS idx_premium_content_tier_id ON premium_content(required_tier_id);
CREATE INDEX IF NOT EXISTS idx_premium_content_status ON premium_content(status);








/*
  # Insert Default Data for Social Commerce Features
  
  1. Default Data
     - Subscription tiers (Free, Premium, VIP)
     - Ad placements
     - Default rewards
     - Sample challenges
     - Hashtag categories
  
  2. Purpose
     - Bootstrap the social commerce features
     - Provide working examples
     - Enable immediate testing
*/

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, description, monthly_price, yearly_price, features, limits) VALUES
(
  'Free',
  'Basic access to community features',
  0.00,
  0.00,
  '{
    "wardrobe": false,
    "premium_content": false,
    "challenges": "basic",
    "ai_recommendations": "limited",
    "community_posts": true,
    "following": true,
    "max_follows": 100
  }',
  '{
    "max_wardrobe_items": 0,
    "max_premium_content": 0,
    "max_challenges_per_month": 2
  }'
),
(
  'Premium',
  'Enhanced features with wardrobe and premium content',
  9.99,
  99.99,
  '{
    "wardrobe": true,
    "premium_content": "standard",
    "challenges": "all",
    "ai_recommendations": "enhanced",
    "community_posts": true,
    "following": true,
    "priority_support": true,
    "max_follows": 1000
  }',
  '{
    "max_wardrobe_items": 500,
    "max_premium_content": "unlimited",
    "max_challenges_per_month": "unlimited"
  }'
),
(
  'VIP',
  'Ultimate experience with exclusive features',
  19.99,
  199.99,
  '{
    "wardrobe": true,
    "premium_content": "exclusive",
    "challenges": "all",
    "ai_recommendations": "premium",
    "community_posts": true,
    "following": true,
    "priority_support": true,
    "early_access": true,
    "exclusive_events": true,
    "personal_stylist": true,
    "max_follows": "unlimited"
  }',
  '{
    "max_wardrobe_items": "unlimited",
    "max_premium_content": "unlimited",
    "max_challenges_per_month": "unlimited"
  }'
)
ON CONFLICT (name) DO NOTHING;

-- Insert default ad placements
INSERT INTO ad_placements (name, description, placement_type, dimensions, max_file_size_mb, supported_formats, base_cpm, base_cpc) VALUES
('Homepage Banner', 'Main banner on homepage', 'homepage_banner', '{"width": 1200, "height": 400}', 5, '["image/jpeg", "image/png", "video/mp4"]', 2.50, 0.25),
('Product Feed', 'Sponsored products in feed', 'product_feed', '{"width": 300, "height": 300}', 2, '["image/jpeg", "image/png"]', 1.80, 0.20),
('Search Results', 'Ads in search results', 'search_results', '{"width": 250, "height": 250}', 1, '["image/jpeg", "image/png"]', 2.00, 0.30),
('Reel Feed', 'Video ads in reel feed', 'reel_feed', '{"width": 1080, "height": 1920}', 50, '["video/mp4", "video/webm"]', 3.00, 0.40),
('Sidebar', 'Side banner ads', 'sidebar', '{"width": 300, "height": 600}', 3, '["image/jpeg", "image/png", "video/mp4"]', 1.50, 0.15)
ON CONFLICT (name) DO NOTHING;

-- Insert default rewards
INSERT INTO rewards (name, description, reward_type, reward_value, rarity, requirements) VALUES
(
  'Welcome Points',
  'Points for joining the community',
  'points',
  '{"amount": 100}',
  'common',
  '{"action": "signup"}'
),
(
  'First Purchase Discount',
  '10% off first purchase',
  'coupon',
  '{"discount_type": "percentage", "discount_value": 10, "minimum_order": 50}',
  'common',
  '{"action": "first_purchase"}'
),
(
  'Style Influencer Badge',
  'Badge for style influencers',
  'badge',
  '{"badge_name": "Style Influencer", "icon_url": "/badges/style-influencer.png"}',
  'rare',
  '{"followers": 1000, "engagement_rate": 0.05}'
),
(
  'Challenge Winner',
  'Exclusive product for challenge winners',
  'product',
  '{"product_type": "exclusive", "value": 100}',
  'epic',
  '{"action": "challenge_winner"}'
),
(
  'Featured Profile',
  'Profile featured on homepage',
  'feature',
  '{"feature_type": "homepage_profile", "duration_days": 7}',
  'legendary',
  '{"action": "top_contributor"}'
)
ON CONFLICT (name) DO NOTHING;

-- Insert sample hashtag categories
INSERT INTO hashtags (tag, category, usage_count) VALUES
('#fashion', 'style', 0),
('#ootd', 'style', 0),
('#style', 'style', 0),
('#trending', 'general', 0),
('#sale', 'shopping', 0),
('#newcollection', 'shopping', 0),
('#sustainable', 'lifestyle', 0),
('#vintage', 'style', 0),
('#streetstyle', 'style', 0),
('#luxury', 'shopping', 0)
ON CONFLICT (tag) DO NOTHING;

-- Insert sample challenge
INSERT INTO challenges (
  title, 
  description, 
  challenge_type, 
  difficulty_level, 
  start_date, 
  end_date, 
  max_participants,
  entry_requirements,
  submission_requirements,
  judging_criteria,
  prizes,
  status,
  hashtags,
  rules
) VALUES (
  'Style Challenge: Sustainable Fashion',
  'Show us your best sustainable fashion looks using eco-friendly brands and vintage pieces',
  'style',
  'medium',
  now() + interval '1 day',
  now() + interval '30 days',
  1000,
  '{"subscription_tier": "any", "min_followers": 0}',
  '{"content_type": "reel", "min_duration": 15, "hashtags": ["#sustainable", "#fashion"]}',
  '{"creativity": 30, "sustainability": 40, "style": 30}',
  '{
    "first_place": {"type": "product", "value": 500, "description": "Sustainable fashion bundle"},
    "second_place": {"type": "coupon", "value": 200, "description": "$200 shopping credit"},
    "third_place": {"type": "coupon", "value": 100, "description": "$100 shopping credit"},
    "participation": {"type": "points", "value": 50, "description": "50 community points"}
  }',
  'upcoming',
  ARRAY['#sustainable', '#fashion', '#challenge'],
  'Create a reel showcasing sustainable fashion. Use eco-friendly brands or vintage pieces. Tag your post with #sustainable and #fashion. Be creative and authentic!'
)
ON CONFLICT (title) DO NOTHING;

-- Insert default personalization model
INSERT INTO personalization_models (
  model_name,
  model_version,
  model_type,
  algorithm,
  accuracy_score,
  is_active
) VALUES (
  'Product Recommendation Engine',
  'v1.0',
  'recommendation',
  'collaborative_filtering',
  0.75,
  true
)
ON CONFLICT (model_name, model_version) DO NOTHING;







/*
  # Database Optimizations for Horizontal Scaling
  
  1. Partitioning Setup
     - Time-based partitioning for metrics tables
     - User-based partitioning preparation
  
  2. Performance Indexes
     - Composite indexes for common query patterns
     - Partial indexes for filtered queries
  
  3. Materialized Views
     - Pre-computed aggregations for analytics
     - Refresh strategies for real-time data
  
  4. Scaling Preparation
     - Sharding-ready table structures
     - Cross-shard query optimization
*/

-- Enable partitioning extension
-- CREATE EXTENSION IF NOT EXISTS pg_partman;

-- =============================================
-- TIME-BASED PARTITIONING FOR METRICS TABLES
-- =============================================

-- Partition content_metrics by month
CREATE TABLE IF NOT EXISTS content_metrics_partitioned (
  LIKE content_metrics EXCLUDING CONSTRAINTS
) PARTITION BY RANGE (metric_date);

-- Drop existing primary key and unique constraint if they exist, to ensure idempotency
ALTER TABLE content_metrics_partitioned DROP CONSTRAINT IF EXISTS content_metrics_partitioned_pkey;
ALTER TABLE content_metrics_partitioned DROP CONSTRAINT IF EXISTS content_metrics_partitioned_content_type_content_id_metric_date_key;

-- Add primary key and unique constraint including the partitioning column
ALTER TABLE content_metrics_partitioned ADD PRIMARY KEY (id, metric_date);
ALTER TABLE content_metrics_partitioned ADD CONSTRAINT content_metrics_partitioned_content_type_content_id_metric_date_key UNIQUE (content_type, content_id, metric_date);


-- Partition ad_metrics by month
CREATE TABLE IF NOT EXISTS ad_metrics_partitioned (
  LIKE ad_metrics EXCLUDING CONSTRAINTS
) PARTITION BY RANGE (metric_date);

-- Drop existing primary key and unique constraint if they exist, to ensure idempotency
ALTER TABLE ad_metrics_partitioned DROP CONSTRAINT IF EXISTS ad_metrics_partitioned_pkey;
ALTER TABLE ad_metrics_partitioned DROP CONSTRAINT IF EXISTS ad_metrics_partitioned_campaign_id_creative_id_placement_id_metric_date_key;

-- Add primary key and unique constraint including the partitioning column
ALTER TABLE ad_metrics_partitioned ADD PRIMARY KEY (id, metric_date);
ALTER TABLE ad_metrics_partitioned ADD CONSTRAINT ad_metrics_partitioned_campaign_id_creative_id_placement_id_metric_date_key UNIQUE (campaign_id, creative_id, placement_id, metric_date);


-- =============================================
-- COMPOSITE INDEXES FOR CROSS-SHARD QUERIES
-- =============================================

-- -- User activity patterns (for sharding decisions)
-- CREATE INDEX CONCURRENTLY idx_users_activity_shard 
-- ON users (id, created_at, status) 
-- WHERE status = 'active';

-- -- Content access patterns
-- CREATE INDEX CONCURRENTLY idx_reels_creator_time 
-- ON reels (creator_id, created_at DESC, status) 
-- WHERE status = 'active';

-- CREATE INDEX CONCURRENTLY idx_live_streams_host_time 
-- ON live_streams (host_id, started_at DESC, status) 
-- WHERE status IN ('live', 'ended');

-- -- Social interaction patterns
-- CREATE INDEX CONCURRENTLY idx_user_follows_activity 
-- ON user_follows (follower_id, followed_at DESC, notification_enabled);

-- CREATE INDEX CONCURRENTLY idx_messages_conversation_time 
-- ON messages (conversation_id, created_at DESC, message_type);

-- -- Commerce patterns
-- CREATE INDEX CONCURRENTLY idx_orders_user_time 
-- ON orders (user_id, created_at DESC, status);

-- CREATE INDEX CONCURRENTLY idx_product_views_user_time 
-- ON product_views (user_id, created_at DESC);

-- =============================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- =============================================

-- Drop dependent views first
DROP VIEW IF EXISTS user_metrics_unified;
DROP VIEW IF EXISTS content_metrics_unified;
DROP VIEW IF EXISTS shard_distribution_analysis;
DROP VIEW IF EXISTS hot_partition_analysis;


-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS daily_user_engagement;
DROP MATERIALIZED VIEW IF EXISTS content_performance_summary;
DROP MATERIALIZED VIEW IF EXISTS seller_performance_summary;


-- Daily user engagement metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_user_engagement AS
SELECT 
  user_id,
  date_trunc('day', created_at)::date as activity_date,
  COUNT(*) as total_activities,
  COUNT(DISTINCT CASE WHEN activity_type = 'view' THEN content_id END) as unique_views,
  COUNT(DISTINCT CASE WHEN activity_type = 'like' THEN content_id END) as unique_likes,
  COUNT(DISTINCT CASE WHEN activity_type = 'share' THEN content_id END) as unique_shares,
  AVG(duration_seconds) as avg_engagement_duration
FROM user_activity_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, date_trunc('day', created_at);

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_user_engagement_unique 
ON daily_user_engagement (user_id, activity_date);

-- Content performance metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS content_performance_summary AS
SELECT 
  cm.content_type,
  cm.content_id,
  DATE_TRUNC('day', cm.metric_date) as date,
  SUM(cm.views) as total_views,
  SUM(cm.likes) as total_likes,
  SUM(cm.shares) as total_shares,
  SUM(cm.comments) as total_comments,
  AVG(cm.engagement_rate) as avg_engagement_rate,
  SUM(cm.revenue_generated) as total_revenue
FROM content_metrics cm
WHERE cm.metric_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY cm.content_type, cm.content_id, DATE_TRUNC('day', cm.metric_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_performance_unique 
ON content_performance_summary (content_type, content_id, date);

-- Seller performance metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS seller_performance_summary AS
SELECT 
  p.seller_id,
  DATE_TRUNC('day', o.created_at) as order_date,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as total_revenue,
  COUNT(DISTINCT oi.product_id) as unique_products_sold,
  SUM(oi.quantity) as total_items_sold,
  AVG(o.total_amount) as avg_order_value
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND o.status = 'delivered' -- Corrected from 'completed'
GROUP BY p.seller_id, DATE_TRUNC('day', o.created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_performance_unique 
ON seller_performance_summary (seller_id, order_date);

-- =============================================
-- SHARDING PREPARATION FUNCTIONS
-- =============================================

-- Function to determine shard for user-based tables
CREATE OR REPLACE FUNCTION get_user_shard(user_uuid uuid, shard_count integer DEFAULT 4)
RETURNS integer AS $$
BEGIN
  RETURN (hashtext(user_uuid::text) % shard_count);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine shard for time-based tables
CREATE OR REPLACE FUNCTION get_time_shard(timestamp_val timestamptz, shard_count integer DEFAULT 12)
RETURNS integer AS $$
BEGIN
  RETURN (EXTRACT(month FROM timestamp_val)::integer - 1) % shard_count;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- CROSS-SHARD QUERY OPTIMIZATION
-- =============================================

-- View for unified user metrics across potential shards
CREATE VIEW user_metrics_unified AS
SELECT 
  u.id as user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at,
  COALESCE(due.total_activities, 0) as daily_activities,
  COALESCE(due.unique_views, 0) as daily_views,
  COALESCE(due.unique_likes, 0) as daily_likes,
  get_user_shard(u.id) as shard_id
FROM users u
LEFT JOIN daily_user_engagement due ON u.id = due.user_id 
  AND due.activity_date = CURRENT_DATE;

-- View for content metrics across shards
CREATE VIEW content_metrics_unified AS
SELECT 
  cps.*,
  get_time_shard(cps.date::timestamptz) as time_shard_id,
  CASE 
    WHEN cps.content_type = 'reel' THEN 
      (SELECT creator_id FROM reels WHERE id = cps.content_id)
    WHEN cps.content_type = 'live_stream' THEN 
      (SELECT host_id FROM live_streams WHERE id = cps.content_id)
  END as creator_id
FROM content_performance_summary cps;

-- =============================================
-- MONITORING AND MAINTENANCE
-- =============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_user_engagement;
  REFRESH MATERIALIZED VIEW CONCURRENTLY content_performance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY seller_performance_summary;
  
  -- Log refresh completion
  INSERT INTO audit_logs (table_name, record_id, action, new_values)
  VALUES ('materialized_views', gen_random_uuid(), 'REFRESH', 
          jsonb_build_object('refreshed_at', now(), 'views', ARRAY['daily_user_engagement', 'content_performance_summary', 'seller_performance_summary']));
END;
$$ LANGUAGE plpgsql;

-- Schedule materialized view refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'SELECT refresh_analytics_views();');

-- =============================================
-- PERFORMANCE MONITORING QUERIES
-- =============================================

-- Query to check shard distribution
CREATE VIEW shard_distribution_analysis AS
SELECT 
  get_user_shard(id) as shard_id,
  COUNT(*) as user_count,
  MIN(created_at) as oldest_user,
  MAX(created_at) as newest_user,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM users) * 100, 2) as percentage
FROM users
GROUP BY get_user_shard(id)
ORDER BY shard_id;

-- Query to identify hot partitions
CREATE VIEW hot_partition_analysis AS
SELECT 
  schemaname,
  relname AS tablename, -- Corrected column name
  n_tup_ins + n_tup_upd + n_tup_del as total_operations,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  seq_scan + idx_scan as total_scans,
  ROUND((idx_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) * 100, 2) as index_usage_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND (n_tup_ins + n_tup_upd + n_tup_del) > 1000
ORDER BY total_operations DESC;

-- Create indexes on monitoring views
CREATE INDEX IF NOT EXISTS idx_shard_distribution_shard_id ON users (get_user_shard(id));

-- =============================================
-- CLEANUP AND MAINTENANCE PROCEDURES
-- =============================================

-- Function to clean old partitions
CREATE OR REPLACE FUNCTION cleanup_old_partitions(table_prefix text, months_to_keep integer DEFAULT 12)
RETURNS void AS $$
DECLARE
  partition_name text;
  cutoff_date date := CURRENT_DATE - (months_to_keep || ' months')::interval;
BEGIN
  FOR partition_name IN 
    SELECT schemaname||'.'||tablename 
    FROM pg_tables 
    WHERE tablename LIKE table_prefix || '_%'
      AND tablename < table_prefix || '_' || to_char(cutoff_date, 'YYYY_MM')
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
    RAISE NOTICE 'Dropped old partition: %', partition_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create future partitions
CREATE OR REPLACE FUNCTION create_future_partitions(table_name text, months_ahead integer DEFAULT 6)
RETURNS void AS $$
DECLARE
  start_date date;
  end_date date;
  partition_name text;
  i integer;
BEGIN
  start_date := date_trunc('month', CURRENT_DATE + interval '1 month');
  
  FOR i IN 1..months_ahead LOOP
    end_date := start_date + interval '1 month';
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I 
                    FOR VALUES FROM (%L) TO (%L)', 
                   partition_name, table_name || '_partitioned', start_date, end_date);
    
    start_date := end_date;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION get_user_shard(uuid, integer) IS 'Determines shard ID for user-based table partitioning';
COMMENT ON FUNCTION get_time_shard(timestamptz, integer) IS 'Determines shard ID for time-based table partitioning';
COMMENT ON FUNCTION refresh_analytics_views() IS 'Refreshes all materialized views for analytics';
COMMENT ON VIEW shard_distribution_analysis IS 'Analyzes user distribution across shards for load balancing';
COMMENT ON VIEW hot_partition_analysis IS 'Identifies high-activity tables and partitions';




/*
  # Final Horizontal Scaling Enhancements
  
  1. Sharding-Ready Table Structures
     - Add shard_id columns for efficient routing
     - Create shard-aware indexes
     - Implement cross-shard query optimization
  
  2. Event-Driven Architecture Support
     - Event sourcing tables for distributed consistency
     - Message queue integration tables
     - Distributed transaction coordination
  
  3. Cache-Friendly Denormalization
     - User summary tables for quick lookups
     - Product summary tables with key metrics
     - Content summary tables for feeds
  
  4. Cross-Shard Query Optimization
     - Federation-ready views
     - Aggregation tables for analytics
     - Distributed join optimization
*/

-- =============================================
-- SHARD-AWARE TABLE ENHANCEMENTS
-- =============================================

-- Add shard routing columns to key tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS shard_id INTEGER GENERATED ALWAYS AS (get_user_shard(id)) STORED;
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_shard_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_shard_id INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_shard_id INTEGER;
ALTER TABLE reels ADD COLUMN IF NOT EXISTS creator_shard_id INTEGER;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS host_shard_id INTEGER;

-- Update shard routing columns with existing data
UPDATE products SET user_shard_id = get_user_shard(seller_id) WHERE seller_id IS NOT NULL;
UPDATE orders SET user_shard_id = get_user_shard(user_id);
UPDATE messages SET sender_shard_id = get_user_shard(sender_id);
UPDATE reels SET creator_shard_id = get_user_shard(creator_id);
UPDATE live_streams SET host_shard_id = get_user_shard(host_id);

-- Create shard-aware indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_shard_id ON users(shard_id, id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_user_shard ON products(user_shard_id, id) WHERE user_shard_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_shard ON orders(user_shard_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_shard ON messages(sender_shard_id, conversation_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_shard ON reels(creator_shard_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_shard ON live_streams(host_shard_id, started_at DESC);

-- =============================================
-- EVENT SOURCING FOR DISTRIBUTED CONSISTENCY
-- =============================================

-- Event store for distributed transactions
CREATE TABLE IF NOT EXISTS event_store (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id uuid NOT NULL,
  aggregate_type varchar(50) NOT NULL,
  event_type varchar(100) NOT NULL,
  event_data jsonb NOT NULL,
  event_version integer NOT NULL,
  shard_id integer NOT NULL,
  correlation_id uuid,
  causation_id uuid,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- -- Create monthly partitions for event store
-- DO $$
-- DECLARE
--   start_date date := date_trunc('month', CURRENT_DATE);
--   end_date date;
--   partition_name text;
--   i integer;
-- BEGIN
--   FOR i IN 0..12 LOOP
--     end_date := start_date + interval '1 month';
--     partition_name := 'event_store_' || to_char(start_date, 'YYYY_MM');
    
--     EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF event_store 
--                     FOR VALUES FROM (%L) TO (%L)', 
--                    partition_name, start_date, end_date);
    
--     start_date := end_date;
--   END LOOP;
-- END $$;

-- Indexes for event store
CREATE INDEX IF NOT EXISTS idx_event_store_aggregate ON event_store(aggregate_type, aggregate_id, event_version);
CREATE INDEX IF NOT EXISTS idx_event_store_shard ON event_store(shard_id, created_at);
CREATE INDEX IF NOT EXISTS idx_event_store_correlation ON event_store(correlation_id) WHERE correlation_id IS NOT NULL;

-- =============================================
-- DENORMALIZED SUMMARY TABLES FOR PERFORMANCE
-- =============================================

-- User summary for cross-shard lookups
CREATE TABLE IF NOT EXISTS user_summaries (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  shard_id integer NOT NULL,
  email varchar(255) NOT NULL,
  full_name varchar(255),
  avatar_url text,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product summary for cross-shard queries
CREATE TABLE IF NOT EXISTS product_summaries (
  product_id uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  seller_shard_id integer,
  name varchar(255) NOT NULL,
  brand_name varchar(100),
  price numeric(10,2) NOT NULL,
  image_url text,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content summary for feeds
CREATE TABLE IF NOT EXISTS content_summaries (
  content_id uuid PRIMARY KEY,
  content_type varchar(20) NOT NULL,
  creator_id uuid NOT NULL,
  creator_shard_id integer NOT NULL,
  title varchar(255),
  thumbnail_url text,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  engagement_score numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for summary tables
CREATE INDEX IF NOT EXISTS idx_user_summaries_shard ON user_summaries(shard_id, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_summaries_shard ON product_summaries(seller_shard_id, created_at DESC) WHERE seller_shard_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_summaries_creator_shard ON content_summaries(creator_shard_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_summaries_engagement ON content_summaries(engagement_score DESC, created_at DESC);

-- =============================================
-- CROSS-SHARD FEDERATION VIEWS
-- =============================================

-- Federated user view for cross-shard queries
CREATE OR REPLACE VIEW user_federation AS
SELECT 
  us.*,
  u.status,
  u.email_verified,
  u.role_id
FROM user_summaries us
JOIN users u ON us.user_id = u.id;

-- Federated product view
CREATE OR REPLACE VIEW product_federation AS
SELECT 
  ps.*,
  p.status,
  p.category_id,
  p.stock_quantity
FROM product_summaries ps
JOIN products p ON ps.product_id = p.id
WHERE p.status = 'active';

-- Federated content view for feeds
CREATE OR REPLACE VIEW content_federation AS
SELECT 
  cs.*,
  CASE 
    WHEN cs.content_type = 'reel' THEN r.status
    WHEN cs.content_type = 'live_stream' THEN l.status
  END as content_status
FROM content_summaries cs
LEFT JOIN reels r ON cs.content_id = r.id AND cs.content_type = 'reel'
LEFT JOIN live_streams l ON cs.content_id = l.id AND cs.content_type = 'live_stream';

-- =============================================
-- DISTRIBUTED ANALYTICS AGGREGATION
-- =============================================

-- Shard-aware analytics aggregation
CREATE TABLE IF NOT EXISTS shard_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shard_id integer NOT NULL,
  metric_date date NOT NULL,
  metric_type varchar(50) NOT NULL,
  metric_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(shard_id, metric_date, metric_type)
);

-- Global analytics rollup
CREATE TABLE IF NOT EXISTS global_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  metric_type varchar(50) NOT NULL,
  aggregated_data jsonb NOT NULL,
  shard_count integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_date, metric_type)
);

-- =============================================
-- TRIGGERS FOR MAINTAINING SUMMARY TABLES
-- =============================================

-- Function to update user summaries
CREATE OR REPLACE FUNCTION update_user_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_summaries (
    user_id, shard_id, email, full_name, avatar_url, created_at, updated_at
  ) VALUES (
    NEW.id, 
    get_user_shard(NEW.id), 
    NEW.email, 
    NEW.first_name || ' ' || NEW.last_name,
    NULL, -- avatar_url to be updated separately
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update product summaries
CREATE OR REPLACE FUNCTION update_product_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_summaries (
    product_id, seller_shard_id, name, price, created_at, updated_at
  ) VALUES (
    NEW.id,
    CASE WHEN NEW.seller_id IS NOT NULL THEN get_user_shard(NEW.seller_id) ELSE NULL END,
    NEW.name,
    NEW.price,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (product_id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_user_summary ON users;
CREATE TRIGGER trigger_update_user_summary
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_user_summary();

DROP TRIGGER IF EXISTS trigger_update_product_summary ON products;
CREATE TRIGGER trigger_update_product_summary
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_summary();

-- =============================================
-- SHARDING UTILITY FUNCTIONS
-- =============================================

-- Function to get all shards for a query
CREATE OR REPLACE FUNCTION get_all_shards()
RETURNS integer[] AS $$
BEGIN
  RETURN ARRAY[0, 1, 2, 3]; -- 4 shards by default
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to route query to specific shard
CREATE OR REPLACE FUNCTION route_to_shard(entity_id uuid, shard_count integer DEFAULT 4)
RETURNS text AS $$
BEGIN
  RETURN 'shard_' || (get_user_shard(entity_id, shard_count))::text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function for cross-shard user lookup
CREATE OR REPLACE FUNCTION find_user_across_shards(search_email text)
RETURNS TABLE(user_id uuid, shard_id integer, email text, full_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT us.user_id, us.shard_id, us.email, us.full_name
  FROM user_summaries us
  WHERE us.email ILIKE search_email || '%'
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MONITORING AND HEALTH CHECKS
-- =============================================

-- Shard health monitoring
CREATE OR REPLACE VIEW shard_health AS
SELECT 
  shard_id,
  COUNT(*) as user_count,
  AVG(total_orders) as avg_orders_per_user,
  SUM(total_spent) as total_revenue,
  MAX(last_active_at) as last_activity,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM user_summaries) * 100, 2) as percentage_of_users
FROM user_summaries
GROUP BY shard_id
ORDER BY shard_id;

-- Cross-shard query performance monitoring
CREATE TABLE IF NOT EXISTS cross_shard_query_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_type varchar(100) NOT NULL,
  shards_involved integer[] NOT NULL,
  execution_time_ms integer NOT NULL,
  result_count integer,
  created_at timestamptz DEFAULT now()
);

-- Function to log cross-shard queries
CREATE OR REPLACE FUNCTION log_cross_shard_query(
  p_query_type text,
  p_shards integer[],
  p_execution_time integer,
  p_result_count integer DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO cross_shard_query_log (query_type, shards_involved, execution_time_ms, result_count)
  VALUES (p_query_type, p_shards, p_execution_time, p_result_count);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE event_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shard_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_shard_query_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for summary tables
DROP POLICY IF EXISTS "User summaries are publicly readable" ON user_summaries;
CREATE POLICY "User summaries are publicly readable" ON user_summaries FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Product summaries are publicly readable" ON product_summaries;
CREATE POLICY "Product summaries are publicly readable" ON product_summaries FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Content summaries are publicly readable" ON content_summaries;
CREATE POLICY "Content summaries are publicly readable" ON content_summaries FOR SELECT TO public USING (true);

-- Admin-only policies for monitoring tables
DROP POLICY IF EXISTS "Admin can read shard analytics" ON shard_analytics;
CREATE POLICY "Admin can read shard analytics" ON shard_analytics FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    JOIN roles ON users.role_id = roles.id
    WHERE users.id = auth.uid() 
    AND roles.name = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin can read global analytics" ON global_analytics;
CREATE POLICY "Admin can read global analytics" ON global_analytics FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    JOIN roles ON users.role_id = roles.id
    WHERE users.id = auth.uid() 
    AND roles.name = 'admin'
  )
);

-- Comments for documentation
COMMENT ON TABLE event_store IS 'Event sourcing store for distributed transaction consistency';
COMMENT ON TABLE user_summaries IS 'Denormalized user data for cross-shard queries';
COMMENT ON TABLE product_summaries IS 'Denormalized product data for cross-shard queries';
COMMENT ON TABLE content_summaries IS 'Denormalized content data for feed generation';
COMMENT ON TABLE shard_analytics IS 'Per-shard analytics aggregation';
COMMENT ON TABLE global_analytics IS 'Global analytics rollup across all shards';
COMMENT ON VIEW shard_health IS 'Monitor shard distribution and health';
COMMENT ON FUNCTION get_user_shard(uuid, integer) IS 'Determines target shard for user-related data';
COMMENT ON FUNCTION route_to_shard(uuid, integer) IS 'Returns shard identifier for query routing';






/*
  # Database Synchronization and Conflict Resolution
  
  1. Resolve Duplicate Tables
     - Drop duplicate table definitions
     - Consolidate overlapping functionality
     - Fix naming inconsistencies
  
  2. Fix Foreign Key References
     - Add missing foreign key constraints
     - Resolve circular dependencies
     - Update reference integrity
  
  3. Standardize Schema
     - Consistent naming conventions
     - Uniform data types
     - Proper indexing strategy
  
  4. Data Migration
     - Migrate data from duplicate tables
     - Preserve existing relationships
     - Maintain data integrity
*/

-- =============================================
-- RESOLVE DUPLICATE TABLE CONFLICTS
-- =============================================

-- Check if tables exist before operations
DO $$
BEGIN
  -- Handle live_streams conflicts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_streams_duplicate') THEN
    -- Migrate any data from duplicate table
    INSERT INTO live_streams (
      host_id, title, description, status, scheduled_at, started_at, ended_at,
      duration_seconds, max_concurrent_viewers, total_unique_viewers,
      featured_products, tags, created_at, updated_at
    )
    SELECT 
      host_id, title, description, status, scheduled_at, started_at, ended_at,
      duration_seconds, max_concurrent_viewers, total_unique_viewers,
      featured_products, tags, created_at, updated_at
    FROM live_streams_duplicate
    ON CONFLICT (id) DO NOTHING;
    
    DROP TABLE live_streams_duplicate;
  END IF;

  -- Handle reels conflicts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reels_duplicate') THEN
    INSERT INTO reels (
      creator_id, title, description, video_url, thumbnail_url, duration_seconds,
      status, featured_products, privacy_setting, created_at, updated_at
    )
    SELECT 
      creator_id, title, description, video_url, thumbnail_url, duration_seconds,
      status, featured_products, privacy_setting, created_at, updated_at
    FROM reels_duplicate
    ON CONFLICT (id) DO NOTHING;
    
    DROP TABLE reels_duplicate;
  END IF;
END $$;

-- =============================================
-- STANDARDIZE EXISTING TABLES
-- =============================================

-- Ensure consistent column types and constraints
DO $$
BEGIN
  -- Standardize user-related columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'live_streams' AND column_name = 'host_shard_id') THEN
    ALTER TABLE live_streams ADD COLUMN host_shard_id INTEGER;
    UPDATE live_streams SET host_shard_id = get_user_shard(host_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reels' AND column_name = 'creator_shard_id') THEN
    ALTER TABLE reels ADD COLUMN creator_shard_id INTEGER;
    UPDATE reels SET creator_shard_id = get_user_shard(creator_id);
  END IF;

  -- Ensure content_metrics table has proper structure
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'content_metrics' AND column_name = 'revenue_generated') THEN
    ALTER TABLE content_metrics ADD COLUMN revenue_generated NUMERIC(12,2) DEFAULT 0;
  END IF;
END $$;

-- =============================================
-- FIX MISSING FOREIGN KEY CONSTRAINTS
-- =============================================

-- Add missing foreign key constraints where tables exist
DO $$
BEGIN
  -- Fix conversation to group_purchase relationship
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_purchases') THEN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_conversations_group_purchase_id') THEN
      ALTER TABLE conversations 
      ADD CONSTRAINT fk_conversations_group_purchase_id 
      FOREIGN KEY (group_purchase_id) REFERENCES group_purchases(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- Fix reviews to orders relationship
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_reviews_order_id') THEN
      ALTER TABLE reviews 
      ADD CONSTRAINT fk_reviews_order_id 
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- Fix ad_campaigns to target_audience relationship
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ad_campaigns') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ad_audiences') THEN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_ad_campaigns_target_audience_id') THEN
      ALTER TABLE ad_campaigns 
      ADD CONSTRAINT fk_ad_campaigns_target_audience_id 
      FOREIGN KEY (target_audience_id) REFERENCES ad_audiences(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- =============================================
-- RESOLVE ENUM TYPE CONFLICTS
-- =============================================

-- Ensure all required enum types exist
DO $$
BEGIN
  -- Check and create missing enum types
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE content_status AS ENUM ('draft', 'active', 'archived', 'reported', 'removed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_setting') THEN
    CREATE TYPE privacy_setting AS ENUM ('public', 'followers', 'private');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_objective') THEN
    CREATE TYPE campaign_objective AS ENUM ('awareness', 'traffic', 'conversions', 'engagement');
  END IF;
END $$;

-- =============================================
-- CONSOLIDATE METRICS TABLES
-- =============================================

-- Create unified metrics view if multiple metrics tables exist
CREATE OR REPLACE VIEW unified_content_metrics AS
SELECT 
  'live_stream' as content_type,
  id as content_id,
  CURRENT_DATE as metric_date,
  total_unique_viewers as views,
  total_unique_viewers as unique_views,
  0 as likes,
  0 as shares,
  0 as comments,
  0 as saves,
  total_unique_viewers as reach,
  total_unique_viewers as impressions,
  0.0 as engagement_rate,
  duration_seconds as watch_time_seconds,
  duration_seconds as average_watch_time_seconds,
  1.0 as completion_rate,
  0.0 as click_through_rate,
  0.0 as conversion_rate,
  0.0 as revenue_generated,
  created_at,
  updated_at
FROM live_streams
WHERE status IN ('live', 'ended')

UNION ALL

SELECT 
  'reel' as content_type,
  id as content_id,
  CURRENT_DATE as metric_date,
  0 as views, -- Will be updated by actual metrics
  0 as unique_views,
  0 as likes,
  0 as shares,
  0 as comments,
  0 as saves,
  0 as reach,
  0 as impressions,
  0.0 as engagement_rate,
  duration_seconds as watch_time_seconds,
  duration_seconds as average_watch_time_seconds,
  1.0 as completion_rate,
  0.0 as click_through_rate,
  0.0 as conversion_rate,
  0.0 as revenue_generated,
  created_at,
  updated_at
FROM reels
WHERE status = 'active';

-- =============================================
-- STANDARDIZE INDEXES
-- =============================================

-- Create consistent indexes across similar tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_shard 
ON live_streams(host_shard_id, started_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_shard 
ON reels(creator_shard_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_interactions_content_user 
ON content_interactions(content_type, content_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_both_directions 
ON user_follows(follower_id, following_id, followed_at DESC);

-- =============================================
-- UPDATE RLS POLICIES FOR CONSISTENCY
-- =============================================

-- Ensure consistent RLS policies across similar tables
DO $$
BEGIN
  -- Update live_streams policies
  DROP POLICY IF EXISTS "Live streams are publicly readable when active" ON live_streams;
  CREATE POLICY "Live streams are publicly readable when active"
    ON live_streams FOR SELECT TO public
    USING (status IN ('live', 'ended'));

  DROP POLICY IF EXISTS "Hosts can manage own live streams" ON live_streams;
  CREATE POLICY "Hosts can manage own live streams"
    ON live_streams FOR ALL TO authenticated
    USING (auth.uid() = host_id);

  -- Update reels policies
  DROP POLICY IF EXISTS "Public reels are readable" ON reels;
  CREATE POLICY "Public reels are readable"
    ON reels FOR SELECT TO public
    USING (privacy_setting = 'public' AND status = 'active');

  DROP POLICY IF EXISTS "Creators can manage own reels" ON reels;
  CREATE POLICY "Creators can manage own reels"
    ON reels FOR ALL TO authenticated
    USING (auth.uid() = creator_id);
END $$;

-- =============================================
-- DATA INTEGRITY CHECKS AND FIXES
-- =============================================

-- Function to check and fix data integrity
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(table_name text, issue_type text, issue_count bigint) AS $$
BEGIN
  RETURN QUERY
  -- Check for orphaned records
  SELECT 'live_streams'::text, 'orphaned_host'::text, 
         COUNT(*) FROM live_streams ls 
         LEFT JOIN users u ON ls.host_id = u.id 
         WHERE u.id IS NULL
  UNION ALL
  SELECT 'reels'::text, 'orphaned_creator'::text, 
         COUNT(*) FROM reels r 
         LEFT JOIN users u ON r.creator_id = u.id 
         WHERE u.id IS NULL
  UNION ALL
  SELECT 'content_interactions'::text, 'orphaned_user'::text, 
         COUNT(*) FROM content_interactions ci 
         LEFT JOIN users u ON ci.user_id = u.id 
         WHERE u.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETION LOG
-- =============================================

-- Log the synchronization completion
INSERT INTO audit_logs (table_name, record_id, action, new_values, created_at)
VALUES (
  'database_sync',
  gen_random_uuid(),
  'UPDATE', -- Changed from 'SYNC_COMPLETED' to 'UPDATE'
  jsonb_build_object(
    'sync_type', 'conflict_resolution',
    'tables_affected', ARRAY[
      'live_streams', 'reels', 'content_metrics', 'ad_campaigns',
      'content_interactions', 'user_follows', 'conversations'
    ],
    'conflicts_resolved', ARRAY[
      'duplicate_tables', 'missing_foreign_keys', 'inconsistent_columns',
      'enum_types', 'rls_policies', 'indexes'
    ],
    'completion_time', now()
  ),
  now()
);

-- Add helpful comments
COMMENT ON VIEW unified_content_metrics IS 'Consolidated view of all content metrics across live streams and reels';
COMMENT ON FUNCTION check_data_integrity() IS 'Checks for data integrity issues across related tables';





/*
  # Database Synchronization and Conflict Resolution
  
  1. Resolve Duplicate Tables
     - Drop duplicate table definitions
     - Consolidate overlapping functionality
     - Fix naming inconsistencies
  
  2. Fix Foreign Key References
     - Add missing foreign key constraints
     - Resolve circular dependencies
     - Update reference integrity
  
  3. Standardize Schema
     - Consistent naming conventions
     - Uniform data types
     - Proper indexing strategy
  
  4. Data Migration
     - Migrate data from duplicate tables
     - Preserve existing relationships
     - Maintain data integrity
*/

-- =============================================
-- RESOLVE DUPLICATE TABLE CONFLICTS
-- =============================================

-- Check if tables exist before operations
DO $$
BEGIN
  -- Handle live_streams conflicts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_streams_duplicate') THEN
    -- Migrate any data from duplicate table
    INSERT INTO live_streams (
      host_id, title, description, status, scheduled_at, started_at, ended_at,
      duration_seconds, max_concurrent_viewers, total_unique_viewers,
      featured_products, tags, created_at, updated_at
    )
    SELECT 
      host_id, title, description, status, scheduled_at, started_at, ended_at,
      duration_seconds, max_concurrent_viewers, total_unique_viewers,
      featured_products, tags, created_at, updated_at
    FROM live_streams_duplicate
    ON CONFLICT (id) DO NOTHING;
    
    DROP TABLE live_streams_duplicate;
  END IF;

  -- Handle reels conflicts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reels_duplicate') THEN
    INSERT INTO reels (
      creator_id, title, description, video_url, thumbnail_url, duration_seconds,
      status, featured_products, privacy_setting, created_at, updated_at
    )
    SELECT 
      creator_id, title, description, video_url, thumbnail_url, duration_seconds,
      status, featured_products, privacy_setting, created_at, updated_at
    FROM reels_duplicate
    ON CONFLICT (id) DO NOTHING;
    
    DROP TABLE reels_duplicate;
  END IF;
END $$;

-- =============================================
-- STANDARDIZE EXISTING TABLES
-- =============================================

-- Ensure consistent column types and constraints
DO $$
BEGIN
  -- Standardize user-related columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'live_streams' AND column_name = 'host_shard_id') THEN
    ALTER TABLE live_streams ADD COLUMN host_shard_id INTEGER;
    UPDATE live_streams SET host_shard_id = get_user_shard(host_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reels' AND column_name = 'creator_shard_id') THEN
    ALTER TABLE reels ADD COLUMN creator_shard_id INTEGER;
    UPDATE reels SET creator_shard_id = get_user_shard(creator_id);
  END IF;

  -- Ensure content_metrics table has proper structure
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'content_metrics' AND column_name = 'revenue_generated') THEN
    ALTER TABLE content_metrics ADD COLUMN revenue_generated NUMERIC(12,2) DEFAULT 0;
  END IF;
END $$;

-- =============================================
-- FIX MISSING FOREIGN KEY CONSTRAINTS
-- =============================================

-- Add missing foreign key constraints where tables exist
DO $$
BEGIN
  -- Fix conversation to group_purchase relationship
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_purchases') THEN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_conversations_group_purchase_id') THEN
      ALTER TABLE conversations 
      ADD CONSTRAINT fk_conversations_group_purchase_id 
      FOREIGN KEY (group_purchase_id) REFERENCES group_purchases(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- Fix reviews to orders relationship
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_reviews_order_id') THEN
      ALTER TABLE reviews 
      ADD CONSTRAINT fk_reviews_order_id 
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- Fix ad_campaigns to target_audience relationship
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ad_campaigns') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ad_audiences') THEN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_ad_campaigns_target_audience_id') THEN
      ALTER TABLE ad_campaigns 
      ADD CONSTRAINT fk_ad_campaigns_target_audience_id 
      FOREIGN KEY (target_audience_id) REFERENCES ad_audiences(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- =============================================
-- RESOLVE ENUM TYPE CONFLICTS
-- =============================================

-- Ensure all required enum types exist
DO $$
BEGIN
  -- Check and create missing enum types
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE content_status AS ENUM ('draft', 'active', 'archived', 'reported', 'removed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_setting') THEN
    CREATE TYPE privacy_setting AS ENUM ('public', 'followers', 'private');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_objective') THEN
    CREATE TYPE campaign_objective AS ENUM ('awareness', 'traffic', 'conversions', 'engagement');
  END IF;
END $$;

-- =============================================
-- CONSOLIDATE METRICS TABLES
-- =============================================

-- Create unified metrics view if multiple metrics tables exist
CREATE OR REPLACE VIEW unified_content_metrics AS
SELECT 
  'live_stream' as content_type,
  id as content_id,
  CURRENT_DATE as metric_date,
  total_unique_viewers as views,
  total_unique_viewers as unique_views,
  0 as likes,
  0 as shares,
  0 as comments,
  0 as saves,
  total_unique_viewers as reach,
  total_unique_viewers as impressions,
  0.0 as engagement_rate,
  duration_seconds as watch_time_seconds,
  duration_seconds as average_watch_time_seconds,
  1.0 as completion_rate,
  0.0 as click_through_rate,
  0.0 as conversion_rate,
  0.0 as revenue_generated,
  created_at,
  updated_at
FROM live_streams
WHERE status IN ('live', 'ended')

UNION ALL

SELECT 
  'reel' as content_type,
  id as content_id,
  CURRENT_DATE as metric_date,
  0 as views, -- Will be updated by actual metrics
  0 as unique_views,
  0 as likes,
  0 as shares,
  0 as comments,
  0 as saves,
  0 as reach,
  0 as impressions,
  0.0 as engagement_rate,
  duration_seconds as watch_time_seconds,
  duration_seconds as average_watch_time_seconds,
  1.0 as completion_rate,
  0.0 as click_through_rate,
  0.0 as conversion_rate,
  0.0 as revenue_generated,
  created_at,
  updated_at
FROM reels
WHERE status = 'active';

-- =============================================
-- STANDARDIZE INDEXES
-- =============================================

-- Create consistent indexes across similar tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_shard 
ON live_streams(host_shard_id, started_at DESC) WHERE host_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_shard 
ON reels(creator_shard_id, created_at DESC) WHERE creator_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_interactions_content_user 
ON content_interactions(content_type, content_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_both_directions 
ON user_follows(follower_id, following_id, followed_at DESC);

-- =============================================
-- UPDATE RLS POLICIES FOR CONSISTENCY
-- =============================================

-- Ensure consistent RLS policies across similar tables
DO $$
BEGIN
  -- Update live_streams policies
  DROP POLICY IF EXISTS "Live streams are publicly readable when active" ON live_streams;
  CREATE POLICY "Live streams are publicly readable when active"
    ON live_streams FOR SELECT TO public
    USING (status IN ('live', 'ended'));

  DROP POLICY IF EXISTS "Hosts can manage own live streams" ON live_streams;
  CREATE POLICY "Hosts can manage own live streams"
    ON live_streams FOR ALL TO authenticated
    USING (auth.uid() = host_id);

  -- Update reels policies
  DROP POLICY IF EXISTS "Public reels are readable" ON reels;
  CREATE POLICY "Public reels are readable"
    ON reels FOR SELECT TO public
    USING (privacy_setting = 'public' AND status = 'active');

  DROP POLICY IF EXISTS "Creators can manage own reels" ON reels;
  CREATE POLICY "Creators can manage own reels"
    ON reels FOR ALL TO authenticated
    USING (auth.uid() = creator_id);
END $$;

-- =============================================
-- DATA INTEGRITY CHECKS AND FIXES
-- =============================================

-- Function to check and fix data integrity
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(table_name text, issue_type text, issue_count bigint) AS $$
BEGIN
  RETURN QUERY
  -- Check for orphaned records
  SELECT 'live_streams'::text, 'orphaned_host'::text, 
         COUNT(*) FROM live_streams ls 
         LEFT JOIN users u ON ls.host_id = u.id 
         WHERE u.id IS NULL
  UNION ALL
  SELECT 'reels'::text, 'orphaned_creator'::text, 
         COUNT(*) FROM reels r 
         LEFT JOIN users u ON r.creator_id = u.id 
         WHERE u.id IS NULL
  UNION ALL
  SELECT 'content_interactions'::text, 'orphaned_user'::text, 
         COUNT(*) FROM content_interactions ci 
         LEFT JOIN users u ON ci.user_id = u.id 
         WHERE u.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETION LOG
-- =============================================

-- Log the synchronization completion
INSERT INTO audit_logs (table_name, record_id, action, new_values, created_at)
VALUES (
  'database_sync',
  gen_random_uuid(),
  'SYNC_COMPLETED',
  jsonb_build_object(
    'sync_type', 'conflict_resolution',
    'tables_affected', ARRAY[
      'live_streams', 'reels', 'content_metrics', 'ad_campaigns',
      'content_interactions', 'user_follows', 'conversations'
    ],
    'conflicts_resolved', ARRAY[
      'duplicate_tables', 'missing_foreign_keys', 'inconsistent_columns',
      'enum_types', 'rls_policies', 'indexes'
    ],
    'completion_time', now()
  ),
  now()
);

-- Add helpful comments
COMMENT ON VIEW unified_content_metrics IS 'Consolidated view of all content metrics across live streams and reels';
COMMENT ON FUNCTION check_data_integrity() IS 'Checks for data integrity issues across related tables';






-- Database Setup Verification Script
-- Run this after all migrations to verify everything is working correctly

-- =============================================
-- 1. CHECK ALL CORE TABLES EXIST
-- =============================================

DO $$
DECLARE
    missing_tables text[] := ARRAY[]::text[];
    required_tables text[] := ARRAY[
        'roles', 'users', 'categories', 'brands', 'products', 'product_variants',
        'orders', 'order_items', 'payments', 'reviews', 'cart_items',
        'live_streams', 'reels', 'conversations', 'messages', 'user_follows',
        'challenges', 'user_subscriptions', 'ad_campaigns', 'content_metrics'
    ];
    req_table text;
BEGIN
    FOREACH req_table IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.tables ist
            WHERE ist.table_schema = 'public' 
              AND ist.table_name = req_table
        ) THEN
            missing_tables := array_append(missing_tables, req_table);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '⚠️ MISSING TABLES: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ ALL CORE TABLES EXIST';
    END IF;
END $$;

-- =============================================
-- 2. CHECK ENUM TYPES (LIST MISSING)
-- =============================================

WITH required_enums AS (
    SELECT unnest(ARRAY[
        'order_status', 'payment_status', 'product_status', 'user_status',
        'discount_type', 'notification_type', 'subscription_status', 'refund_reason'
    ]) AS enum_name
)
SELECT 
    e.enum_name,
    CASE WHEN t.typname IS NULL THEN 'MISSING' ELSE 'OK' END as status
FROM required_enums e
LEFT JOIN pg_type t ON t.typname = e.enum_name;

-- =============================================
-- 3. CHECK FOREIGN KEY CONSTRAINTS (LIST)
-- =============================================

SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
ORDER BY table_name;

-- Quick summary count
SELECT 
    COUNT(*) as total_foreign_keys,
    CASE 
        WHEN COUNT(*) >= 50 THEN '✅ FOREIGN KEYS PROPERLY SET'
        ELSE '⚠️ SOME FOREIGN KEYS MISSING'
    END as fk_status
FROM pg_constraint
WHERE contype = 'f';

-- =============================================
-- 4. CHECK RLS POLICIES
-- =============================================

SELECT 
    schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';

SELECT 
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) >= 30 THEN '✅ RLS POLICIES CONFIGURED'
        ELSE '⚠️ SOME RLS POLICIES MISSING'
    END as rls_status
FROM pg_policies
WHERE schemaname = 'public';

-- =============================================
-- 5. CHECK INDEXES FOR PERFORMANCE
-- =============================================

SELECT 
    tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT 
    COUNT(*) as total_indexes,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PERFORMANCE INDEXES CREATED'
        ELSE '⚠️ SOME INDEXES MISSING'
    END as index_status
FROM pg_indexes
WHERE schemaname = 'public';

-- =============================================
-- 6. CHECK PARTITIONED TABLES
-- =============================================

SELECT 
    relname as partitioned_table
FROM pg_class
WHERE relkind = 'p';

-- =============================================
-- 7. CHECK MATERIALIZED VIEWS
-- =============================================

SELECT 
    matviewname, schemaname, definition
FROM pg_matviews
WHERE schemaname = 'public';

-- =============================================
-- 8. CHECK SCALING FUNCTIONS
-- =============================================

WITH required_functions AS (
    SELECT unnest(ARRAY[
        'get_user_shard', 'get_consistent_shard', 'refresh_analytics_views'
    ]) AS func_name
)
SELECT 
    f.func_name,
    CASE WHEN p.proname IS NULL THEN 'MISSING' ELSE 'OK' END as status
FROM required_functions f
LEFT JOIN pg_proc p ON p.proname = f.func_name
JOIN pg_namespace n ON p.pronamespace = n.oid AND n.nspname = 'public';

-- =============================================
-- 9. SAMPLE DATA CHECK (LIST COUNTS)
-- =============================================

SELECT 
    (SELECT COUNT(*) FROM roles) as roles_count,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM brands) as brands_count,
    (SELECT COUNT(*) FROM subscription_tiers) as tiers_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM roles) >= 3 
         AND (SELECT COUNT(*) FROM categories) > 0
         AND (SELECT COUNT(*) FROM brands) > 0
        THEN '✅ SAMPLE DATA LOADED'
        ELSE '⚠️ SAMPLE DATA MISSING'
    END as sample_data_status;

-- =============================================
-- 10. FINAL STATUS SUMMARY
-- =============================================

SELECT 
    '🚀 DATABASE SETUP VERIFICATION COMPLETE' as status,
    now() as verified_at,
    'Run individual checks above to see detailed status' as note;

-- =============================================
-- BONUS: QUICK PERFORMANCE TEST
-- =============================================

-- Test a complex query to verify performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    u.email,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT p.id) as products_viewed,
    AVG(o.total_amount) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN product_views pv ON u.id = pv.user_id
LEFT JOIN products p ON pv.product_id = p.id
WHERE u.created_at >= now() - interval '30 days'
GROUP BY u.id, u.email
ORDER BY total_orders DESC
LIMIT 10;






/*
  # Fix Missing Unique Constraints for ON CONFLICT
  
  1. Problem
     - ON CONFLICT clauses in purple_lab.sql fail because tables lack UNIQUE constraints
     - shipping_methods.code needs UNIQUE constraint
     - faqs.question needs UNIQUE constraint  
     - loyalty_programs.name needs UNIQUE constraint
  
  2. Solution
     - Add missing UNIQUE constraints to existing tables
     - This enables ON CONFLICT clauses to work properly
  
  3. Tables Fixed
     - shipping_methods: Add UNIQUE constraint on code
     - faqs: Add UNIQUE constraint on question
     - loyalty_programs: Add UNIQUE constraint on name
*/

-- Add missing UNIQUE constraints

-- Fix shipping_methods table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipping_methods') THEN
    -- Add UNIQUE constraint to code column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'shipping_methods' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name LIKE '%code%'
    ) THEN
      ALTER TABLE shipping_methods ADD CONSTRAINT shipping_methods_code_unique UNIQUE (code);
    END IF;
  END IF;
END $$;

-- Fix faqs table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faqs') THEN
    -- Add UNIQUE constraint to question column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'faqs' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name LIKE '%question%'
    ) THEN
      ALTER TABLE faqs ADD CONSTRAINT faqs_question_unique UNIQUE (question);
    END IF;
  END IF;
END $$;

-- Fix loyalty_programs table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loyalty_programs') THEN
    -- Add UNIQUE constraint to name column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'loyalty_programs' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name LIKE '%name%'
    ) THEN
      ALTER TABLE loyalty_programs ADD CONSTRAINT loyalty_programs_name_unique UNIQUE (name);
    END IF;
  END IF;
END $$;

-- Verify constraints were added
DO $$
DECLARE
  constraints_added integer := 0;
BEGIN
  -- Count the constraints we just added
  SELECT COUNT(*) INTO constraints_added
  FROM information_schema.table_constraints 
  WHERE constraint_name IN (
    'shipping_methods_code_unique',
    'faqs_question_unique', 
    'loyalty_programs_name_unique'
  );
  
  RAISE NOTICE 'Added % unique constraints for ON CONFLICT support', constraints_added;
END $$;





/*
  # Social Media Features - Live Streams & Reels (FIXED VERSION)
  
  1. New Tables
     - `live_streams` - Live streaming sessions by sellers/brands
     - `reels` - Short video content by sellers/brands and customers
     - `content_metrics` - Unified metrics tracking for all content types
     - `content_interactions` - Likes, shares, comments on content
     - `content_hashtags` - Hashtag management and tracking
     - `content_product_links` - Product references in content
  
  2. Features
     - Live streaming with real-time metrics
     - Reels with engagement tracking
     - Unified content interaction system
     - Hashtag and product linking
     - Performance analytics
*/

-- Live streaming sessions
CREATE TABLE IF NOT EXISTS live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  thumbnail_url text,
  stream_url text,
  status varchar(20) DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  max_concurrent_viewers integer DEFAULT 0,
  total_unique_viewers integer DEFAULT 0,
  is_recorded boolean DEFAULT true,
  recording_url text,
  featured_products uuid[], -- Array of product IDs
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Short video content (reels)
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255),
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  aspect_ratio varchar(10) DEFAULT '9:16', -- '9:16', '1:1', '16:9'
  resolution varchar(20), -- '1080x1920', '720x1280', etc.
  file_size_bytes bigint,
  status varchar(20) DEFAULT 'active', -- 'active', 'archived', 'reported', 'removed'
  is_featured boolean DEFAULT false,
  featured_products uuid[], -- Array of product IDs
  music_track varchar(255),
  music_start_time integer DEFAULT 0,
  effects_used text[],
  filters_applied text[],
  location varchar(255),
  privacy_setting varchar(20) DEFAULT 'public', -- 'public', 'followers', 'private'
  allow_comments boolean DEFAULT true,
  allow_duets boolean DEFAULT true,
  allow_downloads boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unified content metrics for lives and reels
CREATE TABLE IF NOT EXISTS content_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  metric_date date NOT NULL,
  views integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  likes integer DEFAULT 0,
  shares integer DEFAULT 0,
  comments integer DEFAULT 0,
  saves integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement_rate numeric(5,4) DEFAULT 0,
  watch_time_seconds bigint DEFAULT 0,
  average_watch_time_seconds integer DEFAULT 0,
  completion_rate numeric(5,4) DEFAULT 0,
  click_through_rate numeric(5,4) DEFAULT 0,
  conversion_rate numeric(5,4) DEFAULT 0,
  revenue_generated numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, metric_date)
);

-- Content interactions (likes, shares, comments) - FIXED VERSION
CREATE TABLE IF NOT EXISTS content_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  interaction_type varchar(20) NOT NULL, -- 'like', 'share', 'comment', 'save', 'report'
  comment_text text,
  parent_comment_id uuid REFERENCES content_interactions(id),
  reaction_emoji varchar(10), -- For emoji reactions
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create the partial unique index separately (correct PostgreSQL syntax)
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_interactions_unique_likes_saves 
ON content_interactions(user_id, content_type, content_id, interaction_type) 
WHERE interaction_type IN ('like', 'save');

-- Hashtag management
CREATE TABLE IF NOT EXISTS hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag varchar(100) NOT NULL UNIQUE,
  usage_count integer DEFAULT 0,
  trending_score numeric(10,2) DEFAULT 0,
  category varchar(50),
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content hashtag relationships
CREATE TABLE IF NOT EXISTS content_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  hashtag_id uuid NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, hashtag_id)
);

-- Product links in content
CREATE TABLE IF NOT EXISTS content_product_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(20) NOT NULL, -- 'live_stream', 'reel'
  content_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  link_type varchar(20) DEFAULT 'featured', -- 'featured', 'mentioned', 'tagged'
  timestamp_seconds integer, -- For video content, when product appears
  position_data jsonb, -- For positioning overlays
  click_count integer DEFAULT 0,
  conversion_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, product_id)
);

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_product_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Live streams - public readable when live/ended, creators can manage own
CREATE POLICY "Live streams are publicly readable when active"
  ON live_streams FOR SELECT TO public
  USING (status IN ('live', 'ended'));

CREATE POLICY "Hosts can manage own live streams"
  ON live_streams FOR ALL TO authenticated
  USING (auth.uid() = host_id);

-- Reels - public readable based on privacy, creators can manage own
CREATE POLICY "Public reels are readable"
  ON reels FOR SELECT TO public
  USING (privacy_setting = 'public' AND status = 'active');

CREATE POLICY "Creators can manage own reels"
  ON reels FOR ALL TO authenticated
  USING (auth.uid() = creator_id);

-- Content interactions - users can interact and read interactions
CREATE POLICY "Users can read content interactions"
  ON content_interactions FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can create interactions"
  ON content_interactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON content_interactions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Hashtags are publicly readable
CREATE POLICY "Hashtags are publicly readable"
  ON hashtags FOR SELECT TO public
  USING (NOT is_banned);

-- Content metrics readable by content creators and admins
CREATE POLICY "Content creators can read own metrics"
  ON content_metrics FOR SELECT TO authenticated
  USING (
    (content_type = 'live_stream' AND EXISTS (
      SELECT 1 FROM live_streams WHERE id = content_metrics.content_id AND host_id = auth.uid()
    )) OR
    (content_type = 'reel' AND EXISTS (
      SELECT 1 FROM reels WHERE id = content_metrics.content_id AND creator_id = auth.uid()
    ))
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_streams_host_id ON live_streams(host_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled_at ON live_streams(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_live_streams_started_at ON live_streams(started_at);

CREATE INDEX IF NOT EXISTS idx_reels_creator_id ON reels(creator_id);
CREATE INDEX IF NOT EXISTS idx_reels_status ON reels(status);
CREATE INDEX IF NOT EXISTS idx_reels_privacy_setting ON reels(privacy_setting);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_is_featured ON reels(is_featured);

CREATE INDEX IF NOT EXISTS idx_content_metrics_content ON content_metrics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_date ON content_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_content_interactions_content ON content_interactions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_user ON content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_type ON content_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON hashtags(trending_score DESC);

CREATE INDEX IF NOT EXISTS idx_content_hashtags_content ON content_hashtags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_hashtags_hashtag ON content_hashtags(hashtag_id);

CREATE INDEX IF NOT EXISTS idx_content_product_links_content ON content_product_links(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_product_links_product ON content_product_links(product_id);




/*
  # Concurrent Index Creation (Run After Main Migrations)
  
  This file contains all CREATE INDEX CONCURRENTLY statements that need to be
  run outside of transaction blocks. Execute this after all other migrations
  have completed successfully.
  
  IMPORTANT: Run each statement individually, not as a batch!
*/

-- From tender_marsh.sql - User activity patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_activity_shard 
ON users (id, created_at, status) 
WHERE status = 'active';

-- Content access patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_time 
ON reels (creator_id, created_at DESC, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_time 
ON live_streams (host_id, started_at DESC, status) 
WHERE status IN ('live', 'ended');

-- Social interaction patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_activity 
ON user_follows (follower_id, followed_at DESC, notification_enabled);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_time 
ON messages (conversation_id, created_at DESC, message_type);

-- Commerce patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_time 
ON orders (user_id, created_at DESC, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_user_time 
ON product_views (user_id, created_at DESC);

-- From snowy_term.sql - Shard-aware indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_shard_id 
ON users(shard_id, id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_user_shard 
ON products(user_shard_id, id) 
WHERE user_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_shard 
ON orders(user_shard_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_shard 
ON messages(sender_shard_id, conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_shard 
ON reels(creator_shard_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_shard 
ON live_streams(host_shard_id, started_at DESC);

-- From heavy_fountain.sql - Standardized indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_shard_status 
ON live_streams(host_shard_id, started_at DESC) 
WHERE host_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_shard_status 
ON reels(creator_shard_id, created_at DESC) 
WHERE creator_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_interactions_content_user 
ON content_interactions(content_type, content_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_both_directions 
ON user_follows(follower_id, following_id, followed_at DESC);





/*
  # Concurrent Index Creation (Run After All Migrations)
  
  IMPORTANT: This file contains CREATE INDEX CONCURRENTLY statements that must be
  run OUTSIDE of transaction blocks. 
  
  INSTRUCTIONS:
  1. First, run all other migrations normally
  2. Then, run each statement below individually in Supabase SQL Editor
  3. Do NOT run this entire file at once - run each CREATE INDEX statement separately
*/

-- =============================================
-- CONCURRENT INDEXES FROM TENDER_MARSH.SQL
-- =============================================

-- User activity patterns (for sharding decisions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_activity_shard 
ON users (id, created_at, status) 
WHERE status = 'active';

-- Content access patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_time 
ON reels (creator_id, created_at DESC, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_time 
ON live_streams (host_id, started_at DESC, status) 
WHERE status IN ('live', 'ended');

-- Social interaction patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_activity 
ON user_follows (follower_id, followed_at DESC, notification_enabled);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_time 
ON messages (conversation_id, created_at DESC, message_type);

-- Commerce patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_time 
ON orders (user_id, created_at DESC, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_user_time 
ON product_views (user_id, created_at DESC);

-- =============================================
-- CONCURRENT INDEXES FROM SNOWY_TERM.SQL
-- =============================================

-- Shard-aware indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_shard_id 
ON users(shard_id, id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_user_shard 
ON products(user_shard_id, id) 
WHERE user_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_shard 
ON orders(user_shard_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_shard 
ON messages(sender_shard_id, conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_shard 
ON reels(creator_shard_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_shard 
ON live_streams(host_shard_id, started_at DESC);

-- =============================================
-- CONCURRENT INDEXES FROM HEAVY_FOUNTAIN.SQL
-- =============================================

-- Standardized indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_streams_host_shard_status 
ON live_streams(host_shard_id, started_at DESC) 
WHERE host_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reels_creator_shard_status 
ON reels(creator_shard_id, created_at DESC) 
WHERE creator_shard_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_interactions_content_user 
ON content_interactions(content_type, content_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_both_directions 
ON user_follows(follower_id, following_id, followed_at DESC);

-- =============================================
-- CONCURRENT INDEXES FROM GENTLE_COTTAGE.SQL
-- =============================================

-- Additional performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_distribution_shard_id 
ON users (get_user_shard(id));





-- Function to create future monthly partitions for a given table
CREATE OR REPLACE FUNCTION create_future_monthly_partitions(
  parent_table_name text,
  control_column text,
  months_ahead integer DEFAULT 6
)
RETURNS void AS $$
DECLARE
  start_date date;
  end_date date;
  partition_name text;
  i integer;
BEGIN
  -- Start from the next month
  start_date := date_trunc('month', CURRENT_DATE + interval '1 month');
  
  FOR i IN 1..months_ahead LOOP
    end_date := start_date + interval '1 month';
    partition_name := parent_table_name || '_' || to_char(start_date, 'YYYY_MM');
    
    -- Check if the partition already exists before creating
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
      EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)', 
                     partition_name, parent_table_name, start_date, end_date);
      RAISE NOTICE 'Created partition: %', partition_name;
    END IF;
    
    start_date := end_date;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to drop old monthly partitions for a given table
CREATE OR REPLACE FUNCTION drop_old_monthly_partitions(
  parent_table_name text,
  control_column text,
  months_to_keep integer DEFAULT 12
)
RETURNS void AS $$
DECLARE
  partition_name text;
  cutoff_date date := date_trunc('month', CURRENT_DATE - (months_to_keep || ' months')::interval);
BEGIN
  FOR partition_name IN 
    SELECT relname 
    FROM pg_class pc
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace
    WHERE pn.nspname = 'public'
      AND pc.relkind = 'r' -- regular table
      AND pc.relispartition = true
      AND pc.relname LIKE parent_table_name || '_%'
      AND to_date(substring(pc.relname from length(parent_table_name) + 2 for 7), 'YYYY_MM') < cutoff_date
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(partition_name);
    RAISE NOTICE 'Dropped old partition: %', partition_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Now, you would apply these functions to your partitioned tables.
-- For example, for 'content_metrics_partitioned' and 'ad_metrics_partitioned':

-- Create the parent tables for partitioning (if they don't exist or were removed)
-- Note: These were originally in tender_marsh.sql, ensure they are present.
CREATE TABLE IF NOT EXISTS content_metrics_partitioned (
  LIKE content_metrics INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS ad_metrics_partitioned (
  LIKE ad_metrics INCLUDING ALL
);

-- Initial creation of partitions for existing data (if any) and future
SELECT create_future_monthly_partitions('content_metrics_partitioned', 'metric_date', 6);
SELECT create_future_monthly_partitions('ad_metrics_partitioned', 'metric_date', 6);
