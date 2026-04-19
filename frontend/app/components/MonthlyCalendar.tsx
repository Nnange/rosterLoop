import { useState } from 'react'
import { getWeekIndexFromStartDate } from '../utils/scheduleGenerator'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface MonthlyCalendarProps {
  schedule: Array<{
    date: Date
    person: string
    weekIndex: number
    weekNumber: number
  }>
  currentWeekIndex: number
}

export function MonthlyCalendar({
  schedule,
  currentWeekIndex,
}: Readonly<MonthlyCalendarProps>) {
  const today = new Date()
  const [displayMonth, setDisplayMonth] = useState(today.getMonth())
  const [displayYear, setDisplayYear] = useState(today.getFullYear())
  
  // Get first and last day of displayed month
  const firstDay = new Date(displayYear, displayMonth, 1)
  const lastDay = new Date(displayYear, displayMonth + 1, 0)
  
  // Get the day of week for first day, adjusted for Monday start (0 = Monday, 6 = Sunday)
  const dayOfWeek = firstDay.getDay()
  const startingDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  
  // Calculate total days to display (including padding)
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7
  
  // Get person on duty for a specific date
  const getPersonForDate = (date: Date): string | null => {
    if (schedule.length === 0) return null
    
    const weekIndex = getWeekIndexFromStartDate(date, schedule[0].date)
    const scheduleItem = schedule.find(
      (item) => item.weekIndex === weekIndex,
    )
    return scheduleItem ? scheduleItem.person : null
  }
  
  const monthName = new Date(displayYear, displayMonth).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    },
  )
  
  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11)
      setDisplayYear(displayYear - 1)
    } else {
      setDisplayMonth(displayMonth - 1)
    }
  }
  
  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0)
      setDisplayYear(displayYear + 1)
    } else {
      setDisplayMonth(displayMonth + 1)
    }
  }
  
  const goToToday = () => {
    setDisplayMonth(today.getMonth())
    setDisplayYear(today.getFullYear())
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 lg:w-[50%]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{monthName}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
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
            return <div key={`empty-${displayYear}-${displayMonth}-${index}`} className="aspect-square" />
          }
          const date = new Date(displayYear, displayMonth, dayNumber)
          const isToday = date.toDateString() === today.toDateString()
          
          // Get the start of this week (Monday) and start of current week (Monday)
          const getWeekStart = (d: Date) => {
            const tempDate = new Date(d)
            const day = tempDate.getDay()
            const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
            tempDate.setDate(diff)
            tempDate.setHours(0, 0, 0, 0)
            return tempDate
          }
          
          const weekStart = getWeekStart(date)
          const currentWeekStart = getWeekStart(today)
          const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime()
          
          const weekIndex = schedule.length > 0 ? getWeekIndexFromStartDate(date, schedule[0].date) : -1
          const person = getPersonForDate(date)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          
          return (
            <div
              key={`${displayYear}-${displayMonth}-${dayNumber}`}
              className={`aspect-square p-2 rounded-lg border transition-colors ${isToday ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : isCurrentWeek ? 'bg-indigo-200 border-indigo-400 font-semibold' : isWeekend && person ? 'bg-gray-50 border-gray-200' : 'border-gray-100'}`}
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
          <div className="w-4 h-4 bg-indigo-200 border border-indigo-400 rounded"></div>
          <span>Current Week</span>
        </div>
      </div>
    </div>
  )
}
