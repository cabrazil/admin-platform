'use client'

import { useState, useEffect } from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    )
  }

  return <>{children}</>
}
