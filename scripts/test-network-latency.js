#!/usr/bin/env node

/**
 * Script para testar latência de rede básica com o VPS PostgreSQL
 * Uso: node scripts/test-network-latency.js
 */

// Tentar carregar de múltiplos arquivos .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '../blog-api-backend/.env' });
const net = require('net');

function extractHostPort(databaseUrl) {
  // postgresql://user:pass@host:port/database
  const match = databaseUrl.match(/@([^:]+):(\d+)\//);
  if (match) {
    return { host: match[1], port: parseInt(match[2]) };
  }
  return null;
}

async function testTcpConnection(host, port, attempts = 5) {
  console.log(`🔌 Testando conexão TCP com ${host}:${port}\n`);
  
  const latencies = [];
  
  for (let i = 0; i < attempts; i++) {
    const start = Date.now();
    
    await new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = 5000; // 5 segundos
      
      socket.setTimeout(timeout);
      
      socket.once('connect', () => {
        const latency = Date.now() - start;
        latencies.push(latency);
        socket.destroy();
        resolve();
      });
      
      socket.once('timeout', () => {
        socket.destroy();
        reject(new Error('Timeout'));
      });
      
      socket.once('error', (err) => {
        socket.destroy();
        reject(err);
      });
      
      socket.connect(port, host);
    }).catch(err => {
      console.log(`   Tentativa ${i + 1}: ❌ Erro - ${err.message}`);
    });
    
    if (latencies.length === i + 1) {
      console.log(`   Tentativa ${i + 1}: ${latencies[i]}ms`);
    }
    
    // Pequeno delay entre tentativas
    if (i < attempts - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  if (latencies.length === 0) {
    console.log('\n❌ Não foi possível estabelecer conexão TCP');
    return;
  }
  
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  
  console.log('\n📊 Estatísticas de Latência TCP:');
  console.log(`   Média: ${avgLatency.toFixed(2)}ms`);
  console.log(`   Mínima: ${minLatency}ms`);
  console.log(`   Máxima: ${maxLatency}ms`);
  
  if (avgLatency > 500) {
    console.log(`\n⚠️  Latência alta detectada (>500ms)`);
    console.log(`   Isso pode indicar:`);
    console.log(`   • Distância geográfica significativa`);
    console.log(`   • Problemas de rede`);
    console.log(`   • VPS sobrecarregado`);
  } else if (avgLatency > 200) {
    console.log(`\n⚠️  Latência moderada (200-500ms)`);
    console.log(`   Aceitável, mas pode impactar performance em queries complexas`);
  } else {
    console.log(`\n✅ Latência aceitável (<200ms)`);
  }
  
  return { avgLatency, minLatency, maxLatency };
}

async function main() {
  console.log('🌐 Teste de Latência de Rede - PostgreSQL VPS\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrado no .env.local');
    process.exit(1);
  }
  
  const connectionInfo = extractHostPort(process.env.DATABASE_URL);
  
  if (!connectionInfo) {
    console.error('❌ Não foi possível extrair host e porta do DATABASE_URL');
    console.error('   Formato esperado: postgresql://user:pass@host:port/database');
    process.exit(1);
  }
  
  console.log(`📋 Host: ${connectionInfo.host}`);
  console.log(`📋 Porta: ${connectionInfo.port}\n`);
  
  await testTcpConnection(connectionInfo.host, connectionInfo.port);
  
  console.log('\n💡 Dica: Execute também "npm run test-db-performance" para');
  console.log('   testar a performance completa incluindo queries SQL.');
}

main().catch(console.error);

