'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AdminLayout from '@/components/AdminLayout'
import AuthWrapper from '@/components/AuthWrapper'
import { useAuth } from '@/hooks/useAuth'
import { 
  Building2, 
  FileText, 
  Users, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  MoreVertical
} from 'lucide-react'

interface Blog {
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function BlogsPageContent() {
  const { dbUser, isMaster, blogs: userBlogs, isLoading } = useAuth()
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (isMaster) {
      // Master admin vê todos os blogs
      fetchAllBlogs()
    } else {
      // Outros usuários veem apenas blogs do hook useAuth
      setBlogs(userBlogs || [])
      setLoading(false)
    }
  }, [isMaster, userBlogs, isLoading])

  const fetchAllBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/blogs')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar blogs')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setBlogs(data.data.blogs)
      } else {
        throw new Error(data.error || 'Erro ao carregar blogs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBlog = async (blogId: number) => {
    if (!confirm('Tem certeza que deseja excluir este blog? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir blog')
      }

      // Remover blog da lista
      setBlogs(blogs.filter(blog => blog.id !== blogId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir blog')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout title="Gerenciar Blogs" subtitle="Lista de todos os blogs da plataforma">
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isMaster ? 'Todos os Blogs' : 'Meus Blogs'}
              </h2>
              <p className="text-sm text-gray-600">
                {blogs.length} {blogs.length === 1 ? 'blog encontrado' : 'blogs encontrados'}
              </p>
            </div>
          </div>
          
          <Link
            href="/blogs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Blog
          </Link>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Estados de loading e vazio */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum blog encontrado</h3>
            <p className="text-gray-600 mb-6">
              {isMaster 
                ? 'Ainda não há blogs cadastrados na plataforma.' 
                : 'Você ainda não possui blogs cadastrados.'
              }
            </p>
            <Link
              href="/blogs/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Blog
            </Link>
          </div>
        ) : (
          /* Grid de blogs */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                {/* Header do card */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {blog.themeSettings?.logoUrl ? (
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={blog.themeSettings.logoUrl}
                            alt={`${blog.name} logo`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {blog.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {blog.domain || blog.slug}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.status === 'active'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {blog.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {blog.themeSettings?.description || 'Sem descrição'}
                  </p>
                </div>

                {/* Estatísticas */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{blog._count.articles} artigos</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{blog._count.users} usuários</span>
                      </div>
                    </div>
                  </div>
                  
                  {blog.owner && (
                    <div className="mt-2 text-xs text-gray-500">
                      Proprietário: {blog.owner.name}
                    </div>
                  )}
                  
                  <div className="mt-1 text-xs text-gray-500">
                    Criado em: {formatDate(blog.createdAt)}
                  </div>
                </div>

                {/* Ações */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/blogs/${blog.id}/articles`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Ver Artigos
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link
                        href={`/blogs/${blog.id}/prompts`}
                        className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                      >
                        Ver Prompts
                      </Link>
                      <Link
                        href={`/blogs/${blog.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Editar
                      </Link>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {blog.domain && (
                        <a
                          href={`https://${blog.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                          title="Visitar blog"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      
                      {(isMaster || blog.owner?.email === user?.email) && (
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Excluir blog"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function BlogsPage() {
  return (
    <AuthWrapper>
      <BlogsPageContent />
    </AuthWrapper>
  )
}
