# Guia de Administração de Categorias - Blog Admin Platform

## 📋 Visão Geral

A interface de administração de categorias permite gerenciar as categorias de cada blog de forma centralizada, incluindo criação, edição, exclusão e configuração de prompts para IA.

## 🚀 Como Acessar

### **1. Via Página de Blogs**
1. Acesse: `http://localhost:3000/blogs`
2. No card do blog desejado, clique em **"Categorias"**
3. Você será direcionado para: `/categories?blogId=X`

### **2. Acesso Direto**
```
http://localhost:3000/categories?blogId=4
```

## 🎯 Funcionalidades

### **✅ Criar Nova Categoria**
- **Título**: Nome da categoria (ex: "Mountain Bike")
- **Slug**: URL amigável (ex: "mountain-bike") - gerado automaticamente
- **Descrição**: Descrição da categoria
- **Palavras-chave AI**: Keywords para geração de conteúdo
- **Prompt AI**: Instruções para IA gerar conteúdo sobre a categoria

### **✅ Editar Categoria Existente**
- Clique no ícone de edição (✏️) ao lado da categoria
- Modifique os campos desejados
- Salve as alterações

### **✅ Excluir Categoria**
- Clique no ícone de lixeira (🗑️) ao lado da categoria
- Confirme a exclusão
- ⚠️ **Nota**: Não é possível excluir categorias com artigos associados

### **✅ Visualizar Categorias**
- Lista todas as categorias do blog
- Mostra título, slug, descrição e palavras-chave
- Ordenação alfabética por título

## 🎨 Interface

### **Layout da Página**
```
┌─────────────────────────────────────────┐
│ 🏷️ Categorias - Blog Name               │
├─────────────────────────────────────────┤
│ [Nova Categoria]                        │
├─────────────────────────────────────────┤
│ 📝 Formulário de Nova Categoria         │
│ (quando ativo)                          │
├─────────────────────────────────────────┤
│ 📋 Lista de Categorias                  │
│ • Mountain Bike [✏️] [🗑️]              │
│ • Bike Elétrica [✏️] [🗑️]              │
│ • Bike Feminina [✏️] [✏️] [🗑️]         │
└─────────────────────────────────────────┘
```

### **Formulário de Categoria**
```
┌─────────────────────────────────────────┐
│ Título *: [Mountain Bike              ] │
│ Slug *:   [mountain-bike              ] │
│ Descrição: [Bicicletas para trilhas...] │
│ Keywords:  [mountain bike, trilha...  ] │
│ Prompt AI: [Crie conteúdo sobre...    ] │
│ [Cancelar] [Salvar]                     │
└─────────────────────────────────────────┘
```

## 🔧 APIs Implementadas

### **GET /api/blogs/[id]/categories**
- Lista todas as categorias do blog
- Requer autenticação
- Verifica permissão do usuário

### **POST /api/blogs/[id]/categories**
- Cria nova categoria
- Valida título e slug obrigatórios
- Verifica slug único

### **PUT /api/blogs/[id]/categories/[categoryId]**
- Atualiza categoria existente
- Valida dados e permissões
- Atualiza timestamp

### **DELETE /api/blogs/[id]/categories/[categoryId]**
- Exclui categoria
- Verifica se não há artigos associados
- Remove categoria do banco

## 📝 Exemplo de Uso - CicloePonto

### **1. Acessar Categorias**
```
http://localhost:3000/categories?blogId=4
```

### **2. Criar Categoria "Mountain Bike"**
- **Título**: Mountain Bike
- **Slug**: mountain-bike (gerado automaticamente)
- **Descrição**: Bicicletas para trilhas e montanhas
- **Keywords**: mountain bike, trilha, montanha, off-road, MTB
- **Prompt**: Crie conteúdo sobre mountain bikes, incluindo dicas de trilhas, manutenção e equipamentos necessários para ciclismo off-road

### **3. Resultado**
```json
{
  "id": 15,
  "title": "Mountain Bike",
  "slug": "mountain-bike",
  "description": "Bicicletas para trilhas e montanhas",
  "aiKeywords": ["mountain bike", "trilha", "montanha", "off-road", "MTB"],
  "aiPrompt": "Crie conteúdo sobre mountain bikes...",
  "blogId": 4
}
```

## 🎯 Integração com Blog Base

### **Como as Categorias são Usadas**
1. **Blog Base** carrega categorias via API
2. **Navegação** mostra categorias no menu
3. **Artigos** são associados a categorias
4. **SEO** usa palavras-chave das categorias
5. **IA** usa prompts para gerar conteúdo

### **Estrutura de Dados**
```typescript
interface Category {
  id: number
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: number | null
  aiKeywords: string[] | null
  aiPrompt: string | null
  blogId: number
  createdAt: string
  updatedAt: string
}
```

## 🔍 Validações e Segurança

### **Validações**
- ✅ Título e slug obrigatórios
- ✅ Slug único por blog
- ✅ Verificação de permissão do usuário
- ✅ Validação de IDs numéricos
- ✅ Proteção contra exclusão de categorias com artigos

### **Segurança**
- ✅ Autenticação obrigatória
- ✅ Verificação de propriedade do blog
- ✅ Sanitização de dados
- ✅ Tratamento de erros

## 🚀 Próximos Passos

1. **✅ Interface criada** e funcional
2. **✅ APIs implementadas** com CRUD completo
3. **✅ Integração** com página de blogs
4. **⏳ Testar** com dados reais do CicloePonto
5. **⏳ Integrar** com sistema de artigos

## 📚 Recursos Adicionais

- **Documentação**: Este guia
- **APIs**: Endpoints REST completos
- **Interface**: React com TypeScript
- **Validação**: Client-side e server-side
- **Segurança**: Autenticação e autorização

---

**Sistema de Categorias** - Gerenciamento completo e integrado! 🏷️✨
