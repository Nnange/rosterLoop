package com.rosterloop.rosterloop.service;

import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.repository.HouseholdMemberRepository;
import org.springframework.stereotype.Service;

/**
 * Service for Row-Level Security (RLS) checks on Household entities
 * Ensures users can only access households they own or are members of
 */
@Service
public class HouseholdSecurityService {
    private final HouseholdMemberRepository householdMemberRepository;

    public HouseholdSecurityService(HouseholdMemberRepository householdMemberRepository) {
        this.householdMemberRepository = householdMemberRepository;
    }

    /**
     * Check if user is a member of the household
     * ✅ Returns true only if user is explicitly a member (via HouseholdMember)
     *
     * @param user The user to check
     * @param household The household to check membership in
     * @return true if user is a member, false otherwise
     */
    public boolean isHouseholdMember(User user, Household household) {
        if (user == null || household == null) {
            return false;
        }
        return householdMemberRepository.existsByHouseholdIdAndUserId(household.getId(), user.getId());
    }

    /**
     * Check if user is the owner of the household
     * ✅ Returns true only if user created the household
     *
     * @param user The user to check
     * @param household The household to check ownership
     * @return true if user is the owner, false otherwise
     */
    public boolean isHouseholdOwner(User user, Household household) {
        if (user == null || household == null || household.getOwner() == null) {
            return false;
        }
        return household.getOwner().getId().equals(user.getId());
    }

    /**
     * Check if user can VIEW the household
     * ✅ Permission granted if: owner OR member
     *
     * @param user The user to check
     * @param household The household to check access
     * @return true if user can view, false otherwise
     */
    public boolean canViewHousehold(User user, Household household) {
        if (user == null || household == null) {
            return false;
        }
        return isHouseholdOwner(user, household) || isHouseholdMember(user, household);
    }

    /**
     * Check if user can MODIFY the household (update settings)
     * ✅ Permission granted if: owner only
     *
     * @param user The user to check
     * @param household The household to check access
     * @return true if user can modify, false otherwise
     */
    public boolean canModifyHousehold(User user, Household household) {
        if (user == null || household == null) {
            return false;
        }
        return isHouseholdOwner(user, household);
    }

    /**
     * Check if user can DELETE the household
     * ✅ Permission granted if: owner only
     *
     * @param user The user to check
     * @param household The household to check access
     * @return true if user can delete, false otherwise
     */
    public boolean canDeleteHousehold(User user, Household household) {
        if (user == null || household == null) {
            return false;
        }
        return isHouseholdOwner(user, household);
    }

    /**
     * Check if user can INVITE new members to the household
     * ✅ Permission granted if: owner only
     *
     * @param user The user to check
     * @param household The household to check access
     * @return true if user can invite, false otherwise
     */
    public boolean canInviteMembers(User user, Household household) {
        if (user == null || household == null) {
            return false;
        }
        return isHouseholdOwner(user, household);
    }

    /**
     * Check if user can MANAGE members (remove, edit roles, etc.)
     * ✅ Permission granted if: owner only
     *
     * @param user The user to check
     * @param household The household to check access
     * @return true if user can manage members, false otherwise
     */
    public boolean canManageMembers(User user, Household household) {
        if (user == null || household == null) {
            return false;
        }
        return isHouseholdOwner(user, household);
    }
}
