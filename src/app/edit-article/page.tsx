'use client'

import { useState, useEffect, Suspense } from 'react' // Import Suspense
import { useSearchParams } from 'next/navigation' // Add useSearchParams

interface Article {
  id: number
  title: string
  content: string
  description: string
  imageUrl: string
  published: boolean
  categoryId: number
  authorId: number
  slug: string
  keywords: string[]
}

interface Category {
  id: number
  title: string
}

interface Author {
  id: number
  name: string
}

function EditArticleContent() {
  const searchParams = useSearchParams()
  const [blogId, setBlogId] = useState<string>('')
  const [articleId, setArticleId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // Initialize with default values for creation mode
  const [article, setArticle] = useState<Article>({
    id: 0,
    title: '',
    content: '',
    description: '',
    imageUrl: '',
    published: false,
    categoryId: 0,
    authorId: 0,
    slug: '',
    keywords: []
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    // 1. Try to get IDs from Search Params first (more robust)
    let bId = searchParams.get('blogId')
    let aId = searchParams.get('articleId')

    // 2. Fallback to URL path parsing if params are missing (legacy/direct link support)
    if (!bId || !aId) {
      const url = window.location.pathname
      const parts = url.split('/')
      // URL pattern: /blogs/3/articles/52/edit
      if (parts.length >= 5) {
        if (!bId) bId = parts[2]
        if (!aId) aId = parts[4]
      }
    }

    if (bId) {
      setBlogId(bId)
    } else {
      setError('Blog ID não encontrado')
      setLoading(false)
      return
    }

    if (aId) {
      setArticleId(aId)
      setIsNew(false)
    } else {
      console.log('✨ Modo de Criação: Nenhum Article ID encontrado')
      setIsNew(true)
    }

  }, [searchParams])

  useEffect(() => {
    if (!blogId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('🔍 Carregando dados. Blog:', blogId, 'Artigo:', articleId || 'NOVO')

        // Define promises for aux data
        const categoriesPromise = fetch(`/api/blogs/${blogId}/categories`)
        const authorsPromise = fetch(`/api/blogs/${blogId}/authors`)

        // Define promise for article data if not new
        const articlePromise = (!isNew && articleId)
          ? fetch(`/api/articles/${articleId}`)
          : Promise.resolve(null)

        const [categoriesRes, authorsRes, articleRes] = await Promise.all([
          categoriesPromise,
          authorsPromise,
          articlePromise
        ])

        // Check and parse Aux Data
        if (!categoriesRes.ok) throw new Error(`Erro categorias: ${categoriesRes.status}`)
        if (!authorsRes.ok) throw new Error(`Erro autores: ${authorsRes.status}`)

        const categoriesData = await categoriesRes.json()
        const authorsData = await authorsRes.json()

        console.log('📂 Categorias recebidas:', categoriesData)
        console.log('👤 Autores recebidos:', authorsData)

        setCategories(categoriesData.data?.categories || categoriesData.data || [])
        setAuthors(authorsData.data?.authors || authorsData.data || [])

        // Check and parse Article Data
        if (articleRes) {
          if (!articleRes.ok) throw new Error(`Erro artigo: ${articleRes.status}`)
          const articleData = await articleRes.json()

          if (articleData.success && articleData.data) {
            setArticle(articleData.data)
          } else {
            throw new Error('Artigo não encontrado')
          }
        } else {
          // If new, keep default empty article, maybe set some defaults from categories/authors if available?
          if (categoriesData.data && categoriesData.data.length > 0) {
            setArticle(prev => ({ ...prev, categoryId: categoriesData.data[0].id }))
          }
          if (authorsData.data && authorsData.data.length > 0) {
            setArticle(prev => ({ ...prev, authorId: authorsData.data[0].id }))
          }
        }

      } catch (err) {
        console.error('❌ Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [blogId, articleId, isNew])

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 Salvando artigo:', article)

      const url = isNew ? `/api/blogs/${blogId}/articles` : `/api/articles/${article.id}`
      const method = isNew ? 'POST' : 'PUT'

      // Clean up ID for creation
      const payload = { ...article }
      if (isNew) {
        // @ts-ignore - id is optional for create
        delete payload.id
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errJson = await response.json()
        throw new Error(errJson.error || `Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Salvo:', result)

      alert('Artigo salvo com sucesso!')
      window.location.href = `/blogs/${blogId}/articles`
    } catch (err) {
      console.error('❌ Erro ao salvar:', err)
      alert('Erro ao salvar: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Carregando...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fef2f2', padding: '2rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <h2 style={{ color: '#991b1b', margin: '0 0 1rem 0' }}>Erro</h2>
          <p style={{ color: '#7f1d1d', margin: '0 0 1rem 0' }}>{error}</p>
          <button
            onClick={() => window.location.href = `/blogs/${blogId}/articles`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Voltar para lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#111827' }}>
              {isNew ? '✨ Criar Novo Artigo' : `✏️ Editar Artigo: ${article.title}`}
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
              {isNew ? `Blog: ${blogId}` : `ID: ${article.id} | Blog: ${blogId} | Slug: ${article.slug}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.location.href = `/blogs/${blogId}/articles`}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ← Voltar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: saving ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {saving ? '💾 Salvando...' : '💾 Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Coluna Esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                📝 Título
              </label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                📄 Descrição
              </label>
              <textarea
                value={article.description}
                onChange={(e) => setArticle({ ...article, description: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                🔗 Slug
              </label>
              <input
                type="text"
                value={article.slug}
                onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Coluna Direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                📂 Categoria ({categories.length} disponíveis)
              </label>
              <select
                value={article.categoryId}
                onChange={(e) => setArticle({ ...article, categoryId: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {categories.length === 0 && <option value="0">Nenhuma categoria encontrada</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                👤 Autor ({authors.length} disponíveis)
              </label>
              <select
                value={article.authorId}
                onChange={(e) => setArticle({ ...article, authorId: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {authors.length === 0 && <option value="0">Nenhum autor encontrado</option>}
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px solid #e5e7eb'
            }}>
              <input
                type="checkbox"
                id="published"
                checked={article.published}
                onChange={(e) => setArticle({ ...article, published: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="published" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                🚀 Artigo Publicado
              </label>
            </div>
          </div>
        </div>

        {/* URL da Imagem */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            🖼️ URL da Imagem
          </label>
          <input
            type="text"
            value={article.imageUrl}
            onChange={(e) => setArticle({ ...article, imageUrl: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt="Preview"
              style={{
                marginTop: '1rem',
                maxWidth: '300px',
                height: 'auto',
                borderRadius: '8px',
                border: '2px solid #e5e7eb'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
        </div>

        {/* Conteúdo */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            📝 Conteúdo do Artigo
          </label>
          <textarea
            value={article.content}
            onChange={(e) => setArticle({ ...article, content: e.target.value })}
            rows={20}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              boxSizing: 'border-box',
              resize: 'vertical',
              outline: 'none'
            }}
            placeholder="Digite o conteúdo HTML do artigo..."
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>
    </div>
  )
}

export default function EditArticlePage() {
  return (
    <html lang="pt-BR">
      <head>
        <title>Editar Artigo - Blog Admin</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6' }}>
        <Suspense fallback={<div>Carregando...</div>}>
          <EditArticleContent />
        </Suspense>
      </body>
    </html>
  )
}
