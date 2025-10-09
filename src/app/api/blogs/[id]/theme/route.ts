import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth, createApiResponse, createErrorResponse, handleApiError, validateJsonBody, AuthenticatedUser } from '@/lib/api-auth'

const prisma = new PrismaClient()

interface UpdateThemeData {
  themeSettings: any
}

// PUT /api/blogs/[id]/theme - Atualizar configurações de tema
async function handlePut(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const blogId = parseInt(params.id)
    
    if (isNaN(blogId)) {
      return createErrorResponse('ID do blog inválido', 400)
    }

    const body = await request.json()
    
    const { isValid, data, error } = validateJsonBody<UpdateThemeData>(body, [
      'themeSettings'
    ])

    if (!isValid) {
      return createErrorResponse(error!, 400)
    }

    // Verificar se o blog existe
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        owner: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!blog) {
      return createErrorResponse('Blog não encontrado', 404)
    }

    // Verificar permissões
    if (!user.isMaster && blog.owner.email !== user.email) {
      return createErrorResponse('Você não tem permissão para editar este blog', 403)
    }

    // Atualizar as configurações de tema
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        themeSettingsJson: data!.themeSettings,
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
    }, 'Configurações de tema atualizadas com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/blogs/[id]/theme - Obter configurações de tema
async function handleGet(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const blogId = parseInt(params.id)
    
    if (isNaN(blogId)) {
      return createErrorResponse('ID do blog inválido', 400)
    }

    // Verificar se o blog existe
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        owner: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!blog) {
      return createErrorResponse('Blog não encontrado', 404)
    }

    // Verificar permissões
    if (!user.isMaster && blog.owner.email !== user.email) {
      return createErrorResponse('Você não tem permissão para visualizar este blog', 403)
    }

    // Configurações de tema (já é um objeto JSON do Prisma)
    const themeSettings = blog.themeSettingsJson || {}

    return createApiResponse(true, {
      blogId: blog.id,
      blogName: blog.name,
      themeSettings
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handlePut(req, user, context)
  })(request)
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handleGet(req, user, context)
  })(request)
}
