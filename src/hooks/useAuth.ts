'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useState, useEffect, useRef } from 'react'
import { UserRole, isMasterAdmin, getUserRole } from '@/lib/auth'

interface DBUser {
  id: number
  name: string
  email: string
  role: string
  auth0Sub: string
}

interface AuthState {
  user: any | null
  dbUser: DBUser | null
  isLoading: boolean
  isAuthenticated: boolean
  userRole: UserRole | null
  isMaster: boolean
  mounted: boolean
  blogs: any[]
}

export function useAuth(): AuthState {
  const { user, isLoading } = useUser()
  const [mounted, setMounted] = useState(false)
  const [dbUser, setDbUser] = useState<DBUser | null>(null)
  const [blogs, setBlogs] = useState<any[]>([])
  const [dbLoading, setDbLoading] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Buscar dados do usuário no banco quando autenticado
  useEffect(() => {
    async function fetchUserData() {
      if (!user || isLoading || fetchedRef.current) return

      try {
        fetchedRef.current = true
        setDbLoading(true)
        console.log('🔍 Buscando dados do usuário no banco...')
        
        const response = await fetch('/api/users/me')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('✅ Dados do usuário carregados:', data.data.user)
            setDbUser(data.data.user)
            setBlogs(data.data.blogs)
          }
        } else {
          console.error('❌ Erro na resposta da API:', response.status)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados do usuário:', error)
        fetchedRef.current = false // Reset em caso de erro
      } finally {
        setDbLoading(false)
      }
    }

    fetchUserData()
  }, [user, isLoading])

  // Reset quando user muda (logout/login)
  useEffect(() => {
    if (!user) {
      fetchedRef.current = false
      setDbUser(null)
      setBlogs([])
    }
  }, [user])

  // Durante SSR ou antes do mount, retornar estado de loading
  if (!mounted) {
    return {
      user: null,
      dbUser: null,
      isLoading: true,
      isAuthenticated: false,
      userRole: null,
      isMaster: false,
      mounted: false,
      blogs: []
    }
  }

  // Após mount, usar dados reais do Auth0 e banco
  const isAuthenticated = !!user && !isLoading
  const userRole = dbUser ? (dbUser.role as UserRole) : (isAuthenticated ? getUserRole(user) : null)
  const isMaster = dbUser ? dbUser.role === 'master' : (isAuthenticated ? isMasterAdmin(user?.email) : false)

  return {
    user,
    dbUser,
    isLoading: isLoading || dbLoading,
    isAuthenticated,
    userRole,
    isMaster,
    mounted: true,
    blogs
  }
}