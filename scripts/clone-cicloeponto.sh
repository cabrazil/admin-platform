#!/bin/bash

# Script para clonar o blog CicloePonto
# Execute este script na pasta /home/cabrazil/newprojs/blogs

set -e  # Parar em caso de erro

echo "🚀 Iniciando clonagem do blog CicloePonto..."

# Verificar se estamos no diretório correto
if [ ! -d "blog_base" ]; then
    echo "❌ Erro: Diretório blog_base não encontrado!"
    echo "Execute este script na pasta /home/cabrazil/newprojs/blogs"
    exit 1
fi

# Verificar se o blog_base existe
if [ ! -d "blog_base" ]; then
    echo "❌ Erro: Template blog_base não encontrado!"
    exit 1
fi

# Verificar se cicloeponto já existe
if [ -d "cicloeponto" ]; then
    echo "⚠️  Diretório cicloeponto já existe!"
    read -p "Deseja sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada."
        exit 1
    fi
    echo "🗑️  Removendo diretório existente..."
    rm -rf cicloeponto
fi

# 1. Clonar blog_base para cicloeponto
echo "📁 Clonando blog_base para cicloeponto..."
cp -r blog_base cicloeponto

# 2. Navegar para o diretório cicloeponto
cd cicloeponto

# 3. Configurar .env.local
echo "⚙️  Configurando variáveis de ambiente..."
cat > .env.local << EOF
NEXT_PUBLIC_BLOG_ID=4
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NODE_ENV=development
EOF

# 4. Atualizar package.json
echo "📦 Atualizando package.json..."
cat > package.json << EOF
{
  "name": "cicloeponto",
  "version": "1.0.0",
  "private": true,
  "description": "Blog CicloePonto - Portal completo sobre ciclismo e bicicletas",
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "lint": "next lint"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "dompurify": "^3.2.6",
    "lucide-react": "^0.487.0",
    "next": "^14.2.25",
    "react": "^18",
    "react-dom": "^18",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1",
    "sharp": "^0.34.1",
    "tailwind-merge": "^3.2.0"
  },
  "devDependencies": {
    "@svgr/webpack": "^8.1.0",
    "@types/dompurify": "^3.0.5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
EOF

# 5. Atualizar README.md
echo "📝 Atualizando README.md..."
cat > README.md << EOF
# CicloePonto - Blog de Ciclismo

## 📋 Sobre o Projeto

O **CicloePonto** é um blog especializado em ciclismo e bicicletas, oferecendo conteúdo de qualidade sobre:

- 🚴‍♂️ **Mountain Bike** - Trilhas e aventuras
- ⚡ **Bike Elétrica** - Tecnologia e sustentabilidade  
- 👩‍🚴‍♀️ **Bike Feminina** - Conteúdo especializado
- 🏃‍♂️ **Speed** - Performance e competição
- 🔧 **Manutenção** - Dicas e tutoriais
- 🛍️ **Acessórios** - Equipamentos e reviews

## 🚀 Como Executar

### Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`
Acesse: http://localhost:3002

### Produção
\`\`\`bash
npm run build
npm start
\`\`\`

## ⚙️ Configuração

O blog está configurado para:
- **Blog ID**: 4 (CicloePonto no Supabase)
- **API Backend**: http://localhost:3001
- **Porta**: 3002

## 🎨 Tema

Cores personalizadas do CicloePonto:
- **Primary**: #2EC4B6 (Verde água)
- **Secondary**: #FF9F1C (Laranja)
- **Accent**: #FF9F1C (Laranja)
- **Background**: #011627 (Azul escuro)
- **Text**: #FDFFFC (Branco)

## 📚 Funcionalidades

- ✅ **Artigos** dinâmicos via API
- ✅ **Categorias** organizadas
- ✅ **Autores** com perfis completos
- ✅ **SEO** otimizado
- ✅ **Responsivo** e mobile-first
- ✅ **Tema** dinâmico via admin

## 🔗 Links Úteis

- **Admin Platform**: http://localhost:3000
- **API Backend**: http://localhost:3001
- **Blog**: http://localhost:3002

---

**CicloePonto** - Seu portal completo sobre ciclismo! 🚴‍♂️✨
EOF

# 6. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 7. Verificar se tudo está funcionando
echo "🔍 Verificando configuração..."

# Verificar se .env.local foi criado
if [ ! -f ".env.local" ]; then
    echo "❌ Erro: .env.local não foi criado!"
    exit 1
fi

# Verificar se package.json foi atualizado
if ! grep -q "cicloeponto" package.json; then
    echo "❌ Erro: package.json não foi atualizado!"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "❌ Erro: Dependências não foram instaladas!"
    exit 1
fi

echo "✅ Clonagem concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute o script SQL no Supabase: setup-cicloeponto-complete.sql"
echo "   (Este script agora inclui a configuração automática do tema)"
echo "2. Execute o blog: npm run dev"
echo "3. Acesse: http://localhost:3002"
echo ""
echo "🔧 Se o tema não aparecer corretamente:"
echo "   Execute: update-cicloeponto-theme.sql no Supabase"
echo ""
echo "🎉 Blog CicloePonto pronto para uso!"
