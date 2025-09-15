// Utilitário para verificar permissões no sistema multi-tenant

export type UserRole = 'master' | 'owner' | 'admin' | 'editor' | 'user';
export type BlogRole = 'owner' | 'admin' | 'editor';

export interface UserWithAccess {
  id: number;
  email: string;
  role: UserRole;
  blogAccess?: {
    blogId: number;
    role: BlogRole;
  }[];
}

export class PermissionChecker {
  
  /**
   * Verifica se o usuário é master (acesso total)
   */
  static isMaster(user: UserWithAccess): boolean {
    return user.role === 'master';
  }

  /**
   * Verifica se o usuário tem acesso a um blog específico
   */
  static hasAccessToBlog(user: UserWithAccess, blogId: number): boolean {
    if (this.isMaster(user)) return true;
    
    return user.blogAccess?.some(access => access.blogId === blogId) || false;
  }

  /**
   * Verifica se o usuário pode criar artigos em um blog
   */
  static canCreateArticles(user: UserWithAccess, blogId: number): boolean {
    if (this.isMaster(user)) return true;
    
    const access = user.blogAccess?.find(access => access.blogId === blogId);
    return access ? ['owner', 'admin', 'editor'].includes(access.role) : false;
  }

  /**
   * Verifica se o usuário pode editar configurações do blog
   */
  static canEditBlogSettings(user: UserWithAccess, blogId: number): boolean {
    if (this.isMaster(user)) return true;
    
    const access = user.blogAccess?.find(access => access.blogId === blogId);
    return access ? ['owner', 'admin'].includes(access.role) : false;
  }

  /**
   * Verifica se o usuário pode gerenciar outros usuários do blog
   */
  static canManageUsers(user: UserWithAccess, blogId: number): boolean {
    if (this.isMaster(user)) return true;
    
    const access = user.blogAccess?.find(access => access.blogId === blogId);
    return access ? access.role === 'owner' : false;
  }

  /**
   * Verifica se o usuário pode usar prompts de IA
   */
  static canUseAIPrompts(user: UserWithAccess, blogId: number): boolean {
    if (this.isMaster(user)) return true;
    
    const access = user.blogAccess?.find(access => access.blogId === blogId);
    return access ? ['owner', 'admin', 'editor'].includes(access.role) : false;
  }

  /**
   * Retorna todos os blogs que o usuário tem acesso
   */
  static getAccessibleBlogs(user: UserWithAccess): number[] {
    if (this.isMaster(user)) {
      // Master tem acesso a todos os blogs - isso deve ser tratado na query
      return [];
    }
    
    return user.blogAccess?.map(access => access.blogId) || [];
  }

  /**
   * Verifica se o usuário pode acessar o painel admin
   */
  static canAccessAdmin(user: UserWithAccess): boolean {
    return ['master', 'owner', 'admin', 'editor'].includes(user.role);
  }
}
