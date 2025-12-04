import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse, handleApiError, validateJsonBody, AuthenticatedUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

interface CreateBlogData {
  name: string
  slug: string
  domain?: string
  themeSettings?: any
  ownerId?: number
  status?: string
}

// GET /api/blogs - Listar blogs
async function handleGet(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit

    // Construir filtros baseados nas permissões do usuário
    const where: any = {}
    
    // Se não é master admin, só pode ver seus próprios blogs
    if (!user.isMaster) {
      // TODO: Implementar relação com BlogAccess
      // where.OR = [
      //   { ownerId: parseInt(user.sub) },
      //   { 
      //     blogAccess: {
      //       some: {
      //         userId: parseInt(user.sub)
      //       }
      //     }
      //   }
      // ]
      
      // Por enquanto, filtrar por email do owner (mock)
      where.owner = {
        email: user.email
      }
    }



    // Filtro de busca
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar blogs com contagem de artigos e usuários
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
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
              articles: true,
              // blogAccess: true // TODO: Implementar quando BlogAccess estiver pronto
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.blog.count({ where })
    ])

    // Adicionar contagem de usuários (mock por enquanto)
    const blogsWithCounts = blogs.map(blog => ({
      ...blog,
      _count: {
        ...blog._count,
        users: 1 // TODO: Contar usuários reais do BlogAccess
      }
    }))

    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1



    return createApiResponse(true, {
      blogs: blogsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/blogs - Criar novo blog
async function handlePost(request: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await request.json()
    
    const { isValid, data, error } = validateJsonBody<CreateBlogData>(body, [
      'name',
      'slug'
    ])

    if (!isValid) {
      return createErrorResponse(error!, 400)
    }

    // Verificar se o slug já existe
    const existingBlog = await prisma.blog.findFirst({
      where: { 
        OR: [
          { slug: data!.slug },
          ...(data!.domain ? [{ domain: data!.domain }] : [])
        ]
      }
    })

    if (existingBlog) {
      return createErrorResponse('Este slug ou domínio já está em uso', 400)
    }

    // Determinar o owner do blog
    let ownerId: number | undefined

    if (user.isMaster && data!.ownerId) {
      // Master admin pode definir qualquer owner
      ownerId = data!.ownerId
      
      // Verificar se o usuário existe
      const ownerExists = await prisma.user.findUnique({
        where: { id: ownerId }
      })

      if (!ownerExists) {
        return createErrorResponse('Usuário proprietário não encontrado', 400)
      }
    } else {
      // TODO: Buscar ou criar usuário baseado no Auth0
      // Por enquanto, vamos criar um mock
      ownerId = 1
    }

    // Criar o blog
    const newBlog = await prisma.blog.create({
      data: {
        name: data!.name,
        slug: data!.slug,
        domain: data!.domain || null,
        themeSettings: data!.themeSettings || {},
        ownerId: ownerId,
        status: data!.status || 'active'
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

    // TODO: Criar entrada no BlogAccess para o owner
    // await prisma.blogAccess.create({
    //   data: {
    //     userId: ownerId,
    //     blogId: newBlog.id,
    //     role: 'owner'
    //   }
    // })

    return createApiResponse(true, {
      ...newBlog,
      _count: {
        ...newBlog._count,
        users: 1
      }
    }, 'Blog criado com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}

// Rotas principais
export const GET = requireAuth(handleGet)
export const POST = requireAuth(handlePost)
