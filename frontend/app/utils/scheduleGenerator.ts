// Generate weekend dates for a full year
export function generateYearlySchedule(
  roommates: string[],
): Array<{ date: Date; person: string }> {
  if (!roommates.length) return []
  const schedule: Array<{ date: Date; person: string }> = []
  const currentDate = new Date()
  // Start from the current week's Saturday
  const startDate = getNextSaturday(currentDate)
  // Generate 52 weekends (one year)
  for (let i = 0; i < 52; i++) {
    const saturday = new Date(startDate)
    saturday.setDate(startDate.getDate() + i * 7)
    const personIndex = i % roommates.length
    schedule.push({
      date: saturday,
      person: roommates[personIndex],
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
