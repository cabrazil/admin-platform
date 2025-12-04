/**
 * Script para verificar conexões ativas no PostgreSQL
 * 
 * Uso:
 * node scripts/check-connections.js
 */

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConnections() {
  try {
    console.log('🔍 Verificando conexões ativas no PostgreSQL...\n');

    // Verificar limite máximo de conexões
    const maxConnections = await prisma.$queryRaw`
      SHOW max_connections;
    `;
    console.log('📊 Limite máximo de conexões:', maxConnections[0].max_connections);

    // Contar conexões ativas
    const totalConnections = await prisma.$queryRaw`
      SELECT count(*) as total FROM pg_stat_activity;
    `;
    console.log('🔌 Total de conexões ativas:', totalConnections[0].total);

    // Ver conexões por aplicação
    const connectionsByApp = await prisma.$queryRaw`
      SELECT 
        COALESCE(application_name, '(sem nome)') as application_name,
        count(*)::int as connections,
        state,
        array_agg(DISTINCT usename)::text[] as users
      FROM pg_stat_activity
      WHERE datname IS NOT NULL
      GROUP BY application_name, state
      ORDER BY connections DESC;
    `;

    console.log('\n📋 Conexões por aplicação:');
    console.log('─'.repeat(80));
    connectionsByApp.forEach((row) => {
      console.log(`\n📱 ${row.application_name}`);
      console.log(`   Conexões: ${row.connections}`);
      console.log(`   Estado: ${row.state}`);
      console.log(`   Usuários: ${Array.isArray(row.users) ? row.users.join(', ') : row.users}`);
    });

    // Ver conexões por banco de dados
    const connectionsByDb = await prisma.$queryRaw`
      SELECT 
        datname,
        count(*)::int as connections
      FROM pg_stat_activity
      WHERE datname IS NOT NULL
      GROUP BY datname
      ORDER BY connections DESC;
    `;

    console.log('\n\n🗄️  Conexões por banco de dados:');
    console.log('─'.repeat(80));
    connectionsByDb.forEach((row) => {
      console.log(`\n📦 ${row.datname}`);
      console.log(`   Conexões: ${row.connections}`);
    });

    // Ver conexões idle há muito tempo (possíveis conexões órfãs)
    const idleConnections = await prisma.$queryRaw`
      SELECT 
        pid,
        usename,
        application_name,
        state,
        state_change,
        (now() - state_change)::text as idle_duration
      FROM pg_stat_activity
      WHERE state = 'idle'
        AND datname = 'blogs'
        AND now() - state_change > interval '5 minutes'
      ORDER BY state_change ASC;
    `;

    if (idleConnections.length > 0) {
      console.log('\n\n⚠️  Conexões idle há mais de 5 minutos (possíveis órfãs):');
      console.log('─'.repeat(80));
      idleConnections.forEach((row) => {
        console.log(`\n🔴 PID: ${row.pid}`);
        console.log(`   Aplicação: ${row.application_name || '(sem nome)'}`);
        console.log(`   Usuário: ${row.usename}`);
        console.log(`   Idle há: ${row.idle_duration}`);
      });
    } else {
      console.log('\n\n✅ Nenhuma conexão idle há muito tempo encontrada.');
    }

    // Estatísticas gerais
    const stats = await prisma.$queryRaw`
      SELECT 
        count(*) FILTER (WHERE state = 'active')::int as active,
        count(*) FILTER (WHERE state = 'idle')::int as idle,
        count(*) FILTER (WHERE state = 'idle in transaction')::int as idle_in_transaction,
        count(*) FILTER (WHERE state = 'idle in transaction (aborted)')::int as idle_aborted
      FROM pg_stat_activity
      WHERE datname = 'blogs';
    `;

    console.log('\n\n📈 Estatísticas do banco "blogs":');
    console.log('─'.repeat(80));
    console.log(`   Ativas: ${stats[0].active}`);
    console.log(`   Idle: ${stats[0].idle}`);
    console.log(`   Idle em transação: ${stats[0].idle_in_transaction}`);
    console.log(`   Idle abortadas: ${stats[0].idle_aborted}`);

    // Porcentagem de uso
    const maxConn = parseInt(maxConnections[0].max_connections);
    const totalConn = parseInt(totalConnections[0].total);
    const usagePercent = ((totalConn / maxConn) * 100).toFixed(2);

    // Detalhes das conexões sem nome (provavelmente da aplicação)
    const unnamedConnections = await prisma.$queryRaw`
      SELECT 
        pid,
        usename,
        state,
        state_change,
        backend_start,
        (now() - backend_start)::text as connection_age,
        (now() - state_change)::text as idle_time,
        query_start,
        COALESCE(query, '(sem query)') as last_query
      FROM pg_stat_activity
      WHERE datname = 'blogs'
        AND (application_name IS NULL OR application_name = '')
      ORDER BY backend_start DESC
      LIMIT 20;
    `;

    if (unnamedConnections.length > 0) {
      console.log('\n\n🔍 Detalhes das conexões sem nome (provavelmente da aplicação):');
      console.log('─'.repeat(80));
      unnamedConnections.forEach((row, index) => {
        console.log(`\n${index + 1}. PID: ${row.pid}`);
        console.log(`   Estado: ${row.state}`);
        console.log(`   Conectado há: ${row.connection_age}`);
        if (row.state === 'idle') {
          console.log(`   Idle há: ${row.idle_time}`);
        }
        if (row.query_start) {
          console.log(`   Última query: ${row.query_start}`);
        }
        if (row.last_query && row.last_query !== '(sem query)') {
          const queryPreview = row.last_query.substring(0, 100);
          console.log(`   Query: ${queryPreview}${row.last_query.length > 100 ? '...' : ''}`);
        }
      });
    }

    console.log('\n\n📊 Uso de conexões:');
    console.log('─'.repeat(80));
    console.log(`   ${totalConn} / ${maxConn} (${usagePercent}%)`);

    // Verificar se DATABASE_URL tem connection_limit configurado
    const dbUrl = process.env.DATABASE_URL || '';
    const hasConnectionLimit = dbUrl.includes('connection_limit');
    
    if (!hasConnectionLimit && unnamedConnections.length > 10) {
      console.log('\n\n⚠️  PROBLEMA CRÍTICO: Muitas conexões sem nome detectadas!');
      console.log('─'.repeat(80));
      console.log('   Sua DATABASE_URL não tem connection_limit configurado.');
      console.log('   Isso está causando o problema de muitas conexões.');
      console.log('');
      console.log('   ✅ SOLUÇÃO: Adicione connection_limit na sua DATABASE_URL:');
      console.log('');
      console.log('   DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=20"');
      console.log('');
      console.log('   Depois reinicie o servidor Next.js.');
    }

    if (usagePercent > 80) {
      console.log('\n⚠️  ATENÇÃO: Uso de conexões acima de 80%!');
      console.log('   Considere:');
      console.log('   1. Fechar ferramentas como pgAdmin quando não estiver usando');
      console.log('   2. Aumentar max_connections no PostgreSQL');
      console.log('   3. Verificar conexões órfãs');
      console.log('   4. Executar: npm run kill-idle-connections');
    } else if (unnamedConnections.length > 10) {
      console.log('\n⚠️  ATENÇÃO: Muitas conexões da aplicação detectadas!');
      console.log('   Considere:');
      console.log('   1. Verificar se DATABASE_URL tem connection_limit configurado');
      console.log('   2. Reiniciar o servidor Next.js para fechar conexões antigas');
      console.log('   3. Executar: npm run kill-idle-connections (para limpar conexões órfãs)');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar conexões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnections();

