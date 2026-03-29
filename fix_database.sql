-- Add owner_id column to households table
-- This script adds the owner relationship to the households table

-- First, add the column as nullable
ALTER TABLE households ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Add the foreign key constraint
ALTER TABLE households ADD CONSTRAINT IF NOT EXISTS fk_households_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_households_owner_id ON households(owner_id);

-- Add household_name column if it doesn't exist
ALTER TABLE households ADD COLUMN IF NOT EXISTS household_name VARCHAR(255);
