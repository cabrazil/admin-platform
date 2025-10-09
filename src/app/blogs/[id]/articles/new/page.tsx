'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthWrapper from '@/components/AuthWrapper'
import { LoadingSelect } from '@/components/LoadingSelect'
import { useAuth } from '@/hooks/useAuth'
import { 
  ArrowLeft,
  Save,
  FileText,
  User,
  Tag,
  Loader2,
  CheckCircle,
  X,
  Plus,
  Eye,
  EyeOff,
  Wand2,
  Upload
} from 'lucide-react'

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

function NewArticlePageContent() {
  const { dbUser, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id as string
  
  const [blog, setBlog] = useState<Blog | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedAuthor, setSelectedAuthor] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [published, setPublished] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [isConverting, setIsConverting] = useState<boolean>(false)
  
  // Campos SEO
  const [seoTitle, setSeoTitle] = useState<string>("")
  const [metaDescription, setMetaDescription] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
      const blogResponse = await fetch(`/api/blogs/${blogId}`)
      if (!blogResponse.ok) {
        throw new Error('Blog não encontrado')
      }
      const blogData = await blogResponse.json()
      setBlog(blogData.data.blog)
      
      // Buscar categorias do blog
      const categoriesResponse = await fetch(`/api/blogs/${blogId}/categories`)
      if (!categoriesResponse.ok) {
        throw new Error('Erro ao carregar categorias')
      }
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData.data || [])
      
      // Buscar autores do blog
      const authorsResponse = await fetch(`/api/blogs/${blogId}/authors`)
      if (!authorsResponse.ok) {
        throw new Error('Erro ao carregar autores')
      }
      const authorsData = await authorsResponse.json()
      setAuthors(authorsData.data || [])
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      setError('Título é obrigatório')
      return false
    }
    if (!description.trim()) {
      setError('Descrição é obrigatória')
      return false
    }
    if (!content.trim()) {
      setError('Conteúdo é obrigatório')
      return false
    }
    if (!selectedCategory) {
      setError('Categoria é obrigatória')
      return false
    }
    if (!selectedAuthor) {
      setError('Autor é obrigatório')
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
    
    setSaving(true)

    try {
      const response = await fetch(`/api/blogs/${blogId}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          categoryId: parseInt(selectedCategory),
          authorId: parseInt(selectedAuthor),
          imageUrl: imageUrl.trim() || '',
          published,
          metadata: {
            seoTitle: seoTitle.trim() || null,
            metaDescription: metaDescription.trim() || null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar artigo")
      }

      setSuccess("Artigo criado com sucesso!")
      
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
      setError(err instanceof Error ? err.message : "Erro ao criar artigo")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setError(null)
    const { name, value, type } = e.target
    
    switch (name) {
      case 'title':
        setTitle(value)
        break
      case 'description':
        setDescription(value)
        break
      case 'content':
        setContent(value)
        break
      case 'category':
        setSelectedCategory(value)
        break
      case 'author':
        setSelectedAuthor(value)
        break
      case 'imageUrl':
        setImageUrl(value)
        break
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublished(e.target.checked)
  }

  const convertWordFormatting = () => {
    if (!content.trim()) {
      setError('Cole o conteúdo do Word primeiro')
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      let convertedContent = content

      // Primeiro, normalizar quebras de linha
      convertedContent = convertedContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

      // Detectar e converter títulos primeiro (antes de processar parágrafos)
      
      // Título principal (primeiro título encontrado) - H1
      let titleCount = 0
      convertedContent = convertedContent.replace(
        /^([A-Z\s]{3,})\n/gi,
        (match, title) => {
          titleCount++
          return titleCount === 1 ? `<h1>${title}</h1>\n` : `<h2>${title}</h2>\n`
        }
      )
      
      // Títulos em negrito com asteriscos
      convertedContent = convertedContent.replace(
        /^(\*\*[^*]+\*\*)\n/gi,
        (match, title) => {
          titleCount++
          const cleanTitle = title.replace(/\*\*/g, '')
          return titleCount === 1 ? `<h1>${cleanTitle}</h1>\n` : `<h2>${cleanTitle}</h2>\n`
        }
      )
      
      // Títulos em negrito com underscores
      convertedContent = convertedContent.replace(
        /^(__[^_]+__)\n/gi,
        (match, title) => {
          titleCount++
          const cleanTitle = title.replace(/__/g, '')
          return titleCount === 1 ? `<h1>${cleanTitle}</h1>\n` : `<h2>${cleanTitle}</h2>\n`
        }
      )

      // Converter quebras de linha duplas em parágrafos
      convertedContent = convertedContent.replace(/\n\n+/g, '</p>\n<p>')
      
      // Converter quebras de linha simples em <br>
      convertedContent = convertedContent.replace(/\n/g, '<br>')
      
      // Envolver em tags de parágrafo se não estiver
      if (!convertedContent.startsWith('<h') && !convertedContent.startsWith('<p>')) {
        convertedContent = '<p>' + convertedContent
      }
      if (!convertedContent.endsWith('</p>') && !convertedContent.endsWith('</h2>')) {
        convertedContent = convertedContent + '</p>'
      }

      // Converter listas com bullets - diferentes formatos
      
      // Bullets padrão (•) - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)•\s*([^<]+)/gi,
        '</p>\n<ul>\n<li>$2</li>\n</ul>\n<p>'
      )
      
      // Hífens (-) - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)-\s*([^<]+)/gi,
        '</p>\n<ul>\n<li>$2</li>\n</ul>\n<p>'
      )
      
      // Asteriscos (*) - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)\*\s*([^<]+)/gi,
        '</p>\n<ul>\n<li>$2</li>\n</ul>\n<p>'
      )
      
      // Círculos (○) - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)○\s*([^<]+)/gi,
        '</p>\n<ul>\n<li>$2</li>\n</ul>\n<p>'
      )
      
      // Quadrados (■) - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)■\s*([^<]+)/gi,
        '</p>\n<ul>\n<li>$2</li>\n</ul>\n<p>'
      )
      
      // Triângulos (▶) - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)▶\s*([^<]+)/gi,
        '</p>\n<ul>\n<li>$2</li>\n</ul>\n<p>'
      )

      // Converter listas numeradas - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)(\d+)\.\s*([^<]+)/gi,
        '</p>\n<ol>\n<li>$3</li>\n</ol>\n<p>'
      )
      
      // Converter listas com letras (a., b., c.) - com <br> ou início de linha
      convertedContent = convertedContent.replace(
        /(<br>|^)([a-z])\.\s*([^<]+)/gi,
        '</p>\n<ol type="a">\n<li>$3</li>\n</ol>\n<p>'
      )

      // Converter texto em negrito (Word usa ** ou __)
      convertedContent = convertedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      convertedContent = convertedContent.replace(/__([^_]+)__/g, '<strong>$1</strong>')

      // Converter texto em itálico (Word usa * ou _)
      convertedContent = convertedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>')
      convertedContent = convertedContent.replace(/_([^_]+)_/g, '<em>$1</em>')

      // Limpar tags vazias e espaços extras
      convertedContent = convertedContent.replace(/<p><\/p>/g, '')
      convertedContent = convertedContent.replace(/<p><br><\/p>/g, '')
      convertedContent = convertedContent.replace(/<p>\s*<\/p>/g, '')
      
      // Consolidar listas consecutivas
      convertedContent = consolidateLists(convertedContent)

      // Limpar espaços extras no início e fim
      convertedContent = convertedContent.trim()

      // Garantir que o conteúdo tenha pelo menos um parágrafo
      if (!convertedContent.includes('<p>') && !convertedContent.includes('<h')) {
        convertedContent = '<p>' + convertedContent + '</p>'
      }

      setContent(convertedContent)
      setSuccess('Formatação do Word convertida com sucesso! Use "Visualizar" para verificar o resultado.')
      
    } catch (error) {
      console.error('Erro ao converter formatação:', error)
      setError('Erro ao converter formatação do Word')
    } finally {
      setIsConverting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
      setError('Por favor, selecione um arquivo HTML (.html)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const htmlContent = e.target?.result as string
        
        // Extrair conteúdo do HTML do Word
        const extractedContent = extractContentFromWordHTML(htmlContent)
        
        setContent(extractedContent)
        setSuccess('Arquivo HTML do Word importado com sucesso! Use "Visualizar" para verificar o resultado.')
        
        // Limpar o input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Erro ao processar arquivo HTML:', error)
        setError('Erro ao processar arquivo HTML do Word')
      }
    }
    
    reader.readAsText(file)
  }

  const extractContentFromWordHTML = (htmlContent: string): string => {
    // Criar um DOM parser temporário
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    // O Word geralmente coloca o conteúdo no body
    const body = doc.body
    
    // Remover scripts e estilos
    const scripts = body.querySelectorAll('script, style')
    scripts.forEach(script => script.remove())
    
    // Extrair apenas o conteúdo textual com formatação
    let content = body.innerHTML
    
    // Limpar tags específicas do Word que não queremos
    content = content.replace(/<o:p[^>]*>/g, '')
    content = content.replace(/<\/o:p>/g, '')
    content = content.replace(/<w:[^>]*>/g, '')
    content = content.replace(/<\/w:[^>]*>/g, '')
    content = content.replace(/<m:[^>]*>/g, '')
    content = content.replace(/<\/m:[^>]*>/g, '')
    
    // Limpar classes CSS do Word (mantendo a estrutura)
    content = content.replace(/class="[^"]*"/g, '')
    content = content.replace(/class='[^']*'/g, '')
    
    // Limpar outros atributos específicos do Word
    content = content.replace(/id="[^"]*"/g, '')
    content = content.replace(/id='[^']*'/g, '')
    content = content.replace(/style="[^"]*"/g, '')
    content = content.replace(/style='[^']*'/g, '')
    
    // Converter quebras de linha do Word
    content = content.replace(/<br[^>]*>/gi, '<br>')
    
    // Preservar formatação original - não remover spans com conteúdo
    // Apenas remover spans vazios
    content = content.replace(/<span[^>]*><\/span>/g, '')
    
    // Preservar negrito e itálico que já existem no HTML
    // Não converter spans para texto simples se eles contêm formatação
    
    // Processar formatação do Word de forma mais inteligente
    content = processWordFormatting(content)
    
    // Processar listas do Word especificamente
    content = processWordLists(content)
    
    // Limpar espaços extras
    content = content.trim()
    
    return content
  }

  const consolidateLists = (content: string): string => {
    // Consolidar listas não ordenadas consecutivas
    content = content.replace(
      /<\/ul>\s*<p>\s*<\/p>\s*<ul>/g,
      ''
    )
    
    // Consolidar listas ordenadas consecutivas
    content = content.replace(
      /<\/ol>\s*<p>\s*<\/p>\s*<ol>/g,
      ''
    )
    
    // Consolidar itens de lista que foram separados por parágrafos vazios
    content = content.replace(
      /<\/li>\s*<p>\s*<\/p>\s*<li>/g,
      '</li>\n<li>'
    )
    
    return content
  }

  const processWordFormatting = (content: string): string => {
    // CORREÇÃO: Processar formatação do Word de forma inteligente
    // PROBLEMA ANTERIOR: A função estava convertendo incorretamente classes c0 e c5 para <strong>
    // SOLUÇÃO: Analisar automaticamente as classes CSS para determinar font-weight real
    // - Classes com font-weight >= 700: converter para <strong>
    // - Classes com font-weight < 700: apenas remover o span, manter texto normal
    
    // Converter tags <b> e <i> do Word para HTML padrão
    content = content.replace(/<b[^>]*>/gi, '<strong>')
    content = content.replace(/<\/b>/gi, '</strong>')
    content = content.replace(/<i[^>]*>/gi, '<em>')
    content = content.replace(/<\/i>/gi, '</em>')
    
    // Analisar as classes CSS do Word para determinar quais têm font-weight:700
    // Extrair definições de classes do CSS inline
    const cssClassDefinitions = content.match(/\.c\d+\{[^}]*font-weight:\s*(\d+)[^}]*\}/g) || []
    
    // Mapear classes para seus font-weight
    const classToFontWeight: { [key: string]: number } = {}
    cssClassDefinitions.forEach(def => {
      const classMatch = def.match(/\.(c\d+)/)
      const weightMatch = def.match(/font-weight:\s*(\d+)/)
      if (classMatch && weightMatch) {
        classToFontWeight[classMatch[1]] = parseInt(weightMatch[1])
      }
    })
    
    // Processar spans baseado no font-weight real das classes
    // Para cada classe encontrada, aplicar a formatação correta
    Object.entries(classToFontWeight).forEach(([className, fontWeight]) => {
      const regex = new RegExp(`<span[^>]*class="[^"]*${className}[^"]*"[^>]*>([^<]*)</span>`, 'gi')
      
      if (fontWeight >= 700) {
        // Negrito - converter para <strong>
        content = content.replace(regex, '<strong>$1</strong>')
      } else {
        // Normal - apenas remover o span
        content = content.replace(regex, '$1')
      }
    })
    
    // Remover spans simples (sem formatação especial)
    content = content.replace(
      /<span[^>]*>([^<]*)<\/span>/g,
      '$1'
    )
    
    // CORREÇÃO: Remover padrão específico <span ><strong></span> que causa problemas no TinyMCE
    // Este padrão é gerado pelo Word e causa tags <strong> desnecessárias na edição
    content = content.replace(/<span\s*>\s*<strong>\s*<\/strong>\s*<\/span>/g, '')
    content = content.replace(/<span\s*>\s*<strong>\s*<\/strong>/g, '')
    content = content.replace(/<span\s*>\s*<\/strong>\s*<\/span>/g, '')
    
    // Remover tags <strong> vazias que possam ter sobrado
    content = content.replace(/<strong>\s*<\/strong>/g, '')
    
    return content
  }

  const processWordLists = (content: string): string => {
    // Processar listas do Word que já estão em <ul> e <li>
    // Limpar classes e atributos específicos do Word nas listas
    content = content.replace(
      /<ul[^>]*>/gi,
      '<ul>'
    )
    
    content = content.replace(
      /<li[^>]*>/gi,
      '<li>'
    )
    
    // Limpar classes específicas do Word nas listas
    content = content.replace(
      /class="[^"]*"/g,
      ''
    )
    
    // Remover atributos específicos do Word
    content = content.replace(
      /li-bullet-[^"]*"/g,
      ''
    )
    
    content = content.replace(
      /lst-kix_[^"]*"/g,
      ''
    )
    
    // Limpar espaços extras dentro das tags
    content = content.replace(
      /<ul\s+>/g,
      '<ul>'
    )
    
    content = content.replace(
      /<li\s+>/g,
      '<li>'
    )
    
    return content
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/blogs/${blogId}/articles`}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Artigo</h1>
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
              <Plus className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Criar Artigo Manualmente</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Título do Artigo *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={handleInputChange}
                  placeholder="Digite o título do artigo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={handleInputChange}
                  placeholder="Digite uma descrição curta do artigo"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Descrição que aparecerá na listagem e SEO do artigo.
                </p>
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Categoria *
                </label>
                <LoadingSelect 
                  isLoading={loading && categories.length === 0}
                  loadingText="Carregando categorias..."
                  className="w-full"
                >
                  <select
                    id="category"
                    name="category"
                    value={selectedCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories && categories.length > 0 ? categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    )) : (
                      <option value="" disabled>Nenhuma categoria encontrada</option>
                    )}
                  </select>
                </LoadingSelect>
              </div>

              {/* Autor */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Autor *
                </label>
                <LoadingSelect 
                  isLoading={loading && authors.length === 0}
                  loadingText="Carregando autores..."
                  className="w-full"
                >
                  <select
                    id="author"
                    name="author"
                    value={selectedAuthor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione um autor</option>
                    {authors && authors.length > 0 ? authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    )) : (
                      <option value="" disabled>Nenhum autor encontrado</option>
                    )}
                  </select>
                </LoadingSelect>
              </div>

              {/* URL da Imagem */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL ou Caminho da Imagem
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.jpg ou images/blog/articles/2025/imagem.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL completa ou caminho local da imagem principal do artigo (opcional).
                  <br />
                  <strong>Exemplos:</strong>
                  <br />
                  • URL: <code className="text-xs bg-gray-100 px-1 rounded">https://exemplo.com/imagem.jpg</code>
                  <br />
                  • Local: <code className="text-xs bg-gray-100 px-1 rounded">images/blog/articles/2025/imagem.jpg</code>
                </p>
              </div>

              {/* SEO - Título para Google */}
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Título SEO (Google)
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Título otimizado para busca (máx. 60 caracteres)"
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    Título que aparecerá nos resultados de busca do Google
                  </p>
                  <span className={`text-xs ${seoTitle.length > 50 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {seoTitle.length}/60
                  </span>
                </div>
              </div>

              {/* SEO - Meta Description */}
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (Google)
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Descrição que aparecerá nos resultados de busca (máx. 160 caracteres)"
                  maxLength={160}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    Descrição que aparecerá nos resultados de busca do Google
                  </p>
                  <span className={`text-xs ${metaDescription.length > 140 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {metaDescription.length}/160
                  </span>
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Conteúdo do Artigo *
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Input de arquivo HTML (oculto) */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,text/html"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {/* Botão para importar HTML do Word */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                    >
                      <Upload className="h-4 w-4" />
                      Importar HTML
                    </button>
                    
                    <button
                      type="button"
                      onClick={convertWordFormatting}
                      disabled={isConverting || !content.trim()}
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConverting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      {isConverting ? 'Convertendo...' : 'Converter Word'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPreview ? 'Editar' : 'Visualizar'}
                    </button>
                  </div>
                </div>
                
                {showPreview ? (
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto">
                    <div 
                      dangerouslySetInnerHTML={{ __html: content }} 
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: '1.6',
                        fontSize: '16px'
                      }}
                      className="article-preview"
                    />
                    <style>{`
                      .article-preview h1 {
                        font-size: 2.25rem !important;
                        font-weight: 700 !important;
                        margin-top: 2rem !important;
                        margin-bottom: 1rem !important;
                        color: #1f2937 !important;
                        border-bottom: 2px solid #e5e7eb !important;
                        padding-bottom: 0.5rem !important;
                        display: block !important;
                      }
                      .article-preview h2 {
                        font-size: 1.875rem !important;
                        font-weight: 600 !important;
                        margin-top: 1.5rem !important;
                        margin-bottom: 0.75rem !important;
                        color: #374151 !important;
                        display: block !important;
                      }
                      .article-preview h3 {
                        font-size: 1.5rem !important;
                        font-weight: 600 !important;
                        margin-top: 1.25rem !important;
                        margin-bottom: 0.5rem !important;
                        color: #4b5563 !important;
                        display: block !important;
                      }
                      .article-preview p {
                        margin-bottom: 1rem !important;
                        line-height: 1.75 !important;
                        display: block !important;
                      }
                      .article-preview ul, .article-preview ol {
                        margin: 1rem 0 !important;
                        padding-left: 1.5rem !important;
                        display: block !important;
                        list-style: disc outside !important;
                      }
                      .article-preview li {
                        margin-bottom: 0.5rem !important;
                        display: list-item !important;
                        list-style: inherit !important;
                      }
                      .article-preview ol {
                        list-style: decimal outside !important;
                      }
                      .article-preview strong {
                        font-weight: 600 !important;
                        color: #1f2937 !important;
                      }
                      .article-preview em {
                        font-style: italic !important;
                        color: #4b5563 !important;
                      }
                      .article-preview br {
                        display: inline !important;
                      }
                    `}</style>
                  </div>
                ) : (
                  <textarea
                    id="content"
                    name="content"
                    value={content}
                    onChange={handleInputChange}
                    placeholder="Cole aqui o conteúdo do seu artigo. Você pode usar HTML para formatação."
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    required
                  />
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Cole o conteúdo do seu artigo aqui. HTML é suportado para formatação.
                </p>
              </div>

              {/* Publicar */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={published}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  Publicar imediatamente
                </label>
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
                  href={`/blogs/${blogId}/articles`}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Criar Artigo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dicas */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas para criar artigos:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>HTML do Word (Recomendado):</strong> No Word, salve como "Página da Web (.html)" e use "Importar HTML"</li>
            <li>• <strong>Texto do Word:</strong> Cole o texto e clique em "Converter Word" para manter a formatação</li>
            <li>• <strong>Formatação automática:</strong> Títulos em negrito e maiúsculas são convertidos para H2</li>
            <li>• <strong>Listas:</strong> Suporta bullets (•, -, *, ○, ■, ▶), números (1., 2.) e letras (a., b.)</li>
            <li>• <strong>HTML manual:</strong> Use tags como &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;</li>
            <li>• <strong>Visualização:</strong> Use o botão "Visualizar" para verificar a formatação antes de salvar</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function NewArticlePage() {
  return (
    <AuthWrapper>
      <NewArticlePageContent />
    </AuthWrapper>
  )
}
