-- Insert admin user (password needs to be hashed in production)
INSERT INTO users (email, password_hash, first_name, last_name, role_id)
VALUES (
    'admin@example.com',
    '$2a$10$your_hashed_password',
    'Admin',
    'User',
    (SELECT id FROM roles WHERE name = 'admin')
) ON CONFLICT (email) DO NOTHING;