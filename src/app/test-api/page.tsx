'use client'

import { useState } from 'react'

export default function TestApiPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testApi = async (url: string, name: string) => {
    try {
      setLoading(true)
      console.log(`🧪 Testando ${name}: ${url}`)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`✅ ${name} Response:`, data)
      
      setResults(prev => [...prev, {
        name,
        url,
        status: response.status,
        success: response.ok,
        data: data
      }])
      
    } catch (error) {
      console.error(`❌ ${name} Error:`, error)
      setResults(prev => [...prev, {
        name,
        url,
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }])
    } finally {
      setLoading(false)
    }
  }

  const runTests = async () => {
    setResults([])
    
    // Testar APIs uma por uma
    await testApi('/api/articles/52', 'Get Article 52')
    await testApi('/api/blogs/3/categories', 'Get Blog 3 Categories')
    await testApi('/api/blogs/3/authors', 'Get Blog 3 Authors')
    await testApi('/api/blogs/3', 'Get Blog 3')
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>Teste de APIs - Blog Admin</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
            🧪 Teste de APIs
          </h1>
          
          <button
            onClick={runTests}
            disabled={loading}
            style={{
              padding: '1rem 2rem',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '2rem'
            }}
          >
            {loading ? 'Testando...' : 'Executar Testes de API'}
          </button>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  border: `2px solid ${result.success ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: result.success ? '#065f46' : '#991b1b' }}>
                    {result.success ? '✅' : '❌'} {result.name}
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: result.success ? '#d1fae5' : '#fee2e2',
                    color: result.success ? '#065f46' : '#991b1b',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    {result.status}
                  </span>
                </div>
                
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>URL:</strong> {result.url}
                </p>
                
                {result.error && (
                  <p style={{ margin: '0.5rem 0', color: '#dc2626', fontSize: '0.875rem' }}>
                    <strong>Erro:</strong> {result.error}
                  </p>
                )}
                
                {result.data && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '0.875rem', color: '#4b5563' }}>
                      Ver dados da resposta
                    </summary>
                    <pre style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '0.75rem',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      marginTop: '0.5rem'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
          
          {results.length === 0 && (
            <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '1.125rem' }}>
              Clique no botão acima para testar as APIs
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
