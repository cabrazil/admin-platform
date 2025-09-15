import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'
import { generateArticleContent, getAvailableProviders, getProviderConfig } from '@/lib/ai-providers'

const prisma = new PrismaClient()

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
    const { promptId, categoryId, authorId, topic, count = 1, provider = 'openai' } = body

    // Validação
    if (!categoryId || !authorId || !topic) {
      return NextResponse.json(
        { success: false, error: 'Categoria, autor e tópico são obrigatórios' },
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
        { success: false, error: 'Sem permissão para gerar artigos neste blog' },
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

    // Buscar prompt se fornecido
    let prompt = null
    if (promptId) {
      prompt = await prisma.aiPrompt.findFirst({
        where: { 
          id: promptId,
          blogId: blogId,
          isActive: true
        }
      })

      if (!prompt) {
        return NextResponse.json(
          { success: false, error: 'Prompt não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se o provedor está disponível
    const availableProviders = getAvailableProviders()
    if (!availableProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: `Provedor de IA não disponível: ${provider}` },
        { status: 400 }
      )
    }

    const providerConfig = getProviderConfig(provider)
    console.log(`🔍 Usando ${providerConfig.name} para geração`)

    // Gerar conteúdo com IA
    const generatedContent = await generateArticleContent({
      topic,
      promptContent: prompt?.content,
      categoryName: category.title,
      authorName: author.name,
      provider
    })

    // Criar slug único
    const baseSlug = generatedContent.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
    
    let slug = baseSlug
    let counter = 1
    
    // Verificar se slug já existe
    while (await prisma.article.findFirst({ where: { slug, blogId } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Criar artigo
    const article = await prisma.article.create({
      data: {
        title: generatedContent.title,
        slug,
        content: generatedContent.content,
        description: generatedContent.description,
        date: new Date(),
        imageUrl: '', // Campo obrigatório, será atualizado depois
        blogId,
        categoryId,
        authorId,
        userId: user.id,
        published: false,
        viewCount: 0,
        likeCount: 0,
        keywords: [],
        aiGenerated: true,
        aiModel: generatedContent.model,
        aiPrompt: prompt?.content || 'default',
      }
    })

    // Log da geração
    await prisma.aiGenerationLog.create({
      data: {
        promptId: prompt?.id || null,
        articleId: article.id,
        blogId,
        success: true,
        tokensUsed: null, // Pode ser calculado se necessário
        cost: null, // Pode ser calculado se necessário
        duration: null // Pode ser calculado se necessário
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          status: article.status
        }
      },
      message: 'Artigo gerado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao gerar artigo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


