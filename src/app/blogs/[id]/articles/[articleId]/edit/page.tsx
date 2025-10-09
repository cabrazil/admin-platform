'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ImagePreview } from '@/components/ImagePreview'

// Função para gerar slug (simplificada para frontend)
function generateSlug(text: string): string {
  // Mapeamento de caracteres acentuados para não acentuados
  const accentMap: { [key: string]: string } = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c',
    'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A', 'Å': 'A',
    'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
    'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
    'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
    'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
    'Ý': 'Y',
    'Ñ': 'N',
    'Ç': 'C'
  };

  return text
    .toLowerCase()
    // Remove aspas e parênteses primeiro
    .replace(/["'()]/g, '')
    // Substitui caracteres acentuados
    .replace(/[áàãâäåéèêëíìîïóòõôöúùûüýÿñç]/g, (match) => accentMap[match] || match)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Importar o editor dinamicamente para evitar problemas de SSR
const HtmlEditor = dynamic(() => import('@/components/HtmlEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">Carregando editor...</div>,
})

interface Article {
  id: number
  title: string
  content: string
  description: string
  imageUrl: string
  imageAlt?: string
  published: boolean
  categoryId: number
  authorId: number
  slug: string
  keywords: string[]
  type: 'analise' | 'lista'
  tags?: Array<{ id: number; name: string }>
  metadata?: {
    seoTitle?: string
    metaDescription?: string
  }
}

interface Category {
  id: number
  title: string
}

interface Author {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
  slug: string
  color?: string
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id as string
  const articleId = params?.articleId as string

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Campos SEO
  const [seoTitle, setSeoTitle] = useState<string>("")
  const [metaDescription, setMetaDescription] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !blogId || !articleId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔍 Carregando dados para Blog:', blogId, 'Artigo:', articleId)
        
        // Carregar dados em paralelo
        const [articleRes, categoriesRes, authorsRes, tagsRes] = await Promise.all([
          fetch(`/api/articles/${articleId}`, { credentials: 'include' }),
          fetch(`/api/blogs/${blogId}/categories`, { credentials: 'include' }),
          fetch(`/api/blogs/${blogId}/authors`, { credentials: 'include' }),
          fetch(`/api/blogs/${blogId}/tags`, { credentials: 'include' })
        ])

        console.log('🔍 Status das respostas:', {
          article: articleRes.status,
          categories: categoriesRes.status,
          authors: authorsRes.status,
          tags: tagsRes.status
        })

        if (!articleRes.ok) throw new Error(`Erro artigo: ${articleRes.status}`)
        
        // Tratar erros de categorias e autores de forma mais suave
        let categoriesData = { success: false, data: [] }
        let authorsData = { success: false, data: [] }
        let tagsData = []
        
        if (categoriesRes.ok) {
          categoriesData = await categoriesRes.json()
        } else {
          console.warn('⚠️ Erro ao carregar categorias:', categoriesRes.status)
        }
        
        if (authorsRes.ok) {
          authorsData = await authorsRes.json()
        } else {
          console.warn('⚠️ Erro ao carregar autores:', authorsRes.status)
        }
        
        if (tagsRes.ok) {
          tagsData = await tagsRes.json()
        } else {
          console.warn('⚠️ Erro ao carregar tags:', tagsRes.status)
        }

        const articleData = await articleRes.json()

        console.log('✅ Dados recebidos:', { articleData, categoriesData, authorsData, tagsData })

        if (articleData.success && articleData.data) {
          const article = articleData.data
          
          // Verificar se o autor do artigo pertence ao blog atual
          const validAuthor = authorsData.data?.find((auth: Author) => auth.id === article.authorId)
          
          if (!validAuthor && authorsData.data?.length > 0) {
            // Se o autor não for válido, usar o primeiro autor disponível
            console.log('⚠️ Autor do artigo não pertence ao blog, usando primeiro autor disponível')
            article.authorId = authorsData.data[0].id
          }
          
          setArticle(article)
          
          // Inicializar campos SEO
          if (article.metadata) {
            setSeoTitle(article.metadata.seoTitle || '')
            setMetaDescription(article.metadata.metaDescription || '')
          }
        } else {
          throw new Error('Artigo não encontrado nos dados')
        }

        setCategories(categoriesData.data || [])
        setAuthors(authorsData.data || [])
        setTags(tagsData || [])
        
        // Definir tags selecionadas do artigo
        if (articleData.success && articleData.data.tags) {
          setSelectedTagIds(articleData.data.tags.map((tag: any) => tag.id))
        }

      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [mounted, blogId, articleId])

  const handleSave = async () => {
    if (!article) return

    try {
      setSaving(true)
      
      // Validar se categoria e autor pertencem ao blog
      const validCategory = categories.find(cat => cat.id === article.categoryId)
      const validAuthor = authors.find(auth => auth.id === article.authorId)
      
      if (!validCategory) {
        alert('Categoria selecionada não pertence a este blog!')
        return
      }
      
      if (!validAuthor) {
        alert('Autor selecionado não pertence a este blog!')
        return
      }
      
      // Filtrar apenas os campos que podem ser atualizados
      const updateData = {
        title: article.title,
        slug: article.slug,
        description: article.description,
        content: article.content,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        categoryId: article.categoryId,
        authorId: article.authorId,
        published: article.published,
        type: article.type,
        tagIds: selectedTagIds,
        metadata: {
          seoTitle: seoTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
        },
      }
      
      console.log('💾 Salvando artigo:', updateData)
      
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Salvo com sucesso:', result)
      
      alert('Artigo salvo com sucesso!')
      router.push(`/blogs/${blogId}/articles`)
    } catch (err) {
      console.error('❌ Erro ao salvar:', err)
      alert('Erro ao salvar: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando artigo ID {articleId}...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold text-xl mb-2">Erro ao carregar artigo</h2>
            <p className="text-red-600 mb-4">{error || 'Artigo não encontrado'}</p>
            <button
              onClick={() => router.push(`/blogs/${blogId}/articles`)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Voltar para lista
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Artigo</h1>
              <p className="text-gray-600 mt-1">ID: {article.id} | Blog: {blogId}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/blogs/${blogId}/articles`)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar Artigo'}
              </button>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={article.description}
                  onChange={(e) => setArticle({ ...article, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={article.slug}
                    onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSlug = generateSlug(article.title);
                      setArticle({ ...article, slug: newSlug });
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="Gerar slug automaticamente do título"
                  >
                    🔄
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Clique no botão para gerar automaticamente do título
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={article.imageUrl}
                  onChange={(e) => setArticle({ ...article, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text da Imagem (SEO)
                </label>
                <input
                  type="text"
                  value={article.imageAlt || ''}
                  onChange={(e) => setArticle({ ...article, imageAlt: e.target.value })}
                  placeholder="Ex: Soldados correndo pelas trincheiras no filme 1917"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descrição da imagem para melhorar SEO e acessibilidade
                </p>
              </div>

              {/* SEO - Título para Google */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título SEO (Google)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Título otimizado para busca (máx. 60 caracteres)"
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Título que aparecerá nos resultados de busca do Google
                  </p>
                  <span className={`text-xs ${seoTitle.length > 50 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {seoTitle.length}/60
                  </span>
                </div>
              </div>

              {/* SEO - Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (Google)
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Descrição que aparecerá nos resultados de busca (máx. 160 caracteres)"
                  maxLength={160}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Descrição que aparecerá nos resultados de busca do Google
                  </p>
                  <span className={`text-xs ${metaDescription.length > 140 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {metaDescription.length}/160
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria ({categories.length} disponíveis)
                </label>
                {categories.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50">
                    <p className="text-yellow-700 text-sm">
                      ⚠️ Nenhuma categoria encontrada. 
                      <a href={`/categories?blogId=${blogId}`} className="text-blue-600 hover:underline ml-1">
                        Criar categorias
                      </a>
                    </p>
                  </div>
                ) : (
                  <select
                    value={article.categoryId}
                    onChange={(e) => setArticle({ ...article, categoryId: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      categories.find(cat => cat.id === article.categoryId) 
                        ? 'border-green-500' 
                        : 'border-red-500'
                    }`}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                )}
                {categories.length > 0 && !categories.find(cat => cat.id === article.categoryId) && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ Categoria não pertence a este blog
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor ({authors.length} disponíveis)
                </label>
                {authors.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50">
                    <p className="text-yellow-700 text-sm">
                      ⚠️ Nenhum autor encontrado. 
                      <a href={`/authors?blogId=${blogId}`} className="text-blue-600 hover:underline ml-1">
                        Criar autores
                      </a>
                    </p>
                  </div>
                ) : (
                  <select
                    value={article.authorId}
                    onChange={(e) => setArticle({ ...article, authorId: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      authors.find(auth => auth.id === article.authorId) 
                        ? 'border-green-500' 
                        : 'border-red-500'
                    }`}
                  >
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                )}
                {authors.length > 0 && !authors.find(auth => auth.id === article.authorId) && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ Autor não pertence a este blog
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={article.published}
                  onChange={(e) => setArticle({ ...article, published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  Artigo Publicado
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags ({tags.length} disponíveis) - Máximo 4
                </label>
                <select
                  multiple
                  value={selectedTagIds.map(String)}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                    if (selectedOptions.length <= 4) {
                      setSelectedTagIds(selectedOptions)
                    } else {
                      alert('Máximo de 4 tags permitidas')
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                >
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pressione Ctrl (ou Cmd) para selecionar múltiplas tags
                </p>
                {selectedTagIds.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Tags selecionadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTagIds.map(tagId => {
                        const tag = tags.find(t => t.id === tagId)
                        return tag ? (
                          <span key={tagId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Preview da Imagem */}
              {article.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview da Imagem
                  </label>
                  <ImagePreview
                    imageUrl={article.imageUrl}
                    alt="Preview da imagem do artigo"
                    className="w-full h-32 object-cover rounded border"
                    showDebugInfo={true}
                    blogId={parseInt(blogId)}
                  />
                </div>
              )}

              {/* Tipo do Artigo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo do Artigo
                </label>
                <select
                  value={article.type}
                  onChange={(e) => setArticle({ ...article, type: e.target.value as 'analise' | 'lista' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="analise">Análise</option>
                  <option value="lista">Lista</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione o tipo de conteúdo do artigo
                </p>
              </div>
            </div>
          </div>

          {/* Editor de Conteúdo */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo do Artigo
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <HtmlEditor
                value={article.content}
                onChange={(content) => setArticle({ ...article, content })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}