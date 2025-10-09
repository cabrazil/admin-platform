'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import AuthWrapper from '@/components/AuthWrapper'
import { useBlogs } from '@/hooks/useBlogs'
import { 
  Tag, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Building2,
  RefreshCw
} from 'lucide-react'

interface Category {
  id: number
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: number | null
  aiKeywords: string[] | null
  aiPrompt: string | null
  blogId: number
  createdAt: string
  updatedAt: string
}

const defaultCategory: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  parentId: null,
  aiKeywords: [],
  aiPrompt: '',
  blogId: 0
}

export default function CategoriesPage() {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>(defaultCategory)
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

  // Carregar categorias do blog selecionado
  useEffect(() => {
    const loadCategories = async () => {
      if (!selectedBlogId) return
      
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/blogs/${selectedBlogId}/categories`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          setCategories(result.data)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        setError('Erro ao carregar categorias')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [selectedBlogId])

  const handleSave = async (category: Category | Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedBlogId) return
    
    setSaving(true)
    try {
      const isEditing = 'id' in category
      const url = isEditing 
        ? `/api/blogs/${selectedBlogId}/categories/${category.id}`
        : `/api/blogs/${selectedBlogId}/categories`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(category)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Recarregar categorias
        const reloadResponse = await fetch(`/api/blogs/${selectedBlogId}/categories`, {
          credentials: 'include'
        })
        const reloadResult = await reloadResponse.json()
        if (reloadResult.success) {
          setCategories(reloadResult.data)
        }
        
        // Limpar formulários
        setEditingCategory(null)
        setNewCategory(defaultCategory)
        setShowNewForm(false)
        
        alert(isEditing ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!')
      } else {
        throw new Error(result.error || 'Erro ao salvar categoria')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId: number) => {
    if (!selectedBlogId || !confirm('Tem certeza que deseja excluir esta categoria?')) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/blogs/${selectedBlogId}/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Recarregar categorias
        const reloadResponse = await fetch(`/api/blogs/${selectedBlogId}/categories`, {
          credentials: 'include'
        })
        const reloadResult = await reloadResponse.json()
        if (reloadResult.success) {
          setCategories(reloadResult.data)
        }
        
        alert('Categoria excluída com sucesso!')
      } else {
        throw new Error(result.error || 'Erro ao excluir categoria')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      alert('Erro ao excluir categoria: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Se não há blogId selecionado, mostrar mensagem
  if (!selectedBlogId) {
    return (
      <AuthWrapper>
        <AdminLayout title="Categorias" subtitle="Gerencie as categorias dos seus blogs">
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
      <AdminLayout title="Categorias" subtitle="Gerencie as categorias dos seus blogs">
        <div className="space-y-6">
          {/* Informação do Blog */}
          {selectedBlogId && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {blogs.find(b => b.id === selectedBlogId)?.name || `Blog ID: ${selectedBlogId}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gerenciamento de Categorias
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botão para Nova Categoria */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Categorias ({categories.length})
            </h2>
            <button
              onClick={() => {
                setNewCategory({ ...defaultCategory, blogId: selectedBlogId })
                setShowNewForm(true)
                setEditingCategory(null)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </button>
          </div>

          {/* Formulário de Nova Categoria */}
          {showNewForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Categoria</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={newCategory.title}
                      onChange={(e) => {
                        const title = e.target.value
                        setNewCategory({
                          ...newCategory,
                          title,
                          slug: generateSlug(title)
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Mountain Bike"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: mountain-bike"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição da categoria..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palavras-chave AI
                  </label>
                  <input
                    type="text"
                    value={newCategory.aiKeywords?.join(', ') || ''}
                    onChange={(e) => setNewCategory({
                      ...newCategory,
                      aiKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mountain bike, trilha, montanha, off-road"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt AI
                  </label>
                  <textarea
                    value={newCategory.aiPrompt || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, aiPrompt: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Prompt para geração de conteúdo sobre esta categoria..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowNewForm(false)
                      setNewCategory(defaultCategory)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave(newCategory)}
                    disabled={saving || !newCategory.title || !newCategory.slug}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Categorias */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando categorias...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Erro ao carregar categorias
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
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-gray-600 mb-6">
                Crie sua primeira categoria para organizar os artigos do blog.
              </p>
              <button
                onClick={() => {
                  setNewCategory({ ...defaultCategory, blogId: selectedBlogId })
                  setShowNewForm(true)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Categoria
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <li key={category.id}>
                    {editingCategory?.id === category.id ? (
                      // Formulário de Edição
                      <div className="px-4 py-4 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Categoria</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título *
                              </label>
                              <input
                                type="text"
                                value={editingCategory.title}
                                onChange={(e) => {
                                  const title = e.target.value
                                  setEditingCategory({
                                    ...editingCategory,
                                    title,
                                    slug: generateSlug(title)
                                  })
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slug *
                              </label>
                              <input
                                type="text"
                                value={editingCategory.slug}
                                onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descrição
                            </label>
                            <textarea
                              value={editingCategory.description || ''}
                              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Palavras-chave AI
                            </label>
                            <input
                              type="text"
                              value={editingCategory.aiKeywords?.join(', ') || ''}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                aiKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Prompt AI
                            </label>
                            <textarea
                              value={editingCategory.aiPrompt || ''}
                              onChange={(e) => setEditingCategory({ ...editingCategory, aiPrompt: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <X className="h-4 w-4 mr-2 inline" />
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSave(editingCategory)}
                              disabled={saving || !editingCategory.title || !editingCategory.slug}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Visualização da Categoria
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Tag className="h-5 w-5 text-gray-400" />
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {category.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {category.slug}
                                </p>
                                {category.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {category.description}
                                  </p>
                                )}
                                {category.aiKeywords && category.aiKeywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {category.aiKeywords.map((keyword, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
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
