// Re-exportar para facilitar imports
export { UserProvider } from '@auth0/nextjs-auth0/client';

// Tipos para roles do sistema
export type UserRole = 'master' | 'owner' | 'admin' | 'editor';

// Interface para usuário com permissões
export interface AdminUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  role?: UserRole;
  blogAccess?: Array<{
    blogId: number;
    role: UserRole;
  }>;
}

// Função para verificar se é usuário master
export function isMasterAdmin(email?: string): boolean {
  if (!email) return false;
  
  // Emails master hardcoded para desenvolvimento
  const masterEmails = [
    'admin@cbrazil.com',
    'admin@teste.com',
    ...(process.env.MASTER_ADMIN_EMAILS?.split(',') || [])
  ];
  
  return masterEmails.includes(email);
}

// Função para verificar permissões
export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    editor: 1,
    admin: 2,
    owner: 3,
    master: 4
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Função para obter role do usuário (async version)
export async function getUserRoleFromDB(email: string): Promise<UserRole> {
  // Se é master admin, retorna master
  if (isMasterAdmin(email)) {
    return 'master';
  }

  try {
    const { findOrCreateUser } = await import('./auth-db');
    const user = await findOrCreateUser({ email, sub: email });
    
    return user.role as UserRole;
  } catch (error) {
    console.error('Erro ao buscar role do usuário:', error);
    return 'editor'; // Fallback
  }
}

// Função para obter role do usuário (versão síncrona para compatibilidade)
export function getUserRole(user: { email?: string | null } | null): UserRole {
  // Se é master admin, retorna master
  if (isMasterAdmin(user?.email || undefined)) {
    return 'master';
  }

  // Para casos síncronos, retorna editor como padrão
  // A versão assíncrona deve ser usada quando possível
  return 'editor';
}
