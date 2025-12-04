import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import type { AuthenticatedUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// PUT /api/blogs/[id]/categories/[categoryId] - Atualizar categoria
async function handlePut(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string; categoryId: string }> }) {
  try {
    const { id, categoryId } = await context.params
    const blogId = parseInt(id)
    const catId = parseInt(categoryId)

    if (isNaN(blogId) || isNaN(catId)) {
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

    // Verificar se a categoria existe e pertence ao blog
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: catId,
        blogId: blogId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Categoria não encontrada'
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

    // Verificar se o slug já existe em outra categoria
    const slugConflict = await prisma.category.findFirst({
      where: {
        slug: slug,
        blogId: blogId,
        id: { not: catId }
      }
    })

    if (slugConflict) {
      return NextResponse.json({
        success: false,
        error: 'Já existe uma categoria com este slug'
      }, { status: 400 })
    }

    // Atualizar categoria
    const category = await prisma.category.update({
      where: {
        id: catId
      },
      data: {
        title,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        aiKeywords: aiKeywords || null,
        aiPrompt: aiPrompt || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    })

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// DELETE /api/blogs/[id]/categories/[categoryId] - Excluir categoria
async function handleDelete(request: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id: string; categoryId: string }> }) {
  try {
    const { id, categoryId } = await context.params
    const blogId = parseInt(id)
    const catId = parseInt(categoryId)

    if (isNaN(blogId) || isNaN(catId)) {
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

    // Verificar se a categoria existe e pertence ao blog
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: catId,
        blogId: blogId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Categoria não encontrada'
      }, { status: 404 })
    }

    // Verificar se há artigos usando esta categoria
    const articlesCount = await prisma.article.count({
      where: {
        categoryId: catId
      }
    })

    if (articlesCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Não é possível excluir a categoria pois ela possui ${articlesCount} artigo(s) associado(s)`
      }, { status: 400 })
    }

    // Excluir categoria
    await prisma.category.delete({
      where: {
        id: catId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; categoryId: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handlePut(req, user, context)
  })(request)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; categoryId: string }> }) {
  return requireAuth(async (req: NextRequest, user: AuthenticatedUser) => {
    return handleDelete(req, user, context)
  })(request)
}
