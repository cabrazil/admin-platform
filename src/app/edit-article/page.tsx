'use client'

import { useState, useEffect } from 'react'

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

export default function EditArticlePage() {
  // Extrair IDs da URL manualmente
  const [blogId, setBlogId] = useState<string>('')
  const [articleId, setArticleId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extrair parâmetros da URL
    const url = window.location.pathname
    const parts = url.split('/')
    // URL: /blogs/3/articles/52/edit
    if (parts.length >= 5) {
      const bId = parts[2] // 3
      const aId = parts[4] // 52
      setBlogId(bId)
      setArticleId(aId)
      console.log('🔍 IDs extraídos:', { blogId: bId, articleId: aId })
    } else {
      setError('URL inválida')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!blogId || !articleId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('🔍 Carregando dados para Blog:', blogId, 'Artigo:', articleId)
        
        // Carregar dados em paralelo
        const [articleRes, categoriesRes, authorsRes] = await Promise.all([
          fetch(`/api/articles/${articleId}`),
          fetch(`/api/blogs/${blogId}/categories`),
          fetch(`/api/blogs/${blogId}/authors`)
        ])

        console.log('🔍 Respostas:', {
          article: articleRes.status,
          categories: categoriesRes.status,
          authors: authorsRes.status
        })

        if (!articleRes.ok) throw new Error(`Erro artigo: ${articleRes.status}`)
        if (!categoriesRes.ok) throw new Error(`Erro categorias: ${categoriesRes.status}`)
        if (!authorsRes.ok) throw new Error(`Erro autores: ${authorsRes.status}`)

        const [articleData, categoriesData, authorsData] = await Promise.all([
          articleRes.json(),
          categoriesRes.json(),
          authorsRes.json()
        ])

        console.log('🔍 Dados recebidos:', { articleData, categoriesData, authorsData })

        if (articleData.success && articleData.data) {
          setArticle(articleData.data)
        } else {
          throw new Error('Artigo não encontrado')
        }

        setCategories(categoriesData.data || [])
        setAuthors(authorsData.data || [])

      } catch (err) {
        console.error('❌ Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [blogId, articleId])

  const handleSave = async () => {
    if (!article) return

    try {
      setSaving(true)
      console.log('💾 Salvando artigo:', article)
      
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      })
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
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
      <html lang="pt-BR">
        <head>
          <title>Carregando Artigo - Blog Admin</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style={{ margin: 0, padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #e5e7eb', 
                borderTop: '4px solid #2563eb', 
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>Carregando artigo {articleId} do blog {blogId}...</p>
            </div>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </body>
      </html>
    )
  }

  if (error || !article) {
    return (
      <html lang="pt-BR">
        <head>
          <title>Erro - Blog Admin</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style={{ margin: 0, padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fef2f2', padding: '2rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <h2 style={{ color: '#991b1b', margin: '0 0 1rem 0' }}>Erro ao carregar artigo</h2>
            <p style={{ color: '#7f1d1d', margin: '0 0 1rem 0' }}>{error || 'Artigo não encontrado'}</p>
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
        </body>
      </html>
    )
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>Editar Artigo - Blog Admin</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#111827' }}>
                  ✏️ Editar Artigo: {article.title}
                </h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  ID: {article.id} | Blog: {blogId} | Slug: {article.slug}
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
      </body>
    </html>
  )
}
