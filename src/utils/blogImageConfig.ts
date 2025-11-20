/**
 * Configuração de imagens por blog
 * Detecta automaticamente a estrutura de diretórios baseada no blog
 */

export interface BlogImageConfig {
  blogId: number
  blogName: string
  basePath: string
  isExternal: boolean
  allowedExternalDomains: string[]
  maxImageSize: string
  externalAssetsPath?: string // Caminho absoluto para assets externos (ex: para blog 3)
}

// Configuração dos blogs baseada nos dados reais do banco
export const BLOG_IMAGE_CONFIGS: Record<number, BlogImageConfig> = {
  // Blog cbrazil (ID: 1)
  1: {
    blogId: 1,
    blogName: 'Blog_cbrazil',
    basePath: '/home/cabrazil/newprojs/blogs/blog_cbrazil/public/images',
    isExternal: false,
    allowedExternalDomains: ['unsplash.com', 'pixabay.com', 'pexels.com'],
    maxImageSize: '5MB'
  },
  
  // Blog casa (ID: 2)
  2: {
    blogId: 2,
    blogName: 'Blog_casa',
    basePath: '/home/cabrazil/newprojs/blogs/blog_casa/public/images',
    isExternal: false,
    allowedExternalDomains: ['unsplash.com', 'pixabay.com', 'pexels.com'],
    maxImageSize: '5MB'
  },
  
  // VibesFilm Blog (ID: 3) - Estrutura padrão (imagens copiadas)
  3: {
    blogId: 3,
    blogName: 'VibesFilm Blog',
    basePath: '/home/cabrazil/newprojs/blogs/blog-admin-platform/public/vibesfilm/images',
    isExternal: false, // Imagens copiadas para o projeto admin
    allowedExternalDomains: ['unsplash.com', 'tmdb.org', 'themoviedb.org', 'pexels.com'],
    maxImageSize: '10MB',
    externalAssetsPath: '/home/cabrazil/newprojs/fav_movies/moviesf_front/src/assets' // Caminho para assets externos (caminhos blog/...)
  },
  
  // CicloePonto Blog (ID: 4)
  4: {
    blogId: 4,
    blogName: 'CicloePonto Blog',
    basePath: '/home/cabrazil/newprojs/blogs/cicloeponto/public/images',
    isExternal: false,
    allowedExternalDomains: ['unsplash.com', 'pexels.com', 'pixabay.com'],
    maxImageSize: '5MB'
  }
}

// Diretório compartilhado para imagens entre blogs
export const SHARED_IMAGES_PATH = '/home/cabrazil/newprojs/blogs/blog-admin-platform/public/shared/images'

/**
 * Classe para gerenciar imagens por blog
 */
export class BlogImageManager {
  private blogConfig: BlogImageConfig

  constructor(blogId: number) {
    this.blogConfig = BLOG_IMAGE_CONFIGS[blogId]
    if (!this.blogConfig) {
      throw new Error(`Configuração não encontrada para o blog ${blogId}`)
    }
  }

  /**
   * Processa URL da imagem baseado na configuração do blog
   */
  processImageUrl(imageUrl: string): string {
    if (!imageUrl) return ''

    // Se já é uma URL completa (http/https), retorna como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return this.validateExternalUrl(imageUrl)
    }

    // Remove barra inicial se existir para normalizar
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl

    // Para BlogId 3 (VibesFilm), caminhos que começam com "blog/" são servidos do diretório externo
    if (this.blogConfig.blogId === 3) {
      // Se começa com "blog/", verifica se já tem ano/mês ou precisa adicionar
      if (cleanPath.startsWith('blog/')) {
        // Se já tem estrutura completa (blog/articles/2025/mês/arquivo), usa como está
        if (cleanPath.match(/^blog\/articles\/\d{4}\/[^\/]+\//)) {
          return `/api/blogs/${this.blogConfig.blogId}/images/${encodeURIComponent(cleanPath)}`
        }
        
        // Se é blog/articles/nome.jpg, adiciona ano/mês atual
        if (cleanPath.startsWith('blog/articles/') && !cleanPath.match(/^blog\/articles\/\d{4}\//)) {
          const fileName = cleanPath.replace('blog/articles/', '')
          const now = new Date()
          const year = now.getFullYear()
          const month = now.toLocaleString('pt-BR', { month: 'long' }).toLowerCase()
          return `/api/blogs/${this.blogConfig.blogId}/images/blog/articles/${year}/${month}/${encodeURIComponent(fileName)}`
        }
        
        // Outros caminhos que começam com blog/ são usados como estão
        return `/api/blogs/${this.blogConfig.blogId}/images/${encodeURIComponent(cleanPath)}`
      }
      
      // Se é apenas um nome de arquivo (sem "/"), assume que está em blog/articles/ano/mês/
      // Isso simplifica: "imagem.jpg" -> "blog/articles/2025/novembro/imagem.jpg"
      if (!cleanPath.includes('/') && cleanPath.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.toLocaleString('pt-BR', { month: 'long' }).toLowerCase()
        return `/api/blogs/${this.blogConfig.blogId}/images/blog/articles/${year}/${month}/${encodeURIComponent(cleanPath)}`
      }
    }

    // Se é um caminho local, processa baseado na configuração do blog
    if (cleanPath.startsWith('images/')) {
      // Verifica se é uma imagem compartilhada
      if (cleanPath.startsWith('images/shared/')) {
        return `/shared/${cleanPath.replace('images/shared/', '')}`
      }
      
      if (this.blogConfig.isExternal) {
        // Para blogs externos, retorna caminho relativo
        return `/${cleanPath}`
      } else {
        // Para blogs locais, retorna caminho relativo
        // Para VibesFilm Blog, adiciona prefixo vibesfilm/
        if (this.blogConfig.blogId === 3) {
          return `/vibesfilm/${cleanPath}`
        }
        return `/${cleanPath}`
      }
    }

    // Para outros caminhos, assume que é relativo ao public
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  }

  /**
   * Valida se URL externa é permitida
   */
  private validateExternalUrl(url: string): string {
    try {
      const domain = new URL(url).hostname
      const isAllowed = this.blogConfig.allowedExternalDomains.some(allowedDomain => 
        domain.includes(allowedDomain)
      )
      
      if (!isAllowed) {
        console.warn(`Domínio não permitido para blog ${this.blogConfig.blogName}: ${domain}`)
      }
      
      return url
    } catch {
      return url
    }
  }

  /**
   * Verifica se a imagem existe no sistema de arquivos
   */
  async checkImageExists(imageUrl: string): Promise<boolean> {
    const processedUrl = this.processImageUrl(imageUrl)
    
    // Para URLs externas, faz requisição HTTP
    if (processedUrl.startsWith('http')) {
      try {
        const response = await fetch(processedUrl, { method: 'HEAD' })
        return response.ok
      } catch {
        return false
      }
    }

    // Para URLs de API (caminhos blog/... do blog 3), verifica via HTTP
    if (processedUrl.startsWith('/api/blogs/')) {
      try {
        const response = await fetch(processedUrl, { method: 'HEAD' })
        return response.ok
      } catch {
        return false
      }
    }

    // Para caminhos locais, verifica se arquivo existe
    if (this.blogConfig.isExternal) {
      // Para blogs externos, verifica no sistema de arquivos
      try {
        const fs = await import('fs')
        const fullPath = `${this.blogConfig.basePath}/${processedUrl.replace(/^\//, '')}`
        return fs.existsSync(fullPath)
      } catch {
        return false
      }
    }

    // Para blogs locais, assume que existe se está no public
    return true
  }

  /**
   * Gera informações de debug para a imagem
   */
  getDebugInfo(imageUrl: string) {
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
    const isExternalAsset = this.blogConfig.blogId === 3 && (
      cleanPath.startsWith('blog/') || 
      (!cleanPath.includes('/') && cleanPath.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i))
    )
    
    // Determina o caminho completo para assets externos
    let fullPath: string | null = null
    if (isExternalAsset && this.blogConfig.externalAssetsPath) {
      const processedUrl = this.processImageUrl(imageUrl)
      // Extrai o caminho da URL processada (remove /api/blogs/3/images/)
      const pathFromUrl = processedUrl.replace(`/api/blogs/${this.blogConfig.blogId}/images/`, '')
      fullPath = `${this.blogConfig.externalAssetsPath}/${pathFromUrl}`
    }
    
    return {
      originalUrl: imageUrl,
      processedUrl: this.processImageUrl(imageUrl),
      blogConfig: this.blogConfig,
      isExternalBlog: this.blogConfig.isExternal,
      basePath: this.blogConfig.basePath,
      externalAssetsPath: this.blogConfig.externalAssetsPath,
      isExternalAsset: isExternalAsset,
      fullPath: fullPath
    }
  }

  /**
   * Obtém configuração do blog
   */
  getConfig(): BlogImageConfig {
    return this.blogConfig
  }
}

/**
 * Hook para usar o gerenciador de imagens
 */
export function useBlogImageManager(blogId: number) {
  return new BlogImageManager(blogId)
}
