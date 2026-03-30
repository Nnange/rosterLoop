-- Ensure cascade delete is properly configured for user deletion
-- Update foreign key constraints to use ON DELETE CASCADE for proper cleanup

-- Update household_members to cascade delete when user is deleted
ALTER TABLE household_members
DROP CONSTRAINT IF EXISTS fk1qcyeyx7v52432f6hyswues69;

ALTER TABLE household_members
ADD CONSTRAINT fk1qcyeyx7v52432f6hyswues69 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update household_invitations to cascade delete when inviter user is deleted
ALTER TABLE household_invitations
DROP CONSTRAINT IF EXISTS fk3na0ltniew91c8bslcdpms8bp;

-- Note: Keep the newer constraint with CASCADE if it already exists
ALTER TABLE household_invitations
DROP CONSTRAINT IF EXISTS fk7tyblyuwkvqo0s5gtndvhgvno;

ALTER TABLE household_invitations
ADD CONSTRAINT fk7tyblyuwkvqo0s5gtndvhgvno FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE;
