import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InviteModal from '../../components/InviteModal'

const defaultProps = {
    isOpen: true,
    householdName: 'Flat 4B',
    isInviting: false,
    onInvite: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
}

beforeEach(() => {
    vi.clearAllMocks()
    defaultProps.onInvite.mockResolvedValue(undefined)
})

describe('InviteModal', () => {
    describe('visibility', () => {
        it('renders when isOpen is true', () => {
            render(<InviteModal {...defaultProps} />)
            expect(screen.getByText('Invite to Household')).toBeInTheDocument()
        })

        it('renders nothing when isOpen is false', () => {
            render(<InviteModal {...defaultProps} isOpen={false} />)
            expect(screen.queryByText('Invite to Household')).not.toBeInTheDocument()
        })
    })

    describe('content', () => {
        it('shows the household name', () => {
            render(<InviteModal {...defaultProps} />)
            expect(screen.getByText('Flat 4B')).toBeInTheDocument()
        })

        it('shows "Send Invite" on the submit button when not inviting', () => {
            render(<InviteModal {...defaultProps} />)
            expect(screen.getByRole('button', { name: 'Send Invite' })).toBeInTheDocument()
        })

        it('shows "Sending..." on the submit button while inviting', () => {
            render(<InviteModal {...defaultProps} isInviting={true} />)
            expect(screen.getByRole('button', { name: 'Sending...' })).toBeInTheDocument()
        })

        it('disables the email input and buttons while inviting', () => {
            render(<InviteModal {...defaultProps} isInviting={true} />)
            expect(screen.getByPlaceholderText('Enter email address')).toBeDisabled()
            expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
        })
    })

    describe('form validation', () => {
        it('shows an error when submitted with an empty email', async () => {
            render(<InviteModal {...defaultProps} />)
            fireEvent.submit(screen.getByRole('button', { name: 'Send Invite' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('Please enter an email address')).toBeInTheDocument()
            )
        })

        it('shows an error when submitted with an invalid email', async () => {
            const user = userEvent.setup()
            render(<InviteModal {...defaultProps} />)
            await user.type(screen.getByPlaceholderText('Enter email address'), 'not-an-email')
            fireEvent.submit(screen.getByRole('button', { name: 'Send Invite' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
            )
        })

        it('does not call onInvite when validation fails', async () => {
            render(<InviteModal {...defaultProps} />)
            fireEvent.submit(screen.getByRole('button', { name: 'Send Invite' }).closest('form')!)
            expect(defaultProps.onInvite).not.toHaveBeenCalled()
        })
    })

    describe('successful submission', () => {
        it('calls onInvite with the entered email', async () => {
            const user = userEvent.setup()
            const onInvite = vi.fn().mockResolvedValue(undefined)
            render(<InviteModal {...defaultProps} onInvite={onInvite} />)
            await user.type(screen.getByPlaceholderText('Enter email address'), 'alice@example.com')
            fireEvent.submit(screen.getByRole('button', { name: 'Send Invite' }).closest('form')!)
            await waitFor(() => expect(onInvite).toHaveBeenCalledWith('alice@example.com'))
        })

        it('clears the email input after a successful invite', async () => {
            const user = userEvent.setup()
            render(<InviteModal {...defaultProps} />)
            const input = screen.getByPlaceholderText('Enter email address')
            await user.type(input, 'alice@example.com')
            fireEvent.submit(screen.getByRole('button', { name: 'Send Invite' }).closest('form')!)
            await waitFor(() => expect(input).toHaveValue(''))
        })
    })

    describe('failed submission', () => {
        it('shows the error message returned by onInvite', async () => {
            const user = userEvent.setup()
            const onInvite = vi.fn().mockRejectedValue(new Error('User already a member'))
            render(<InviteModal {...defaultProps} onInvite={onInvite} />)
            await user.type(screen.getByPlaceholderText('Enter email address'), 'alice@example.com')
            fireEvent.submit(screen.getByRole('button', { name: 'Send Invite' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('User already a member')).toBeInTheDocument()
            )
        })

        it('shows a generic error when onInvite rejects with a non-Error', async () => {
            const user = userEvent.setup()
            const onInvite = vi.fn().mockRejectedValue('unexpected')
            render(<InviteModal {...defaultProps} onInvite={onInvite} />)
            await user.type(screen.getByPlaceholderText('Enter email address'), 'alice@example.com')
            fireEvent.submit(screen.getByRole('button', { name: 'Send Invite' }).closest('form')!)
            await waitFor(() =>
                expect(screen.getByText('Failed to send invitation')).toBeInTheDocument()
            )
        })
    })

    describe('cancel interactions', () => {
        it('calls onCancel when Cancel is clicked', () => {
            render(<InviteModal {...defaultProps} />)
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
            expect(defaultProps.onCancel).toHaveBeenCalledOnce()
        })

        it('calls onCancel when Escape is pressed', () => {
            const onCancel = vi.fn()
            const { container } = render(<InviteModal {...defaultProps} onCancel={onCancel} />)
            fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Escape' })
            expect(onCancel).toHaveBeenCalledOnce()
        })

        it('calls onCancel when backdrop is clicked', () => {
            const onCancel = vi.fn()
            const { container } = render(<InviteModal {...defaultProps} onCancel={onCancel} />)
            fireEvent.click(container.firstChild as HTMLElement)
            expect(onCancel).toHaveBeenCalledOnce()
        })
    })
})
