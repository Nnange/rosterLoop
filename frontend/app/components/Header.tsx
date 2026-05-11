'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="w-full bg-white shadow-md mb-4 md:mb-8">
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-3 md:py-4">
        <Link href="/households" className="text-center hover:opacity-80 transition-opacity cursor-pointer mb-3 md:mb-0 flex-1">
          <p className="text-lg md:text-3xl font-bold text-indigo-600 mb-0 md:mb-1">
            Flatemate Cleaning Roster
          </p>
          <p className="text-xs md:text-sm text-gray-600 hidden md:block">
            Keep your shared space clean with a fair rotation system
          </p>
        </Link>
        
        {isAuthenticated && user && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="text-left md:text-right text-xs md:text-sm flex-1">
              <p className="font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Link
                href="/account-settings"
                className="flex-1 md:flex-none bg-gray-600 text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-gray-700 transition-colors text-xs md:text-sm font-medium text-center"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 md:flex-none bg-red-600 text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-red-700 transition-colors text-xs md:text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}