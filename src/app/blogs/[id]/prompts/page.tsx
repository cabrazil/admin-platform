'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthWrapper from '@/components/AuthWrapper'
import { useAuth } from '@/hooks/useAuth'
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Building2
} from 'lucide-react'

interface Prompt {
  id: number
  name: string
  content: string
  isActive: boolean
  createdAt: string
  blogId: number
}

interface Blog {
  id: number
  name: string
  slug: string
}

function BlogPromptsPageContent() {
  const { dbUser, isMaster, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id as string
  
  const [blog, setBlog] = useState<Blog | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    content: '',
    isActive: true
  })

  useEffect(() => {
    if (!isLoading && dbUser && blogId) {
      fetchBlogAndPrompts()
    }
  }, [isLoading, dbUser, blogId])

  const fetchBlogAndPrompts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar blog e prompts em paralelo (otimizado)
      const [blogResponse, promptsResponse] = await Promise.all([
        fetch(`/api/blogs/${blogId}`, { credentials: 'include' }),
        fetch(`/api/blogs/${blogId}/prompts?includeInactive=true`, { credentials: 'include' })
      ])
      
      if (!blogResponse.ok) {
        throw new Error('Blog não encontrado')
      }
      
      if (!promptsResponse.ok) {
        const errorData = await promptsResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao carregar prompts')
      }
      
      const [blogData, promptsData] = await Promise.all([
        blogResponse.json(),
        promptsResponse.json()
      ])
      
      if (blogData.success) {
        setBlog(blogData.data.blog || blogData.data)
      }
      
      if (promptsData.success) {
        setPrompts(promptsData.data.prompts || [])
      } else {
        throw new Error(promptsData.error || 'Erro ao carregar prompts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch(`/api/blogs/${blogId}/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrompt),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar prompt')
      }

      const data = await response.json()
      setPrompts([...prompts, data.data.prompt])
      setIsCreating(false)
      setNewPrompt({ name: '', content: '', isActive: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar prompt')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) {
      return
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/blogs/${blogId}/prompts/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir prompt')
      }

      setPrompts(prompts.filter(prompt => prompt.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir prompt')
    }
  }

  const handleGenerateArticle = (promptId: number) => {
    router.push(`/blogs/${blogId}/prompts/generate?promptId=${promptId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && error.includes('não encontrado')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-red-800 font-semibold text-xl mb-2">Blog não encontrado</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/blogs')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar para blogs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/blogs')}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prompts de IA</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Building2 className="h-4 w-4" />
                <span>{blog?.name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Gerencie os prompts para geração de artigos neste blog</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/blogs/${blogId}/prompts/generate`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Gerar Artigo
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Formulário de criação */}
        {isCreating && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium mb-4">Criar Novo Prompt</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Prompt
                </label>
                <input
                  type="text"
                  value={newPrompt.name}
                  onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Artigo Informativo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Prompt
                </label>
                <textarea
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Use {topic} para referenciar o tópico do artigo"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use {'{topic}'} para referenciar o tópico do artigo
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newPrompt.isActive}
                  onChange={(e) => setNewPrompt({ ...newPrompt, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Prompt ativo
                </label>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Prompt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Lista de prompts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando prompts...</p>
            </div>
          ) : prompts.length === 0 && !isCreating ? (
            <div className="p-8 text-center">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prompt encontrado</h3>
              <p className="text-gray-600 mb-4">Crie seu primeiro prompt para começar a gerar artigos com IA</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeiro Prompt
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{prompt.name}</h3>
                        {prompt.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{prompt.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleGenerateArticle(prompt.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Gerar artigo com este prompt"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      
                      <Link
                        href={`/blogs/${blogId}/prompts/${prompt.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar prompt"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir prompt"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

export default function BlogPromptsPage() {
  return (
    <AuthWrapper>
      <BlogPromptsPageContent />
    </AuthWrapper>
  )
}
