#!/bin/bash

# Script para verificar se o CicloePonto está funcionando corretamente
# Execute este script após configurar tudo

set -e

echo "🔍 Verificando configuração do CicloePonto..."

# Verificar se o diretório existe
if [ ! -d "./cicloeponto" ]; then
    echo "❌ Erro: Diretório cicloeponto não encontrado!"
    echo "Execute primeiro: ./clone-cicloeponto.sh"
    exit 1
fi

cd ./cicloeponto

echo "📁 Verificando estrutura do projeto..."

# Verificar arquivos essenciais
files=(".env.local" "package.json" "tailwind.config.ts" "src/pages/index.tsx")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file não encontrado!"
        exit 1
    fi
done

echo "⚙️ Verificando configuração..."

# Verificar .env.local
if grep -q "NEXT_PUBLIC_BLOG_ID=4" .env.local; then
    echo "✅ Blog ID configurado corretamente"
else
    echo "❌ Blog ID não configurado!"
    exit 1
fi

if grep -q "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001" .env.local; then
    echo "✅ API Base URL configurada corretamente"
else
    echo "❌ API Base URL não configurada!"
    exit 1
fi

echo "📦 Verificando dependências..."

# Verificar se node_modules existe
if [ -d "node_modules" ]; then
    echo "✅ Dependências instaladas"
else
    echo "❌ Dependências não instaladas!"
    echo "Execute: npm install"
    exit 1
fi

echo "🌐 Verificando conectividade..."

# Verificar se blog-api-backend está rodando
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Blog API Backend está rodando"
else
    echo "⚠️  Blog API Backend não está rodando em http://localhost:3001"
    echo "Execute: cd ../blog-api-backend && npm run dev"
fi

# Verificar se blog-admin-platform está rodando
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Blog Admin Platform está rodando"
else
    echo "⚠️  Blog Admin Platform não está rodando em http://localhost:3000"
    echo "Execute: cd ../blog-admin-platform && npm run dev"
fi

echo "🗄️ Verificando dados no Supabase..."

# Verificar se conseguimos acessar a API
if curl -s http://localhost:3001/api/blogs/4/articles > /dev/null 2>&1; then
    echo "✅ API respondendo para blog ID 4"
else
    echo "⚠️  API não está respondendo para blog ID 4"
    echo "Verifique se os dados foram criados no Supabase"
fi

echo ""
echo "📋 Checklist de Verificação:"
echo ""

# Checklist interativo
echo "1. ✅ Dados criados no Supabase?"
read -p "   (Execute setup-cicloeponto-complete.sql) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   ✅ Dados configurados"
else
    echo "   ❌ Execute o script SQL primeiro!"
fi

echo ""
echo "2. ✅ Tema configurado no admin?"
read -p "   (Acesse http://localhost:3000/layouts-seo?blogId=4) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   ✅ Tema configurado"
else
    echo "   ❌ Configure o tema no admin platform!"
fi

echo ""
echo "3. ✅ Blog API Backend rodando?"
read -p "   (http://localhost:3001) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   ✅ Backend rodando"
else
    echo "   ❌ Execute: cd ../blog-api-backend && npm run dev"
fi

echo ""
echo "4. ✅ Blog Admin Platform rodando?"
read -p "   (http://localhost:3000) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   ✅ Admin rodando"
else
    echo "   ❌ Execute: cd ../blog-admin-platform && npm run dev"
fi

echo ""
echo "🚀 Pronto para executar o CicloePonto!"
echo ""
echo "Execute: npm run dev"
echo "Acesse: http://localhost:3002"
echo ""
echo "🎉 Blog CicloePonto configurado com sucesso!"
