import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth, createApiResponse, createErrorResponse, handleApiError, validateJsonBody, AuthenticatedUser, validateBlogAccess } from '@/lib/api-auth'
import { generateSlug } from '@/lib/slug-utils'

const prisma = new PrismaClient()

interface UpdateArticleData {
  title?: string
  slug?: string
  description?: string
  content?: string
  imageUrl?: string
  imageAlt?: string
  categoryId?: number
  authorId?: number
  published?: boolean
  type?: 'analise' | 'lista'
  tagIds?: number[]
  metadata?: {
    seoTitle?: string | null
    metaDescription?: string | null
  }
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/articles/[id] - Obter artigo específico
async function handleGet(request: NextRequest, user: AuthenticatedUser, { params }: RouteParams) {
  try {
    const { id } = await params
    const articleId = parseInt(id)
    
    if (isNaN(articleId)) {
      return createErrorResponse('ID do artigo inválido', 400)
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        blog: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        category: {
          select: {
            id: true,
            title: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!article) {
      return createErrorResponse('Artigo não encontrado', 404)
    }



    // Verificar acesso ao blog do artigo
    const { hasAccess, error } = await validateBlogAccess(user, article.blogId, 'editor')
    if (!hasAccess) {
      return createErrorResponse(error || 'Acesso negado', 403)
    }

    return createApiResponse(true, {
      ...article,
      _count: {
        views: Math.floor(Math.random() * 2000), // Mock
        comments: Math.floor(Math.random() * 50) // Mock
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/articles/[id] - Atualizar artigo
async function handlePut(request: NextRequest, user: AuthenticatedUser, { params }: RouteParams) {
  try {
    const { id } = await params
    const articleId = parseInt(id)
    
    if (isNaN(articleId)) {
      return createErrorResponse('ID do artigo inválido', 400)
    }

    // Verificar se o artigo existe
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        blogId: true,
        title: true,
        slug: true,
        published: true,

      }
    })

    if (!existingArticle) {
      return createErrorResponse('Artigo não encontrado', 404)
    }

    // Verificar acesso ao blog do artigo
    const { hasAccess, error } = await validateBlogAccess(user, existingArticle.blogId, 'editor')
    if (!hasAccess) {
      return createErrorResponse(error || 'Acesso negado', 403)
    }

    const body = await request.json()
    const { isValid, data, error: validationError } = validateJsonBody<UpdateArticleData>(body, [])

    if (!isValid) {
      return createErrorResponse(validationError!, 400)
    }

    // Truncar metaDescription se exceder 160 caracteres
    if (data!.metadata?.metaDescription && data!.metadata.metaDescription.length > 160) {
      data!.metadata.metaDescription = data!.metadata.metaDescription.substring(0, 160).trim()
    }

    // Verificar se categoria e autor pertencem ao blog (se fornecidos)
    if (data!.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data!.categoryId, blogId: existingArticle.blogId }
      })
      if (!category) {
        return createErrorResponse('Categoria não encontrada neste blog', 400)
      }
    }

    if (data!.authorId) {
      const author = await prisma.author.findFirst({
        where: { id: data!.authorId, blogId: existingArticle.blogId }
      })
      if (!author) {
        return createErrorResponse('Autor não encontrado neste blog', 400)
      }
    }

    // Validar tags (máximo 4)
    if (data!.tagIds && data!.tagIds.length > 4) {
      return createErrorResponse('Máximo de 4 tags permitidas', 400)
    }

    // Verificar se todas as tags existem e pertencem ao blog
    if (data!.tagIds && data!.tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: data!.tagIds },
          blogId: existingArticle.blogId
        }
      })

      if (tags.length !== data!.tagIds.length) {
        return createErrorResponse('Uma ou mais tags não foram encontradas', 400)
      }
    }

    // Processar slug: usar slug manual se fornecido, senão gerar automaticamente se título mudou
    let newSlug = existingArticle.slug
    
    if (data!.slug) {
      // Slug manual fornecido - validar formato e unicidade
      const slug = data!.slug.trim()
      
      if (!slug) {
        return createErrorResponse('Slug não pode estar vazio', 400)
      }
      
      // Validar formato do slug (apenas letras, números, hífens e underscores)
      if (!/^[a-z0-9-_]+$/.test(slug)) {
        return createErrorResponse('Slug deve conter apenas letras minúsculas, números, hífens e underscores', 400)
      }
      
      const slugExists = await prisma.article.findFirst({ 
        where: { 
          slug: slug, 
          blogId: existingArticle.blogId,
          id: { not: articleId }
        } 
      })
      
      if (slugExists) {
        return createErrorResponse('Este slug já está sendo usado por outro artigo', 400)
      }
      
      newSlug = slug
    } else if (data!.title && data!.title !== existingArticle.title) {
      // Título mudou mas slug não foi fornecido - gerar automaticamente
      const baseSlug = generateSlug(data!.title)
      
      newSlug = baseSlug
      let counter = 1

      while (await prisma.article.findFirst({ 
        where: { 
          slug: newSlug, 
          blogId: existingArticle.blogId,
          id: { not: articleId }
        } 
      })) {
        newSlug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Campo publishedAt não existe no schema atual, usar apenas published boolean

    // Atualizar artigo em UMA única operação, incluindo tags via set (sem transação)
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        ...(data!.title && { title: data!.title }),
        ...(data!.description && { description: data!.description }),
        ...(data!.content && { content: data!.content }),
        ...(data!.imageUrl !== undefined && { imageUrl: data!.imageUrl }),
        ...(data!.imageAlt !== undefined && { imageAlt: data!.imageAlt }),
        ...(data!.categoryId && { categoryId: data!.categoryId }),
        ...(data!.authorId && { authorId: data!.authorId }),
        ...(data!.published !== undefined && { published: data!.published }),
        ...(data!.type && { type: data!.type }),
        ...(data!.metadata && { metadata: data!.metadata }),
        ...(data!.tagIds !== undefined && {
          tags: {
            set: data!.tagIds.map((id) => ({ id }))
          }
        }),
        slug: newSlug,
        updatedAt: new Date()
      }
    })

    // Buscar artigo completo com relacionamentos
    const articleWithRelations = await prisma.article.findUnique({
      where: { id: updatedArticle.id },
      include: {
        blog: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        category: {
          select: {
            id: true,
            title: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return createApiResponse(true, {
      ...articleWithRelations,
      _count: {
        views: Math.floor(Math.random() * 2000),
        comments: Math.floor(Math.random() * 50)
      }
    }, 'Artigo atualizado com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/articles/[id] - Deletar artigo
async function handleDelete(request: NextRequest, user: AuthenticatedUser, { params }: RouteParams) {
  try {
    const { id } = await params
    const articleId = parseInt(id)
    
    if (isNaN(articleId)) {
      return createErrorResponse('ID do artigo inválido', 400)
    }

    // Verificar se o artigo existe
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        blogId: true,
        title: true,
        published: true
      }
    })

    if (!existingArticle) {
      return createErrorResponse('Artigo não encontrado', 404)
    }

    // Verificar acesso ao blog do artigo (editor pode deletar)
    const { hasAccess, error } = await validateBlogAccess(user, existingArticle.blogId, 'editor')
    if (!hasAccess) {
      return createErrorResponse(error || 'Acesso negado', 403)
    }

    // Deletar artigo e relacionamentos usando transação
    await prisma.$transaction(async (tx) => {
      // Deletar associações com tags
      await tx.articleTag.deleteMany({
        where: { articleId }
      })

      // TODO: Deletar comentários quando implementado
      // await tx.comment.deleteMany({
      //   where: { articleId }
      // })

      // TODO: Deletar views quando implementado
      // await tx.articleView.deleteMany({
      //   where: { articleId }
      // })

      // Deletar o artigo
      await tx.article.delete({
        where: { id: articleId }
      })
    })

    return createApiResponse(true, null, 'Artigo excluído com sucesso')
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
