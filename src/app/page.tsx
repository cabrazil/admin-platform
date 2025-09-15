'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthWrapper from '@/components/AuthWrapper';

function HomePageContent() {
  const { user, isLoading, isAuthenticated, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;

    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthWrapper>
      <HomePageContent />
    </AuthWrapper>
  );
}