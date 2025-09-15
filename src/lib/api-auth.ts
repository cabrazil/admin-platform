import { getSession } from '@auth0/nextjs-auth0'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isMasterAdmin, getUserRole, UserRole } from './auth'

export interface AuthenticatedUser {
  sub: string
  email: string
  name: string
  role: UserRole
  isMaster: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): Response {
  const response: ApiResponse<T> = {
    success,
    ...(data && { data }),
    ...(message && { message }),
    ...(error && { error })
  }

  const status = success ? 200 : 400
  return NextResponse.json(response, { status })
}

export function createErrorResponse(error: string, status: number = 400): Response {
  return NextResponse.json(
    { success: false, error },
    { status }
  )
}

export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthenticatedUser | null
  error?: string
}> {
  try {
    // Extrair cookies manualmente do request para evitar o erro do Next.js 15
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=')
        return [name, value]
      })
    )

    // Verificar se há sessão do Auth0
    const appSession = cookies['appSession']
    if (!appSession) {
      return { user: null, error: 'Usuário não autenticado' }
    }

    // Por enquanto, vamos usar uma verificação simples
    // TODO: Implementar verificação real da sessão do Auth0
    const userEmail = cookies['user_email'] || 'admin@cbrazil.com'
    const userName = cookies['user_name'] || 'Admin cbrazil'
    
    const userRole = getUserRole({ email: userEmail })
    const isMaster = isMasterAdmin(userEmail)

    return {
      user: {
        sub: 'auth0|test',
        email: userEmail,
        name: userName,
        role: userRole,
        isMaster
      }
    }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return { user: null, error: 'Erro interno de autenticação' }
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const { user, error } = await authenticateRequest(request)
    
    if (!user) {
      return createErrorResponse(error || 'Acesso negado', 401)
    }
    
    return handler(request, user)
  }
}

export function requireRole(
  requiredRole: UserRole,
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return requireAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    const roleHierarchy: Record<UserRole, number> = {
      editor: 1,
      admin: 2,
      owner: 3,
      master: 4
    }

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return createErrorResponse('Permissão insuficiente', 403)
    }

    return handler(request, user)
  })
}

export async function validateBlogAccess(
  user: AuthenticatedUser,
  blogId: number,
  requiredRole: UserRole = 'editor'
): Promise<{ hasAccess: boolean; error?: string }> {
  // Master admin tem acesso a tudo
  if (user.isMaster) {
    return { hasAccess: true }
  }

  try {
    // TODO: Implementar verificação real no banco de dados
    // const blogAccess = await prisma.blogAccess.findFirst({
    //   where: {
    //     userId: parseInt(user.sub),
    //     blogId: blogId,
    //   },
    //   include: {
    //     blog: true
    //   }
    // })

    // if (!blogAccess) {
    //   return { hasAccess: false, error: 'Acesso negado ao blog' }
    // }

    // const roleHierarchy: Record<UserRole, number> = {
    //   editor: 1,
    //   admin: 2,
    //   owner: 3,
    //   master: 4
    // }

    // if (roleHierarchy[blogAccess.role as UserRole] < roleHierarchy[requiredRole]) {
    //   return { hasAccess: false, error: 'Permissão insuficiente para este blog' }
    // }

    // Por enquanto, simular acesso baseado no email
    // Em produção, isso seria verificado no banco
    return { hasAccess: true }
  } catch (error) {
    console.error('Erro ao verificar acesso ao blog:', error)
    return { hasAccess: false, error: 'Erro interno ao verificar permissões' }
  }
}

export function withBlogAccess(
  blogIdParam: string,
  requiredRole: UserRole = 'editor',
  handler: (request: NextRequest, user: AuthenticatedUser, blogId: number) => Promise<Response>
) {
  return requireAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    const blogId = parseInt(blogIdParam)
    
    if (isNaN(blogId)) {
      return createErrorResponse('ID do blog inválido', 400)
    }

    const { hasAccess, error } = await validateBlogAccess(user, blogId, requiredRole)
    
    if (!hasAccess) {
      return createErrorResponse(error || 'Acesso negado', 403)
    }

    return handler(request, user, blogId)
  })
}

export function validateJsonBody<T>(body: any, requiredFields: string[]): { isValid: boolean; data?: T; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Corpo da requisição deve ser um JSON válido' }
  }

  const missingFields = requiredFields.filter(field => {
    const value = body[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` 
    }
  }

  return { isValid: true, data: body as T }
}

export async function handleApiError(error: unknown): Promise<Response> {
  console.error('Erro na API:', error)
  
  if (error instanceof Error) {
    return createErrorResponse(error.message, 500)
  }
  
  return createErrorResponse('Erro interno do servidor', 500)
}
