-- Mandi Deals Database Schema
-- PostgreSQL SQL script

-- Create database (run this separately if needed)
-- CREATE DATABASE mandi_deals;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer', -- customer, staff, vendor, admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer profiles
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id VARCHAR(50),
  address TEXT,
  tier VARCHAR(20) DEFAULT 'Silver', -- Silver, Gold, Platinum
  total_purchases DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Inventory
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  vendor_id UUID,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets / Points system
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  available_points INT DEFAULT 0,
  redeemable_points INT DEFAULT 0,
  remaining_points INT DEFAULT 0,
  total_points_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales transactions (POS)
CREATE TABLE IF NOT EXISTS sales_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  staff_id UUID NOT NULL REFERENCES users(id),
  counter_id VARCHAR(20),
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  points_used INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  payment_method VARCHAR(50), -- cash, card, upi, points+cash
  status VARCHAR(20) DEFAULT 'completed', -- completed, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale items (line items in each transaction)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES sales_transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Points transactions (ledger)
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50), -- purchase, redeem, bonus, adjustment
  points_amount INT NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Points redemptions
CREATE TABLE IF NOT EXISTS points_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES sales_transactions(id),
  points_redeemed INT NOT NULL,
  discount_given DECIMAL(10,2) NOT NULL,
  staff_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waste bags
CREATE TABLE IF NOT EXISTS waste_bags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customer_profiles(id),
  status VARCHAR(20) DEFAULT 'active', -- active, collected, redeemed
  points_value INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  collected_at TIMESTAMP
);

-- Waste collections
CREATE TABLE IF NOT EXISTS waste_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id UUID NOT NULL REFERENCES waste_bags(id),
  collector_id UUID REFERENCES users(id),
  weight_kg DECIMAL(10,2),
  points_calculated INT,
  status VARCHAR(20) DEFAULT 'collected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON sales_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_staff_id ON sales_transactions(staff_id);
CREATE INDEX IF NOT EXISTS idx_wallets_customer_id ON wallets(customer_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_wallet_id ON points_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_waste_bags_qr ON waste_bags(qr_code);
CREATE INDEX IF NOT EXISTS idx_waste_bags_customer_id ON waste_bags(customer_id);

-- Insert sample data

-- Sample users
INSERT INTO users (phone, name, email, password_hash, role) VALUES
('9876543210', 'John Staff', 'staff@mandi.com', 'hashed_password_123', 'staff'),
('9123456789', 'Rajesh Admin', 'admin@mandi.com', 'hashed_password_123', 'admin'),
('9111111111', 'Customer One', 'cust1@mandi.com', 'hashed_password_123', 'customer'),
('9222222222', 'Customer Two', 'cust2@mandi.com', 'hashed_password_123', 'customer')
ON CONFLICT DO NOTHING;

-- Sample products
INSERT INTO products (name, category, price, current_stock, unit) VALUES
('Tomatoes', 'Vegetables', 40, 100, 'kg'),
('Potatoes', 'Vegetables', 25, 200, 'kg'),
('Onions', 'Vegetables', 30, 150, 'kg'),
('Apples', 'Fruits', 80, 50, 'kg'),
('Bananas', 'Fruits', 50, 75, 'kg'),
('Carrots', 'Vegetables', 35, 120, 'kg'),
('Cucumbers', 'Vegetables', 20, 90, 'kg'),
('Mangoes', 'Fruits', 100, 40, 'kg'),
('Broccoli', 'Vegetables', 60, 30, 'kg'),
('Spinach', 'Vegetables', 25, 50, 'kg')
ON CONFLICT DO NOTHING;

-- Sample customer profile
INSERT INTO customer_profiles (user_id, household_id, address, tier) 
SELECT id, 'HH-' || phone, '123 Main Street', 'Gold' 
FROM users WHERE phone = '9111111111'
ON CONFLICT DO NOTHING;

-- Sample wallet
INSERT INTO wallets (customer_id, available_points, redeemable_points, remaining_points, total_points_earned)
SELECT id, 500, 300, 200, 1000 
FROM customer_profiles 
WHERE household_id = 'HH-9111111111'
ON CONFLICT DO NOTHING;

-- Display summary
SELECT 'Database schema created successfully!' as message;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as customer_count FROM customer_profiles;
