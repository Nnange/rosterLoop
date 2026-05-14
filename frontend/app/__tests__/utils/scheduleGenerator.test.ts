import { describe, it, expect } from 'vitest'
import {
    generateYearlySchedule,
    getNextSaturday,
    getWeekNumber,
    formatDate,
    formatWeekendRange,
    getWeekIndexFromStartDate,
} from '../../utils/scheduleGenerator'

describe('generateYearlySchedule', () => {
    it('returns empty array when no roommates provided', () => {
        expect(generateYearlySchedule([])).toEqual([])
    })

    it('generates 104 entries for a single roommate', () => {
        const schedule = generateYearlySchedule(['Alice'])
        expect(schedule).toHaveLength(104)
    })

    it('assigns the only roommate to every slot', () => {
        const schedule = generateYearlySchedule(['Alice'])
        schedule.forEach(entry => expect(entry.person).toBe('Alice'))
    })

    it('rotates through roommates in order', () => {
        const schedule = generateYearlySchedule(['Alice', 'Bob', 'Carol'])
        expect(schedule[0].person).toBe('Alice')
        expect(schedule[1].person).toBe('Bob')
        expect(schedule[2].person).toBe('Carol')
        expect(schedule[3].person).toBe('Alice') // wraps back around
    })

    it('all dates are Saturdays', () => {
        const schedule = generateYearlySchedule(['Alice', 'Bob'])
        schedule.forEach(entry => {
            expect(entry.date.getDay()).toBe(6) // 6 = Saturday
        })
    })

    it('dates are spaced exactly 7 days apart', () => {
        const schedule = generateYearlySchedule(['Alice'])
        for (let i = 1; i < schedule.length; i++) {
            const diff = schedule[i].date.getTime() - schedule[i - 1].date.getTime()
            // Round to nearest day to handle DST transitions (±1 hour)
            const diffDays = Math.round(diff / (24 * 60 * 60 * 1000))
            expect(diffDays).toBe(7)
        }
    })

    it('is deterministic — same input always produces same output', () => {
        const first = generateYearlySchedule(['Alice', 'Bob'])
        const second = generateYearlySchedule(['Alice', 'Bob'])
        expect(first.map(e => e.person)).toEqual(second.map(e => e.person))
        expect(first.map(e => e.date.getTime())).toEqual(second.map(e => e.date.getTime()))
    })
})

describe('getNextSaturday', () => {
    it('returns the same day if already Saturday', () => {
        const saturday = new Date('2026-01-03') // known Saturday
        expect(getNextSaturday(saturday).getDay()).toBe(6)
    })

    it('returns the upcoming Saturday from a Sunday', () => {
        const sunday = new Date('2026-01-04') // Sunday after Jan 3
        const next = getNextSaturday(sunday)
        expect(next.getDay()).toBe(6)
        expect(next.getDate()).toBe(10) // Jan 10
    })

    it('returns the upcoming Saturday from a Wednesday', () => {
        const wednesday = new Date('2026-01-07')
        const next = getNextSaturday(wednesday)
        expect(next.getDay()).toBe(6)
        expect(next.getDate()).toBe(10) // Jan 10
    })
})

describe('getWeekIndexFromStartDate', () => {
    it('returns 0 when both dates are the same', () => {
        const date = new Date('2026-01-03')
        expect(getWeekIndexFromStartDate(date, date)).toBe(0)
    })

    it('returns 1 for a date exactly one week later', () => {
        const start = new Date('2026-01-03')
        const oneWeekLater = new Date('2026-01-10')
        expect(getWeekIndexFromStartDate(oneWeekLater, start)).toBe(1)
    })

    it('returns negative index for a date before the start', () => {
        const start = new Date('2026-01-10')
        const earlier = new Date('2026-01-03')
        expect(getWeekIndexFromStartDate(earlier, start)).toBe(-1)
    })
})

describe('getWeekNumber', () => {
    it('returns a number between 1 and 53', () => {
        const date = new Date('2026-06-15')
        const week = getWeekNumber(date)
        expect(week).toBeGreaterThanOrEqual(1)
        expect(week).toBeLessThanOrEqual(53)
    })

    it('Jan 1 is in week 1 or 53 (ISO boundary)', () => {
        const jan1 = new Date('2026-01-01')
        const week = getWeekNumber(jan1)
        expect([1, 52, 53]).toContain(week)
    })
})

describe('formatDate', () => {
    it('formats a date as "Mon DD"', () => {
        const date = new Date('2026-01-03')
        expect(formatDate(date)).toBe('Jan 3')
    })

    it('formats a mid-year date correctly', () => {
        const date = new Date('2026-07-15')
        expect(formatDate(date)).toBe('Jul 15')
    })
})

describe('formatWeekendRange', () => {
    it('formats a same-month range as "Mon DD-DD"', () => {
        const saturday = new Date('2026-01-03')
        expect(formatWeekendRange(saturday)).toBe('Jan 3-4')
    })

    it('formats a month-boundary range across months', () => {
        const saturday = new Date('2026-01-31')
        const result = formatWeekendRange(saturday)
        expect(result).toBe('Jan 31 - Feb 1')
    })
})
