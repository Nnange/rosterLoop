'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="w-full bg-white shadow-md mb-4 md:mb-8 dark:bg-gray-900 dark:shadow-black/30">
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-3 md:py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <Link href="/households" className="text-center md:text-left hover:opacity-80 transition-opacity cursor-pointer flex-1">
          <p className="text-lg md:text-3xl font-bold text-indigo-600 mb-0 md:mb-1 dark:text-indigo-400">
            Flatemate Cleaning Roster
          </p>
          <p className="text-xs md:text-sm text-gray-600 hidden md:block dark:text-gray-400">
            Keep your shared space clean with a fair rotation system
          </p>
        </Link>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4">
          {isAuthenticated && user && (
            <>
              <div className="text-left md:text-right text-xs md:text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-gray-500 truncate dark:text-gray-400">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/account-settings"
                  className="bg-gray-600 text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-gray-700 transition-colors text-xs md:text-sm font-medium text-center dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-red-700 transition-colors text-xs md:text-sm font-medium dark:bg-red-700 dark:hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
