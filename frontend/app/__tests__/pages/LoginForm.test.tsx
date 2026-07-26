import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../../[locale]/login/LoginForm'

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
}))

vi.mock('@/app/context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

const mockPush = vi.fn()
const mockLogin = vi.fn()

function setupMocks({
    loading = false,
    error = null,
    redirectParam = null,
}: {
    loading?: boolean
    error?: string | null
    redirectParam?: string | null
} = {}) {
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.mocked(useSearchParams).mockReturnValue({
        get: vi.fn().mockReturnValue(redirectParam),
    } as any)
    vi.mocked(useAuth).mockReturnValue({
        login: mockLogin,
        loading,
        error,
    } as any)
}

// Helper: type into both fields and submit
async function fillAndSubmit(email = 'alice@example.com', password = 'password123') {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), email)
    await user.type(screen.getByLabelText('Password'), password)
    fireEvent.submit(screen.getByRole('button', { name: 'Login' }).closest('form')!)
}

beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
    mockLogin.mockResolvedValue(undefined)
})

describe('LoginForm', () => {
    describe('rendering', () => {
        it('shows the Login heading', () => {
            render(<LoginForm />)
            expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
        })

        it('renders email and password inputs', () => {
            render(<LoginForm />)
            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByLabelText('Password')).toBeInTheDocument()
        })

        it('renders the Login submit button', () => {
            render(<LoginForm />)
            expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
        })

        it('shows "Logging in..." and disables the button while loading', () => {
            setupMocks({ loading: true })
            render(<LoginForm />)
            expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled()
        })

        it('disables inputs while loading', () => {
            setupMocks({ loading: true })
            render(<LoginForm />)
            expect(screen.getByLabelText('Email')).toBeDisabled()
            expect(screen.getByLabelText('Password')).toBeDisabled()
        })

        it('shows the sign up link', () => {
            render(<LoginForm />)
            expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
        })

        it('sign up link points to /signup with no redirect param', () => {
            render(<LoginForm />)
            expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
        })

        it('sign up link includes the redirect param when present', () => {
            setupMocks({ redirectParam: '/households' })
            render(<LoginForm />)
            expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
                'href',
                '/signup?redirect=%2Fhouseholds'
            )
        })
    })

    describe('form validation', () => {
        it('shows an error when both fields are empty', async () => {
            render(<LoginForm />)
            fireEvent.submit(screen.getByRole('button', { name: 'Login' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('Email and password are required')).toBeInTheDocument()
            )
        })

        it('shows an error when only email is empty', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)
            await user.type(screen.getByLabelText('Password'), 'password123')
            fireEvent.submit(screen.getByRole('button', { name: 'Login' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('Email and password are required')).toBeInTheDocument()
            )
        })

        it('shows an error when only password is empty', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)
            await user.type(screen.getByLabelText('Email'), 'alice@example.com')
            fireEvent.submit(screen.getByRole('button', { name: 'Login' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('Email and password are required')).toBeInTheDocument()
            )
        })

        it('does not call login when validation fails', async () => {
            render(<LoginForm />)
            fireEvent.submit(screen.getByRole('button', { name: 'Login' }).closest('form')!)
            expect(mockLogin).not.toHaveBeenCalled()
        })
    })

    describe('successful login', () => {
        it('calls login with the entered email and password', async () => {
            render(<LoginForm />)
            await fillAndSubmit('alice@example.com', 'secret123')
            await waitFor(() =>
                expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'secret123')
            )
        })

        it('redirects to / after login when no redirect param', async () => {
            render(<LoginForm />)
            await fillAndSubmit()
            await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'))
        })

        it('redirects to the redirect param value after login', async () => {
            setupMocks({ redirectParam: '/households' })
            mockLogin.mockResolvedValue(undefined)
            render(<LoginForm />)
            await fillAndSubmit()
            await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/households'))
        })
    })

    describe('failed login', () => {
        it('shows the error message from a failed login', async () => {
            mockLogin.mockRejectedValue(new Error('Invalid credentials'))
            render(<LoginForm />)
            await fillAndSubmit()
            await waitFor(() =>
                expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
            )
        })

        it('shows a generic error when login rejects with a non-Error', async () => {
            mockLogin.mockRejectedValue('unexpected')
            render(<LoginForm />)
            await fillAndSubmit()
            await waitFor(() =>
                expect(screen.getByText('Login failed')).toBeInTheDocument()
            )
        })

        it('shows the error from the auth context', () => {
            setupMocks({ error: 'Session expired' })
            render(<LoginForm />)
            expect(screen.getByText('Session expired')).toBeInTheDocument()
        })

        it('does not show the forgot password link before 3 failures', async () => {
            mockLogin.mockRejectedValue(new Error('Wrong password'))
            render(<LoginForm />)
            await fillAndSubmit()
            await waitFor(() => screen.getByText('Wrong password'))
            expect(screen.queryByText('Reset Your Password')).not.toBeInTheDocument()
        })

        it('shows the forgot password link after 3 failed attempts', async () => {
            mockLogin.mockRejectedValue(new Error('Wrong password'))
            render(<LoginForm />)
            await fillAndSubmit()
            await waitFor(() => screen.getByText('Wrong password'))
            await fillAndSubmit()
            await waitFor(() => screen.getByText('Wrong password'))
            await fillAndSubmit()
            await waitFor(() =>
                expect(screen.getByRole('link', { name: 'Reset Your Password' })).toBeInTheDocument()
            )
        })

        it('forgot password link points to /forgot-password', async () => {
            mockLogin.mockRejectedValue(new Error('Wrong password'))
            render(<LoginForm />)
            for (let i = 0; i < 3; i++) {
                await fillAndSubmit()
                await waitFor(() => screen.getByText('Wrong password'))
            }
            expect(screen.getByRole('link', { name: 'Reset Your Password' })).toHaveAttribute(
                'href',
                '/forgot-password'
            )
        })
    })
})
