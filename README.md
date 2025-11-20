# Blog Admin Platform

## 📋 Visão Geral

O **Blog Admin Platform** é uma plataforma centralizada de gerenciamento de conteúdo para múltiplos blogs. Desenvolvido com Next.js 15 e TypeScript, oferece uma interface administrativa completa para criar, editar e gerenciar artigos, categorias, autores, tags e configurações de tema para diversos blogs simultaneamente.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│           Blog Admin Platform (Next.js 15)              │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Artigos    │  │  Categorias  │  │   Autores    │ │
│  │   Tags       │  │   Prompts    │  │   Layouts    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         API Routes (Next.js API Routes)          │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                      │
│  • Blogs • Articles • Authors • Categories • Tags      │
│  • Users • Comments • ThemeSettings • AiPrompts        │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Tecnologias Principais

### Frontend
- **Next.js 15.5.0** - Framework React com App Router
- **React 19.1.0** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Estilização utilitária
- **TinyMCE React** - Editor WYSIWYG para conteúdo
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - APIs RESTful
- **Prisma 6.14.0** - ORM para PostgreSQL
- **Supabase** - Banco de dados PostgreSQL gerenciado

### Autenticação
- **Auth0** - Autenticação e autorização
- **NextAuth.js** - Sistema de autenticação alternativo

### IA e Integrações
- **OpenAI** - Geração de conteúdo com GPT
- **Google Gemini** - Geração de conteúdo alternativa
- **Unsplash API** - Busca de imagens

### Utilitários
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificações
- **Slugify** - Geração de slugs URL-friendly

## ✨ Funcionalidades Principais

### 📝 Gerenciamento de Artigos
- **Criação e edição** de artigos com editor WYSIWYG (TinyMCE)
- **Slug manual** ou automático (configurável)
- **Tipos de artigo**: Análise (`analise`) ou Lista (`lista`)
- **Meta descrição** com limite de 160 caracteres e truncamento inteligente
- **Upload de imagens** com preview
- **Associação** com categorias, tags e autores
- **Publicação** e rascunhos
- **Estatísticas**: visualizações e curtidas
- **SEO**: keywords, meta description, image alt text

### 🏷️ Gerenciamento de Categorias
- Criação, edição e exclusão de categorias
- Geração automática de slugs
- Configuração de prompts para IA
- Palavras-chave para SEO
- Hierarquia de categorias (parent/child)

### 👤 Gerenciamento de Autores
- Perfis completos de autores
- Informações profissionais (função, bio, habilidades)
- Suporte a autores gerados por IA
- Links sociais e website
- Assinatura personalizada

### 🏷️ Gerenciamento de Tags
- Criação e edição de tags
- Cores personalizadas
- Associação com artigos
- Tags relacionadas a IA

### 🎨 Configuração de Layouts e SEO
- **Temas personalizados** por blog
- **Configurações de layout**: header, footer, sidebar
- **SEO**: meta descriptions, keywords, social images
- **Cores e tipografia** customizáveis
- **Configurações de newsletter**
- **Estilos de cards** de artigos

### 🤖 Geração de Conteúdo com IA
- **Prompts personalizados** por blog
- **Integração OpenAI** e Google Gemini
- **Geração automática** de artigos
- **Logs de geração** com métricas (tokens, custo, duração)
- **Confiança da IA** (confidence score)

### 🖼️ Gerenciamento de Imagens
- **Upload local** para blogs específicos
- **Integração Unsplash** para busca de imagens
- **Assets externos** (ex: BlogId 3 com caminhos externos)
- **Organização automática** por data (ano/mês)
- **Preview de imagens** antes de salvar
- **Validação de tamanho** e formato

### 🔐 Autenticação e Autorização
- Login via Auth0
- Sistema de roles (master, owner, admin, editor, user)
- Controle de acesso por blog (BlogAccess)
- Proteção de rotas com middleware

## 📁 Estrutura do Projeto

```
blog-admin-platform/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── public/                     # Assets estáticos
│   └── vibesfilm/             # Imagens específicas do blog 3
├── scripts/                    # Scripts utilitários
│   └── copy-vibesfilm-images.sh
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── articles/       # CRUD de artigos
│   │   │   ├── blogs/          # Gerenciamento de blogs
│   │   │   ├── prompts/        # Prompts de IA
│   │   │   └── auth/           # Autenticação
│   │   ├── blogs/              # Páginas de blogs
│   │   │   └── [id]/
│   │   │       └── articles/   # Artigos do blog
│   │   ├── authors/            # Gerenciamento de autores
│   │   ├── categories/         # Gerenciamento de categorias
│   │   ├── layouts-seo/        # Configuração de layouts
│   │   ├── prompts/            # Gerenciamento de prompts
│   │   └── dashboard/          # Dashboard principal
│   ├── components/             # Componentes React
│   │   ├── AdminLayout.tsx     # Layout administrativo
│   │   ├── HtmlEditor.tsx      # Editor WYSIWYG
│   │   ├── ImagePreview.tsx    # Preview de imagens
│   │   └── UnsplashImageSearch.tsx
│   ├── lib/                    # Bibliotecas e utilitários
│   ├── hooks/                  # React Hooks customizados
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Funções utilitárias
│   │   └── blogImageConfig.ts  # Configuração de imagens por blog
│   └── middleware.ts           # Middleware Next.js
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🗄️ Modelo de Dados

### Principais Entidades

#### Blog
- Informações básicas (nome, slug, domain)
- Configurações de tema e SEO
- Status (active, suspended, sold)
- Relacionamentos: Articles, Authors, Categories, Tags, etc.

#### Article
- Conteúdo completo (título, descrição, HTML)
- Metadados (slug, published, viewCount, likeCount)
- Tipo: `analise` ou `lista`
- SEO (keywords, metaDescription, imageAlt)
- Relacionamentos: Blog, Category, Author, Tags, Comments

#### Author
- Perfil completo (nome, função, bio, foto)
- Informações profissionais (email, website, habilidades)
- Suporte a autores IA (isAi, aiModel)

#### Category
- Hierarquia (parent/child)
- Configurações de IA (aiKeywords, aiPrompt)
- SEO (slug, description)

#### Tag
- Nome e slug
- Cor personalizada
- Relacionamento many-to-many com Articles

#### ThemeSettings
- Configurações visuais (cores, fontes)
- Layout (header, footer, sidebar)
- SEO (meta descriptions, social images)

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `env.example` para `.env.local` e configure:

```bash
# Banco de Dados
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth0
AUTH0_SECRET="..."
AUTH0_ISSUER_BASE_URL="https://..."
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."

# APIs de IA
OPENAI_API_KEY="..."
GOOGLE_API_KEY="..."

# Unsplash
UNSPLASH_ACCESS_KEY="..."

# TinyMCE
NEXT_PUBLIC_TINYMCE_API_KEY="..."
```

### 2. Instalação

```bash
# Instalar dependências
npm install

# Configurar Prisma
npx prisma generate
npx prisma db push  # ou npx prisma migrate dev

# Executar em desenvolvimento
npm run dev
```

### 3. Configuração de Imagens por Blog

O arquivo `src/utils/blogImageConfig.ts` contém configurações específicas para cada blog:

```typescript
export const BLOG_IMAGE_CONFIGS: Record<number, BlogImageConfig> = {
  1: {
    blogId: 1,
    blogName: 'Blog_cbrazil',
    basePath: '/home/cabrazil/newprojs/blogs/blog_cbrazil/public/images',
    // ...
  },
  3: {
    blogId: 3,
    blogName: 'VibesFilm Blog',
    externalAssetsPath: '/home/cabrazil/newprojs/fav_movies/moviesf_front/src/assets',
    // Organização automática: blog/articles/2025/mês/arquivo.jpg
  },
  // ...
}
```

## 🎯 Uso

### Criar um Artigo

1. Acesse `/blogs/[id]/articles/new`
2. Preencha título, conteúdo, descrição
3. Configure slug manualmente (ou deixe temporário)
4. Selecione categoria, autor e tags
5. Escolha tipo: Análise ou Lista
6. Adicione imagem (local ou Unsplash)
7. Configure meta description (máx. 160 caracteres)
8. Salve e edite na página de edição

### Gerenciar Categorias

1. Acesse `/categories?blogId=X`
2. Clique em "Nova Categoria"
3. Preencha título, descrição
4. Configure palavras-chave e prompt para IA
5. Salve

### Configurar Layout

1. Acesse `/layouts-seo?blogId=X`
2. Configure cores, fontes, layout
3. Ajuste SEO (meta descriptions, keywords)
4. Configure header, footer, sidebar
5. Salve alterações

## 🔌 APIs Principais

### Artigos

- `GET /api/articles/[id]` - Obter artigo
- `POST /api/blogs/[id]/articles` - Criar artigo
- `PUT /api/articles/[id]` - Atualizar artigo
- `DELETE /api/articles/[id]` - Deletar artigo

### Blogs

- `GET /api/blogs` - Listar blogs
- `GET /api/blogs/[id]` - Obter blog
- `GET /api/blogs/[id]/images/[...path]` - Servir imagens externas

### Categorias

- `GET /api/blogs/[id]/categories` - Listar categorias
- `POST /api/blogs/[id]/categories` - Criar categoria
- `PUT /api/categories/[id]` - Atualizar categoria

### Autores

- `GET /api/blogs/[id]/authors` - Listar autores
- `POST /api/blogs/[id]/authors` - Criar autor
- `PUT /api/authors/[id]` - Atualizar autor

## 🖼️ Sistema de Imagens

### BlogId 3 (VibesFilm) - Organização por Data

Para o BlogId 3, as imagens são organizadas automaticamente por data:

**Estrutura**: `/home/cabrazil/newprojs/fav_movies/moviesf_front/src/assets/blog/articles/2025/mês/arquivo.jpg`

**Formas de uso**:

1. **Apenas nome do arquivo**: `imagem.jpg`
   - → `blog/articles/2025/novembro/imagem.jpg`

2. **Caminho parcial**: `blog/articles/imagem.jpg`
   - → `blog/articles/2025/novembro/imagem.jpg`

3. **Caminho completo**: `blog/articles/2025/outubro/imagem.jpg`
   - → Usado como está (para imagens de outros meses)

### Outros Blogs

- Imagens locais em `public/images/`
- Upload direto para o projeto
- Integração com Unsplash

## 🔒 Segurança

- Autenticação via Auth0
- Middleware de proteção de rotas
- Validação de dados com Prisma
- Sanitização de inputs
- Proteção contra path traversal em rotas de imagens
- Validação de tipos de arquivo e tamanho

## 📊 Recursos Especiais

### Geração de Conteúdo com IA
- Prompts personalizados por blog
- Múltiplos provedores (OpenAI, Gemini)
- Logs detalhados de geração
- Métricas de custo e performance

### SEO Avançado
- Meta descriptions otimizadas
- Keywords por artigo
- Image alt text
- Configurações por blog

### Editor WYSIWYG
- TinyMCE integrado
- Formatação rica de texto
- Inserção de imagens
- Preview de conteúdo

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter
npm run copy-vibesfilm-images  # Copiar imagens do blog 3
```

## 📚 Documentação Adicional

- `AUTHORS_GUIDE.md` - Guia de gerenciamento de autores
- `CATEGORIES_GUIDE.md` - Guia de gerenciamento de categorias
- `LAYOUT_EXAMPLES.md` - Exemplos de configuração de layout
- `CICLOEPONTO_CLONE_GUIDE.md` - Guia específico do blog CicloePonto

## 🐛 Troubleshooting

### Erro de transação Prisma (P2028)
- **Causa**: Timeout em transações longas
- **Solução**: Operações de tags foram refatoradas para fora de transações

### Imagens não aparecem (BlogId 3)
- **Verificar**: Caminho absoluto em `blogImageConfig.ts`
- **Verificar**: Permissões do diretório externo
- **Debug**: Ativar `showDebugInfo` no componente ImagePreview

### Meta Description truncada
- **Limite**: 160 caracteres (padrão Google)
- **Comportamento**: Truncamento automático respeitando palavras

## 📝 Notas de Desenvolvimento

- **Slug**: Pode ser manual ou automático (temporário na criação)
- **Tipos de Artigo**: Enum `ArticleType` com valores `analise` e `lista`
- **Imagens Externas**: BlogId 3 usa caminhos externos com organização por data
- **Validações**: Slug único, meta description <= 160 chars, tipos de arquivo

## 🔄 Próximos Passos

- [ ] Suporte a múltiplos idiomas
- [ ] Editor de blocos (block editor)
- [ ] Analytics integrado
- [ ] Exportação de conteúdo
- [ ] Backup automático
- [ ] Preview de artigos antes de publicar

## 📄 Licença

Projeto privado - Todos os direitos reservados

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e Prisma**
