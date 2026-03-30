-- Ensure cascade delete is properly configured for household deletion
-- This migration ensures that when a household is deleted, all related records are deleted

-- Drop the existing foreign key constraint that prevents household deletion
-- We need to drop the auto-generated constraint name first
ALTER TABLE household_members
DROP CONSTRAINT IF EXISTS fkits4dus4oxqsobbp02l23iw8x;

-- Also drop the explicit constraint name if it exists
ALTER TABLE household_members
DROP CONSTRAINT IF EXISTS fk_household_members_household;

-- Recreate the constraint with ON DELETE CASCADE with explicit name
ALTER TABLE household_members
ADD CONSTRAINT fk_household_members_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE;

-- Ensure household_invitations also has cascade delete for household_id
-- Drop any auto-generated constraint first
ALTER TABLE household_invitations
DROP CONSTRAINT IF EXISTS fkd6f3cs3vvrtl3v8iakxsxrjp;

-- Drop the explicit constraint name if it exists
ALTER TABLE household_invitations
DROP CONSTRAINT IF EXISTS fk_household_invitations_household;

-- Add the constraint with ON DELETE CASCADE
ALTER TABLE household_invitations
ADD CONSTRAINT fk_household_invitations_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE;
