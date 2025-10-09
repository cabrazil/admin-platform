'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import AuthWrapper from '@/components/AuthWrapper'
import { useBlogs } from '@/hooks/useBlogs'
import { 
  User, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Building2,
  RefreshCw,
  Mail,
  Globe,
  Twitter,
  Linkedin,
  Instagram,
  Github
} from 'lucide-react'

interface Author {
  id: number
  name: string
  role: string
  imageUrl: string
  bio: string | null
  email: string | null
  website: string | null
  social: any | null
  skills: string[] | null
  aiModel: string | null
  isAi: boolean
  signature: string | null
  blogId: number
  createdAt: string
  updatedAt: string
}

const defaultAuthor: Omit<Author, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  role: '',
  imageUrl: '',
  bio: '',
  email: '',
  website: '',
  social: {},
  skills: [],
  aiModel: '',
  isAi: false,
  signature: '',
  blogId: 0
}

export default function AuthorsPage() {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null)
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [newAuthor, setNewAuthor] = useState<Omit<Author, 'id' | 'createdAt' | 'updatedAt'>>(defaultAuthor)
  const [showNewForm, setShowNewForm] = useState(false)
  const { blogs, loading: blogsLoading } = useBlogs()

  // Verificar se há blogId na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const blogIdParam = urlParams.get('blogId')
    if (blogIdParam) {
      const blogId = parseInt(blogIdParam)
      if (!isNaN(blogId)) {
        setSelectedBlogId(blogId)
      }
    }
  }, [])

  // Carregar autores do blog selecionado
  useEffect(() => {
    const loadAuthors = async () => {
      if (!selectedBlogId) return
      
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/blogs/${selectedBlogId}/authors`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          setAuthors(result.data)
        } else {
          setAuthors([])
        }
      } catch (error) {
        console.error('Erro ao carregar autores:', error)
        setError('Erro ao carregar autores')
        setAuthors([])
      } finally {
        setLoading(false)
      }
    }

    loadAuthors()
  }, [selectedBlogId])

  const handleSave = async (author: Author | Omit<Author, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedBlogId) return
    
    setSaving(true)
    try {
      const isEditing = 'id' in author
      const url = isEditing 
        ? `/api/blogs/${selectedBlogId}/authors/${author.id}`
        : `/api/blogs/${selectedBlogId}/authors`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(author)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Recarregar autores
        const reloadResponse = await fetch(`/api/blogs/${selectedBlogId}/authors`, {
          credentials: 'include'
        })
        const reloadResult = await reloadResponse.json()
        if (reloadResult.success) {
          setAuthors(reloadResult.data)
        }
        
        // Limpar formulários
        setEditingAuthor(null)
        setNewAuthor(defaultAuthor)
        setShowNewForm(false)
        
        alert(isEditing ? 'Autor atualizado com sucesso!' : 'Autor criado com sucesso!')
      } else {
        throw new Error(result.error || 'Erro ao salvar autor')
      }
    } catch (error) {
      console.error('Erro ao salvar autor:', error)
      alert('Erro ao salvar autor: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (authorId: number) => {
    if (!selectedBlogId || !confirm('Tem certeza que deseja excluir este autor?')) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/blogs/${selectedBlogId}/authors/${authorId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Recarregar autores
        const reloadResponse = await fetch(`/api/blogs/${selectedBlogId}/authors`, {
          credentials: 'include'
        })
        const reloadResult = await reloadResponse.json()
        if (reloadResult.success) {
          setAuthors(reloadResult.data)
        }
        
        alert('Autor excluído com sucesso!')
      } else {
        throw new Error(result.error || 'Erro ao excluir autor')
      }
    } catch (error) {
      console.error('Erro ao excluir autor:', error)
      alert('Erro ao excluir autor: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  // Se não há blogId selecionado, mostrar mensagem
  if (!selectedBlogId) {
    return (
      <AuthWrapper>
        <AdminLayout title="Autores" subtitle="Gerencie os autores dos seus blogs">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Blog não selecionado</h3>
            <p className="text-gray-600 mb-6">
              Acesse esta página através dos cards de blogs na página principal.
            </p>
            <Link
              href="/blogs"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Ir para Blogs
            </Link>
          </div>
        </AdminLayout>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <AdminLayout title="Autores" subtitle="Gerencie os autores dos seus blogs">
        <div className="space-y-6">
          {/* Informação do Blog */}
          {selectedBlogId && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {blogs.find(b => b.id === selectedBlogId)?.name || `Blog ID: ${selectedBlogId}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gerenciamento de Autores
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botão para Novo Autor */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Autores ({authors.length})
            </h2>
            <button
              onClick={() => {
                setNewAuthor({ ...defaultAuthor, blogId: selectedBlogId })
                setShowNewForm(true)
                setEditingAuthor(null)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Autor
            </button>
          </div>

          {/* Formulário de Novo Autor */}
          {showNewForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Autor</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={newAuthor.name}
                      onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Função *
                    </label>
                    <input
                      type="text"
                      value={newAuthor.role}
                      onChange={(e) => setNewAuthor({ ...newAuthor, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Editor Chefe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Foto *
                  </label>
                  <input
                    type="url"
                    value={newAuthor.imageUrl}
                    onChange={(e) => setNewAuthor({ ...newAuthor, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia
                  </label>
                  <textarea
                    value={newAuthor.bio || ''}
                    onChange={(e) => setNewAuthor({ ...newAuthor, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Biografia do autor..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newAuthor.email || ''}
                      onChange={(e) => setNewAuthor({ ...newAuthor, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="autor@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={newAuthor.website || ''}
                      onChange={(e) => setNewAuthor({ ...newAuthor, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habilidades
                  </label>
                  <input
                    type="text"
                    value={newAuthor.skills?.join(', ') || ''}
                    onChange={(e) => setNewAuthor({
                      ...newAuthor,
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escrita, Edição, Fotografia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assinatura
                  </label>
                  <input
                    type="text"
                    value={newAuthor.signature || ''}
                    onChange={(e) => setNewAuthor({ ...newAuthor, signature: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Assinatura do autor"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAuthor.isAi}
                    onChange={(e) => setNewAuthor({ ...newAuthor, isAi: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Autor gerado por IA</span>
                </div>

                {newAuthor.isAi && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modelo de IA
                    </label>
                    <input
                      type="text"
                      value={newAuthor.aiModel || ''}
                      onChange={(e) => setNewAuthor({ ...newAuthor, aiModel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="GPT-4, Claude, etc."
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowNewForm(false)
                      setNewAuthor(defaultAuthor)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave(newAuthor)}
                    disabled={saving || !newAuthor.name || !newAuthor.role || !newAuthor.imageUrl}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Autores */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando autores...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Erro ao carregar autores
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </button>
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum autor encontrado</h3>
              <p className="text-gray-600 mb-6">
                Crie seu primeiro autor para começar a publicar conteúdo.
              </p>
              <button
                onClick={() => {
                  setNewAuthor({ ...defaultAuthor, blogId: selectedBlogId })
                  setShowNewForm(true)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Autor
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {authors.map((author) => (
                  <li key={author.id}>
                    {editingAuthor?.id === author.id ? (
                      // Formulário de Edição (similar ao de criação)
                      <div className="px-4 py-4 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Autor</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome *
                              </label>
                              <input
                                type="text"
                                value={editingAuthor.name}
                                onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Função *
                              </label>
                              <input
                                type="text"
                                value={editingAuthor.role}
                                onChange={(e) => setEditingAuthor({ ...editingAuthor, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL da Foto *
                            </label>
                            <input
                              type="url"
                              value={editingAuthor.imageUrl}
                              onChange={(e) => setEditingAuthor({ ...editingAuthor, imageUrl: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Biografia
                            </label>
                            <textarea
                              value={editingAuthor.bio || ''}
                              onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                              </label>
                              <input
                                type="email"
                                value={editingAuthor.email || ''}
                                onChange={(e) => setEditingAuthor({ ...editingAuthor, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Website
                              </label>
                              <input
                                type="url"
                                value={editingAuthor.website || ''}
                                onChange={(e) => setEditingAuthor({ ...editingAuthor, website: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Habilidades
                            </label>
                            <input
                              type="text"
                              value={editingAuthor.skills?.join(', ') || ''}
                              onChange={(e) => setEditingAuthor({
                                ...editingAuthor,
                                skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assinatura
                            </label>
                            <input
                              type="text"
                              value={editingAuthor.signature || ''}
                              onChange={(e) => setEditingAuthor({ ...editingAuthor, signature: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingAuthor.isAi}
                              onChange={(e) => setEditingAuthor({ ...editingAuthor, isAi: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Autor gerado por IA</span>
                          </div>

                          {editingAuthor.isAi && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Modelo de IA
                              </label>
                              <input
                                type="text"
                                value={editingAuthor.aiModel || ''}
                                onChange={(e) => setEditingAuthor({ ...editingAuthor, aiModel: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setEditingAuthor(null)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <X className="h-4 w-4 mr-2 inline" />
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSave(editingAuthor)}
                              disabled={saving || !editingAuthor.name || !editingAuthor.role || !editingAuthor.imageUrl}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Visualização do Autor
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={author.imageUrl}
                              alt={author.name}
                              className="h-12 w-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/48x48?text=' + author.name.charAt(0)
                              }}
                            />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {author.name}
                                {author.isAi && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                    IA
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{author.role}</p>
                              {author.bio && (
                                <p className="text-sm text-gray-500 mt-1">{author.bio}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                {author.email && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Mail className="h-4 w-4 mr-1" />
                                    {author.email}
                                  </div>
                                )}
                                {author.website && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Globe className="h-4 w-4 mr-1" />
                                    <a href={author.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>
                              {author.skills && author.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {author.skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingAuthor(author)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(author.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthWrapper>
  )
}
