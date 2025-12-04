import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Criar singleton do PrismaClient com configuração otimizada
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Em desenvolvimento, manter a instância no global para evitar múltiplas conexões durante hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Garantir que conexões sejam fechadas adequadamente ao encerrar o processo
if (typeof process !== 'undefined') {
  const gracefulShutdown = async () => {
    await prisma.$disconnect()
  }
  
  process.on('beforeExit', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
}

export default prisma
