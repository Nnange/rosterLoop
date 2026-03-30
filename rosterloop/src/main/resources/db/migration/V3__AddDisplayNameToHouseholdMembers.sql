-- Add display_name column to household_members table
ALTER TABLE household_members
ADD COLUMN display_name VARCHAR(255);

-- Update existing records to use user's first and last name as display name
UPDATE household_members
SET display_name = CONCAT(u.first_name, ' ', u.last_name)
FROM users u
WHERE household_members.user_id = u.id
AND household_members.display_name IS NULL;
