-- Add join token columns to households table for shareable join links
ALTER TABLE households ADD COLUMN join_token VARCHAR(255) UNIQUE;
ALTER TABLE households ADD COLUMN join_token_expires_at TIMESTAMP;
