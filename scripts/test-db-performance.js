#!/usr/bin/env node

/**
 * Script para testar latência e performance do banco PostgreSQL VPS
 * Uso: node scripts/test-db-performance.js
 */

// Tentar carregar de múltiplos arquivos .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '../blog-api-backend/.env' });
const { PrismaClient } = require('@prisma/client');

async function testPerformance() {
  console.log('🚀 Teste de Performance e Latência - PostgreSQL VPS\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrado no .env.local');
    process.exit(1);
  }
  
  const dbUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log(`📋 Database: ${dbUrl}`);
  console.log('');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    // Teste 1: Latência de conexão
    console.log('⏱️  Teste 1: Latência de Conexão');
    console.log('─'.repeat(50));
    
    const connectionTests = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      connectionTests.push(latency);
      console.log(`   Tentativa ${i + 1}: ${latency}ms`);
    }
    
    const avgLatency = connectionTests.reduce((a, b) => a + b, 0) / connectionTests.length;
    const minLatency = Math.min(...connectionTests);
    const maxLatency = Math.max(...connectionTests);
    
    console.log(`\n   📊 Média: ${avgLatency.toFixed(2)}ms`);
    console.log(`   📊 Mínima: ${minLatency}ms`);
    console.log(`   📊 Máxima: ${maxLatency}ms`);
    
    if (avgLatency > 1000) {
      console.log(`   ⚠️  Latência alta detectada (>1000ms)`);
    } else if (avgLatency > 500) {
      console.log(`   ⚠️  Latência moderada (500-1000ms)`);
    } else {
      console.log(`   ✅ Latência aceitável (<500ms)`);
    }
    console.log('');
    
    // Teste 2: Performance de queries simples
    console.log('⏱️  Teste 2: Performance de Queries Simples');
    console.log('─'.repeat(50));
    
    const simpleQueryStart = Date.now();
    const blogCount = await prisma.blog.count();
    const simpleQueryTime = Date.now() - simpleQueryStart;
    console.log(`   COUNT blogs: ${blogCount} registros em ${simpleQueryTime}ms`);
    
    const articleCountStart = Date.now();
    const articleCount = await prisma.article.count();
    const articleCountTime = Date.now() - articleCountStart;
    console.log(`   COUNT articles: ${articleCount} registros em ${articleCountTime}ms`);
    console.log('');
    
    // Teste 3: Performance de queries com relacionamentos
    console.log('⏱️  Teste 3: Performance de Queries com Relacionamentos');
    console.log('─'.repeat(50));
    
    const complexQueryStart = Date.now();
    const articlesWithRelations = await prisma.article.findMany({
      take: 10,
      include: {
        blog: {
          select: {
            id: true,
            name: true,
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    const complexQueryTime = Date.now() - complexQueryStart;
    console.log(`   SELECT com JOINs (10 artigos): ${complexQueryTime}ms`);
    console.log(`   Média por artigo: ${(complexQueryTime / 10).toFixed(2)}ms`);
    console.log('');
    
    // Teste 4: Performance específica do blog 3
    console.log('⏱️  Teste 4: Performance Específica - Blog ID 3 (VibesFilm)');
    console.log('─'.repeat(50));
    
    const blog3Tests = [];
    
    // Teste categorias
    const catStart = Date.now();
    const categories = await prisma.category.findMany({
      where: { blogId: 3 },
      take: 20
    });
    blog3Tests.push({ name: 'Categorias', time: Date.now() - catStart, count: categories.length });
    
    // Teste autores
    const authStart = Date.now();
    const authors = await prisma.author.findMany({
      where: { blogId: 3 },
      take: 20
    });
    blog3Tests.push({ name: 'Autores', time: Date.now() - authStart, count: authors.length });
    
    // Teste tags
    const tagsStart = Date.now();
    const tags = await prisma.tag.findMany({
      where: { blogId: 3 },
      take: 20
    });
    blog3Tests.push({ name: 'Tags', time: Date.now() - tagsStart, count: tags.length });
    
    // Teste artigos
    const artStart = Date.now();
    const articles = await prisma.article.findMany({
      where: { blogId: 3 },
      take: 20
    });
    blog3Tests.push({ name: 'Artigos', time: Date.now() - artStart, count: articles.length });
    
    blog3Tests.forEach(test => {
      console.log(`   ${test.name}: ${test.count} registros em ${test.time}ms`);
      if (test.time > 5000) {
        console.log(`      ⚠️  Query muito lenta (>5s)`);
      } else if (test.time > 2000) {
        console.log(`      ⚠️  Query lenta (2-5s)`);
      }
    });
    console.log('');
    
    // Teste 5: Verificar índices
    console.log('⏱️  Teste 5: Verificação de Índices');
    console.log('─'.repeat(50));
    
    try {
      // Verificar se há índices nas colunas importantes
      const indexCheck = await prisma.$queryRaw`
        SELECT 
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('Article', 'Blog', 'Author', 'Category', 'Tag')
        ORDER BY tablename, indexname;
      `;
      
      console.log(`   Índices encontrados: ${indexCheck.length}`);
      if (indexCheck.length > 0) {
        const tables = {};
        indexCheck.forEach(idx => {
          if (!tables[idx.tablename]) {
            tables[idx.tablename] = [];
          }
          tables[idx.tablename].push(idx.indexname);
        });
        
        Object.entries(tables).forEach(([table, indexes]) => {
          console.log(`   ${table}: ${indexes.length} índices`);
        });
      }
    } catch (error) {
      console.log(`   ⚠️  Não foi possível verificar índices: ${error.message}`);
    }
    console.log('');
    
    // Resumo e recomendações
    console.log('📊 Resumo e Recomendações');
    console.log('─'.repeat(50));
    
    const allTimes = [
      avgLatency,
      simpleQueryTime,
      articleCountTime,
      complexQueryTime,
      ...blog3Tests.map(t => t.time)
    ];
    const maxTime = Math.max(...allTimes);
    const avgTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
    
    console.log(`   Tempo médio de queries: ${avgTime.toFixed(2)}ms`);
    console.log(`   Tempo máximo: ${maxTime}ms`);
    console.log('');
    
    if (maxTime > 8000) {
      console.log('      ⚠️  PERFORMANCE CRÍTICA: Queries muito lentas detectadas');
      console.log('      Recomendações:');
      console.log('      • Verificar latência de rede com o VPS');
      console.log('      • Adicionar índices nas colunas filtradas (blogId, slug, etc.)');
      console.log('      • Considerar usar connection pooling (PgBouncer)');
      console.log('      • Verificar se há queries N+1');
    } else if (maxTime > 3000) {
      console.log('      ⚠️  PERFORMANCE MODERADA: Algumas queries podem ser otimizadas');
      console.log('      Recomendações:');
      console.log('      • Verificar índices nas colunas mais consultadas');
      console.log('      • Considerar cache para dados que mudam pouco');
    } else {
      console.log('      ✅ PERFORMANCE ACEITÁVEL');
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão encerrada.');
  }
}

testPerformance();

