-- rosterLoop Household Members and Invitations Migration
-- This script creates tables for managing household members and invitations

-- Create household_members table
CREATE TABLE IF NOT EXISTS household_members (
    id UUID PRIMARY KEY,
    household_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_household_members_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_household_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_household_member UNIQUE(household_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);

-- Create household_invitations table
CREATE TABLE IF NOT EXISTS household_invitations (
    id UUID PRIMARY KEY,
    household_id UUID NOT NULL,
    inviter_id UUID NOT NULL,
    invitee_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    declined_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_household_invitations_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_household_invitations_inviter FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_household_invitations_household_id ON household_invitations(household_id);
CREATE INDEX IF NOT EXISTS idx_household_invitations_invitee_email ON household_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_household_invitations_status ON household_invitations(status);

-- Add the owner as a member of their household (for existing households)
INSERT INTO household_members (id, household_id, user_id, joined_at)
SELECT gen_random_uuid(), h.id, h.owner_id, h.created_at
FROM households h
WHERE h.id NOT IN (SELECT household_id FROM household_members);
