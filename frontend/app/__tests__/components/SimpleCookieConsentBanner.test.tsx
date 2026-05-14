import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SimpleCookieConsentBanner from '../../components/SimpleCookieConsentBanner'

beforeEach(() => {
    localStorage.clear()
})

describe('SimpleCookieConsentBanner', () => {
    describe('visibility', () => {
        it('shows the banner when no consent is stored', async () => {
            render(<SimpleCookieConsentBanner />)
            await waitFor(() =>
                expect(screen.getByText('🍪 Cookie Settings')).toBeInTheDocument()
            )
        })

        it('hides the banner when valid consent is already stored', async () => {
            localStorage.setItem(
                'cookie-consent',
                JSON.stringify({ essential: true, analytics: false, marketing: false })
            )
            render(<SimpleCookieConsentBanner />)
            await waitFor(() =>
                expect(screen.queryByText('🍪 Cookie Settings')).not.toBeInTheDocument()
            )
        })

        it('shows the banner when stored consent JSON is invalid', async () => {
            localStorage.setItem('cookie-consent', 'not-valid-json')
            render(<SimpleCookieConsentBanner />)
            await waitFor(() =>
                expect(screen.getByText('🍪 Cookie Settings')).toBeInTheDocument()
            )
        })
    })

    describe('Accept All', () => {
        it('hides the banner after clicking Accept All', async () => {
            render(<SimpleCookieConsentBanner />)
            await waitFor(() => screen.getByRole('button', { name: 'Accept All' }))
            fireEvent.click(screen.getByRole('button', { name: 'Accept All' }))
            await waitFor(() =>
                expect(screen.queryByText('🍪 Cookie Settings')).not.toBeInTheDocument()
            )
        })

        it('saves full consent to localStorage on Accept All', async () => {
            render(<SimpleCookieConsentBanner />)
            await waitFor(() => screen.getByRole('button', { name: 'Accept All' }))
            fireEvent.click(screen.getByRole('button', { name: 'Accept All' }))
            await waitFor(() => {
                const saved = JSON.parse(localStorage.getItem('cookie-consent')!)
                expect(saved).toEqual({ essential: true, analytics: true, marketing: true })
            })
        })
    })

    describe('Reject All', () => {
        it('hides the banner after clicking Reject All', async () => {
            render(<SimpleCookieConsentBanner />)
            await waitFor(() => screen.getByRole('button', { name: 'Reject All' }))
            fireEvent.click(screen.getByRole('button', { name: 'Reject All' }))
            await waitFor(() =>
                expect(screen.queryByText('🍪 Cookie Settings')).not.toBeInTheDocument()
            )
        })

        it('saves only essential consent to localStorage on Reject All', async () => {
            render(<SimpleCookieConsentBanner />)
            await waitFor(() => screen.getByRole('button', { name: 'Reject All' }))
            fireEvent.click(screen.getByRole('button', { name: 'Reject All' }))
            await waitFor(() => {
                const saved = JSON.parse(localStorage.getItem('cookie-consent')!)
                expect(saved).toEqual({ essential: true, analytics: false, marketing: false })
            })
        })
    })

    describe('Settings / detailed view', () => {
        async function openSettings() {
            render(<SimpleCookieConsentBanner />)
            await waitFor(() => screen.getByRole('button', { name: 'Settings' }))
            fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
            await waitFor(() =>
                expect(screen.getByText('Cookie Preferences')).toBeInTheDocument()
            )
        }

        it('shows the Cookie Preferences panel when Settings is clicked', async () => {
            await openSettings()
            expect(screen.getByText('Cookie Preferences')).toBeInTheDocument()
        })

        it('shows analytics and marketing checkboxes unchecked by default', async () => {
            await openSettings()
            expect(screen.getByLabelText(/Analytics Cookies/)).not.toBeChecked()
            expect(screen.getByLabelText(/Marketing Cookies/)).not.toBeChecked()
        })

        it('essential checkbox is always checked and disabled', async () => {
            await openSettings()
            const essentialCheckbox = screen.getByLabelText(/Essential Cookies/)
            expect(essentialCheckbox).toBeChecked()
            expect(essentialCheckbox).toBeDisabled()
        })

        it('toggles the analytics checkbox', async () => {
            await openSettings()
            const analyticsCheckbox = screen.getByLabelText(/Analytics Cookies/)
            fireEvent.click(analyticsCheckbox)
            expect(analyticsCheckbox).toBeChecked()
            fireEvent.click(analyticsCheckbox)
            expect(analyticsCheckbox).not.toBeChecked()
        })

        it('saves custom preferences and hides banner on Save Preferences', async () => {
            await openSettings()
            fireEvent.click(screen.getByLabelText(/Analytics Cookies/))
            fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }))
            await waitFor(() =>
                expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument()
            )
            const saved = JSON.parse(localStorage.getItem('cookie-consent')!)
            expect(saved).toEqual({ essential: true, analytics: true, marketing: false })
        })

        it('returns to the main banner view when Back is clicked', async () => {
            await openSettings()
            fireEvent.click(screen.getByRole('button', { name: 'Back' }))
            await waitFor(() =>
                expect(screen.getByText('🍪 Cookie Settings')).toBeInTheDocument()
            )
        })
    })
})
