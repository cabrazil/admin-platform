import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, checkBlogAccess } from '@/lib/auth-db'

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

    return NextResponse.json({
      success: true,
      data: {
        hasAccess: access.hasAccess,
        role: access.role,
        userId: user.id,
        blogId
      }
    })

  } catch (error) {
    console.error('Erro ao verificar acesso ao blog:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
