-- Create tables for cart and wishlist functionality

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create some sample products for testing
INSERT INTO products (name, price, description, images, slug, stock_quantity, created_at, updated_at) 
VALUES 
    ('Sample Product 1', 999.99, 'A sample product for testing', ARRAY['https://via.placeholder.com/300'], 'sample-product-1', 10, NOW(), NOW()),
    ('Sample Product 2', 1999.99, 'Another sample product', ARRAY['https://via.placeholder.com/300'], 'sample-product-2', 5, NOW(), NOW()),
    ('Sample Product 3', 599.99, 'Third sample product', ARRAY['https://via.placeholder.com/300'], 'sample-product-3', 15, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS for carts and wishlists
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for carts
CREATE POLICY "Users can view their own cart items" ON carts FOR SELECT USING (user_id = auth.uid()::integer);
CREATE POLICY "Users can insert their own cart items" ON carts FOR INSERT WITH CHECK (user_id = auth.uid()::integer);
CREATE POLICY "Users can update their own cart items" ON carts FOR UPDATE USING (user_id = auth.uid()::integer);
CREATE POLICY "Users can delete their own cart items" ON carts FOR DELETE USING (user_id = auth.uid()::integer);

-- Create RLS policies for wishlists
CREATE POLICY "Users can view their own wishlist items" ON wishlists FOR SELECT USING (user_id = auth.uid()::integer);
CREATE POLICY "Users can insert their own wishlist items" ON wishlists FOR INSERT WITH CHECK (user_id = auth.uid()::integer);
CREATE POLICY "Users can update their own wishlist items" ON wishlists FOR UPDATE USING (user_id = auth.uid()::integer);
CREATE POLICY "Users can delete their own wishlist items" ON wishlists FOR DELETE USING (user_id = auth.uid()::integer);
