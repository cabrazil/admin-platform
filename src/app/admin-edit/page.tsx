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

export default function AdminEditPage() {
  const [blogId, setBlogId] = useState<string>('3') // Padrão
  const [articleId, setArticleId] = useState<string>('52') // Padrão
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!blogId || !articleId) {
      setError('IDs não fornecidos')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Carregando dados para Blog:', blogId, 'Artigo:', articleId)
      
      // Carregar dados em paralelo
      const [articleRes, categoriesRes, authorsRes] = await Promise.all([
        fetch(`/api/articles/${articleId}`),
        fetch(`/api/blogs/${blogId}/categories`),
        fetch(`/api/blogs/${blogId}/authors`)
      ])

      console.log('🔍 Status das respostas:', {
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

      console.log('✅ Dados recebidos:', { articleData, categoriesData, authorsData })

              if (articleData.success && articleData.data) {
          const article = articleData.data
          
          // Extrair array de autores da estrutura de resposta
          const authorsArray = authorsData.data?.authors || authorsData.data || []
          
          // Verificar se o autor do artigo pertence ao blog atual
          const validAuthor = Array.isArray(authorsArray) 
            ? authorsArray.find(auth => auth.id === article.authorId)
            : null
          
          if (!validAuthor && Array.isArray(authorsArray) && authorsArray.length > 0) {
            // Se o autor não for válido, usar o primeiro autor disponível
            console.log('⚠️ Autor do artigo não pertence ao blog, usando primeiro autor disponível')
            article.authorId = authorsArray[0].id
          }
          
          setArticle(article)
        } else {
          throw new Error('Artigo não encontrado nos dados')
        }

        setCategories(categoriesData.data?.categories || categoriesData.data || [])
        setAuthors(authorsData.data?.authors || authorsData.data || [])

    } catch (err) {
      console.error('❌ Erro ao carregar:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!article) return

    try {
      setSaving(true)
      
      // Validar se categoria e autor pertencem ao blog
      const validCategory = categories.find(cat => cat.id === article.categoryId)
      const validAuthor = authors.find(auth => auth.id === article.authorId)
      
      if (!validCategory) {
        alert('❌ Categoria selecionada não pertence a este blog!')
        return
      }
      
      if (!validAuthor) {
        alert('❌ Autor selecionado não pertence a este blog!')
        return
      }
      
      // Filtrar apenas os campos que podem ser atualizados
      const updateData = {
        title: article.title,
        description: article.description,
        content: article.content,
        imageUrl: article.imageUrl,
        categoryId: article.categoryId,
        authorId: article.authorId, // Agora validado
        published: article.published,
        // Remover campos que não devem ser enviados
        // id, date, createdAt, updatedAt, etc. são gerenciados pelo servidor
      }
      
      console.log('💾 Salvando artigo (dados filtrados):', updateData)
      console.log('🔍 Autor atual do artigo:', article.authorId)
      console.log('🔍 Autores disponíveis no blog:', authors.map(a => ({ id: a.id, name: a.name })))
      
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        // Tentar ler a resposta de erro
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          console.log('❌ Detalhes do erro:', errorData)
        } catch {
          // Se não conseguir fazer parse do JSON, usar status genérico
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ Salvo com sucesso:', result)
      
      // Mostrar sucesso na interface em vez de alert
      setError(null)
      // Adicionar uma mensagem de sucesso temporária
      const successMsg = document.createElement('div')
      successMsg.innerHTML = `
        <div style="
          position: fixed; top: 20px; right: 20px; 
          background: #10b981; color: white; padding: 1rem; 
          border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 1000; font-weight: 500;
        ">
          ✅ Artigo salvo com sucesso!
        </div>
      `
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)
    } catch (err) {
      console.error('❌ Erro ao salvar:', err)
      alert('❌ Erro ao salvar: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>Admin - Editar Artigo</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { margin: 0; padding: 1rem; font-family: system-ui, sans-serif; background: #f8fafc; }
          .container { max-width: 1200px; margin: 0 auto; }
          .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; margin-bottom: 1.5rem; }
          .form-group { margin-bottom: 1.5rem; }
          .label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem; }
          .input, .textarea, .select { 
            width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; 
            font-size: 1rem; box-sizing: border-box; outline: none; transition: border-color 0.2s;
          }
          .input:focus, .textarea:focus, .select:focus { border-color: #3b82f6; }
          .btn { 
            padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 0.875rem; 
            cursor: pointer; transition: all 0.2s; font-weight: 500;
          }
          .btn-primary { background: #2563eb; color: white; }
          .btn-primary:hover { background: #1d4ed8; }
          .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
          .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
          .btn-secondary:hover { background: #e5e7eb; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
          .spinner { 
            border: 4px solid #e5e7eb; border-top: 4px solid #2563eb; border-radius: 50%; 
            width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .error { background: #fef2f2; border: 2px solid #fecaca; color: #991b1b; padding: 1rem; border-radius: 8px; }
          .success { background: #f0fdf4; border: 2px solid #bbf7d0; color: #166534; padding: 1rem; border-radius: 8px; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="card">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 2rem 0', color: '#111827' }}>
              🛠️ Admin - Editor de Artigos
            </h1>
            
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="label">🏢 Blog ID</label>
                <input
                  type="text"
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  className="input"
                  placeholder="Ex: 3"
                />
              </div>
              
              <div className="form-group">
                <label className="label">📄 Artigo ID</label>
                <input
                  type="text"
                  value={articleId}
                  onChange={(e) => setArticleId(e.target.value)}
                  className="input"
                  placeholder="Ex: 52"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={loadData} disabled={loading} className="btn btn-primary">
                {loading ? '⏳ Carregando...' : '🔄 Carregar Artigo'}
              </button>
              
              {article && (
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
                </button>
              )}
            </div>
            
            {error && (
              <div className="error">
                <strong>❌ Erro:</strong> {error}
              </div>
            )}
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                  Carregando dados do artigo...
                </p>
              </div>
            )}
          </div>

          {article && (
            <div className="card">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 2rem 0', color: '#111827' }}>
                ✏️ Editando: {article.title}
              </h2>
              
              <div className="grid-2">
                <div>
                  <div className="form-group">
                    <label className="label">📝 Título</label>
                    <input
                      type="text"
                      value={article.title}
                      onChange={(e) => setArticle({ ...article, title: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">📄 Descrição</label>
                    <textarea
                      value={article.description}
                      onChange={(e) => setArticle({ ...article, description: e.target.value })}
                      rows={4}
                      className="textarea"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">🔗 Slug</label>
                    <input
                      type="text"
                      value={article.slug}
                      onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="form-group">
                    <label className="label">📂 Categoria ({categories.length} disponíveis)</label>
                    <select
                      value={article.categoryId}
                      onChange={(e) => setArticle({ ...article, categoryId: parseInt(e.target.value) })}
                      className="select"
                      style={{
                        borderColor: categories.find(cat => cat.id === article.categoryId) ? '#10b981' : '#ef4444'
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                    {!categories.find(cat => cat.id === article.categoryId) && (
                      <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                        ⚠️ Categoria não pertence a este blog
                      </small>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="label">👤 Autor ({authors.length} disponíveis)</label>
                    <select
                      value={article.authorId}
                      onChange={(e) => setArticle({ ...article, authorId: parseInt(e.target.value) })}
                      className="select"
                      style={{
                        borderColor: authors.find(auth => auth.id === article.authorId) ? '#10b981' : '#ef4444'
                      }}
                    >
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                    {!authors.find(auth => auth.id === article.authorId) && (
                      <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                        ⚠️ Autor não pertence a este blog
                      </small>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={article.published}
                        onChange={(e) => setArticle({ ...article, published: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span className="label" style={{ margin: 0 }}>🚀 Artigo Publicado</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="label">🖼️ URL da Imagem</label>
                <input
                  type="text"
                  value={article.imageUrl}
                  onChange={(e) => setArticle({ ...article, imageUrl: e.target.value })}
                  className="input"
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
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
              </div>
              
              <div className="form-group">
                <label className="label">📝 Conteúdo HTML</label>
                <textarea
                  value={article.content}
                  onChange={(e) => setArticle({ ...article, content: e.target.value })}
                  rows={20}
                  className="textarea"
                  style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem' }}
                  placeholder="Digite o conteúdo HTML do artigo..."
                />
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
