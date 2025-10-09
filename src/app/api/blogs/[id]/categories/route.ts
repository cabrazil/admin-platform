import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/api-auth'
import type { AuthenticatedUser } from '@/lib/api-auth'

const prisma = new PrismaClient()

// GET /api/blogs/[id]/categories - Listar categorias do blog
async function handleGet(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const blogId = parseInt(id)

    if (isNaN(blogId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do blog inválido'
      }, { status: 400 })
    }

    // Verificar se o usuário tem acesso ao blog
    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        ownerId: user.id
      }
    })

    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog não encontrado ou sem permissão'
      }, { status: 404 })
    }

    // Buscar categorias do blog
    const categories = await prisma.category.findMany({
      where: {
        blogId: blogId
      },
      orderBy: {
        title: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST /api/blogs/[id]/categories - Criar nova categoria
async function handlePost(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const blogId = parseInt(id)

    if (isNaN(blogId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do blog inválido'
      }, { status: 400 })
    }

    // Verificar se o usuário tem acesso ao blog
    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        ownerId: user.id
      }
    })

    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog não encontrado ou sem permissão'
      }, { status: 404 })
    }

    const body = await request.json()
    const { title, slug, description, imageUrl, parentId, aiKeywords, aiPrompt } = body

    // Validações
    if (!title || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Título e slug são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se o slug já existe
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: slug,
        blogId: blogId
      }
    })

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Já existe uma categoria com este slug'
      }, { status: 400 })
    }

    // Criar categoria
    const category = await prisma.category.create({
      data: {
        title,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        aiKeywords: aiKeywords || null,
        aiPrompt: aiPrompt || null,
        blogId: blogId
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handleGet(req, user, context)
  })(request)
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handlePost(req, user, context)
  })(request)
}
