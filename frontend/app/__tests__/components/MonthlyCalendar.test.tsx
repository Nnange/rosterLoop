import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthlyCalendar } from '../../components/MonthlyCalendar'

// May 2026 Saturdays (2026-05-14 is a Thursday per system date)
const MAY_2_SAT = new Date(2026, 4, 2)   // May 2
const MAY_9_SAT = new Date(2026, 4, 9)   // May 9
const MAY_16_SAT = new Date(2026, 4, 16) // May 16

const mockSchedule = [
    { date: MAY_2_SAT,  person: 'Alice', weekIndex: -2, weekNumber: 18 },
    { date: MAY_9_SAT,  person: 'Bob',   weekIndex: -1, weekNumber: 19 },
    { date: MAY_16_SAT, person: 'Carol', weekIndex: 0,  weekNumber: 20 },
]

describe('MonthlyCalendar', () => {
    describe('structure', () => {
        it('renders all seven day-of-week headers', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
                expect(screen.getByText(day)).toBeInTheDocument()
            }
        })

        it('renders the Today, Previous month, and Next month controls', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument()
        })

        it('renders the "Today" and "Current Week" legend items', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            // "Today" appears twice: once as the nav button, once as the legend label
            expect(screen.getAllByText('Today')).toHaveLength(2)
            expect(screen.getByText('Current Week')).toBeInTheDocument()
        })
    })

    describe('month display', () => {
        it('shows the current month and year by default', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            const now = new Date()
            const expected = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            expect(screen.getByText(expected)).toBeInTheDocument()
        })

        it('advances to the next month when Next is clicked', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
            const next = new Date()
            next.setMonth(next.getMonth() + 1)
            const expected = next.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            expect(screen.getByText(expected)).toBeInTheDocument()
        })

        it('goes back to the previous month when Previous is clicked', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
            const prev = new Date()
            prev.setMonth(prev.getMonth() - 1)
            const expected = prev.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            expect(screen.getByText(expected)).toBeInTheDocument()
        })

        it('returns to the current month when Today is clicked after navigating away', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
            fireEvent.click(screen.getByRole('button', { name: 'Today' }))
            const now = new Date()
            const expected = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            expect(screen.getByText(expected)).toBeInTheDocument()
        })

        it('wraps from January back to December of the previous year', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            const now = new Date()
            // Navigate to January (getMonth() clicks takes us from current month to January)
            const monthsBack = now.getMonth()
            for (let i = 0; i < monthsBack; i++) {
                fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
            }
            // One more click should go to December of previous year
            fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
            const expected = new Date(now.getFullYear() - 1, 11).toLocaleDateString('en-US', {
                month: 'long', year: 'numeric',
            })
            expect(screen.getByText(expected)).toBeInTheDocument()
        })
    })

    describe('schedule display', () => {
        it('shows person names on Saturday cells', () => {
            render(<MonthlyCalendar schedule={mockSchedule} currentWeekIndex={0} />)
            // Person names appear as title attributes on weekend cells
            expect(screen.getAllByTitle('Alice').length).toBeGreaterThan(0)
            expect(screen.getAllByTitle('Bob').length).toBeGreaterThan(0)
            expect(screen.getAllByTitle('Carol').length).toBeGreaterThan(0)
        })

        it('also shows person names on Sunday cells (Sunday uses the preceding Saturday)', () => {
            render(<MonthlyCalendar schedule={mockSchedule} currentWeekIndex={0} />)
            // Each Saturday produces 2 entries: the Saturday cell and the following Sunday cell
            const aliceEntries = screen.getAllByTitle('Alice')
            expect(aliceEntries.length).toBe(2) // Saturday + Sunday
        })

        it('shows no person on weekday cells', () => {
            render(<MonthlyCalendar schedule={mockSchedule} currentWeekIndex={0} />)
            // All named entries come from weekend cells only
            const allPersonDivs = screen.getAllByTitle(/Alice|Bob|Carol/)
            // 3 weeks × 2 days (Sat+Sun) = 6 entries
            expect(allPersonDivs.length).toBe(6)
        })

        it('shows nothing when schedule is empty', () => {
            render(<MonthlyCalendar schedule={[]} currentWeekIndex={0} />)
            expect(screen.queryByTitle('Alice')).not.toBeInTheDocument()
        })
    })
})
