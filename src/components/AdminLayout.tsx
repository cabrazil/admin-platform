'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBlogs } from '@/hooks/useBlogs'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Bot,
  Menu,
  X,
  ChevronDown,
  Building2,
  LogOut
} from 'lucide-react'
import Image from 'next/image'

// Componente para evitar hidratação
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [blogsDropdownOpen, setBlogsDropdownOpen] = useState(false)
  const { user, isLoading, isAuthenticated, userRole, isMaster, mounted } = useAuth()
  const { blogs, loading: blogsLoading } = useBlogs()
  const router = useRouter()

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.blog-selector')) {
        setBlogsDropdownOpen(false)
      }
    }

    if (blogsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [blogsDropdownOpen])

  // Verificar se usuário está logado
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Blogs', href: '/blogs', icon: Building2 },
    { name: 'Usuários', href: '/users', icon: Users },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ]

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Platform</h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.picture ? (
                  <Image 
                    className="h-8 w-8 rounded-full" 
                    src={user.picture} 
                    alt={user.name || 'Avatar'}
                    width={32}
                    height={32}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {isMaster ? 'Master Admin' : userRole}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/api/auth/logout'}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-0">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b lg:px-8">
          <div className="flex items-center">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Blog selector */}
          <div className="relative blog-selector">
            <button
              onClick={() => setBlogsDropdownOpen(!blogsDropdownOpen)}
              className="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={blogsLoading}
            >
              <Building2 className="h-4 w-4 mr-2" />
              {blogsLoading ? 'Carregando...' : `${blogs.length} Blogs`}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            {blogsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide border-b">
                    Blogs Disponíveis
                  </div>
                  {blogsLoading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Carregando blogs...
                    </div>
                  ) : blogs.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Nenhum blog encontrado
                    </div>
                  ) : (
                    blogs.map((blog) => (
                      <Link
                        key={blog.id}
                        href={`/blogs/${blog.id}/articles`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-b-0"
                        onClick={() => setBlogsDropdownOpen(false)}
                      >
                        <div className="font-medium">{blog.name}</div>
                        <div className="text-xs text-gray-500">{blog.domain}</div>
                      </Link>
                    ))
                  )}
                  <div className="border-t">
                    <Link
                      href="/blogs"
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      onClick={() => setBlogsDropdownOpen(false)}
                    >
                      Ver todos os blogs →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
