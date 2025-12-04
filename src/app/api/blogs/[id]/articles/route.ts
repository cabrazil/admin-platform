import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'
import { prisma } from '@/lib/prisma'

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
    const { title, description, content, categoryId, authorId, imageUrl, imageAlt, tagIds = [], published = false, metadata = {} } = body

    // Validação
    if (!title || !description || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Título, descrição, conteúdo, categoria e autor são obrigatórios' },
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
        { success: false, error: 'Sem permissão para criar artigos neste blog' },
        { status: 403 }
      )
    }

    // Verificar se categoria existe e pertence ao blog
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        blogId: blogId
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se autor existe e pertence ao blog
    const author = await prisma.author.findFirst({
      where: { 
        id: authorId,
        blogId: blogId
      }
    })

    if (!author) {
      return NextResponse.json(
        { success: false, error: 'Autor não encontrado' },
        { status: 404 }
      )
    }

    // Validar tags (máximo 4)
    if (tagIds.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Máximo de 4 tags permitidas' },
        { status: 400 }
      )
    }

    // Verificar se todas as tags existem e pertencem ao blog
    if (tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          blogId: blogId
        }
      })

      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { success: false, error: 'Uma ou mais tags não foram encontradas' },
          { status: 404 }
        )
      }
    }

    // Criar slug temporário baseado no ID que será gerado
    // O slug será definido manualmente na página de edição
    const tempSlug = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Criar artigo
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug: tempSlug,
        content: content.trim(),
        description: description.trim(),
        date: new Date(),
        imageUrl: imageUrl?.trim() || '',
        imageAlt: imageAlt?.trim() || null,
        blogId,
        categoryId,
        authorId,
        userId: user.id,
        published,
        viewCount: 0,
        likeCount: 0,
        keywords: [],
        aiGenerated: false,
        aiModel: null,
        aiPrompt: null,
        metadata: metadata,
        tags: {
          connect: tagIds.map(id => ({ id }))
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          published: article.published
        }
      },
      message: 'Artigo criado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar artigo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
        { success: false, error: 'Sem permissão para acessar artigos deste blog' },
        { status: 403 }
      )
    }

    // Obter parâmetros de paginação e filtros
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = { blogId }
    
    // Filtro por status (published/draft/all)
    if (status === 'published') {
      where.published = true
    } else if (status === 'draft') {
      where.published = false
    }
    // Se status === 'all', não filtra por published

    // Filtro de busca
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar artigos com paginação e campos otimizados
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          imageUrl: true,
          published: true,
          viewCount: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          date: true,
          category: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
