import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Blog {
  id: number
  name: string
  slug: string
  domain: string | null
  themeSettings: any
  status: string
  createdAt: string
  updatedAt: string
  ownerId: number | null
  owner: {
    id: number
    name: string
    email: string
  } | null
  _count: {
    articles: number
    users: number
  }
}

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.getBlogs()
        if (response.success && response.data) {
          setBlogs(response.data.blogs)
        } else {
          throw new Error(response.error || 'Erro ao carregar blogs')
        }
      } catch (err) {
        console.error('Erro ao buscar blogs:', err)
        setError('Erro ao carregar blogs')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  return { blogs, loading, error }
}
