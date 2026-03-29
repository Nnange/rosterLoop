-- rosterLoop Authentication Database Migration
-- This script sets up the user authentication tables
-- Run this after initial database creation

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verification_token VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Modify households table to add owner reference
-- This assumes the households table already exists
ALTER TABLE households ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE households ADD CONSTRAINT fk_households_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index on owner_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_households_owner_id ON households(owner_id);

-- Optional: Add household_name column if it doesn't exist
ALTER TABLE households ADD COLUMN IF NOT EXISTS household_name VARCHAR(255);

-- Create a view for user statistics (optional, for future analytics)
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(h.id) as household_count,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN households h ON u.id = h.owner_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.created_at, u.last_login;

-- Verify tables were created successfully
-- \dt (in psql) to see all tables
-- SELECT * FROM information_schema.tables WHERE table_name IN ('users', 'households');
