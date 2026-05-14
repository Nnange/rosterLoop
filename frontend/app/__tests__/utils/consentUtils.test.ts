import { describe, it, expect, beforeEach } from 'vitest'
import {
    hasConsent,
    hasEssentialConsent,
    hasAnalyticsConsent,
    hasMarketingConsent,
    getAllConsent,
    setConsent,
    loadGoogleAnalytics,
} from '../../utils/consentUtils'

// jsdom provides localStorage, but we clear it before each test so tests don't bleed into each other
beforeEach(() => {
    localStorage.clear()
})

describe('hasEssentialConsent', () => {
    it('always returns true', () => {
        expect(hasEssentialConsent()).toBe(true)
    })
})

describe('hasConsent', () => {
    it('returns false when no klaro entry in localStorage', () => {
        expect(hasConsent('analytics')).toBe(false)
    })

    it('returns true when the service is consented to', () => {
        localStorage.setItem('klaro', JSON.stringify({ analytics: true }))
        expect(hasConsent('analytics')).toBe(true)
    })

    it('returns false when the service is explicitly denied', () => {
        localStorage.setItem('klaro', JSON.stringify({ analytics: false }))
        expect(hasConsent('analytics')).toBe(false)
    })

    it('returns false when the service is not present in stored consent', () => {
        localStorage.setItem('klaro', JSON.stringify({ marketing: true }))
        expect(hasConsent('analytics')).toBe(false)
    })

    it('returns false when localStorage contains invalid JSON', () => {
        localStorage.setItem('klaro', 'not-valid-json')
        expect(hasConsent('analytics')).toBe(false)
    })
})

describe('hasAnalyticsConsent', () => {
    it('returns false when analytics consent is not set', () => {
        expect(hasAnalyticsConsent()).toBe(false)
    })

    it('returns true when analytics consent is given', () => {
        localStorage.setItem('klaro', JSON.stringify({ analytics: true }))
        expect(hasAnalyticsConsent()).toBe(true)
    })
})

describe('hasMarketingConsent', () => {
    it('returns false when marketing consent is not set', () => {
        expect(hasMarketingConsent()).toBe(false)
    })

    it('returns true when marketing consent is given', () => {
        localStorage.setItem('klaro', JSON.stringify({ marketing: true }))
        expect(hasMarketingConsent()).toBe(true)
    })
})

describe('getAllConsent', () => {
    it('returns empty object when nothing is stored', () => {
        expect(getAllConsent()).toEqual({})
    })

    it('returns the full stored consent object', () => {
        const consent = { analytics: true, marketing: false }
        localStorage.setItem('klaro', JSON.stringify(consent))
        expect(getAllConsent()).toEqual(consent)
    })

    it('returns empty object when localStorage contains invalid JSON', () => {
        localStorage.setItem('klaro', 'not-valid-json')
        expect(getAllConsent()).toEqual({})
    })
})

describe('setConsent', () => {
    it('writes a new consent entry to localStorage', () => {
        setConsent('analytics', true)
        expect(hasConsent('analytics')).toBe(true)
    })

    it('overwrites an existing consent entry', () => {
        localStorage.setItem('klaro', JSON.stringify({ analytics: true }))
        setConsent('analytics', false)
        expect(hasConsent('analytics')).toBe(false)
    })

    it('preserves other consent entries when updating one', () => {
        localStorage.setItem('klaro', JSON.stringify({ marketing: true }))
        setConsent('analytics', true)
        expect(hasConsent('marketing')).toBe(true)
        expect(hasConsent('analytics')).toBe(true)
    })

    it('can set consent for multiple services independently', () => {
        setConsent('analytics', true)
        setConsent('marketing', false)
        expect(getAllConsent()).toEqual({ analytics: true, marketing: false })
    })
})

describe('loadGoogleAnalytics', () => {
    it('does nothing when analytics consent is not given', () => {
        const scriptsBefore = document.head.querySelectorAll('script').length
        loadGoogleAnalytics('G-TESTID')
        expect(document.head.querySelectorAll('script').length).toBe(scriptsBefore)
    })

    it('appends a script tag when analytics consent is given', () => {
        localStorage.setItem('klaro', JSON.stringify({ analytics: true }))
        const scriptsBefore = document.head.querySelectorAll('script').length
        loadGoogleAnalytics('G-TESTID')
        expect(document.head.querySelectorAll('script').length).toBe(scriptsBefore + 1)
    })

    it('sets the correct gtag script src', () => {
        localStorage.setItem('klaro', JSON.stringify({ analytics: true }))
        loadGoogleAnalytics('G-TESTID')
        const scripts = Array.from(document.head.querySelectorAll('script'))
        const gtagScript = scripts.find(s => s.src.includes('G-TESTID'))
        expect(gtagScript).toBeDefined()
    })
})
