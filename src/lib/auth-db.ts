import { prisma } from './prisma'

export interface UserWithAccess {
  id: number
  name: string
  email: string
  role: string
  blogAccess: {
    id: number
    blogId: number
    role: string
    blog: {
      id: number
      name: string
      slug: string
    }
  }[]
}

/**
 * Buscar ou criar usuário baseado no email do Auth0
 */
export async function findOrCreateUser(auth0User: {
  email: string
  name?: string
  sub: string
}): Promise<UserWithAccess> {
  let user = await prisma.user.findUnique({
    where: { email: auth0User.email },
    include: {
      blogAccess: {
        include: {
          blog: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  })

  // Se usuário não existe, criar
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: auth0User.email,
        name: auth0User.name || auth0User.email.split('@')[0],
        role: 'user', // Role padrão
      },
      include: {
        blogAccess: {
          include: {
            blog: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })
  }

  return user
}

/**
 * Verificar se usuário tem acesso a um blog específico
 */
export async function checkBlogAccess(
  userId: number, 
  blogId: number
): Promise<{ hasAccess: boolean; role?: string }> {
  // Verificar se é master admin
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (user?.role === 'master') {
    return { hasAccess: true, role: 'master' }
  }

  // Verificar se é owner do blog
  const blog = await prisma.blog.findFirst({
    where: {
      id: blogId,
      ownerId: userId
    }
  })

  if (blog) {
    return { hasAccess: true, role: 'owner' }
  }

  // Verificar acesso específico
  const access = await prisma.blogAccess.findUnique({
    where: {
      userId_blogId: {
        userId,
        blogId
      }
    }
  })

  if (access) {
    return { hasAccess: true, role: access.role }
  }

  return { hasAccess: false }
}

/**
 * Listar todos os blogs que um usuário tem acesso
 */
export async function getUserBlogs(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedBlogs: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          _count: {
            select: {
              articles: true,
              userAccess: true
            }
          }
        }
      },
      blogAccess: {
        include: {
          blog: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              _count: {
                select: {
                  articles: true,
                  userAccess: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  // Se é master admin, retornar todos os blogs
  if (user.role === 'master') {
    const allBlogs = await prisma.blog.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        _count: {
          select: {
            articles: true,
            userAccess: true
          }
        }
      }
    })

    return allBlogs.map(blog => ({
      ...blog,
      userRole: 'master'
    }))
  }

  // Combinar blogs próprios e com acesso
  const blogs = [
    // Blogs que possui
    ...user.ownedBlogs.map(blog => ({
      ...blog,
      userRole: 'owner'
    })),
    // Blogs com acesso específico
    ...user.blogAccess.map(access => ({
      ...access.blog,
      userRole: access.role
    }))
  ]

  // Remover duplicatas (caso seja owner e tenha acesso específico)
  const uniqueBlogs = blogs.filter((blog, index, self) => 
    index === self.findIndex(b => b.id === blog.id)
  )

  return uniqueBlogs
}

/**
 * Conceder acesso a um blog para um usuário
 */
export async function grantBlogAccess(
  userId: number,
  blogId: number,
  role: 'admin' | 'editor'
) {
  return await prisma.blogAccess.upsert({
    where: {
      userId_blogId: {
        userId,
        blogId
      }
    },
    update: {
      role
    },
    create: {
      userId,
      blogId,
      role
    }
  })
}

/**
 * Revogar acesso a um blog
 */
export async function revokeBlogAccess(userId: number, blogId: number) {
  return await prisma.blogAccess.delete({
    where: {
      userId_blogId: {
        userId,
        blogId
      }
    }
  })
}
