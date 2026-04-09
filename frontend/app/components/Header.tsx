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
    <div className="w-full bg-white shadow-md mb-8">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/households" className="text-center flex-1 hover:opacity-80 transition-opacity cursor-pointer">
          <p className="text-3xl font-bold text-indigo-600 mb-1">
            Flatemate Cleaning Roster
          </p>
          <p className="text-sm text-gray-600">
            Keep your shared space clean with a fair rotation system
          </p>
        </Link>
        
        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Link
              href="/account-settings"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}