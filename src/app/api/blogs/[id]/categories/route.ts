import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'

const prisma = new PrismaClient()

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

    // Buscar categorias do blog (removendo duplicatas por título)
    const allCategories = await prisma.category.findMany({
      where: { 
        blogId
      },
      orderBy: { title: 'asc' },
    })

    // Remover duplicatas baseado no título, mantendo a mais recente
    const categoriesMap = new Map()
    allCategories.forEach(category => {
      if (!categoriesMap.has(category.title) || 
          new Date(category.createdAt) > new Date(categoriesMap.get(category.title).createdAt)) {
        categoriesMap.set(category.title, category)
      }
    })

    const categories = Array.from(categoriesMap.values()).sort((a, b) => 
      a.title.localeCompare(b.title)
    )

    return NextResponse.json({
      success: true,
      data: {
        categories
      }
    })

  } catch (error) {
    console.error('Erro ao buscar categorias do blog:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
