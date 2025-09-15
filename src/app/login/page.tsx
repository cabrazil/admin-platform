'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogIn, Shield, Users, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      router.push('/dashboard');
    }
  }, [user, router, mounted]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Blog Admin Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de administração de blogs multi-tenant
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-6">
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Dashboard analítico</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Gerenciamento de usuários</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Controle de permissões</span>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button
                onClick={() => window.location.href = '/api/auth/login'}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar com Auth0
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Acesso restrito a administradores autorizados
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            © 2024 Blog Admin Platform. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
