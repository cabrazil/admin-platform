import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json(
        { success: false, error: 'ID do blog inválido' },
        { status: 400 }
      )
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

    // Obter parâmetro opcional para filtrar por isActive
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Construir filtro
    const where: any = { blogId }
    if (!includeInactive) {
      where.isActive = true
    }

    // Buscar prompts do blog (campos otimizados)
    const prompts = await prisma.aiPrompt.findMany({
      where,
      select: {
        id: true,
        name: true,
        content: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        blogId: true
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        prompts
      }
    })

  } catch (error) {
    console.error('Erro ao buscar prompts do blog:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json(
        { success: false, error: 'ID do blog inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, content, isActive = true } = body

    // Validação
    if (!name || !content) {
      return NextResponse.json(
        { success: false, error: 'Nome e conteúdo são obrigatórios' },
        { status: 400 }
      )
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
        { success: false, error: 'Sem permissão para criar prompts neste blog' },
        { status: 403 }
      )
    }

    // Criar prompt
    const prompt = await prisma.aiPrompt.create({
      data: {
        name,
        content,
        isActive,
        blogId,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        prompt
      },
      message: 'Prompt criado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
