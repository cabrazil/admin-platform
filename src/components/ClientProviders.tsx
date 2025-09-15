'use client'

import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Durante SSR, renderizar sem UserProvider para evitar hidratação
  if (!isClient) {
    return (
      <>
        {children}
        <Toaster position="top-right" />
      </>
    )
  }

  // No cliente, renderizar com UserProvider
  return (
    <>
      <UserProvider>
        {children}
      </UserProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
}