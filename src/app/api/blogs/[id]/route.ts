import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse, handleApiError, validateJsonBody, AuthenticatedUser, validateBlogAccess } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

interface UpdateBlogData {
  title?: string
  description?: string
  domain?: string
  logoUrl?: string
  isActive?: boolean
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/blogs/[id] - Obter blog específico
async function handleGet(request: NextRequest, user: AuthenticatedUser, { params }: RouteParams) {
  try {
    const { id } = await params
    const blogId = parseInt(id)
    
    if (isNaN(blogId)) {
      return createErrorResponse('ID do blog inválido', 400)
    }

    // Verificar acesso ao blog
    const { hasAccess, error } = await validateBlogAccess(user, blogId, 'editor')
    if (!hasAccess) {
      return createErrorResponse(error || 'Acesso negado', 403)
    }

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            articles: true
          }
        }
      }
    })

    if (!blog) {
      return createErrorResponse('Blog não encontrado', 404)
    }

    // Adicionar contagem de usuários (mock)
    const blogWithCounts = {
      ...blog,
      _count: {
        ...blog._count,
        users: 1 // TODO: Contar usuários reais do BlogAccess
      }
    }

    return createApiResponse(true, blogWithCounts)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/blogs/[id] - Atualizar blog
async function handlePut(request: NextRequest, user: AuthenticatedUser, { params }: RouteParams) {
  try {
    const { id } = await params
    const blogId = parseInt(id)
    
    if (isNaN(blogId)) {
      return createErrorResponse('ID do blog inválido', 400)
    }

    // Verificar acesso de owner ao blog
    const { hasAccess, error } = await validateBlogAccess(user, blogId, 'owner')
    if (!hasAccess) {
      return createErrorResponse(error || 'Acesso negado', 403)
    }

    const body = await request.json()
    const { isValid, data, error: validationError } = validateJsonBody<UpdateBlogData>(body, [])

    if (!isValid) {
      return createErrorResponse(validationError!, 400)
    }

    // Verificar se o blog existe
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId }
    })

    if (!existingBlog) {
      return createErrorResponse('Blog não encontrado', 404)
    }

    // Se está alterando o domínio, verificar se já existe
    if (data!.domain && data!.domain !== existingBlog.domain) {
      const domainExists = await prisma.blog.findFirst({
        where: { 
          domain: data!.domain,
          id: { not: blogId }
        }
      })

      if (domainExists) {
        return createErrorResponse('Este domínio já está em uso', 400)
      }
    }

    // Atualizar o blog
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        ...(data!.title && { title: data!.title }),
        ...(data!.description && { description: data!.description }),
        ...(data!.domain && { domain: data!.domain }),
        ...(data!.logoUrl !== undefined && { logoUrl: data!.logoUrl }),
        ...(data!.isActive !== undefined && { isActive: data!.isActive }),
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            articles: true
          }
        }
      }
    })

    return createApiResponse(true, {
      ...updatedBlog,
      _count: {
        ...updatedBlog._count,
        users: 1
      }
    }, 'Blog atualizado com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/blogs/[id] - Deletar blog
async function handleDelete(request: NextRequest, user: AuthenticatedUser, { params }: RouteParams) {
  try {
    const { id } = await params
    const blogId = parseInt(id)
    
    if (isNaN(blogId)) {
      return createErrorResponse('ID do blog inválido', 400)
    }

    // Verificar acesso de owner ao blog
    const { hasAccess, error } = await validateBlogAccess(user, blogId, 'owner')
    if (!hasAccess) {
      return createErrorResponse(error || 'Acesso negado', 403)
    }

    // Verificar se o blog existe
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    })

    if (!existingBlog) {
      return createErrorResponse('Blog não encontrado', 404)
    }

    // Verificar se há artigos publicados
    if (existingBlog._count.articles > 0) {
      const publishedArticles = await prisma.article.count({
        where: {
          blogId: blogId,
          published: true
        }
      })

      if (publishedArticles > 0) {
        return createErrorResponse(
          'Não é possível excluir um blog com artigos publicados. Primeiro despublique ou exclua todos os artigos.',
          400
        )
      }
    }

    // Usar transação para deletar blog e dados relacionados
    await prisma.$transaction(async (tx) => {
      // Deletar artigos do blog
      await tx.article.deleteMany({
        where: { blogId: blogId }
      })

      // TODO: Deletar BlogAccess quando implementado
      // await tx.blogAccess.deleteMany({
      //   where: { blogId: blogId }
      // })

      // Deletar categorias do blog
      await tx.category.deleteMany({
        where: { blogId: blogId }
      })

      // Deletar prompts IA do blog
      await tx.aiPrompt.deleteMany({
        where: { blogId: blogId }
      })

      // Deletar o blog
      await tx.blog.delete({
        where: { id: blogId }
      })
    })

    return createApiResponse(true, null, 'Blog excluído com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}

// Funções auxiliares para roteamento
async function handleGetWrapper(request: NextRequest, context: RouteParams) {
  const { user, error } = await require('@/lib/api-auth').authenticateRequest(request)
  if (!user) {
    return createErrorResponse(error || 'Acesso negado', 401)
  }
  return handleGet(request, user, context)
}

async function handlePutWrapper(request: NextRequest, context: RouteParams) {
  const { user, error } = await require('@/lib/api-auth').authenticateRequest(request)
  if (!user) {
    return createErrorResponse(error || 'Acesso negado', 401)
  }
  return handlePut(request, user, context)
}

async function handleDeleteWrapper(request: NextRequest, context: RouteParams) {
  const { user, error } = await require('@/lib/api-auth').authenticateRequest(request)
  if (!user) {
    return createErrorResponse(error || 'Acesso negado', 401)
  }
  return handleDelete(request, user, context)
}

// Rotas principais
export { handleGetWrapper as GET, handlePutWrapper as PUT, handleDeleteWrapper as DELETE }
