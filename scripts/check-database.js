#!/usr/bin/env node

/**
 * Script para verificar conexão e dados do banco PostgreSQL VPS
 * Uso: node scripts/check-database.js [articleId]
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 Verificando conexão com o banco de dados PostgreSQL VPS...\n');
  
  // Verificar variáveis de ambiente
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrado no .env.local');
    process.exit(1);
  }
  
  console.log('📋 Configuração:');
  const dbUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log(`   DATABASE_URL: ${dbUrl}`);
  console.log('');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    // Testar conexão
    console.log('🔄 Conectando ao banco...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');
    
    // Verificar artigo específico se fornecido
    const articleId = process.argv[2];
    if (articleId) {
      const id = parseInt(articleId);
      console.log(`🔍 Buscando artigo ID: ${id}...`);
      
      const article = await prisma.article.findUnique({
        where: { id },
        include: {
          blog: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              name: true,
            }
          },
          category: {
            select: {
              id: true,
              title: true,
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });
      
      if (article) {
        console.log('\n✅ Artigo encontrado:');
        console.log(`   ID: ${article.id}`);
        console.log(`   Título: ${article.title}`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   Blog: ${article.blog.name} (ID: ${article.blog.id})`);
        console.log(`   Autor: ${article.author.name}`);
        console.log(`   Categoria: ${article.category.title}`);
        console.log(`   Publicado: ${article.published ? 'Sim' : 'Não'}`);
        console.log(`   Tipo: ${article.type}`);
        console.log(`   Views: ${article.viewCount}`);
        console.log(`   Likes: ${article.likeCount}`);
        console.log(`   Tags: ${article.tags.map(t => t.name).join(', ') || 'Nenhuma'}`);
        console.log(`   Image URL: ${article.imageUrl || 'Não definida'}`);
        console.log(`   Criado em: ${article.createdAt.toLocaleString('pt-BR')}`);
        console.log(`   Atualizado em: ${article.updatedAt.toLocaleString('pt-BR')}`);
        
        if (article.metadata) {
          console.log(`   Metadata: ${JSON.stringify(article.metadata, null, 2)}`);
        }
        
        console.log(`\n   Conteúdo (primeiros 200 caracteres):`);
        console.log(`   ${article.content.substring(0, 200)}...`);
      } else {
        console.log(`❌ Artigo ID ${id} não encontrado`);
      }
    } else {
      // Estatísticas gerais
      console.log('📊 Estatísticas do banco:\n');
      
      const blogCount = await prisma.blog.count();
      const articleCount = await prisma.article.count();
      const authorCount = await prisma.author.count();
      const categoryCount = await prisma.category.count();
      const tagCount = await prisma.tag.count();
      
      console.log(`   Blogs: ${blogCount}`);
      console.log(`   Artigos: ${articleCount}`);
      console.log(`   Autores: ${authorCount}`);
      console.log(`   Categorias: ${categoryCount}`);
      console.log(`   Tags: ${tagCount}\n`);
      
      // Listar blogs
      if (blogCount > 0) {
        console.log('📋 Blogs encontrados:');
        const blogs = await prisma.blog.findMany({
          take: 10,
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            _count: {
              select: {
                articles: true,
                authors: true,
                categories: true,
              }
            }
          },
        });
        
        blogs.forEach(blog => {
          console.log(`   [${blog.id}] ${blog.name} (${blog.slug}) - ${blog.status}`);
          console.log(`      Artigos: ${blog._count.articles} | Autores: ${blog._count.authors} | Categorias: ${blog._count.categories}`);
        });
        
        if (blogCount > 10) {
          console.log(`   ... e mais ${blogCount - 10} blogs`);
        }
        console.log('');
      }
      
      // Artigos recentes
      if (articleCount > 0) {
        console.log('📝 Últimos 5 artigos:');
        const recentArticles = await prisma.article.findMany({
          take: 5,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            blogId: true,
            published: true,
            updatedAt: true,
          }
        });
        
        recentArticles.forEach(article => {
          console.log(`   [${article.id}] ${article.title.substring(0, 50)}...`);
          console.log(`      Blog ID: ${article.blogId} | Publicado: ${article.published ? 'Sim' : 'Não'} | Atualizado: ${article.updatedAt.toLocaleString('pt-BR')}`);
        });
        console.log('');
      }
    }
    
    console.log('✅ Verificação concluída com sucesso!\n');
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Dica: Verifique se o PostgreSQL está rodando no VPS');
      console.error('   e se a porta 5435 está acessível.\n');
    } else if (error.code === 'P1001') {
      console.error('💡 Dica: Verifique as credenciais (usuário/senha) no DATABASE_URL\n');
    } else if (error.code === 'P1003') {
      console.error('💡 Dica: Verifique se o banco de dados "blogs" existe\n');
    } else if (error.code === 'P2002') {
      console.error('💡 Dica: Violação de constraint único (slug, email, etc.)\n');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão encerrada.');
  }
}

checkDatabase();

