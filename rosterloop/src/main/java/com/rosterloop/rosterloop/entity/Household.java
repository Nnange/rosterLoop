package com.rosterloop.rosterloop.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "households")
public class Household {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "flatmate_names", nullable = false)
    private List<String> flatmateNames;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "household_name")
    private String householdName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "join_token", unique = true, nullable = true)
    private String joinToken;

    @Column(name = "join_token_expires_at", nullable = true)
    private LocalDateTime joinTokenExpiresAt;

    @Column(name = "max_members")
    private Integer maxMembers = 0;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public List<String> getFlatmateNames() {
        return flatmateNames;
    }

    public void setFlatmateNames(List<String> flatmateNames) {
        this.flatmateNames = flatmateNames;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getHouseholdName() {
        return householdName;
    }

    public void setHouseholdName(String householdName) {
        this.householdName = householdName;
    }

    public String getJoinToken() {
        return joinToken;
    }

    public void setJoinToken(String joinToken) {
        this.joinToken = joinToken;
    }

    public LocalDateTime getJoinTokenExpiresAt() {
        return joinTokenExpiresAt;
    }

    public void setJoinTokenExpiresAt(LocalDateTime joinTokenExpiresAt) {
        this.joinTokenExpiresAt = joinTokenExpiresAt;
    }

    public int getMaxMembers() {
        return maxMembers != null ? maxMembers : 0;
    }

    public void setMaxMembers(int maxMembers) {
        this.maxMembers = maxMembers;
    }
}
