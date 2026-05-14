import { describe, it, expect } from 'vitest'
import {
    isAdmin,
    isUser,
    canCreateHousehold,
    getRoleDisplayName,
} from '../../utils/roleUtils'

describe('isAdmin', () => {
    it('returns true for ROLE_ADMIN', () => {
        expect(isAdmin('ROLE_ADMIN')).toBe(true)
    })

    it('returns false for ROLE_USER', () => {
        expect(isAdmin('ROLE_USER')).toBe(false)
    })

    it('returns false for an unknown role', () => {
        expect(isAdmin('ROLE_SUPERUSER')).toBe(false)
    })

    it('returns false when role is undefined', () => {
        expect(isAdmin()).toBe(false)
    })

    it('returns false for empty string', () => {
        expect(isAdmin('')).toBe(false)
    })
})

describe('isUser', () => {
    it('returns true for ROLE_USER', () => {
        expect(isUser('ROLE_USER')).toBe(true)
    })

    it('returns false for ROLE_ADMIN', () => {
        expect(isUser('ROLE_ADMIN')).toBe(false)
    })

    it('returns false when role is undefined', () => {
        expect(isUser()).toBe(false)
    })

    it('returns false for empty string', () => {
        expect(isUser('')).toBe(false)
    })
})

describe('canCreateHousehold', () => {
    it('returns true for admins', () => {
        expect(canCreateHousehold('ROLE_ADMIN')).toBe(true)
    })

    it('returns false for regular users', () => {
        expect(canCreateHousehold('ROLE_USER')).toBe(false)
    })

    it('returns false when role is undefined', () => {
        expect(canCreateHousehold()).toBe(false)
    })
})

describe('getRoleDisplayName', () => {
    it('returns "Admin" for ROLE_ADMIN', () => {
        expect(getRoleDisplayName('ROLE_ADMIN')).toBe('Admin')
    })

    it('returns "Member" for ROLE_USER', () => {
        expect(getRoleDisplayName('ROLE_USER')).toBe('Member')
    })

    it('returns "Unknown" for an unrecognised role', () => {
        expect(getRoleDisplayName('ROLE_GUEST')).toBe('Unknown')
    })

    it('returns "Unknown" when role is undefined', () => {
        expect(getRoleDisplayName()).toBe('Unknown')
    })

    it('returns "Unknown" for empty string', () => {
        expect(getRoleDisplayName('')).toBe('Unknown')
    })
})
