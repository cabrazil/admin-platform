'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthWrapper from '@/components/AuthWrapper'
import { useAuth } from '@/hooks/useAuth'
import { 
  ArrowLeft,
  Play,
  FileText,
  User,
  Tag,
  Bot,
  Loader2,
  CheckCircle,
  X,
  Sparkles,
  Zap,
  Brain,
  Cpu
} from 'lucide-react'

interface Prompt {
  id: number
  name: string
  content: string
  isActive: boolean
}

interface Category {
  id: number
  title: string
  slug: string
}

interface Author {
  id: number
  name: string
  email: string
}

interface Blog {
  id: number
  name: string
  slug: string
}

function GenerateArticlePageContent() {
  const { dbUser, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const blogId = params?.id as string
  const preSelectedPromptId = searchParams.get('promptId')
  
  const [blog, setBlog] = useState<Blog | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  
  const [selectedPrompt, setSelectedPrompt] = useState<string>(preSelectedPromptId || "")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedAuthor, setSelectedAuthor] = useState<string>("")
  const [topic, setTopic] = useState<string>("")
  const [selectedProvider, setSelectedProvider] = useState<string>("openai")
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && dbUser && blogId) {
      fetchData()
    }
  }, [isLoading, dbUser, blogId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar dados do blog
      console.log('🔍 Buscando dados do blog:', blogId)
      const blogResponse = await fetch(`/api/blogs/${blogId}`, {
        credentials: 'include'
      })
      console.log('📊 Resposta blog:', blogResponse.status, blogResponse.statusText)
      if (!blogResponse.ok) {
        throw new Error('Blog não encontrado')
      }
      const blogData = await blogResponse.json()
      console.log('📝 Dados do blog:', blogData.data.blog)
      setBlog(blogData.data.blog)
      
      // Buscar prompts do blog
      const promptsResponse = await fetch(`/api/blogs/${blogId}/prompts`, {
        credentials: 'include'
      })
      if (!promptsResponse.ok) {
        throw new Error('Erro ao carregar prompts')
      }
      const promptsData = await promptsResponse.json()
      setPrompts(promptsData.data.prompts.filter((p: Prompt) => p.isActive))
      
      // Buscar categorias do blog
      console.log('🔍 Buscando categorias para blog:', blogId)
      const categoriesResponse = await fetch(`/api/blogs/${blogId}/categories`, {
        credentials: 'include'
      })
      console.log('📊 Resposta categorias:', categoriesResponse.status, categoriesResponse.statusText)
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        console.log('📋 Categorias carregadas:', categoriesData.data?.categories)
        setCategories(categoriesData.data?.categories || [])
      } else {
        const errorData = await categoriesResponse.json().catch(() => ({}))
        console.error('❌ Erro ao carregar categorias:', categoriesResponse.status, errorData)
        setError(`Erro ao carregar categorias: ${errorData.error || categoriesResponse.statusText}`)
      }
      
      // Buscar autores do blog
      console.log('🔍 Buscando autores para blog:', blogId)
      const authorsResponse = await fetch(`/api/blogs/${blogId}/authors`, {
        credentials: 'include'
      })
      console.log('📊 Resposta autores:', authorsResponse.status, authorsResponse.statusText)
      if (authorsResponse.ok) {
        const authorsData = await authorsResponse.json()
        console.log('👥 Autores carregados:', authorsData.data?.authors)
        setAuthors(authorsData.data?.authors || [])
      } else {
        const errorData = await authorsResponse.json().catch(() => ({}))
        console.error('❌ Erro ao carregar autores:', authorsResponse.status, errorData)
        setError(`Erro ao carregar autores: ${errorData.error || authorsResponse.statusText}`)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!selectedCategory) {
      setError("Por favor, selecione uma categoria")
      return false
    }
    if (!selectedAuthor) {
      setError("Por favor, selecione um autor")
      return false
    }
    if (!topic.trim()) {
      setError("Por favor, digite um tópico")
      return false
    }
    if (topic.length < 3) {
      setError("O tópico deve ter pelo menos 3 caracteres")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) {
      return
    }
    
    setGenerating(true)

    try {
      const response = await fetch(`/api/blogs/${blogId}/articles/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptId: selectedPrompt ? parseInt(selectedPrompt) : null,
          categoryId: parseInt(selectedCategory),
          authorId: parseInt(selectedAuthor),
          topic,
          count: 1,
          provider: selectedProvider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar artigo")
      }

      setSuccess("Artigo gerado com sucesso!")
      
      // Redirecionar para o artigo após 2 segundos
      setTimeout(() => {
        if (data.data?.article?.id) {
          router.push(`/blogs/${blogId}/articles/${data.data.article.id}/edit`)
        } else {
          router.push(`/blogs/${blogId}/articles`)
        }
      }, 2000)
    } catch (err) {
      console.error("Erro detalhado:", err)
      setError(err instanceof Error ? err.message : "Erro ao gerar artigo")
    } finally {
      setGenerating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(null)
    const { name, value } = e.target
    
    switch (name) {
      case 'prompt':
        setSelectedPrompt(value)
        break
      case 'category':
        setSelectedCategory(value)
        break
      case 'topic':
        setTopic(value)
        break
      case 'author':
        setSelectedAuthor(value)
        break
      case 'provider':
        setSelectedProvider(value)
        break
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Gerar Artigo com IA</h1>
              <div className="text-gray-600 mt-1">
                Blog: <span className="font-medium">{blog?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configurações do Artigo</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Categoria do Artigo
                </label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Escolha a categoria em que o artigo será publicado.
                </p>
              </div>

              {/* Autor */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Autor do Artigo
                </label>
                <select
                  id="author"
                  name="author"
                  value={selectedAuthor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um autor</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione o autor que assinará o artigo.
                </p>
              </div>

              {/* Prompt de IA */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  <Bot className="h-4 w-4 inline mr-1" />
                  Prompt de IA (opcional)
                </label>
                <select
                  id="prompt"
                  name="prompt"
                  value={selectedPrompt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um prompt</option>
                  {prompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Se nenhum prompt for selecionado, será usado o prompt padrão.
                </p>
              </div>
              
              {/* Provedor de IA */}
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                  <Brain className="h-4 w-4 inline mr-1" />
                  Provedor de IA
                </label>
                <select
                  id="provider"
                  name="provider"
                  value={selectedProvider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="openai">
                    🤖 OpenAI GPT-4 - Modelo avançado com excelente compreensão
                  </option>
                  <option value="gemini">
                    🧠 Google Gemini Pro - Modelo do Google com forte capacidade de raciocínio
                  </option>
                  <option value="claude">
                    💡 Anthropic Claude - Modelo especializado em escrita criativa
                  </option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Escolha o provedor de IA que irá gerar o conteúdo do artigo.
                </p>
              </div>

              {/* Tópico */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Tópico do Artigo
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={topic}
                  onChange={handleInputChange}
                  placeholder="Ex: Introdução à Inteligência Artificial"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={3}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Descreva o tópico sobre o qual você deseja gerar um artigo.
                </p>
              </div>

              {/* Mensagens de erro/sucesso */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <X className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>{success}</span>
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
                  disabled={generating || loading}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Gerar Artigo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 space-y-4">
          {/* Status dos Provedores de IA */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-900">🤖 Provedores de IA Disponíveis:</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>OpenAI GPT-4: {typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '✅ Configurado' : '⏳ Verificando...'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>Google Gemini Pro: {typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '✅ Configurado' : '⏳ Verificando...'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span>Anthropic Claude: ⏳ Em breve</span>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas para melhor geração:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Seja específico no tópico para obter artigos mais direcionados</li>
              <li>• Use prompts personalizados para diferentes tipos de conteúdo</li>
              <li>• O artigo será criado como rascunho e você poderá editá-lo depois</li>
              <li>• A geração pode levar alguns segundos dependendo da complexidade</li>
              <li>• Se OpenAI não estiver configurado, será usado conteúdo simulado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GenerateArticlePage() {
  return (
    <AuthWrapper>
      <GenerateArticlePageContent />
    </AuthWrapper>
  )
}
