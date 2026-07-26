import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPasswordForm from '../../[locale]/reset-password/ResetPasswordForm'

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
}))

vi.mock('@/app/components/Header', () => ({
    default: () => <div data-testid="header" />,
}))

vi.mock('@/app/components/Footer', () => ({
    default: () => <div data-testid="footer" />,
}))

vi.mock('@/app/context/AuthContext', () => ({
    useAuth: vi.fn().mockReturnValue({ isAuthenticated: false, user: null, logout: vi.fn() }),
}))

import { useRouter, useSearchParams } from 'next/navigation'

const mockPush = vi.fn()

function setupMocks(token: string | null = 'valid-token') {
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.mocked(useSearchParams).mockReturnValue({
        get: vi.fn().mockReturnValue(token),
    } as any)
}

beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
    setupMocks()
})

describe('ResetPasswordForm', () => {
    describe('token verification', () => {
        it('shows a loading spinner while verifying the token', () => {
            globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
            render(<ResetPasswordForm />)
            expect(screen.getByText('Verifying reset link...')).toBeInTheDocument()
        })

        it('shows an invalid link error when no token is in the URL', async () => {
            setupMocks(null)
            render(<ResetPasswordForm />)
            await waitFor(() =>
                expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
            )
        })

        it('shows an invalid link error when the API rejects the token', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
            render(<ResetPasswordForm />)
            await waitFor(() =>
                expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
            )
        })

        it('shows an invalid link error on a network error during verification', async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
            render(<ResetPasswordForm />)
            await waitFor(() =>
                expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
            )
        })

        it('shows the reset form when the token is valid', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            render(<ResetPasswordForm />)
            await waitFor(() =>
                expect(screen.getByRole('heading', { name: 'Create New Password' })).toBeInTheDocument()
            )
        })

        it('"Request New Link" button on invalid screen navigates to /forgot-password', async () => {
            setupMocks(null)
            render(<ResetPasswordForm />)
            await waitFor(() => screen.getByText('Invalid Reset Link'))
            fireEvent.click(screen.getByRole('button', { name: 'Request New Link' }))
            expect(mockPush).toHaveBeenCalledWith('/forgot-password')
        })
    })

    describe('form validation', () => {
        beforeEach(async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            render(<ResetPasswordForm />)
            await waitFor(() => screen.getByRole('heading', { name: 'Create New Password' }))
        })

        it('shows an error when both password fields are empty', async () => {
            fireEvent.submit(
                screen.getByRole('button', { name: 'Reset Password' }).closest('form')!
            )
            await waitFor(() =>
                expect(screen.getByText('Both password fields are required')).toBeInTheDocument()
            )
        })

        it('shows an error when passwords do not match', async () => {
            const user = userEvent.setup()
            await user.type(screen.getByLabelText('New Password'), 'password123')
            await user.type(screen.getByLabelText('Confirm Password'), 'different456')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Reset Password' }).closest('form')!
            )
            await waitFor(() =>
                expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
            )
        })

        it('shows an error when password is shorter than 8 characters', async () => {
            const user = userEvent.setup()
            await user.type(screen.getByLabelText('New Password'), 'short')
            await user.type(screen.getByLabelText('Confirm Password'), 'short')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Reset Password' }).closest('form')!
            )
            await waitFor(() =>
                expect(
                    screen.getByText('Password must be at least 8 characters long')
                ).toBeInTheDocument()
            )
        })
    })

    describe('successful reset', () => {
        async function submitValidReset() {
            // First call = verify token, second = reset password
            globalThis.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true })        // verify
                .mockResolvedValueOnce({ ok: true })        // reset
            render(<ResetPasswordForm />)
            await waitFor(() => screen.getByRole('heading', { name: 'Create New Password' }))
            const user = userEvent.setup()
            await user.type(screen.getByLabelText('New Password'), 'newpassword1')
            await user.type(screen.getByLabelText('Confirm Password'), 'newpassword1')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Reset Password' }).closest('form')!
            )
        }

        it('calls the reset endpoint with the token and new password', async () => {
            await submitValidReset()
            await waitFor(() =>
                expect(globalThis.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/auth/reset-password'),
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({ token: 'valid-token', newPassword: 'newpassword1' }),
                    })
                )
            )
        })

        it('shows the success message after a successful reset', async () => {
            await submitValidReset()
            await waitFor(() =>
                expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument()
            )
        })

        it('redirects to /login after 3 seconds on success', async () => {
            vi.useFakeTimers({ shouldAdvanceTime: true })
            try {
                await submitValidReset()
                await waitFor(() => screen.getByText('Password Reset Successful!'))
                await vi.runAllTimersAsync()
                expect(mockPush).toHaveBeenCalledWith('/login')
            } finally {
                vi.useRealTimers()
            }
        })
    })

    describe('failed reset', () => {
        it('shows the error message from the API response', async () => {
            globalThis.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true })
                .mockResolvedValueOnce({
                    ok: false,
                    json: () => Promise.resolve({ message: 'Token already used' }),
                })
            render(<ResetPasswordForm />)
            await waitFor(() => screen.getByRole('heading', { name: 'Create New Password' }))
            const user = userEvent.setup()
            await user.type(screen.getByLabelText('New Password'), 'newpassword1')
            await user.type(screen.getByLabelText('Confirm Password'), 'newpassword1')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Reset Password' }).closest('form')!
            )
            await waitFor(() =>
                expect(screen.getByText('Token already used')).toBeInTheDocument()
            )
        })

        it('shows a generic error on network failure during reset', async () => {
            globalThis.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true })
                .mockRejectedValueOnce(new Error('Network error'))
            render(<ResetPasswordForm />)
            await waitFor(() => screen.getByRole('heading', { name: 'Create New Password' }))
            const user = userEvent.setup()
            await user.type(screen.getByLabelText('New Password'), 'newpassword1')
            await user.type(screen.getByLabelText('Confirm Password'), 'newpassword1')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Reset Password' }).closest('form')!
            )
            await waitFor(() =>
                expect(
                    screen.getByText('Error resetting password. Please try again.')
                ).toBeInTheDocument()
            )
        })
    })
})
