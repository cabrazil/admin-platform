// Cliente para APIs do admin
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // ============ BLOGS ============
  async getBlogs(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<{ blogs: any[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    return this.request(`/api/blogs${query ? `?${query}` : ''}`)
  }

  async getBlog(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/blogs/${id}`)
  }

  async createBlog(data: {
    name: string
    slug: string
    domain?: string
    themeSettings?: any
    ownerId?: number
    status?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/api/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBlog(id: number, data: {
    name?: string
    slug?: string
    domain?: string
    themeSettings?: any
    status?: string
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBlog(id: number): Promise<ApiResponse<void>> {
    return this.request(`/api/blogs/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ ARTICLES ============
  async getArticles(blogId: number, params?: {
    page?: number
    limit?: number
    search?: string
    status?: 'all' | 'published' | 'draft'
  }): Promise<ApiResponse<{ articles: any[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)

    const query = searchParams.toString()
    return this.request(`/api/blogs/${blogId}/articles${query ? `?${query}` : ''}`)
  }

  async getArticle(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/articles/${id}`)
  }

  async createArticle(blogId: number, data: {
    title: string
    description: string
    content: string
    imageUrl?: string
    categoryId: number
    authorId: number
    published?: boolean
    tags?: string[]
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/blogs/${blogId}/articles`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateArticle(id: number, data: {
    title?: string
    description?: string
    content?: string
    imageUrl?: string
    categoryId?: number
    authorId?: number
    published?: boolean
    tags?: string[]
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteArticle(id: number): Promise<ApiResponse<void>> {
    return this.request(`/api/articles/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ CATEGORIES ============
  async getCategories(blogId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/api/blogs/${blogId}/categories`)
  }

  // ============ AUTHORS ============
  async getAuthors(blogId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/api/blogs/${blogId}/authors`)
  }

  // ============ UPLOAD ============
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    // TODO: Implementar endpoint de upload
    return this.request('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type para FormData
    })
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient()

// Hook para tratamento de erros de API
export function useApiError() {
  const handleError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    return 'Erro desconhecido'
  }

  return { handleError }
}

// Hook para operações assíncronas com estado de loading
export function useAsyncOperation() {
  const { handleError } = useApiError()

  const execute = async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: string) => void
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await operation()
      onSuccess?.(result)
      return { success: true }
    } catch (error) {
      const errorMessage = handleError(error)
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return { execute }
}
