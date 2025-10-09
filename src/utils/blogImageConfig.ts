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
    maxImageSize: '10MB'
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

    // Se é um caminho local, processa baseado na configuração do blog
    if (imageUrl.startsWith('images/') || imageUrl.startsWith('/images/')) {
      const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
      
      // Verifica se é uma imagem compartilhada
      if (cleanPath.startsWith('shared/')) {
        return `/${cleanPath}`
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
    return {
      originalUrl: imageUrl,
      processedUrl: this.processImageUrl(imageUrl),
      blogConfig: this.blogConfig,
      isExternalBlog: this.blogConfig.isExternal,
      basePath: this.blogConfig.basePath
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
