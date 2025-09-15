'use client'

import AdminLayout from '@/components/AdminLayout'
import AuthWrapper from '@/components/AuthWrapper'
import { 
  Building2, 
  FileText, 
  Users, 
  BarChart3,
  TrendingUp,
  Bot
} from 'lucide-react'

export default function DashboardPage() {
  // Dados mock - serão substituídos por dados reais da API
  const stats = {
    totalBlogs: 3,
    totalArticles: 127,
    totalUsers: 8,
    totalPrompts: 15,
    monthlyViews: 45672,
    monthlyGrowth: 12.5,
  }

  const recentActivity = [
    { id: 1, action: 'Novo artigo criado', blog: 'cbrazil.com', time: '2 horas atrás' },
    { id: 2, action: 'Usuário adicionado', blog: 'Blog da Casa', time: '4 horas atrás' },
    { id: 3, action: 'Prompt atualizado', blog: 'Tech Blog', time: '6 horas atrás' },
    { id: 4, action: 'Artigo publicado', blog: 'cbrazil.com', time: '8 horas atrás' },
  ]

  const topBlogs = [
    { name: 'cbrazil.com', articles: 45, views: 23456, growth: 8.2 },
    { name: 'Blog da Casa', articles: 32, views: 15890, growth: 15.7 },
    { name: 'Tech Blog', articles: 50, views: 6326, growth: 3.1 },
  ]

  return (
    <AuthWrapper>
      <AdminLayout title="Dashboard" subtitle="Visão geral de todos os blogs">
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Blogs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBlogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Artigos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visualizações (mês)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyViews.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500 ml-1">+{stats.monthlyGrowth}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Blogs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Top Blogs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topBlogs.map((blog, index) => (
                  <div key={blog.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{blog.name}</p>
                        <p className="text-sm text-gray-500">{blog.articles} artigos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{blog.views.toLocaleString()} views</p>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500 ml-1">+{blog.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.blog}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions rápidas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Building2 className="h-8 w-8 text-gray-400" />
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-900">Criar Novo Blog</p>
                  <p className="text-sm text-gray-500">Configurar um novo blog</p>
                </div>
              </button>

              <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <FileText className="h-8 w-8 text-gray-400" />
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-900">Criar Artigo</p>
                  <p className="text-sm text-gray-500">Novo artigo com IA</p>
                </div>
              </button>

              <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Bot className="h-8 w-8 text-gray-400" />
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-900">Novo Prompt</p>
                  <p className="text-sm text-gray-500">Criar prompt de IA</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
    </AuthWrapper>
  )
}