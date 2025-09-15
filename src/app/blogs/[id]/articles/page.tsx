'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AuthWrapper from '@/components/AuthWrapper'
import { useAuth } from '@/hooks/useAuth'
import { 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'

interface Article {
  id: number
  title: string
  description: string
  content: string
  imageUrl: string | null
  published: boolean

  createdAt: string
  updatedAt: string
  slug: string
  viewCount: number
  likeCount: number
  author: {
    id: number
    name: string
    imageUrl: string | null
  }
  category: {
    id: number
    title: string
  }
  tags: Array<{
    id: number
    name: string
  }>
}

interface Blog {
  id: number
  name: string
  slug: string
  domain: string | null
  status: string
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function BlogArticlesPageContent() {
  const { dbUser, isMaster, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id as string
  
  const [blog, setBlog] = useState<Blog | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [hasAccess, setHasAccess] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && dbUser && blogId) {
      checkAccess()
    }
  }, [isLoading, dbUser, blogId])

  const checkAccess = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/access`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setHasAccess(data.data.hasAccess)
          setUserRole(data.data.role)
          
          if (data.data.hasAccess) {
            fetchBlogAndArticles()
          } else {
            setError('Você não tem permissão para acessar este blog')
            setLoading(false)
          }
        }
      }
    } catch (err) {
      console.error('Erro ao verificar acesso:', err)
      setError('Erro ao verificar permissões')
      setLoading(false)
    }
  }

  const fetchBlogAndArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar blog e artigos em paralelo
      const [blogResponse, articlesResponse] = await Promise.all([
        fetch(`/api/blogs/${blogId}`),
        fetch(`/api/blogs/${blogId}/articles?status=${filterStatus}&search=${searchTerm}`)
      ])
      
      if (!blogResponse.ok) {
        throw new Error(`Erro ao carregar blog: ${blogResponse.status}`)
      }
      
      if (!articlesResponse.ok) {
        throw new Error(`Erro ao carregar artigos: ${articlesResponse.status}`)
      }
      
      const [blogData, articlesData] = await Promise.all([
        blogResponse.json(),
        articlesResponse.json()
      ])
      
      if (blogData.success) {
        setBlog(blogData.data)
      }
      
      if (articlesData.success) {
        setArticles(articlesData.data.articles || [])
      }
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir artigo')
      }

      // Recarregar artigos
      fetchBlogAndArticles()
    } catch (err) {
      console.error('Erro ao excluir artigo:', err)
      alert('Erro ao excluir artigo')
    }
  }

  // Estados de carregamento/erro
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // if (!user) {
  //   router.push('/login')
  //   return null
  // }

  // const isMaster = isMasterAdmin(user?.email)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{blog ? `Artigos - ${blog.name}` : 'Artigos do Blog'}</h1>
          <p className="text-gray-600">{blog ? `Gerencie os artigos do blog ${blog.domain || blog.slug}` : 'Carregando...'}</p>
        </div>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div>
            <Link
              href="/blogs"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para blogs
            </Link>
          </div>

          {/* Header do blog */}
          {blog && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                {blog.logoUrl ? (
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={blog.logoUrl}
                      alt={`${blog.title} logo`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-8 w-8 text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{blog.name}</h2>
                  <p className="text-gray-600">Blog ID: {blog.id}</p>
                  <a 
                    href={blog.domain ? `https://${blog.domain}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {blog.domain || blog.slug}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Controles */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-1 items-center space-x-4">
              {/* Busca */}
              <div className="relative flex-1 max-w-md">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Filtro */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="published">Publicados</option>
                <option value="draft">Rascunhos</option>
              </select>
            </div>
            
            <Link
              href={`/blogs/${blogId}/articles/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Artigo
            </Link>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Lista de artigos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando artigos...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum artigo encontrado</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro artigo'
                }
              </p>
              <Link
                href={`/blogs/${blogId}/articles/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Artigo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Título e descrição */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            <Link
                              href={`/blogs/${blogId}/articles/${article.id}/edit`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {article.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 line-clamp-2">
                            {article.description}
                          </p>
                          
                          {/* Metadados */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {article.author?.name || 'Autor não definido'}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {article.published 
                                ? `Publicado em ${formatDate(article.updatedAt)}`
                                : `Criado em ${formatDate(article.createdAt)}`
                              }
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {article.viewCount} visualizações
                            </div>
                          </div>
                          
                          {/* Tags e categoria */}
                          <div className="flex items-center gap-3 mt-3">
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {article.category?.title || 'Categoria não definida'}
                            </span>
                            
                            {article.tags && article.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tag.name}
                              </span>
                            ))}
                            
                            {article.tags && article.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{article.tags.length - 3} mais
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status e ações */}
                      <div className="flex items-start space-x-3 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.published ? 'Publicado' : 'Rascunho'}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {article.published && (
                            <a
                              href={blog?.domain ? `https://${blog.domain}/articles/${article.slug}` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600"
                              title="Ver artigo publicado"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          
                          <Link
                            href={`/blogs/${blogId}/articles/${article.id}/edit`}
                            className="text-gray-400 hover:text-blue-600"
                            title="Editar artigo"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Excluir artigo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BlogArticlesPage() {
  return (
    <AuthWrapper>
      <BlogArticlesPageContent />
    </AuthWrapper>
  )
}
