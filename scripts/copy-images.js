#!/usr/bin/env node

/**
 * Script para copiar imagens entre projetos
 * Uso: node scripts/copy-images.js [caminho-origem] [caminho-destino]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageCopier {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.publicDir = path.join(this.projectRoot, 'public');
  }

  async copyImage(sourcePath, targetPath) {
    try {
      // Verificar se o arquivo origem existe
      if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Arquivo origem não encontrado: ${sourcePath}`);
        return false;
      }

      // Criar diretório de destino se não existir
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 Diretório criado: ${targetDir}`);
      }

      // Copiar arquivo
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Imagem copiada: ${sourcePath} → ${targetPath}`);
      return true;

    } catch (error) {
      console.error(`❌ Erro ao copiar imagem:`, error.message);
      return false;
    }
  }

  async copyFromMoviesProject() {
    const moviesProjectPath = '/home/cabrazil/newprojs/fav_movies/moviesf_front/public';
    const sourceImage = path.join(moviesProjectPath, 'images/blog/articles/2025/outubro/imagem_blog_6filmes_1.jpg');
    const targetImage = path.join(this.publicDir, 'images/blog/articles/2025/outubro/imagem_blog_6filmes_1.jpg');

    console.log('🔄 Copiando imagem do projeto moviesf_front...');
    console.log(`Origem: ${sourceImage}`);
    console.log(`Destino: ${targetImage}`);

    return await this.copyImage(sourceImage, targetImage);
  }

  async listAvailableImages() {
    const moviesProjectPath = '/home/cabrazil/newprojs/fav_movies/moviesf_front/public';
    const imagesDir = path.join(moviesProjectPath, 'images');

    if (!fs.existsSync(imagesDir)) {
      console.log('❌ Diretório de imagens não encontrado no projeto moviesf_front');
      return;
    }

    console.log('📁 Imagens disponíveis no projeto moviesf_front:');
    this.scanDirectory(imagesDir, '');
  }

  scanDirectory(dir, relativePath) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      const currentRelativePath = path.join(relativePath, item);
      
      if (stat.isDirectory()) {
        console.log(`📁 ${currentRelativePath}/`);
        this.scanDirectory(fullPath, currentRelativePath);
      } else if (item.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        console.log(`🖼️  ${currentRelativePath}`);
      }
    }
  }
}

// Execução do script
const args = process.argv.slice(2);
const copier = new ImageCopier();

if (args.length === 0) {
  console.log('🔄 Copiando imagem específica do projeto moviesf_front...');
  copier.copyFromMoviesProject();
} else if (args[0] === 'list') {
  copier.listAvailableImages();
} else if (args.length === 2) {
  const [source, target] = args;
  copier.copyImage(source, target);
} else {
  console.log(`
📖 Uso do script:

1. Copiar imagem específica:
   node scripts/copy-images.js

2. Listar imagens disponíveis:
   node scripts/copy-images.js list

3. Copiar imagem específica:
   node scripts/copy-images.js [origem] [destino]

Exemplos:
   node scripts/copy-images.js
   node scripts/copy-images.js list
   node scripts/copy-images.js /path/to/source.jpg /path/to/target.jpg
  `);
}
