import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'

const prisma = new PrismaClient()

// GET /api/blogs/[id]/categories - Listar categorias do blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request, new NextResponse())
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const blogId = parseInt(id)

    if (isNaN(blogId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do blog inválido'
      }, { status: 400 })
    }

    // Buscar usuário no banco
    const user = await findOrCreateUser({
      email: session.user.email!,
      name: session.user.name,
      sub: session.user.sub!
    })

    // Verificar acesso ao blog
    const access = await checkBlogAccess(user.id, blogId)
    if (!access.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para acessar este blog' },
        { status: 403 }
      )
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
      data: {
        categories
      }
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
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request, new NextResponse())
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const blogId = parseInt(id)

    if (isNaN(blogId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do blog inválido'
      }, { status: 400 })
    }

    // Buscar usuário no banco
    const user = await findOrCreateUser({
      email: session.user.email!,
      name: session.user.name,
      sub: session.user.sub!
    })

    // Verificar acesso ao blog
    const access = await checkBlogAccess(user.id, blogId)
    if (!access.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para criar categorias neste blog' },
        { status: 403 }
      )
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
