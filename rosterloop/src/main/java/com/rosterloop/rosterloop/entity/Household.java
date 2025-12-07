package com.rosterloop.rosterloop.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "households")
public class Household {
    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String flatematenames;

    @Column(nullable = false)
    private LocalDateTime created_at;
}
