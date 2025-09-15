'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthWrapper from '@/components/AuthWrapper'
import { useAuth } from '@/hooks/useAuth'
import { 
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  XCircle
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

function EditPromptPageContent() {
  const { dbUser, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id as string
  const promptId = params?.promptId as string
  
  const [blog, setBlog] = useState<Blog | null>(null)
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isLoading && dbUser && blogId && promptId) {
      fetchBlogAndPrompt()
    }
  }, [isLoading, dbUser, blogId, promptId])

  const fetchBlogAndPrompt = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar dados do blog
      const blogResponse = await fetch(`/api/blogs/${blogId}`)
      if (!blogResponse.ok) {
        throw new Error('Blog não encontrado')
      }
      const blogData = await blogResponse.json()
      setBlog(blogData.data.blog)
      
      // Buscar dados do prompt
      const promptResponse = await fetch(`/api/blogs/${blogId}/prompts/${promptId}`)
      if (!promptResponse.ok) {
        const errorData = await promptResponse.json()
        throw new Error(errorData.error || 'Erro ao carregar prompt')
      }
      
      const promptData = await promptResponse.json()
      if (promptData.success) {
        setPrompt(promptData.data.prompt)
      } else {
        throw new Error(promptData.error || 'Erro ao carregar prompt')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt) return

    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const response = await fetch(`/api/blogs/${blogId}/prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar prompt')
      }

      setSuccess(true)
      
      // Redirecionar após 1.5 segundos
      setTimeout(() => {
        router.push(`/blogs/${blogId}/prompts`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Prompt, value: string | boolean) => {
    if (!prompt) return
    
    setPrompt({ ...prompt, [field]: value })
    setError(null) // Limpar erro quando usuário começar a editar
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && (error.includes('não encontrado') || error.includes('não encontrada'))) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-red-800 font-semibold text-xl mb-2">Recurso não encontrado</h2>
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

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-800 font-semibold text-xl mb-2">Carregando...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/blogs/${blogId}/prompts`}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Prompt</h1>
              <div className="text-gray-600 mt-1">
                Blog: <span className="font-medium">{blog?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {success && (
            <div className="p-4 bg-green-50 border-b border-green-200 text-green-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Prompt atualizado com sucesso! Redirecionando...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nome do Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Prompt
              </label>
              <input
                type="text"
                value={prompt.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite um nome para o prompt"
                required
              />
            </div>

            {/* Conteúdo do Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo do Prompt
              </label>
              <textarea
                value={prompt.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Use {topic} para referenciar o tópico do artigo. Exemplo: 'Escreva um artigo sobre {topic}'"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Use {'{topic}'} para referenciar o tópico do artigo. O texto será substituído automaticamente.
              </p>
            </div>

            {/* Status Ativo/Inativo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={prompt.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Prompt ativo
              </label>
              {prompt.isActive ? (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3" />
                  Ativo
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3" />
                  Inativo
                </span>
              )}
            </div>

            {/* Informações do Prompt */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Informações do Prompt</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">ID:</span> {prompt.id}
                </div>
                <div>
                  <span className="font-medium">Blog ID:</span> {prompt.blogId}
                </div>
                <div>
                  <span className="font-medium">Criado em:</span> {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {prompt.isActive ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link
                href={`/blogs/${blogId}/prompts`}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving || success}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function EditPromptPage() {
  return (
    <AuthWrapper>
      <EditPromptPageContent />
    </AuthWrapper>
  )
}
