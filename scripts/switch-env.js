#!/usr/bin/env node

/**
 * Script para trocar entre ambientes DEV e PROD
 * 
 * Uso:
 *   node scripts/switch-env.js dev    # Trocar para desenvolvimento (Supabase)
 *   node scripts/switch-env.js prod   # Trocar para produção (VPS)
 *   node scripts/switch-env.js        # Mostrar ambiente atual
 */

const fs = require('fs');
const path = require('path');

const ENV_FILES = {
  dev: '.env.development',
  prod: '.env.production',
  local: '.env.local'
};

function getCurrentEnv() {
  const envLocalPath = path.join(process.cwd(), ENV_FILES.local);
  
  if (!fs.existsSync(envLocalPath)) {
    return null;
  }

  const content = fs.readFileSync(envLocalPath, 'utf8');
  
  if (content.includes('supabase.com')) {
    return 'dev';
  } else if (content.includes('178.156.178.145') || content.includes('VPS')) {
    return 'prod';
  }
  
  return 'unknown';
}

function switchEnv(targetEnv) {
  const sourceFile = ENV_FILES[targetEnv];
  const targetFile = ENV_FILES.local;
  
  const sourcePath = path.join(process.cwd(), sourceFile);
  const targetPath = path.join(process.cwd(), targetFile);
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Arquivo ${sourceFile} não encontrado!`);
    console.log(`\n💡 Crie o arquivo ${sourceFile} baseado em ${sourceFile}.example`);
    process.exit(1);
  }

  // Fazer backup do .env.local atual se existir
  if (fs.existsSync(targetPath)) {
    const backupPath = `${targetPath}.backup.${Date.now()}`;
    fs.copyFileSync(targetPath, backupPath);
    console.log(`📦 Backup criado: ${backupPath}`);
  }

  // Copiar arquivo de ambiente
  fs.copyFileSync(sourcePath, targetPath);
  
  console.log(`✅ Ambiente alterado para: ${targetEnv.toUpperCase()}`);
  console.log(`📋 Arquivo ${targetFile} atualizado`);
  console.log(`\n⚠️  IMPORTANTE: Reinicie o servidor para aplicar as mudanças!`);
}

function showCurrentEnv() {
  const current = getCurrentEnv();
  
  console.log('\n🔍 Ambiente Atual:');
  console.log('─'.repeat(50));
  
  if (current === 'dev') {
    console.log('   Ambiente: DEVELOPMENT (Supabase) ✅');
  } else if (current === 'prod') {
    console.log('   Ambiente: PRODUCTION (PostgreSQL VPS) ✅');
  } else {
    console.log('   Ambiente: Desconhecido ou não configurado ⚠️');
  }
  
  console.log('\n📋 Arquivos disponíveis:');
  console.log('─'.repeat(50));
  
  Object.entries(ENV_FILES).forEach(([env, file]) => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${file}`);
  });
  
  console.log('\n💡 Uso:');
  console.log('   node scripts/switch-env.js dev   # Trocar para DEV');
  console.log('   node scripts/switch-env.js prod  # Trocar para PROD');
}

// Main
const targetEnv = process.argv[2]?.toLowerCase();

if (!targetEnv) {
  showCurrentEnv();
} else if (targetEnv === 'dev' || targetEnv === 'development') {
  switchEnv('dev');
} else if (targetEnv === 'prod' || targetEnv === 'production') {
  switchEnv('prod');
} else {
  console.error(`❌ Ambiente inválido: ${targetEnv}`);
  console.log('\n💡 Use: dev ou prod');
  process.exit(1);
}

