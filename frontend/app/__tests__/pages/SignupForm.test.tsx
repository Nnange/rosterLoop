import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupForm from '../../signup/SignupForm'

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
const mockSignup = vi.fn()

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
        signup: mockSignup,
        loading,
        error,
    } as any)
}

// Helper: fill all fields and submit
async function fillAndSubmit({
    firstName = 'Alice',
    lastName = 'Smith',
    email = 'alice@example.com',
    password = 'password123',
    confirmPassword = 'password123',
} = {}) {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('First Name'), firstName)
    await user.type(screen.getByLabelText('Last Name'), lastName)
    await user.type(screen.getByLabelText('Email'), email)
    await user.type(screen.getByLabelText('Password'), password)
    await user.type(screen.getByLabelText('Confirm Password'), confirmPassword)
    fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }).closest('form')!)
}

beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setupMocks()
    mockSignup.mockResolvedValue(undefined)
})

describe('SignupForm', () => {
    describe('rendering', () => {
        it('shows the Create Account heading', () => {
            render(<SignupForm />)
            expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
        })

        it('renders all five form fields', () => {
            render(<SignupForm />)
            expect(screen.getByLabelText('First Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByLabelText('Password')).toBeInTheDocument()
            expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
        })

        it('renders the Sign Up submit button', () => {
            render(<SignupForm />)
            expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
        })

        it('shows "Creating Account..." and disables the button while loading', () => {
            setupMocks({ loading: true })
            render(<SignupForm />)
            expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeDisabled()
        })

        it('disables all inputs while loading', () => {
            setupMocks({ loading: true })
            render(<SignupForm />)
            for (const label of ['First Name', 'Last Name', 'Email', 'Password', 'Confirm Password']) {
                expect(screen.getByLabelText(label)).toBeDisabled()
            }
        })

        it('shows a link to the login page', () => {
            render(<SignupForm />)
            expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
        })

        it('login link includes the redirect param when present', () => {
            setupMocks({ redirectParam: '/households' })
            render(<SignupForm />)
            expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
                'href',
                '/login?redirect=%2Fhouseholds'
            )
        })
    })

    describe('form validation', () => {
        it('shows an error when any required field is empty', async () => {
            render(<SignupForm />)
            fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('All fields are required')).toBeInTheDocument()
            )
        })

        it('shows an error when passwords do not match', async () => {
            render(<SignupForm />)
            await fillAndSubmit({ password: 'password123', confirmPassword: 'different456' })
            await waitFor(() =>
                expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
            )
        })

        it('shows an error when password is shorter than 8 characters', async () => {
            render(<SignupForm />)
            await fillAndSubmit({ password: 'short', confirmPassword: 'short' })
            await waitFor(() =>
                expect(
                    screen.getByText('Password must be at least 8 characters long')
                ).toBeInTheDocument()
            )
        })

        it('does not call signup when validation fails', async () => {
            render(<SignupForm />)
            fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }).closest('form')!)
            expect(mockSignup).not.toHaveBeenCalled()
        })
    })

    describe('successful signup', () => {
        it('calls signup with the correct arguments', async () => {
            render(<SignupForm />)
            await fillAndSubmit({
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            })
            await waitFor(() =>
                expect(mockSignup).toHaveBeenCalledWith(
                    'alice@example.com',
                    'password123',
                    'Alice',
                    'Smith'
                )
            )
        })

        it('redirects to /verification-required with no redirect param', async () => {
            render(<SignupForm />)
            await fillAndSubmit()
            await waitFor(() =>
                expect(mockPush).toHaveBeenCalledWith('/verification-required')
            )
        })

        it('redirects to /verification-required?returnUrl=... when redirect param is present', async () => {
            setupMocks({ redirectParam: '/households' })
            mockSignup.mockResolvedValue(undefined)
            render(<SignupForm />)
            await fillAndSubmit()
            await waitFor(() =>
                expect(mockPush).toHaveBeenCalledWith(
                    '/verification-required?returnUrl=%2Fhouseholds'
                )
            )
        })

        it('stores pendingReturnUrl in localStorage when redirect param is present', async () => {
            setupMocks({ redirectParam: '/households' })
            mockSignup.mockResolvedValue(undefined)
            render(<SignupForm />)
            await fillAndSubmit()
            await waitFor(() =>
                expect(localStorage.getItem('pendingReturnUrl')).toBe('/households')
            )
        })

        it('does not write to localStorage when no redirect param', async () => {
            render(<SignupForm />)
            await fillAndSubmit()
            await waitFor(() => expect(mockPush).toHaveBeenCalled())
            expect(localStorage.getItem('pendingReturnUrl')).toBeNull()
        })
    })

    describe('failed signup', () => {
        it('shows the error message from a failed signup', async () => {
            mockSignup.mockRejectedValue(new Error('Email already registered'))
            render(<SignupForm />)
            await fillAndSubmit()
            await waitFor(() =>
                expect(screen.getByText('Email already registered')).toBeInTheDocument()
            )
        })

        it('shows a generic error when signup rejects with a non-Error', async () => {
            mockSignup.mockRejectedValue('unexpected')
            render(<SignupForm />)
            await fillAndSubmit()
            await waitFor(() =>
                expect(screen.getByText('Signup failed')).toBeInTheDocument()
            )
        })

        it('shows the error from the auth context', () => {
            setupMocks({ error: 'Server unavailable' })
            render(<SignupForm />)
            expect(screen.getByText('Server unavailable')).toBeInTheDocument()
        })
    })
})
