import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CleaningSchedule } from '../../components/CleaningSchedule'

// lucide-react uses SVG — render it as-is in jsdom
describe('CleaningSchedule', () => {
    describe('structure', () => {
        it('renders the "Cleaning Schedule" heading', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() =>
                expect(screen.getByText('Cleaning Schedule')).toBeInTheDocument()
            )
        })

        it('renders the "This Weekend" section', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() =>
                expect(screen.getByText('This Weekend')).toBeInTheDocument()
            )
        })

        it('renders the "Next Weekend" section', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() =>
                expect(screen.getByText('Next Weekend')).toBeInTheDocument()
            )
        })

        it('shows an avatar initial for the current person on duty', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() => screen.getByText('This Weekend'))
            // Current and next persons have their first initial shown in an avatar circle
            // At least one of A or B should be visible
            const avatars = screen.getAllByText(/^[AB]$/)
            expect(avatars.length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('view mode toggle', () => {
        it('renders "Next 4 Weeks" and "Full Year" toggle buttons', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() => screen.getByText('Next 4 Weeks'))
            expect(screen.getByRole('button', { name: 'Next 4 Weeks' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Full Year' })).toBeInTheDocument()
        })

        it('defaults to "Next 4 Weeks" mode showing at most 4 schedule rows', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() => screen.getByText('Next 4 Weeks'))
            // Each schedule list row has exactly one "•" separator — section headers do not
            const bullets = screen.getAllByText('•')
            expect(bullets.length).toBeLessThanOrEqual(4)
        })

        it('switches to "Full Year" mode showing all 104 schedule rows', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() => screen.getByRole('button', { name: 'Full Year' }))
            fireEvent.click(screen.getByRole('button', { name: 'Full Year' }))
            await waitFor(() => {
                const bullets = screen.getAllByText('•')
                expect(bullets.length).toBe(104)
            })
        })

        it('returns to 4 rows when "Next 4 Weeks" is clicked after "Full Year"', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() => screen.getByRole('button', { name: 'Full Year' }))
            fireEvent.click(screen.getByRole('button', { name: 'Full Year' }))
            await waitFor(() => screen.getAllByText('•').length === 104)
            fireEvent.click(screen.getByRole('button', { name: 'Next 4 Weeks' }))
            await waitFor(() => {
                const bullets = screen.getAllByText('•')
                expect(bullets.length).toBeLessThanOrEqual(4)
            })
        })
    })

    describe('roommate names', () => {
        it('shows only the provided roommate names in the schedule', async () => {
            render(<CleaningSchedule roommates={['Alice', 'Bob']} />)
            await waitFor(() => screen.getByRole('button', { name: 'Full Year' }))
            fireEvent.click(screen.getByRole('button', { name: 'Full Year' }))
            await waitFor(() => screen.getAllByText('Alice').length > 0)
            const carolOccurrences = screen.queryAllByText('Carol')
            expect(carolOccurrences).toHaveLength(0)
        })

        it('shows "Loading..." while the schedule is being generated', () => {
            // Both currentPersonOnDuty and nextPersonOnDuty default to 'Loading...' with empty roommates
            render(<CleaningSchedule roommates={[]} />)
            // Empty roommates → schedule stays empty → both persons stay 'Loading...'
            expect(screen.getAllByText('Loading...')).toHaveLength(2)
        })
    })
})
