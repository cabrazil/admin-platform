#!/bin/bash

# Script para copiar imagens do VibesFilm Blog para o projeto admin
# Uso: ./scripts/copy-vibesfilm-images.sh

echo "🔄 Copiando imagens do VibesFilm Blog..."

# Diretórios
SOURCE_DIR="/home/cabrazil/newprojs/fav_movies/moviesf_front/public/images"
TARGET_DIR="/home/cabrazil/newprojs/blogs/blog-admin-platform/public/vibesfilm/images"

# Criar diretório de destino
echo "📁 Criando diretório de destino..."
mkdir -p "$TARGET_DIR"

# Copiar todas as imagens
echo "📋 Copiando imagens..."
cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"

# Verificar se a cópia foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Imagens copiadas com sucesso!"
    echo "📊 Conteúdo copiado:"
    ls -la "$TARGET_DIR"
else
    echo "❌ Erro ao copiar imagens"
    exit 1
fi

echo "🎯 Agora você pode usar as imagens com o caminho:"
echo "   images/blog/articles/2025/outubro/imagem_blog_6filmes_1.jpg"
echo "   (sem o prefixo 'vibesfilm/')"
