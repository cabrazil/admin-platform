'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AdminLayout from '@/components/AdminLayout'
import UnsplashImageSearch from '@/components/UnsplashImageSearch'
import { isMasterAdmin } from '@/lib/auth'
import { 
  Building2, 
  Upload, 
  Search,
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
}

export default function NewBlogPage() {
  const { user, isLoading: authLoading } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    logoUrl: '',
    ownerId: '',
    isActive: true
  })
  
  // Estados da UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showImageSearch, setShowImageSearch] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  // Evitar erro de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading && user) {
      fetchUsers()
      
      // Se não é master admin, definir como owner por padrão
      if (!isMasterAdmin(user?.email)) {
        setFormData(prev => ({
          ...prev,
          ownerId: '1' // TODO: Buscar ID real do usuário
        }))
      }
    }
  }, [mounted, authLoading, user])

  const fetchUsers = async () => {
    try {
      // TODO: Substituir por API real
      // const response = await fetch('/api/users')
      // const data = await response.json()
      
      // Dados mock
      const mockUsers: User[] = [
        { id: 1, name: 'Carlos Brazil', email: 'carlos@cbrazil.com' },
        { id: 2, name: 'Ana Silva', email: 'ana@blogdacasa.com.br' },
        { id: 3, name: 'João Santos', email: 'joao@startupnews.tech' }
      ]
      
      setUsers(mockUsers)
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Limpar erros quando usuário digita
    if (error) {
      setError(null)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      logoUrl: imageUrl
    }))
    setShowImageSearch(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      // TODO: Implementar upload real
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formDataUpload,
      // })
      
      // if (!response.ok) {
      //   throw new Error('Erro ao fazer upload da imagem')
      // }
      
      // const data = await response.json()
      // setFormData(prev => ({ ...prev, logoUrl: data.url }))
      
      // Simular upload por enquanto
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          logoUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop&crop=center'
        }))
        setUploading(false)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem')
      setUploading(false)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('O título do blog é obrigatório')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('A descrição do blog é obrigatória')
      return false
    }
    
    if (!formData.domain.trim()) {
      setError('O domínio do blog é obrigatório')
      return false
    }
    
    // Validar formato do domínio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(formData.domain)) {
      setError('Por favor, insira um domínio válido (ex: meublog.com)')
      return false
    }
    
    if (isMasterAdmin(user?.email) && !formData.ownerId) {
      setError('Selecione um proprietário para o blog')
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
    
    setLoading(true)

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ownerId: formData.ownerId ? parseInt(formData.ownerId) : undefined
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar blog')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess('Blog criado com sucesso!')
        setTimeout(() => {
          router.push('/blogs')
        }, 1500)
      } else {
        throw new Error(result.error || 'Erro ao criar blog')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar blog')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const isMaster = isMasterAdmin(user?.email)

  return (
    <AdminLayout title="Criar Novo Blog" subtitle="Configure um novo blog na plataforma">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blogs"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista de blogs
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Novo Blog</h1>
              <p className="text-gray-600">Preencha as informações básicas do blog</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Título */}
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Blog *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Meu Blog Incrível"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="lg:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva brevemente o tema e propósito do blog..."
                  required
                />
              </div>

              {/* Domínio */}
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                  Domínio *
                </label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="meublog.com"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Digite apenas o domínio (sem http:// ou www)
                </p>
              </div>

              {/* Proprietário (apenas para master admin) */}
              {isMaster && (
                <div>
                  <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Proprietário *
                  </label>
                  <select
                    id="ownerId"
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione um usuário</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Logo do Blog */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo do Blog
              </label>
              
              <div className="space-y-4">
                {/* Preview da imagem */}
                {formData.logoUrl && (
                  <div className="flex items-center space-x-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={formData.logoUrl}
                        alt="Preview do logo"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Logo selecionado</p>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}

                {/* Opções de upload */}
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Upload do Computador'}
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowImageSearch(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar no Unsplash
                  </button>
                </div>

                {/* URL manual */}
                <div>
                  <input
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ou cole a URL da imagem aqui"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Blog ativo</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Blogs inativos não ficam visíveis publicamente
              </p>
            </div>

            {/* Mensagens */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/blogs"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Criando...' : 'Criar Blog'}
              </button>
            </div>
          </form>
        </div>

        {/* Modal de busca de imagem */}
        {showImageSearch && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Buscar Imagem no Unsplash
                </h3>
                <button
                  onClick={() => setShowImageSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <UnsplashImageSearch onImageSelect={handleImageSelect} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
