import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { findOrCreateUser, getUserBlogs } from '@/lib/auth-db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request, new NextResponse())
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar ou criar usuário no banco
    const user = await findOrCreateUser({
      email: session.user.email!,
      name: session.user.name,
      sub: session.user.sub!
    })

    // Buscar blogs do usuário
    const blogs = await getUserBlogs(user.id)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          auth0Sub: session.user.sub
        },
        blogs,
        blogAccess: user.blogAccess
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
