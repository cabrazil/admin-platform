#!/bin/bash

# Script para verificar se o tema do CicloePonto está configurado corretamente
# Execute este script após configurar o tema no Supabase

set -e

echo "🎨 Verificando configuração do tema CicloePonto..."

# Verificar se o blog-api-backend está rodando
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "⚠️  Blog API Backend não está rodando em http://localhost:3001"
    echo "Execute: cd ../blog-api-backend && npm run dev"
    exit 1
fi

echo "✅ Blog API Backend está rodando"

# Verificar se conseguimos acessar a API de tema
echo "🔍 Verificando API de tema..."

response=$(curl -s http://localhost:3001/api/blogs/4/theme 2>/dev/null || echo "ERROR")

if [ "$response" = "ERROR" ]; then
    echo "❌ Erro ao acessar API de tema"
    echo "Verifique se o blog-api-backend está rodando e se os dados foram criados no Supabase"
    exit 1
fi

# Verificar se a resposta contém dados de tema
if echo "$response" | grep -q "themeSettings"; then
    echo "✅ API de tema respondendo"
    
    # Extrair informações específicas do tema
    site_title=$(echo "$response" | grep -o '"siteTitle":"[^"]*"' | cut -d'"' -f4)
    primary_color=$(echo "$response" | grep -o '"primary":"[^"]*"' | cut -d'"' -f4)
    home_layout=$(echo "$response" | grep -o '"homeLayout":"[^"]*"' | cut -d'"' -f4)
    
    echo "📊 Informações do tema:"
    echo "   Site Title: $site_title"
    echo "   Primary Color: $primary_color"
    echo "   Home Layout: $home_layout"
    
    # Verificar se as configurações estão corretas
    if [ "$site_title" = "cicloeponto.com.br" ]; then
        echo "✅ Site title configurado corretamente"
    else
        echo "❌ Site title incorreto: $site_title (esperado: cicloeponto.com.br)"
    fi
    
    if [ "$primary_color" = "#2EC4B6" ]; then
        echo "✅ Cor primária configurada corretamente"
    else
        echo "❌ Cor primária incorreta: $primary_color (esperado: #2EC4B6)"
    fi
    
    if [ "$home_layout" = "featured" ]; then
        echo "✅ Layout da home configurado corretamente"
    else
        echo "❌ Layout da home incorreto: $home_layout (esperado: featured)"
    fi
    
else
    echo "❌ API de tema não retornou dados válidos"
    echo "Resposta: $response"
    echo ""
    echo "🔧 Soluções:"
    echo "1. Execute o script SQL: setup-cicloeponto-complete.sql"
    echo "2. Ou execute apenas: update-cicloeponto-theme.sql"
    exit 1
fi

echo ""
echo "🌐 Testando blog CicloePonto..."

# Verificar se o blog está rodando
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Blog CicloePonto está rodando em http://localhost:3002"
    echo ""
    echo "🎯 Verificações manuais:"
    echo "1. Acesse: http://localhost:3002"
    echo "2. Verifique se o título é 'cicloeponto.com.br'"
    echo "3. Verifique se as cores estão aplicadas (verde #2EC4B6, laranja #FF9F1C)"
    echo "4. Verifique se o layout é 'featured' (seção de destaque)"
    echo "5. Verifique se os artigos estão sendo carregados"
else
    echo "⚠️  Blog CicloePonto não está rodando em http://localhost:3002"
    echo "Execute: cd cicloeponto && npm run dev"
fi

echo ""
echo "🎉 Verificação de tema concluída!"
