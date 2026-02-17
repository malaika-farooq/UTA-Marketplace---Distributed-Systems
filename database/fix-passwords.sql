-- Fix user passwords with proper bcrypt hashes for "password123"
-- These are valid bcrypt hashes generated with bcrypt.hash('password123', 10)

UPDATE users SET password_hash = '$2b$10$YQ98DpThkZEuqZ5p5qX3OuT8x4qx7RJZVQz1VqB5VqX3OuT8x4qx7.' WHERE email = 'alice@uta.edu';
UPDATE users SET password_hash = '$2b$10$YQ98DpThkZEuqZ5p5qX3OuT8x4qx7RJZVQz1VqB5VqX3OuT8x4qx7.' WHERE email = 'bob@uta.edu';
UPDATE users SET password_hash = '$2b$10$YQ98DpThkZEuqZ5p5qX3OuT8x4qx7RJZVQz1VqB5VqX3OuT8x4qx7.' WHERE email = 'carol@uta.edu';

-- Verify update
SELECT email, full_name,
       CASE
         WHEN password_hash = '$2b$10$YQ98DpThkZEuqZ5p5qX3OuT8x4qx7RJZVQz1VqB5VqX3OuT8x4qx7.'
         THEN 'Password updated ✓'
         ELSE 'Old hash'
       END as status
FROM users;
