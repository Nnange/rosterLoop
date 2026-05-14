import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { TokenExpirationMonitor } from '../../components/TokenExpirationMonitor'

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

vi.mock('@/app/context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

const mockPush = vi.fn()
const mockLogout = vi.fn()
const mockIsTokenExpired = vi.fn()

beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.mocked(useAuth).mockReturnValue({
        logout: mockLogout,
        isTokenExpired: mockIsTokenExpired,
    } as any)
    mockIsTokenExpired.mockReturnValue(false)
    vi.clearAllMocks()
    // Re-apply after clearAllMocks
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.mocked(useAuth).mockReturnValue({
        logout: mockLogout,
        isTokenExpired: mockIsTokenExpired,
    } as any)
    mockIsTokenExpired.mockReturnValue(false)
})

afterEach(() => {
    vi.useRealTimers()
})

describe('TokenExpirationMonitor', () => {
    it('renders nothing — returns null', () => {
        const { container } = render(<TokenExpirationMonitor />)
        expect(container).toBeEmptyDOMElement()
    })

    it('does not call logout when the token is still valid', async () => {
        mockIsTokenExpired.mockReturnValue(false)
        render(<TokenExpirationMonitor />)
        await act(async () => {
            vi.advanceTimersByTime(5000)
        })
        expect(mockLogout).not.toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('calls logout and redirects to /login when the token has expired', async () => {
        mockIsTokenExpired.mockReturnValue(true)
        render(<TokenExpirationMonitor />)
        await act(async () => {
            vi.advanceTimersByTime(5000)
        })
        expect(mockLogout).toHaveBeenCalledOnce()
        expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('detects expiry only after the 5-second interval fires', async () => {
        mockIsTokenExpired.mockReturnValue(true)
        render(<TokenExpirationMonitor />)
        // Less than one interval — should NOT have fired yet
        await act(async () => {
            vi.advanceTimersByTime(4999)
        })
        expect(mockLogout).not.toHaveBeenCalled()
        // Now cross the threshold
        await act(async () => {
            vi.advanceTimersByTime(1)
        })
        expect(mockLogout).toHaveBeenCalledOnce()
    })

    it('checks expiry on every 5-second tick', async () => {
        mockIsTokenExpired.mockReturnValue(false)
        render(<TokenExpirationMonitor />)
        await act(async () => {
            vi.advanceTimersByTime(15000) // 3 ticks
        })
        expect(mockIsTokenExpired).toHaveBeenCalledTimes(3)
    })
})
