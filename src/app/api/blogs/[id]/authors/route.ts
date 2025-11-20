import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'

const prisma = new PrismaClient()

// GET /api/blogs/[id]/authors - Listar autores do blog
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

    // Buscar autores do blog
    const authors = await prisma.author.findMany({
      where: {
        blogId: blogId
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        authors
      }
    })

  } catch (error) {
    console.error('Erro ao buscar autores:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST /api/blogs/[id]/authors - Criar novo autor
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
        { success: false, error: 'Sem permissão para criar autores neste blog' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      role, 
      imageUrl, 
      bio, 
      email, 
      website, 
      social, 
      skills, 
      aiModel, 
      isAi, 
      signature 
    } = body

    // Validações
    if (!name || !role || !imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Nome, função e URL da foto são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se o email já existe (se fornecido)
    if (email) {
      const existingAuthor = await prisma.author.findFirst({
        where: {
          email: email
        }
      })

      if (existingAuthor) {
        return NextResponse.json({
          success: false,
          error: 'Já existe um autor com este email'
        }, { status: 400 })
      }
    }

    // Criar autor
    const author = await prisma.author.create({
      data: {
        name,
        role,
        imageUrl,
        bio: bio || null,
        email: email || null,
        website: website || null,
        social: social || null,
        skills: skills || null,
        aiModel: aiModel || null,
        isAi: isAi || false,
        signature: signature || null,
        blogId: blogId
      }
    })

    return NextResponse.json({
      success: true,
      data: author
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar autor:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
