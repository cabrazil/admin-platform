'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import AuthWrapper from '@/components/AuthWrapper'
import { useBlogs } from '@/hooks/useBlogs'
import { 
  Palette, 
  Search, 
  Type, 
  Image as ImageIcon, 
  Globe, 
  Save,
  Eye,
  RefreshCw,
  Building2
} from 'lucide-react'

interface ThemeSettings {
  seo: {
    socialImage: string
    defaultKeywords: string[]
    defaultMetaDescription: string
  }
  fonts: {
    bodyFont: string
    headingFont: string
  }
  colors: {
    accent: string
    primary: string
    secondary: string
    background: string
    textPrimary: string
    textSecondary: string
  }
  footer: {
    description: string
    copyrightText: string
  }
  layout: {
    headerStyle: string
    footerColumns: number
    sidebarEnabled: boolean
    sidebarPosition: string
    articleCardStyle: string
    homeLayout: string
    featuredSectionEnabled: boolean
    featuredSectionStyle: string
    heroSectionEnabled: boolean
    heroSectionStyle: string
    newsletterEnabled: boolean
    categoriesEnabled: boolean
  }
  branding: {
    favicon: string
    logoDark: string
    logoLight: string
    siteTitle: string
  }
  customCode: {
    js: string
    css: string
  }
  socialLinks: {
    github: string
    twitter: string
    linkedin: string
  }
}

const defaultThemeSettings: ThemeSettings = {
  seo: {
    socialImage: '/images/social-share.png',
    defaultKeywords: ['IA', 'Inteligência Artificial', 'Machine Learning', 'NLP', 'Tecnologia'],
    defaultMetaDescription: 'Blog sobre Inteligência Artificial, Processamento de Linguagem Natural e Machine Learning para todos'
  },
  fonts: {
    bodyFont: 'Inter, sans-serif',
    headingFont: 'Montserrat, sans-serif'
  },
  colors: {
    accent: '#ef4444',
    primary: '#2563eb',
    secondary: '#10b981',
    background: '#f9fafb',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563'
  },
  footer: {
    description: 'Seu portal de conhecimento em Inteligência Artificial e tecnologia.',
    copyrightText: '© 2025 cbrazil.com. Todos os direitos reservados.'
  },
  layout: {
    headerStyle: 'default',
    footerColumns: 4,
    sidebarEnabled: false,
    sidebarPosition: 'right',
    articleCardStyle: 'default',
    homeLayout: 'standard',
    featuredSectionEnabled: false,
    featuredSectionStyle: 'default',
    heroSectionEnabled: true,
    heroSectionStyle: 'default',
    newsletterEnabled: false,
    categoriesEnabled: true
  },
  branding: {
    favicon: '/favicon.ico',
    logoDark: '/images/cbrazil_logo_dark.png',
    logoLight: '/images/cbrazil_logo.png',
    siteTitle: 'cbrazil.com'
  },
  customCode: {
    js: '',
    css: ''
  },
  socialLinks: {
    github: 'https://github.com/cbrazil',
    twitter: 'https://twitter.com/cbrazil',
    linkedin: 'https://linkedin.com/in/cbrazil'
  }
}

export default function LayoutsSeoPage() {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null)
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('seo')
  const [error, setError] = useState<string | null>(null)
  const { blogs, loading: blogsLoading } = useBlogs()

  // Função para garantir que themeSettings sempre tenha a estrutura correta
  const ensureThemeSettingsStructure = (settings: any): ThemeSettings => {
    return {
      seo: { ...defaultThemeSettings.seo, ...settings.seo },
      fonts: { ...defaultThemeSettings.fonts, ...settings.fonts },
      colors: { ...defaultThemeSettings.colors, ...settings.colors },
      footer: { ...defaultThemeSettings.footer, ...settings.footer },
      layout: { ...defaultThemeSettings.layout, ...settings.layout },
      branding: { ...defaultThemeSettings.branding, ...settings.branding },
      customCode: { ...defaultThemeSettings.customCode, ...settings.customCode },
      socialLinks: { ...defaultThemeSettings.socialLinks, ...settings.socialLinks }
    }
  }

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

  // Carregar configurações do blog selecionado
  useEffect(() => {
    const loadThemeSettings = async () => {
      if (!selectedBlogId) return
      
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/blogs/${selectedBlogId}/theme`, {
          credentials: 'include'
        })
        
        // Verificar se a resposta é válida
        if (!response.ok) {
          if (response.status === 401) {
            setError('Usuário não autenticado. Faça login novamente.')
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        // Verificar se há conteúdo para parsear
        const text = await response.text()
        if (!text) {
          throw new Error('Resposta vazia da API')
        }
        
        const result = JSON.parse(text)
        
        if (result.success && result.data && result.data.themeSettings) {
          // Garantir que as configurações tenham a estrutura correta
          const validSettings = ensureThemeSettingsStructure(result.data.themeSettings)
          setThemeSettings(validSettings)
        } else if (result.success && result.data) {
          // Se não há themeSettings, usar padrão
          console.log('Blog sem configurações salvas, usando configurações padrão')
          setThemeSettings(defaultThemeSettings)
        } else {
          // Se a API retornou erro, usar configurações padrão
          console.warn('API retornou erro, usando configurações padrão:', result.error)
          setThemeSettings(defaultThemeSettings)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do tema:', error)
        setError('Erro ao carregar configurações. Usando configurações padrão.')
        setThemeSettings(defaultThemeSettings)
      } finally {
        setLoading(false)
      }
    }

    loadThemeSettings()
  }, [selectedBlogId])

  const handleSave = async () => {
    if (!selectedBlogId) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/blogs/${selectedBlogId}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          themeSettings
        })
      })
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Verificar se há conteúdo para parsear
      const text = await response.text()
      if (!text) {
        throw new Error('Resposta vazia da API')
      }
      
      const result = JSON.parse(text)
      
      if (result.success) {
        alert('Configurações salvas com sucesso!')
      } else {
        throw new Error(result.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    if (!selectedBlogId) return
    // Abrir preview em nova aba
    window.open(`/preview/${selectedBlogId}`, '_blank')
  }

  const tabs = [
    { id: 'seo', name: 'SEO', icon: Search },
    { id: 'colors', name: 'Cores', icon: Palette },
    { id: 'fonts', name: 'Fontes', icon: Type },
    { id: 'layout', name: 'Layout', icon: Globe },
    { id: 'branding', name: 'Marca', icon: ImageIcon },
    { id: 'custom', name: 'Código', icon: RefreshCw }
  ]

  // Se não há blogId selecionado, mostrar mensagem
  if (!selectedBlogId) {
    return (
      <AuthWrapper>
        <AdminLayout title="Layouts & SEO" subtitle="Configure o visual e SEO dos seus blogs">
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
      <AdminLayout title="Layouts & SEO" subtitle="Configure o visual e SEO dos seus blogs">
        <div className="space-y-6">
          {/* Informação do Blog */}
          {selectedBlogId && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Palette className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {blogs.find(b => b.id === selectedBlogId)?.name || `Blog ID: ${selectedBlogId}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configurações de Layout e SEO
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedBlogId && (
            <>
              {/* Mensagem de erro */}
              {error && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Carregando configurações...</p>
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Tab: SEO */}
                  {activeTab === 'seo' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imagem Social (Open Graph)
                        </label>
                        <input
                          type="text"
                          value={themeSettings.seo.socialImage}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            seo: { ...themeSettings.seo, socialImage: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="/images/social-share.png"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description Padrão
                        </label>
                        <textarea
                          value={themeSettings.seo.defaultMetaDescription}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            seo: { ...themeSettings.seo, defaultMetaDescription: e.target.value }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Descrição padrão para SEO..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Palavras-chave Padrão
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {themeSettings.seo.defaultKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {keyword}
                              <button
                                onClick={() => {
                                  const newKeywords = themeSettings.seo.defaultKeywords.filter((_, i) => i !== index)
                                  setThemeSettings({
                                    ...themeSettings,
                                    seo: { ...themeSettings.seo, defaultKeywords: newKeywords }
                                  })
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Adicionar palavra-chave..."
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const keyword = e.currentTarget.value.trim()
                              if (keyword && !themeSettings.seo.defaultKeywords.includes(keyword)) {
                                setThemeSettings({
                                  ...themeSettings,
                                  seo: {
                                    ...themeSettings.seo,
                                    defaultKeywords: [...themeSettings.seo.defaultKeywords, keyword]
                                  }
                                })
                                e.currentTarget.value = ''
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab: Cores */}
                  {activeTab === 'colors' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(themeSettings.colors).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, [key]: e.target.value }
                              })}
                              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, [key]: e.target.value }
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab: Fontes */}
                  {activeTab === 'fonts' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fonte do Corpo
                        </label>
                        <select
                          value={themeSettings.fonts.bodyFont}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            fonts: { ...themeSettings.fonts, bodyFont: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Open Sans, sans-serif">Open Sans</option>
                          <option value="Lato, sans-serif">Lato</option>
                          <option value="Poppins, sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fonte dos Títulos
                        </label>
                        <select
                          value={themeSettings.fonts.headingFont}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            fonts: { ...themeSettings.fonts, headingFont: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Montserrat, sans-serif">Montserrat</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="Oswald, sans-serif">Oswald</option>
                          <option value="Lora, serif">Lora</option>
                          <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Tab: Layout */}
                  {activeTab === 'layout' && (
                    <div className="space-y-8">
                      {/* Layout da Home */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Layout da Home</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de Layout
                            </label>
                            <select
                              value={themeSettings.layout.homeLayout}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, homeLayout: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="standard">Padrão</option>
                              <option value="featured">Com Destaque</option>
                              <option value="magazine">Revista</option>
                              <option value="minimal">Minimalista</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Estilo do Header
                            </label>
                            <select
                              value={themeSettings.layout.headerStyle}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, headerStyle: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="default">Padrão</option>
                              <option value="minimal">Minimalista</option>
                              <option value="centered">Centralizado</option>
                              <option value="sidebar">Com Sidebar</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Seção de Destaque */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Seção de Destaque</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={themeSettings.layout.featuredSectionEnabled}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, featuredSectionEnabled: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Habilitar Seção de Destaque</span>
                          </div>

                          {themeSettings.layout.featuredSectionEnabled && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estilo da Seção de Destaque
                              </label>
                              <select
                                value={themeSettings.layout.featuredSectionStyle}
                                onChange={(e) => setThemeSettings({
                                  ...themeSettings,
                                  layout: { ...themeSettings.layout, featuredSectionStyle: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="default">Padrão (Artigo principal + laterais)</option>
                                <option value="compact">Compacto (Grid uniforme)</option>
                                <option value="grid">Grade (Primeiro em destaque)</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hero Section */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={themeSettings.layout.heroSectionEnabled}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, heroSectionEnabled: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Habilitar Hero Section</span>
                          </div>

                          {themeSettings.layout.heroSectionEnabled && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estilo do Hero
                              </label>
                              <select
                                value={themeSettings.layout.heroSectionStyle}
                                onChange={(e) => setThemeSettings({
                                  ...themeSettings,
                                  layout: { ...themeSettings.layout, heroSectionStyle: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="default">Padrão</option>
                                <option value="gradient">Gradiente</option>
                                <option value="image">Com Imagem</option>
                                <option value="minimal">Minimalista</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Funcionalidades Extras */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Funcionalidades Extras</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={themeSettings.layout.newsletterEnabled}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, newsletterEnabled: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Newsletter</span>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={themeSettings.layout.categoriesEnabled}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, categoriesEnabled: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Categorias</span>
                          </div>
                        </div>
                      </div>

                      {/* Configurações Avançadas */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Avançadas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Colunas do Footer
                            </label>
                            <select
                              value={themeSettings.layout.footerColumns}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, footerColumns: parseInt(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={2}>2 Colunas</option>
                              <option value={3}>3 Colunas</option>
                              <option value={4}>4 Colunas</option>
                              <option value={5}>5 Colunas</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Estilo dos Cards de Artigo
                            </label>
                            <select
                              value={themeSettings.layout.articleCardStyle}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, articleCardStyle: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="default">Padrão</option>
                              <option value="compact">Compacto</option>
                              <option value="modern">Moderno</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={themeSettings.layout.sidebarEnabled}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                layout: { ...themeSettings.layout, sidebarEnabled: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Habilitar Sidebar</span>
                          </div>

                          {themeSettings.layout.sidebarEnabled && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Posição da Sidebar
                              </label>
                              <select
                                value={themeSettings.layout.sidebarPosition}
                                onChange={(e) => setThemeSettings({
                                  ...themeSettings,
                                  layout: { ...themeSettings.layout, sidebarPosition: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="left">Esquerda</option>
                                <option value="right">Direita</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Branding */}
                  {activeTab === 'branding' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título do Site
                        </label>
                        <input
                          type="text"
                          value={themeSettings.branding.siteTitle}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            branding: { ...themeSettings.branding, siteTitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo Claro
                          </label>
                          <input
                            type="text"
                            value={themeSettings.branding.logoLight}
                            onChange={(e) => setThemeSettings({
                              ...themeSettings,
                              branding: { ...themeSettings.branding, logoLight: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="/images/logo-light.png"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo Escuro
                          </label>
                          <input
                            type="text"
                            value={themeSettings.branding.logoDark}
                            onChange={(e) => setThemeSettings({
                              ...themeSettings,
                              branding: { ...themeSettings.branding, logoDark: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="/images/logo-dark.png"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Favicon
                        </label>
                        <input
                          type="text"
                          value={themeSettings.branding.favicon}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            branding: { ...themeSettings.branding, favicon: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="/favicon.ico"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab: Código Customizado */}
                  {activeTab === 'custom' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CSS Customizado
                        </label>
                        <textarea
                          value={themeSettings.customCode.css}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            customCode: { ...themeSettings.customCode, css: e.target.value }
                          })}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="/* Seu CSS customizado aqui */"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          JavaScript Customizado
                        </label>
                        <textarea
                          value={themeSettings.customCode.js}
                          onChange={(e) => setThemeSettings({
                            ...themeSettings,
                            customCode: { ...themeSettings.customCode, js: e.target.value }
                          })}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="// Seu JavaScript customizado aqui"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-between items-center bg-white rounded-lg shadow p-6">
                <button
                  onClick={handlePreview}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </button>
              </div>
                </>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </AuthWrapper>
  )
}