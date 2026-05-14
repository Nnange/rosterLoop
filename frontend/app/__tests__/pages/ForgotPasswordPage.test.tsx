import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '../../forgot-password/page'

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

vi.mock('@/app/components/Header', () => ({
    default: () => <div data-testid="header" />,
}))

vi.mock('@/app/components/Footer', () => ({
    default: () => <div data-testid="footer" />,
}))

// Header uses AuthContext — mock it so the Header mock doesn't need a provider
vi.mock('@/app/context/AuthContext', () => ({
    useAuth: vi.fn().mockReturnValue({ isAuthenticated: false, user: null, logout: vi.fn() }),
}))

import { useRouter } from 'next/navigation'

const mockPush = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    globalThis.fetch = vi.fn()
})

describe('ForgotPasswordPage', () => {
    describe('rendering', () => {
        it('shows the Reset Password heading', () => {
            render(<ForgotPasswordPage />)
            expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
        })

        it('renders the email input and submit button', () => {
            render(<ForgotPasswordPage />)
            expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
        })

        it('renders a link back to login', () => {
            render(<ForgotPasswordPage />)
            expect(screen.getByRole('link', { name: 'Back to Login' })).toHaveAttribute(
                'href',
                '/login'
            )
        })
    })

    describe('validation', () => {
        it('shows an error when email is empty', async () => {
            render(<ForgotPasswordPage />)
            fireEvent.submit(
                screen.getByRole('button', { name: 'Send Reset Link' }).closest('form')!
            )
            await waitFor(() =>
                expect(screen.getByText('Email is required')).toBeInTheDocument()
            )
        })

        it('does not call fetch when email is empty', async () => {
            render(<ForgotPasswordPage />)
            fireEvent.submit(
                screen.getByRole('button', { name: 'Send Reset Link' }).closest('form')!
            )
            expect(globalThis.fetch).not.toHaveBeenCalled()
        })
    })

    describe('loading state', () => {
        it('shows "Sending..." and disables the button while the request is in flight', async () => {
            globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {})) // never resolves
            const user = userEvent.setup()
            render(<ForgotPasswordPage />)
            await user.type(screen.getByLabelText('Email Address'), 'alice@example.com')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Send Reset Link' }).closest('form')!
            )
            await waitFor(() =>
                expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()
            )
        })
    })

    describe('successful submission', () => {
        it('shows the success view after a 200 response', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            const user = userEvent.setup()
            render(<ForgotPasswordPage />)
            await user.type(screen.getByLabelText('Email Address'), 'alice@example.com')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Send Reset Link' }).closest('form')!
            )
            await waitFor(() =>
                expect(screen.getByText('Check Your Email')).toBeInTheDocument()
            )
        })

        it('redirects to /login when "Back to Login" is clicked in the success view', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            const user = userEvent.setup()
            render(<ForgotPasswordPage />)
            await user.type(screen.getByLabelText('Email Address'), 'alice@example.com')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Send Reset Link' }).closest('form')!
            )
            await waitFor(() => screen.getByText('Check Your Email'))
            fireEvent.click(screen.getByRole('button', { name: 'Back to Login' }))
            expect(mockPush).toHaveBeenCalledWith('/login')
        })
    })

    describe('failed submission', () => {
        it('shows the error message from the API response', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ message: 'Email not found' }),
            })
            const user = userEvent.setup()
            render(<ForgotPasswordPage />)
            await user.type(screen.getByLabelText('Email Address'), 'unknown@example.com')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Send Reset Link' }).closest('form')!
            )
            await waitFor(() =>
                expect(screen.getByText('Email not found')).toBeInTheDocument()
            )
        })

        it('shows a generic error on network failure', async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
            const user = userEvent.setup()
            render(<ForgotPasswordPage />)
            await user.type(screen.getByLabelText('Email Address'), 'alice@example.com')
            fireEvent.submit(
                screen.getByRole('button', { name: 'Send Reset Link' }).closest('form')!
            )
            await waitFor(() =>
                expect(
                    screen.getByText('Error sending reset email. Please try again.')
                ).toBeInTheDocument()
            )
        })
    })
})
