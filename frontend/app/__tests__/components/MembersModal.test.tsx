import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MembersModal from '../../components/MembersModal'

const defaultProps = {
    isOpen: true,
    householdId: 'hh-1',
    householdName: 'Flat 4B',
    token: 'test-token',
    onClose: vi.fn(),
    onMemberRemoved: vi.fn(),
}

const mockMembers = [
    {
        memberId: 'm-1',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        displayName: 'Alice',
        status: 'MEMBER',
        joinedAt: '2026-01-01',
    },
    {
        memberId: 'm-2',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Jones',
        displayName: null,
        status: 'PENDING',
        joinedAt: null,
    },
]

function mockFetchSuccess(data: unknown) {
    globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
    })
}

function mockFetchFailure() {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('MembersModal', () => {
    describe('visibility', () => {
        it('renders nothing when isOpen is false', () => {
            render(<MembersModal {...defaultProps} isOpen={false} />)
            expect(screen.queryByText('Flat 4B - Members')).not.toBeInTheDocument()
        })

        it('skips the fetch when token is null', () => {
            globalThis.fetch = vi.fn()
            render(<MembersModal {...defaultProps} token={null} />)
            expect(globalThis.fetch).not.toHaveBeenCalled()
        })
    })

    describe('loading state', () => {
        it('shows a loading spinner while fetching', async () => {
            // Never resolves so we stay in loading state
            globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
            render(<MembersModal {...defaultProps} />)
            await waitFor(() =>
                expect(screen.getByText('Loading members...')).toBeInTheDocument()
            )
        })
    })

    describe('successful fetch', () => {
        it('renders the household name as a title', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => expect(screen.getByText('Flat 4B - Members')).toBeInTheDocument())
        })

        it('renders all member names', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
            expect(screen.getByText('bob@example.com')).toBeInTheDocument()
        })

        it('shows MEMBER status badge for active members', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => expect(screen.getByText('MEMBER')).toBeInTheDocument())
        })

        it('shows PENDING status badge for pending members', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => expect(screen.getByText('PENDING')).toBeInTheDocument())
        })

        it('shows "No members yet" when the list is empty', async () => {
            mockFetchSuccess([])
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => expect(screen.getByText('No members yet')).toBeInTheDocument())
        })

        it('shows the Remove button only for active members', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => screen.getByText('MEMBER'))
            const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
            expect(removeButtons).toHaveLength(1)
        })
    })

    describe('failed fetch', () => {
        it('shows an error message when the fetch fails', async () => {
            mockFetchFailure()
            render(<MembersModal {...defaultProps} />)
            await waitFor(() =>
                expect(screen.getByText('Failed to load members')).toBeInTheDocument()
            )
        })

        it('shows an error message when fetch throws a network error', async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
            render(<MembersModal {...defaultProps} />)
            await waitFor(() =>
                expect(screen.getByText('Error fetching members')).toBeInTheDocument()
            )
        })
    })

    describe('remove member', () => {
        it('calls DELETE endpoint with correct URL when Remove is clicked', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => screen.getByRole('button', { name: 'Remove' }))

            // Second fetch call is the DELETE — mock it as success
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

            await waitFor(() =>
                expect(globalThis.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/members/m-1'),
                    expect.objectContaining({ method: 'DELETE' })
                )
            )
        })

        it('removes the member from the list on success', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => screen.getByRole('button', { name: 'Remove' }))

            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

            await waitFor(() => expect(screen.queryByText('Alice')).not.toBeInTheDocument())
        })

        it('calls onMemberRemoved after successful removal', async () => {
            const onMemberRemoved = vi.fn()
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} onMemberRemoved={onMemberRemoved} />)
            await waitFor(() => screen.getByRole('button', { name: 'Remove' }))

            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

            await waitFor(() => expect(onMemberRemoved).toHaveBeenCalledOnce())
        })

        it('shows an error when removal fails', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => screen.getByRole('button', { name: 'Remove' }))

            globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
            fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

            await waitFor(() =>
                expect(screen.getByText('Failed to remove member')).toBeInTheDocument()
            )
        })
    })

    describe('edit display name', () => {
        it('shows an edit input when "Edit name" is clicked', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => screen.getByText('Edit name'))
            fireEvent.click(screen.getByText('Edit name'))
            expect(screen.getByPlaceholderText('Display name')).toBeInTheDocument()
        })

        it('hides the edit form when Cancel is clicked', async () => {
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => screen.getByText('Edit name'))
            fireEvent.click(screen.getByText('Edit name'))
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
            await waitFor(() =>
                expect(screen.queryByPlaceholderText('Display name')).not.toBeInTheDocument()
            )
        })

        it('calls PUT endpoint with the new display name on Save', async () => {
            const user = userEvent.setup()
            mockFetchSuccess(mockMembers)
            render(<MembersModal {...defaultProps} />)
            await waitFor(() => screen.getByText('Edit name'))
            fireEvent.click(screen.getByText('Edit name'))

            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
            const input = screen.getByPlaceholderText('Display name')
            await user.clear(input)
            await user.type(input, 'Ali')
            fireEvent.click(screen.getByRole('button', { name: 'Save' }))

            await waitFor(() =>
                expect(globalThis.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/display-name'),
                    expect.objectContaining({ method: 'PUT' })
                )
            )
        })
    })

    describe('close interactions', () => {
        it('calls onClose when the Close button is clicked', async () => {
            const onClose = vi.fn()
            mockFetchSuccess([])
            render(<MembersModal {...defaultProps} onClose={onClose} />)
            await waitFor(() => screen.getByRole('button', { name: 'Close' }))
            fireEvent.click(screen.getByRole('button', { name: 'Close' }))
            expect(onClose).toHaveBeenCalledOnce()
        })

        it('calls onClose when Escape is pressed', async () => {
            const onClose = vi.fn()
            mockFetchSuccess([])
            const { container } = render(<MembersModal {...defaultProps} onClose={onClose} />)
            await waitFor(() => screen.getByText('Flat 4B - Members'))
            fireEvent.keyDown(container.children[0], { key: 'Escape' })
            expect(onClose).toHaveBeenCalledOnce()
        })

        it('calls onClose when the backdrop is clicked', async () => {
            const onClose = vi.fn()
            mockFetchSuccess([])
            const { container } = render(<MembersModal {...defaultProps} onClose={onClose} />)
            await waitFor(() => screen.getByText('Flat 4B - Members'))
            fireEvent.click(container.children[0])
            expect(onClose).toHaveBeenCalledOnce()
        })
    })
})
