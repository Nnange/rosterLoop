import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ShareLinkModal from '../../components/ShareLinkModal'

const defaultProps = {
    isOpen: true,
    householdId: 'hh-123',
    householdName: 'Flat 4B',
    joinLink: 'https://example.com/join/abc123',
    onClose: vi.fn(),
}

beforeEach(() => {
    // jsdom doesn't implement clipboard — provide a mock
    Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('ShareLinkModal', () => {
    describe('visibility', () => {
        it('renders when isOpen is true', () => {
            render(<ShareLinkModal {...defaultProps} />)
            expect(screen.getByText('Share Flat 4B')).toBeInTheDocument()
        })

        it('renders nothing when isOpen is false', () => {
            render(<ShareLinkModal {...defaultProps} isOpen={false} />)
            expect(screen.queryByText('Share Flat 4B')).not.toBeInTheDocument()
        })
    })

    describe('content', () => {
        it('shows the household name in the title', () => {
            render(<ShareLinkModal {...defaultProps} />)
            expect(screen.getByText('Share Flat 4B')).toBeInTheDocument()
        })

        it('displays the join link in a readonly input', () => {
            render(<ShareLinkModal {...defaultProps} />)
            const input = screen.getByDisplayValue('https://example.com/join/abc123')
            expect(input).toBeInTheDocument()
            expect(input).toHaveAttribute('readonly')
        })

        it('shows "Copy" on the copy button by default', () => {
            render(<ShareLinkModal {...defaultProps} />)
            expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
        })
    })

    describe('copy interaction', () => {
        it('writes the join link to clipboard when Copy is clicked', async () => {
            render(<ShareLinkModal {...defaultProps} />)
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
            })
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/join/abc123')
        })

        it('shows "✓ Copied" immediately after copying', async () => {
            render(<ShareLinkModal {...defaultProps} />)
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
            })
            expect(screen.getByRole('button', { name: '✓ Copied' })).toBeInTheDocument()
        })

        it('reverts back to "Copy" after 2 seconds', async () => {
            render(<ShareLinkModal {...defaultProps} />)
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
            })
            await act(async () => {
                vi.advanceTimersByTime(2000)
            })
            expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
        })
    })

    describe('close interactions', () => {
        it('calls onClose when Close button is clicked', () => {
            const onClose = vi.fn()
            render(<ShareLinkModal {...defaultProps} onClose={onClose} />)
            fireEvent.click(screen.getByRole('button', { name: 'Close' }))
            expect(onClose).toHaveBeenCalledOnce()
        })

        it('calls onClose when Escape key is pressed', () => {
            const onClose = vi.fn()
            const { container } = render(<ShareLinkModal {...defaultProps} onClose={onClose} />)
            fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Escape' })
            expect(onClose).toHaveBeenCalledOnce()
        })

        it('calls onClose when the backdrop is clicked', () => {
            const onClose = vi.fn()
            const { container } = render(<ShareLinkModal {...defaultProps} onClose={onClose} />)
            fireEvent.click(container.firstChild as HTMLElement)
            expect(onClose).toHaveBeenCalledOnce()
        })

        it('does not call onClose when modal content is clicked', () => {
            const onClose = vi.fn()
            render(<ShareLinkModal {...defaultProps} onClose={onClose} />)
            fireEvent.click(screen.getByText('Share Flat 4B'))
            expect(onClose).not.toHaveBeenCalled()
        })
    })
})
