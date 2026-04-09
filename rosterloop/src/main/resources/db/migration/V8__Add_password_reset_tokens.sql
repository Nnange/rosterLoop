-- Add password reset token columns to users table
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_token_expires_at TIMESTAMP;
ALTER TABLE users ADD CONSTRAINT uk_reset_token UNIQUE (reset_token);
