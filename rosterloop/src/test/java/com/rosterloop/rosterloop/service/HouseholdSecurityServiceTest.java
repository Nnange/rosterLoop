package com.rosterloop.rosterloop.service;

import com.rosterloop.rosterloop.entity.Household;
import com.rosterloop.rosterloop.entity.User;
import com.rosterloop.rosterloop.repository.HouseholdMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdSecurityServiceTest {

    @Mock
    private HouseholdMemberRepository memberRepository;

    private HouseholdSecurityService securityService;

    private User owner;
    private User member;
    private User stranger;
    private Household household;

    @BeforeEach
    void setUp() {
        securityService = new HouseholdSecurityService(memberRepository);

        UUID ownerId    = UUID.randomUUID();
        UUID memberId   = UUID.randomUUID();
        UUID strangerId = UUID.randomUUID();
        UUID householdId = UUID.randomUUID();

        owner    = userWithId(ownerId);
        member   = userWithId(memberId);
        stranger = userWithId(strangerId);

        household = new Household();
        household.setId(householdId);
        household.setOwner(owner);
    }

    // ── isHouseholdOwner ──────────────────────────────────────────────────────

    @Test
    void isHouseholdOwner_trueWhenIdsMatch() {
        assertThat(securityService.isHouseholdOwner(owner, household)).isTrue();
    }

    @Test
    void isHouseholdOwner_falseForNonOwner() {
        assertThat(securityService.isHouseholdOwner(stranger, household)).isFalse();
    }

    @Test
    void isHouseholdOwner_falseWhenUserIsNull() {
        assertThat(securityService.isHouseholdOwner(null, household)).isFalse();
    }

    @Test
    void isHouseholdOwner_falseWhenHouseholdIsNull() {
        assertThat(securityService.isHouseholdOwner(owner, null)).isFalse();
    }

    @Test
    void isHouseholdOwner_falseWhenHouseholdOwnerIsNull() {
        household.setOwner(null);
        assertThat(securityService.isHouseholdOwner(owner, household)).isFalse();
    }

    // ── isHouseholdMember ─────────────────────────────────────────────────────

    @Test
    void isHouseholdMember_trueWhenRepositoryConfirms() {
        when(memberRepository.existsByHouseholdIdAndUserId(household.getId(), member.getId()))
                .thenReturn(true);
        assertThat(securityService.isHouseholdMember(member, household)).isTrue();
    }

    @Test
    void isHouseholdMember_falseWhenRepositoryDenies() {
        when(memberRepository.existsByHouseholdIdAndUserId(household.getId(), stranger.getId()))
                .thenReturn(false);
        assertThat(securityService.isHouseholdMember(stranger, household)).isFalse();
    }

    @Test
    void isHouseholdMember_falseWhenUserIsNull() {
        assertThat(securityService.isHouseholdMember(null, household)).isFalse();
    }

    @Test
    void isHouseholdMember_falseWhenHouseholdIsNull() {
        assertThat(securityService.isHouseholdMember(member, null)).isFalse();
    }

    // ── canViewHousehold ──────────────────────────────────────────────────────

    @Test
    void canViewHousehold_trueForOwner() {
        assertThat(securityService.canViewHousehold(owner, household)).isTrue();
    }

    @Test
    void canViewHousehold_trueForMember() {
        when(memberRepository.existsByHouseholdIdAndUserId(household.getId(), member.getId()))
                .thenReturn(true);
        assertThat(securityService.canViewHousehold(member, household)).isTrue();
    }

    @Test
    void canViewHousehold_falseForStranger() {
        when(memberRepository.existsByHouseholdIdAndUserId(household.getId(), stranger.getId()))
                .thenReturn(false);
        assertThat(securityService.canViewHousehold(stranger, household)).isFalse();
    }

    @Test
    void canViewHousehold_falseWhenUserIsNull() {
        assertThat(securityService.canViewHousehold(null, household)).isFalse();
    }

    // ── canModifyHousehold / canDeleteHousehold / canInviteMembers / canManageMembers ──

    @Test
    void canModifyHousehold_trueForOwnerOnly() {
        assertThat(securityService.canModifyHousehold(owner,    household)).isTrue();
        assertThat(securityService.canModifyHousehold(stranger, household)).isFalse();
    }

    @Test
    void canDeleteHousehold_trueForOwnerOnly() {
        assertThat(securityService.canDeleteHousehold(owner,    household)).isTrue();
        assertThat(securityService.canDeleteHousehold(stranger, household)).isFalse();
    }

    @Test
    void canInviteMembers_trueForOwnerOnly() {
        assertThat(securityService.canInviteMembers(owner,    household)).isTrue();
        assertThat(securityService.canInviteMembers(stranger, household)).isFalse();
    }

    @Test
    void canManageMembers_trueForOwnerOnly() {
        assertThat(securityService.canManageMembers(owner,    household)).isTrue();
        assertThat(securityService.canManageMembers(stranger, household)).isFalse();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static User userWithId(UUID id) {
        User u = new User();
        u.setId(id);
        return u;
    }
}
