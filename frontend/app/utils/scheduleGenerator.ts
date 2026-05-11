// Generate weekend dates for a full year (past and future)
export function generateYearlySchedule(
    roommates: string[],
): Array<{ date: Date; person: string; weekIndex: number; weekNumber: number }> {
    if (!roommates.length) return []
    const schedule: Array<{ date: Date; person: string; weekIndex: number; weekNumber: number }> = []
    
    // Use a fixed anchor date so the schedule is deterministic and doesn't shift
    // Use the first Saturday of 2026 as the anchor
    const anchorDate = new Date('2026-01-03T00:00:00Z') // Jan 3, 2026 is a Saturday
    const pastStartDate = new Date(anchorDate)
    pastStartDate.setDate(anchorDate.getDate() - 26 * 7) // 26 weeks in the past

    // Generate 104 weekends (52 past, 52 future)
    for (let i = 0; i < 104; i++) {
        const saturday = new Date(pastStartDate)
        saturday.setDate(pastStartDate.getDate() + i * 7)
        const personIndex = i % roommates.length
        schedule.push({
            date: saturday,
            person: roommates[personIndex],
            weekIndex: i - 26, // Adjust so current week is approximately index 0
            weekNumber: getWeekNumber(saturday),
        })
    }
    return schedule
}
// Get the next Saturday
export function getNextSaturday(date: Date): Date {
    const resultDate = new Date(date)
    const dayOfWeek = resultDate.getDay()
    // Calculate days until next Saturday (day 6)
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7
    resultDate.setDate(resultDate.getDate() + daysUntilSaturday)
    return resultDate
}

// Get the week index from a start date (weeks are counted from the schedule's start Saturday)
export function getWeekIndexFromStartDate(
    date: Date,
    scheduleStartDate: Date,
): number {
    const dateAtMidnight = new Date(date)
    dateAtMidnight.setHours(0, 0, 0, 0)
    
    const startAtMidnight = new Date(scheduleStartDate)
    startAtMidnight.setHours(0, 0, 0, 0)
    
    const diffTime = dateAtMidnight.getTime() - startAtMidnight.getTime()
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000))
    
    return diffWeeks
}

// Get the upcoming weekend date (Saturday) - keeping for backward compatibility
export function getNextWeekendDate(date: Date): Date {
    return getNextSaturday(date)
}
// Get the week number of a date (with Monday as first day of week)
export function getWeekNumber(date: Date): number {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    )
    const dayNum = d.getUTCDay() || 7 // Convert Sunday (0) to 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum) // Set to nearest Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
// Format date to display as "Jan 15"
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
// Format weekend range (e.g., "Jan 15-16")
export function formatWeekendRange(saturday: Date): string {
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    const satDay = saturday.getDate()
    const sunDay = sunday.getDate()
    const month = saturday.toLocaleDateString('en-US', { month: 'short' })
    // If same month
    if (saturday.getMonth() === sunday.getMonth()) {
        return `${month} ${satDay}-${sunDay}`
    }
    // If different months
    const sunMonth = sunday.toLocaleDateString('en-US', { month: 'short' })
    return `${month} ${satDay} - ${sunMonth} ${sunDay}`
}
