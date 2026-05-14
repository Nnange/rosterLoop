import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupForm } from '../../components/SetupForm'

const defaultProps = {
    onComplete: vi.fn(),
}

beforeEach(() => {
    vi.clearAllMocks()
})

// Helper: advance from step 1 to step 2 with a given count
async function advanceToStep2(count = 2) {
    const user = userEvent.setup()
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, String(count))
    fireEvent.submit(screen.getByRole('button', { name: 'Next' }).closest('form')!)
    await waitFor(() => expect(screen.getByText("Enter everyone's names")).toBeInTheDocument())
}

describe('SetupForm — Step 1 (count)', () => {
    it('renders the count question', () => {
        render(<SetupForm {...defaultProps} />)
        expect(screen.getByText('How many people live in your household?')).toBeInTheDocument()
    })

    it('defaults to 2 people', () => {
        render(<SetupForm {...defaultProps} />)
        expect(screen.getByRole('spinbutton')).toHaveValue(2)
    })

    it('shows an error when count is 0', async () => {
        const user = userEvent.setup()
        render(<SetupForm {...defaultProps} />)
        await user.clear(screen.getByRole('spinbutton'))
        await user.type(screen.getByRole('spinbutton'), '0')
        fireEvent.submit(screen.getByRole('button', { name: 'Next' }).closest('form')!)
        await waitFor(() =>
            expect(screen.getByText('Please enter at least 1 person')).toBeInTheDocument()
        )
    })

    it('advances to step 2 when a valid count is submitted', async () => {
        render(<SetupForm {...defaultProps} />)
        await advanceToStep2(3)
        expect(screen.getByText("Enter everyone's names")).toBeInTheDocument()
    })

    it('renders the Back button when onBack prop is provided', () => {
        render(<SetupForm {...defaultProps} onBack={vi.fn()} />)
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('does not render Back button when onBack prop is omitted', () => {
        render(<SetupForm {...defaultProps} />)
        expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    })

    it('calls onBack when the Back button is clicked', () => {
        const onBack = vi.fn()
        render(<SetupForm {...defaultProps} onBack={onBack} />)
        fireEvent.click(screen.getByRole('button', { name: /back/i }))
        expect(onBack).toHaveBeenCalledOnce()
    })
})

describe('SetupForm — Step 2 (names)', () => {
    it('renders the correct number of name inputs', async () => {
        render(<SetupForm {...defaultProps} />)
        await advanceToStep2(3)
        expect(screen.getAllByPlaceholderText('Enter name')).toHaveLength(3)
    })

    it('labels inputs as Person 1, Person 2, etc.', async () => {
        render(<SetupForm {...defaultProps} />)
        await advanceToStep2(2)
        expect(screen.getByText('Person 1')).toBeInTheDocument()
        expect(screen.getByText('Person 2')).toBeInTheDocument()
    })

    it('shows an error when any name is empty', async () => {
        render(<SetupForm {...defaultProps} />)
        await advanceToStep2(2)
        fireEvent.submit(screen.getByRole('button', { name: 'Create Roster' }).closest('form')!)
        await waitFor(() =>
            expect(screen.getByText('Please enter all names')).toBeInTheDocument()
        )
    })

    it('shows an error when names are duplicates', async () => {
        const user = userEvent.setup()
        render(<SetupForm {...defaultProps} />)
        await advanceToStep2(2)
        const inputs = screen.getAllByPlaceholderText('Enter name')
        await user.type(inputs[0], 'Alice')
        await user.type(inputs[1], 'Alice')
        fireEvent.submit(screen.getByRole('button', { name: 'Create Roster' }).closest('form')!)
        await waitFor(() =>
            expect(screen.getByText('Each person must have a unique name')).toBeInTheDocument()
        )
    })

    it('treats duplicate names case-insensitively', async () => {
        const user = userEvent.setup()
        render(<SetupForm {...defaultProps} />)
        await advanceToStep2(2)
        const inputs = screen.getAllByPlaceholderText('Enter name')
        await user.type(inputs[0], 'alice')
        await user.type(inputs[1], 'ALICE')
        fireEvent.submit(screen.getByRole('button', { name: 'Create Roster' }).closest('form')!)
        await waitFor(() =>
            expect(screen.getByText('Each person must have a unique name')).toBeInTheDocument()
        )
    })

    it('calls onComplete with the entered names on valid submit', async () => {
        const user = userEvent.setup()
        const onComplete = vi.fn()
        render(<SetupForm onComplete={onComplete} />)
        await advanceToStep2(2)
        const inputs = screen.getAllByPlaceholderText('Enter name')
        await user.type(inputs[0], 'Alice')
        await user.type(inputs[1], 'Bob')
        fireEvent.submit(screen.getByRole('button', { name: 'Create Roster' }).closest('form')!)
        await waitFor(() => expect(onComplete).toHaveBeenCalledWith(['Alice', 'Bob']))
    })

    it('does not call onComplete when validation fails', async () => {
        const onComplete = vi.fn()
        render(<SetupForm onComplete={onComplete} />)
        await advanceToStep2(2)
        fireEvent.submit(screen.getByRole('button', { name: 'Create Roster' }).closest('form')!)
        expect(onComplete).not.toHaveBeenCalled()
    })

    it('goes back to step 1 when Back is clicked', async () => {
        render(<SetupForm {...defaultProps} />)
        await advanceToStep2(2)
        fireEvent.click(screen.getByRole('button', { name: 'Back' }))
        await waitFor(() =>
            expect(screen.getByText('How many people live in your household?')).toBeInTheDocument()
        )
    })
})
