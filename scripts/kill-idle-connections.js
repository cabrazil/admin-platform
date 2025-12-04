/**
 * Script para matar conexões idle há muito tempo (conexões órfãs)
 * 
 * Uso:
 * node scripts/kill-idle-connections.js [horas]
 * 
 * Exemplo:
 * node scripts/kill-idle-connections.js 1  # Mata conexões idle há mais de 1 hora
 */

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function killIdleConnections() {
  try {
    const hours = parseFloat(process.argv[2] || '1'); // Padrão: 1 hora
    const minutes = hours * 60;

    console.log(`🔍 Procurando conexões idle há mais de ${hours} hora(s)...\n`);

    // Listar conexões que serão mortas
    const idleConnections = await prisma.$queryRawUnsafe(`
      SELECT 
        pid,
        usename,
        COALESCE(application_name, '(sem nome)') as application_name,
        state,
        (now() - state_change)::text as idle_time,
        backend_start
      FROM pg_stat_activity
      WHERE datname = 'blogs'
        AND state = 'idle'
        AND now() - state_change > interval '${minutes} minutes'
        AND pid <> pg_backend_pid()
      ORDER BY state_change ASC;
    `);

    if (idleConnections.length === 0) {
      console.log('✅ Nenhuma conexão idle há muito tempo encontrada.');
      return;
    }

    console.log(`⚠️  Encontradas ${idleConnections.length} conexões idle há mais de ${hours} hora(s):\n`);
    console.log('─'.repeat(80));
    
    idleConnections.forEach((row, index) => {
      console.log(`${index + 1}. PID: ${row.pid}`);
      console.log(`   Aplicação: ${row.application_name}`);
      console.log(`   Usuário: ${row.usename}`);
      console.log(`   Idle há: ${row.idle_time}`);
      console.log('');
    });

    // Confirmar antes de matar
    console.log('─'.repeat(80));
    console.log(`\n⚠️  ATENÇÃO: Isso vai matar ${idleConnections.length} conexões!`);
    console.log('   Pressione Ctrl+C para cancelar ou Enter para continuar...\n');

    // Aguardar 3 segundos para dar tempo de cancelar
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Matar conexões
    const pids = idleConnections.map(row => row.pid);
    let killed = 0;
    let errors = 0;

    for (const pid of pids) {
      try {
        await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(${pid})`);
        killed++;
        console.log(`✅ Conexão ${pid} terminada`);
      } catch (error) {
        errors++;
        console.log(`❌ Erro ao terminar conexão ${pid}: ${error.message}`);
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n📊 Resultado:`);
    console.log(`   ✅ Terminadas: ${killed}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log(`   📋 Total: ${idleConnections.length}`);

    if (killed > 0) {
      console.log('\n✅ Conexões órfãs removidas com sucesso!');
      console.log('   Recomendação: Configure connection_limit na DATABASE_URL para evitar isso no futuro.');
    }

  } catch (error) {
    console.error('❌ Erro ao matar conexões idle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

killIdleConnections();

