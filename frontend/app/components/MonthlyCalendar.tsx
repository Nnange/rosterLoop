import React from 'react'
import { getWeekNumber } from '../utils/scheduleGenerator'
interface MonthlyCalendarProps {
  schedule: Array<{
    date: Date
    person: string
  }>
  currentWeek: number
}
export function MonthlyCalendar({
  schedule,
  currentWeek,
}: MonthlyCalendarProps) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  // Get first and last day of month
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  // Get the day of week for first day, adjusted for Monday start (0 = Monday, 6 = Sunday)
  const dayOfWeek = firstDay.getDay()
  const startingDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  // Calculate total days to display (including padding)
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7
  // Get person on duty for a specific date
  const getPersonForDate = (date: Date): string | null => {
    const weekNum = getWeekNumber(date)
    const scheduleItem = schedule.find(
      (item) => getWeekNumber(item.date) === weekNum,
    )
    return scheduleItem ? scheduleItem.person : null
  }
  const monthName = today.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">{monthName}</h3>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({
          length: totalCells,
        }).map((_, index) => {
          const dayNumber = index - startingDayOfWeek + 1
          const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth
          if (!isValidDay) {
            return <div key={index} className="aspect-square" />
          }
          const date = new Date(currentYear, currentMonth, dayNumber)
          const isToday = date.toDateString() === today.toDateString()
          const weekNum = getWeekNumber(date)
          const isCurrentWeek = weekNum === currentWeek
          const person = getPersonForDate(date)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          return (
            <div
              key={index}
              className={`aspect-square p-2 rounded-lg border transition-colors ${isToday ? 'bg-indigo-600 text-white border-indigo-600' : isCurrentWeek ? 'bg-indigo-50 border-indigo-200' : isWeekend && person ? 'bg-gray-50 border-gray-200' : 'border-gray-100'}`}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}
                >
                  {dayNumber}
                </span>
                {isWeekend && person && (
                  <div className="mt-auto">
                    <div
                      className={`text-xs truncate ${isToday ? 'text-white' : 'text-indigo-600'}`}
                      title={person}
                    >
                      {person}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-600 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-50 border border-indigo-200 rounded"></div>
          <span>Current Week</span>
        </div>
      </div>
    </div>
  )
}
