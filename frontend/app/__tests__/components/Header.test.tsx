import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../../components/Header'

// Mock Next.js modules — they don't work outside the Next.js runtime
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

vi.mock('@/app/context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

const mockPush = vi.fn()

const authenticatedUser = {
    userId: '1',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'ROLE_USER',
}

beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    mockPush.mockClear()
})

describe('Header', () => {
    describe('when user is authenticated', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: authenticatedUser,
                isAuthenticated: true,
                logout: vi.fn(),
            } as any)
        })

        it('shows the app title', () => {
            render(<Header />)
            expect(screen.getByText('Flatemate Cleaning Roster')).toBeInTheDocument()
        })

        it('shows the user full name', () => {
            render(<Header />)
            expect(screen.getByText('Alice Smith')).toBeInTheDocument()
        })

        it('shows the user email', () => {
            render(<Header />)
            expect(screen.getByText('alice@example.com')).toBeInTheDocument()
        })

        it('shows the Settings button', () => {
            render(<Header />)
            expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
        })

        it('shows the Logout button', () => {
            render(<Header />)
            expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
        })

        it('calls logout and redirects to /login when Logout is clicked', () => {
            const logout = vi.fn()
            vi.mocked(useAuth).mockReturnValue({
                user: authenticatedUser,
                isAuthenticated: true,
                logout,
            } as any)

            render(<Header />)
            fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

            expect(logout).toHaveBeenCalledOnce()
            expect(mockPush).toHaveBeenCalledWith('/login')
        })

        it('Settings link points to /account-settings', () => {
            render(<Header />)
            expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
                'href',
                '/account-settings'
            )
        })
    })

    describe('when user is not authenticated', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                isAuthenticated: false,
                logout: vi.fn(),
            } as any)
        })

        it('still shows the app title', () => {
            render(<Header />)
            expect(screen.getByText('Flatemate Cleaning Roster')).toBeInTheDocument()
        })

        it('does not show the user name', () => {
            render(<Header />)
            expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
        })

        it('does not show Logout button', () => {
            render(<Header />)
            expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()
        })

        it('does not show Settings button', () => {
            render(<Header />)
            expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
        })
    })
})
