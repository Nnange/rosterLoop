"use client"

import { useEffect, useState } from 'react'
import {
    generateYearlySchedule,
    getWeekNumber,
    formatWeekendRange,
} from '../utils/scheduleGenerator';
import { MonthlyCalendar } from './MonthlyCalendar';

interface CleaningScheduleProps {
    roommates: string[]
}
export function CleaningSchedule({ roommates }: CleaningScheduleProps) {
    const [schedule, setSchedule] = useState<
        Array<{
            date: Date
            person: string
        }>
    >([])
    const [currentWeek, setCurrentWeek] = useState<number>(0)
    const [viewMode, setViewMode] = useState<'current' | 'all'>('current')
    useEffect(() => {
        setSchedule(generateYearlySchedule(roommates))
        setCurrentWeek(getWeekNumber(new Date()))
    }, [roommates])
    const currentPersonOnDuty =
        schedule.find((item) => getWeekNumber(item.date) === currentWeek)?.person ||
        'Loading...'
    const currentWeekendDate = schedule.find(
        (item) => getWeekNumber(item.date) === currentWeek,
    )?.date
    const nextPersonOnDuty =
        schedule.find((item) => getWeekNumber(item.date) === currentWeek + 1)
            ?.person || 'Loading...'

    return (
        <>
            <MonthlyCalendar schedule={schedule} currentWeek={currentWeek} />

            <div className="bg-white rounded-lg shadow-md overflow-hidden min-w-[70%]">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Cleaning Schedule
                    </h2>
                    <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-medium text-indigo-800 mb-2">
                            This Weekend
                        </h3>
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {currentPersonOnDuty.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <p className="text-xl font-semibold">{currentPersonOnDuty}</p>
                                <p className="text-gray-600">
                                    {currentWeekendDate
                                        ? formatWeekendRange(currentWeekendDate)
                                        : `Week ${currentWeek}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                            Next Weekend
                        </h3>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
                                {nextPersonOnDuty.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <p className="text-lg font-medium">{nextPersonOnDuty}</p>
                                <p className="text-gray-500">Week {currentWeek + 1}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-b px-6 py-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Schedule</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('current')}
                                className={`px-3 py-1 rounded text-sm ${viewMode === 'current' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Next 4 Weeks
                            </button>
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-3 py-1 rounded text-sm ${viewMode === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Full Year
                            </button>
                        </div>
                    </div>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                    {schedule
                        .filter((item) => {
                            if (viewMode === 'current') {
                                const itemWeek = getWeekNumber(item.date)
                                return itemWeek >= currentWeek && itemWeek < currentWeek + 4
                            }
                            return true
                        })
                        .map((item, index) => {
                            const isCurrentWeek = getWeekNumber(item.date) === currentWeek
                            return (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center p-4 ${isCurrentWeek ? 'bg-indigo-50' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${isCurrentWeek ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            {item.person.charAt(0)}
                                        </div>
                                        <span className="font-medium">{item.person}</span>
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        <span>Week {getWeekNumber(item.date)}</span>
                                        <span className="mx-1">•</span>
                                        <span>{formatWeekendRange(item.date)}</span>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
        </>
    )
}
