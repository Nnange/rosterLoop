import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'

const defaultProps = {
    isOpen: true,
    householdName: 'Flat 4B',
    isDeleting: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
}

describe('DeleteConfirmModal', () => {
    describe('visibility', () => {
        it('renders when isOpen is true', () => {
            render(<DeleteConfirmModal {...defaultProps} />)
            expect(screen.getByText('Delete Household')).toBeInTheDocument()
        })

        it('renders nothing when isOpen is false', () => {
            render(<DeleteConfirmModal {...defaultProps} isOpen={false} />)
            expect(screen.queryByText('Delete Household')).not.toBeInTheDocument()
        })
    })

    describe('content', () => {
        it('shows the household name in the confirmation message', () => {
            render(<DeleteConfirmModal {...defaultProps} />)
            // The name is interpolated into the confirmation sentence, so match
            // it as a substring rather than a standalone text node.
            expect(screen.getByText(/Flat 4B/)).toBeInTheDocument()
        })

        it('shows "Delete" on the confirm button when not deleting', () => {
            render(<DeleteConfirmModal {...defaultProps} />)
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
        })

        it('shows "Deleting..." on the confirm button while deleting', () => {
            render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />)
            expect(screen.getByRole('button', { name: 'Deleting...' })).toBeInTheDocument()
        })

        it('disables both buttons while deleting', () => {
            render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />)
            expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled()
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
        })
    })

    describe('interactions', () => {
        it('calls onConfirm when Delete button is clicked', () => {
            const onConfirm = vi.fn()
            render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />)
            fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
            expect(onConfirm).toHaveBeenCalledOnce()
        })

        it('calls onCancel when Cancel button is clicked', () => {
            const onCancel = vi.fn()
            render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />)
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
            expect(onCancel).toHaveBeenCalledOnce()
        })

        it('calls onCancel when Escape key is pressed', () => {
            const onCancel = vi.fn()
            render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />)
            fireEvent.keyDown(screen.getByText('Delete Household').closest('div')!.parentElement!, {
                key: 'Escape',
            })
            expect(onCancel).toHaveBeenCalledOnce()
        })

        it('calls onCancel when the backdrop is clicked', () => {
            const onCancel = vi.fn()
            const { container } = render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />)
            // The backdrop is the outermost div
            const backdrop = container.firstChild as HTMLElement
            fireEvent.click(backdrop)
            expect(onCancel).toHaveBeenCalledOnce()
        })

        it('does not call onCancel when the modal content is clicked', () => {
            const onCancel = vi.fn()
            render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />)
            fireEvent.click(screen.getByText('Delete Household'))
            expect(onCancel).not.toHaveBeenCalled()
        })
    })
})
