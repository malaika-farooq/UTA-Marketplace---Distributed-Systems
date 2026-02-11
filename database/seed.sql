-- Seed data for UTA Marketplace

-- Insert categories
INSERT INTO categories (id, name, description) VALUES
    ('electronics', 'Electronics', 'Phones, laptops, tablets, and gadgets'),
    ('textbooks', 'Textbooks', 'Academic books and study materials'),
    ('furniture', 'Furniture', 'Desks, chairs, beds, and home furnishings'),
    ('clothing', 'Clothing', 'Apparel and accessories'),
    ('sports', 'Sports & Outdoors', 'Sports equipment and outdoor gear'),
    ('other', 'Other', 'Miscellaneous items')
ON CONFLICT (id) DO NOTHING;

-- Insert conditions
INSERT INTO conditions (id, name, description) VALUES
    ('new', 'New', 'Brand new, never used'),
    ('like_new', 'Like New', 'Barely used, excellent condition'),
    ('good', 'Good', 'Normal wear, fully functional'),
    ('fair', 'Fair', 'Visible wear but works fine'),
    ('poor', 'Poor', 'Heavy wear or some defects')
ON CONFLICT (id) DO NOTHING;

-- Insert meet spots
INSERT INTO meet_spots (id, name, description) VALUES
    ('library', 'Central Library', 'UTA Central Library main entrance'),
    ('uc', 'University Center', 'UC building lobby'),
    ('erc', 'Engineering Research Complex', 'ERC main entrance'),
    ('mac', 'MAC (Maverick Activities Center)', 'MAC main entrance'),
    ('parking_lot_a', 'Parking Lot A', 'Parking Lot A near stadium'),
    ('starbucks', 'Starbucks (UC)', 'Starbucks inside University Center')
ON CONFLICT (id) DO NOTHING;

-- Insert sample users (password is 'password123' hashed with bcrypt)
-- These are valid bcrypt hashes generated with: bcrypt.hash('password123', 10)
-- Hash generated: 2026-02-11
INSERT INTO users (id, email, password_hash, full_name, phone, whatsapp) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'alice@uta.edu', '$2b$10$xJ2JQGt6UqtSOKcUC2NeLOfPJikxnXb2dNeaoov70xfIQIB6mvdOS', 'Alice Johnson', '8175551001', '18175551001'),
    ('550e8400-e29b-41d4-a716-446655440002', 'bob@uta.edu', '$2b$10$xJ2JQGt6UqtSOKcUC2NeLOfPJikxnXb2dNeaoov70xfIQIB6mvdOS', 'Bob Smith', '8175551002', '18175551002'),
    ('550e8400-e29b-41d4-a716-446655440003', 'carol@uta.edu', '$2b$10$xJ2JQGt6UqtSOKcUC2NeLOfPJikxnXb2dNeaoov70xfIQIB6mvdOS', 'Carol Williams', '8175551003', '18175551003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample listings
INSERT INTO listings (id, title, description, price, category_id, condition_id, seller_id, seller_email, seller_whatsapp, image_url, meet_spot_id) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'MacBook Pro 13" M1', 'Barely used MacBook Pro with M1 chip, 8GB RAM, 256GB SSD. Excellent condition!', 650.00, 'electronics', 'like_new', '550e8400-e29b-41d4-a716-446655440001', 'alice@uta.edu', '18175551001', 'https://picsum.photos/300/200?random=1', 'library'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Calculus Textbook (9th Ed)', 'Calculus Early Transcendentals by Stewart. Clean pages, no markings.', 45.00, 'textbooks', 'good', '550e8400-e29b-41d4-a716-446655440002', 'bob@uta.edu', '18175551002', 'https://picsum.photos/300/200?random=2', 'library'),
    ('660e8400-e29b-41d4-a716-446655440003', 'Study Desk', 'Solid wood desk, perfect for dorm or apartment. Minor scratches.', 80.00, 'furniture', 'good', '550e8400-e29b-41d4-a716-446655440003', 'carol@uta.edu', '18175551003', 'https://picsum.photos/300/200?random=3', 'uc'),
    ('660e8400-e29b-41d4-a716-446655440004', 'iPhone 13 Pro', 'iPhone 13 Pro 256GB, Space Gray. Battery health 95%.', 520.00, 'electronics', 'like_new', '550e8400-e29b-41d4-a716-446655440001', 'alice@uta.edu', '18175551001', 'https://picsum.photos/300/200?random=4', 'starbucks'),
    ('660e8400-e29b-41d4-a716-446655440005', 'Engineering Mechanics Textbook', 'Statics and Dynamics 14th Edition. Some highlighting.', 60.00, 'textbooks', 'fair', '550e8400-e29b-41d4-a716-446655440002', 'bob@uta.edu', '18175551002', 'https://picsum.photos/300/200?random=5', 'erc'),
    ('660e8400-e29b-41d4-a716-446655440006', 'Basketball', 'Official size basketball, lightly used.', 15.00, 'sports', 'good', '550e8400-e29b-41d4-a716-446655440003', 'carol@uta.edu', '18175551003', 'https://picsum.photos/300/200?random=6', 'mac')
ON CONFLICT (id) DO NOTHING;

-- Insert sample favorites
INSERT INTO favorites (user_id, listing_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004')
ON CONFLICT DO NOTHING;

-- Insert sample views for analytics
INSERT INTO listing_views (listing_id, user_id, timestamp) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1 day'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '2 hours'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '3 hours'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1 hour'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;
