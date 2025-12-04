import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import type { AuthenticatedUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// PUT /api/blogs/[id]/authors/[authorId] - Atualizar autor
async function handlePut(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string; authorId: string }> }) {
  try {
    const { id, authorId } = await context.params
    const blogId = parseInt(id)
    const authId = parseInt(authorId)

    if (isNaN(blogId) || isNaN(authId)) {
      return NextResponse.json({
        success: false,
        error: 'IDs inválidos'
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

    // Verificar se o autor existe e pertence ao blog
    const existingAuthor = await prisma.author.findFirst({
      where: {
        id: authId,
        blogId: blogId
      }
    })

    if (!existingAuthor) {
      return NextResponse.json({
        success: false,
        error: 'Autor não encontrado'
      }, { status: 404 })
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

    // Verificar se o email já existe em outro autor (se fornecido)
    if (email) {
      const emailConflict = await prisma.author.findFirst({
        where: {
          email: email,
          id: { not: authId }
        }
      })

      if (emailConflict) {
        return NextResponse.json({
          success: false,
          error: 'Já existe um autor com este email'
        }, { status: 400 })
      }
    }

    // Atualizar autor
    const author = await prisma.author.update({
      where: {
        id: authId
      },
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
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: author
    })

  } catch (error) {
    console.error('Erro ao atualizar autor:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// DELETE /api/blogs/[id]/authors/[authorId] - Excluir autor
async function handleDelete(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string; authorId: string }> }) {
  try {
    const { id, authorId } = await context.params
    const blogId = parseInt(id)
    const authId = parseInt(authorId)

    if (isNaN(blogId) || isNaN(authId)) {
      return NextResponse.json({
        success: false,
        error: 'IDs inválidos'
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

    // Verificar se o autor existe e pertence ao blog
    const existingAuthor = await prisma.author.findFirst({
      where: {
        id: authId,
        blogId: blogId
      }
    })

    if (!existingAuthor) {
      return NextResponse.json({
        success: false,
        error: 'Autor não encontrado'
      }, { status: 404 })
    }

    // Verificar se há artigos usando este autor
    const articlesCount = await prisma.article.count({
      where: {
        authorId: authId
      }
    })

    if (articlesCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Não é possível excluir o autor pois ele possui ${articlesCount} artigo(s) associado(s)`
      }, { status: 400 })
    }

    // Excluir autor
    await prisma.author.delete({
      where: {
        id: authId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Autor excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir autor:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; authorId: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handlePut(req, user, context)
  })(request)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; authorId: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handleDelete(req, user, context)
  })(request)
}
