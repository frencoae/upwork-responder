//components/Layout/Topbar.tsx


// components/Layout/Topbar.tsx
'use client'

interface User {
  id: number
  name: string
  email: string
  company_name: string
  profile_photo?: string
}

interface TopbarProps {
  user: User | null
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Topbar({ user, sidebarOpen, setSidebarOpen }: TopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900"> DASHBOARD</h1>
            {/* <p className="text-sm text-gray-600 hidden sm:block">
              Upwork assistant
            </p> */}
          </div>
        </div>
        
        {/* User Profile with Photo */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.company_name || 'Professional Plan'}</p>
            </div>
          </div>
          
          {/* Profile Photo Display */}
          {user?.profile_photo ? (
            <img
              src={user.profile_photo}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-lg"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}