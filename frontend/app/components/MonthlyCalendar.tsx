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
    
    // Find the Saturday of the week containing this date
    // Saturday is day 6, Sunday is day 0
    const dayOfWeek = date.getDay()
    const saturday = new Date(date)
    
    if (dayOfWeek === 0) {
      // If it's Sunday, get Saturday from the SAME week (go back 1 day)
      saturday.setDate(date.getDate() - 1)
    } else if (dayOfWeek === 6) {
      // If it's Saturday, use this date
      // (no change needed)
    } else {
      // For other weekdays, calculate forward to Saturday
      const daysUntilSaturday = 6 - dayOfWeek
      saturday.setDate(date.getDate() + daysUntilSaturday)
    }
    
    saturday.setHours(0, 0, 0, 0)
    
    // Find the schedule item with matching Saturday date
    const scheduleItem = schedule.find((item) => {
      const itemDate = new Date(item.date)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === saturday.getTime()
    })
    
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
    <div className="bg-white rounded-lg shadow-md p-2 md:p-6 mb-6 w-full md:w-[50%] dark:bg-gray-800 dark:shadow-black/30">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 md:mb-4 gap-2">
        <h3 className="text-lg md:text-xl font-semibold">{monthName}</h3>
        <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto">
          <button
            onClick={goToPreviousMonth}
            className="p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 md:px-3 py-1 text-xs md:text-sm hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-medium text-gray-500 py-1 md:py-2 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
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
              className={`aspect-square p-1 md:p-2 rounded-lg border transition-colors text-xs md:text-sm ${isToday ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : isCurrentWeek ? 'bg-indigo-200 border-indigo-400 font-semibold dark:bg-indigo-900/60 dark:border-indigo-700' : isWeekend && person ? 'bg-gray-50 border-gray-200 dark:bg-gray-700/40 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-xs md:text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {dayNumber}
                </span>
                {isWeekend && person && (
                  <div className="mt-auto">
                    <div
                      className={`text-xs md:text-xs break-words line-clamp-2 ${isToday ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}
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
      <div className="mt-3 md:mt-4 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-indigo-600 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-indigo-200 border border-indigo-400 rounded dark:bg-indigo-900/60 dark:border-indigo-700"></div>
          <span>Current Week</span>
        </div>
      </div>
    </div>
  )
}
