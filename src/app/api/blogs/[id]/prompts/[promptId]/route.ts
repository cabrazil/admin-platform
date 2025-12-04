import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; promptId: string }> }
) {
  try {
    const session = await getSession(request, new NextResponse())
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { id, promptId: promptIdParam } = await params
    const blogId = parseInt(id)
    const promptId = parseInt(promptIdParam)
    
    if (isNaN(blogId) || isNaN(promptId)) {
      return NextResponse.json(
        { success: false, error: 'IDs inválidos' },
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

    // Buscar prompt
    const prompt = await prisma.aiPrompt.findFirst({
      where: { 
        id: promptId,
        blogId: blogId
      }
    })

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { prompt }
    })

  } catch (error) {
    console.error('Erro ao buscar prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; promptId: string }> }
) {
  try {
    const session = await getSession(request, new NextResponse())
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { id, promptId: promptIdParam } = await params
    const blogId = parseInt(id)
    const promptId = parseInt(promptIdParam)
    
    if (isNaN(blogId) || isNaN(promptId)) {
      return NextResponse.json(
        { success: false, error: 'IDs inválidos' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, content, isActive } = body

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
        { success: false, error: 'Sem permissão para editar prompts neste blog' },
        { status: 403 }
      )
    }

    // Verificar se prompt existe e pertence ao blog
    const existingPrompt = await prisma.aiPrompt.findFirst({
      where: { 
        id: promptId,
        blogId: blogId
      }
    })

    if (!existingPrompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar prompt
    const prompt = await prisma.aiPrompt.update({
      where: { id: promptId },
      data: {
        name,
        content,
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: { prompt },
      message: 'Prompt atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; promptId: string }> }
) {
  try {
    const session = await getSession(request, new NextResponse())
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { id, promptId: promptIdParam } = await params
    const blogId = parseInt(id)
    const promptId = parseInt(promptIdParam)
    
    if (isNaN(blogId) || isNaN(promptId)) {
      return NextResponse.json(
        { success: false, error: 'IDs inválidos' },
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
        { success: false, error: 'Sem permissão para excluir prompts neste blog' },
        { status: 403 }
      )
    }

    // Verificar se prompt existe e pertence ao blog
    const existingPrompt = await prisma.aiPrompt.findFirst({
      where: { 
        id: promptId,
        blogId: blogId
      }
    })

    if (!existingPrompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt não encontrado' },
        { status: 404 }
      )
    }

    // Excluir prompt
    await prisma.aiPrompt.delete({
      where: { id: promptId }
    })

    return NextResponse.json({
      success: true,
      message: 'Prompt excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
