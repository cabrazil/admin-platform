# Exemplos de Configuração de Layout - Blog Admin Platform

## 📋 Visão Geral

Este documento mostra exemplos práticos de como configurar diferentes tipos de layout para blogs através do `blog-admin-platform`.

## 🚀 Como Acessar

1. **Acesse o admin platform**: `http://localhost:3000`
2. **Vá para a página de blogs**: `http://localhost:3000/blogs`
3. **Clique em "Layouts/SEO"** no card do blog desejado
4. **Configure na aba "Layout"**

## 🎨 Exemplos de Configuração

### **1. Blog de Tecnologia (CicloePonto)**

**URL**: `http://localhost:3000/layouts-seo?blogId=4`

**Configurações recomendadas**:
```json
{
  "layout": {
    "homeLayout": "featured",
    "featuredSectionEnabled": true,
    "featuredSectionStyle": "default",
    "heroSectionEnabled": true,
    "heroSectionStyle": "image",
    "newsletterEnabled": true,
    "categoriesEnabled": true,
    "headerStyle": "default",
    "footerColumns": 4,
    "sidebarEnabled": false,
    "articleCardStyle": "modern"
  }
}
```

**Resultado**: Blog com seção de destaque, hero com imagem, newsletter e layout moderno.

### **2. Blog Minimalista**

**Configurações**:
```json
{
  "layout": {
    "homeLayout": "minimal",
    "featuredSectionEnabled": false,
    "heroSectionEnabled": false,
    "newsletterEnabled": false,
    "categoriesEnabled": false,
    "headerStyle": "minimal",
    "footerColumns": 2,
    "sidebarEnabled": false,
    "articleCardStyle": "compact"
  }
}
```

**Resultado**: Layout limpo, foco no conteúdo, sem elementos extras.

### **3. Blog Magazine/Revista**

**Configurações**:
```json
{
  "layout": {
    "homeLayout": "magazine",
    "featuredSectionEnabled": true,
    "featuredSectionStyle": "grid",
    "heroSectionEnabled": true,
    "heroSectionStyle": "gradient",
    "newsletterEnabled": true,
    "categoriesEnabled": true,
    "headerStyle": "centered",
    "footerColumns": 5,
    "sidebarEnabled": true,
    "sidebarPosition": "right",
    "articleCardStyle": "modern"
  }
}
```

**Resultado**: Layout em revista, múltiplas seções, sidebar, visual rico.

### **4. Blog Corporativo**

**Configurações**:
```json
{
  "layout": {
    "homeLayout": "standard",
    "featuredSectionEnabled": false,
    "heroSectionEnabled": true,
    "heroSectionStyle": "default",
    "newsletterEnabled": false,
    "categoriesEnabled": true,
    "headerStyle": "default",
    "footerColumns": 4,
    "sidebarEnabled": false,
    "articleCardStyle": "default"
  }
}
```

**Resultado**: Layout profissional, hero section, categorias, sem newsletter.

## 🔧 Passo a Passo - Configurando o CicloePonto

### **1. Acessar a Configuração**
```
http://localhost:3000/layouts-seo?blogId=4
```

### **2. Ir para a Aba "Layout"**
Clique na aba "Layout" no topo da página.

### **3. Configurar Layout da Home**
- **Tipo de Layout**: "Com Destaque"
- **Estilo do Header**: "Padrão"

### **4. Configurar Seção de Destaque**
- ✅ **Habilitar Seção de Destaque**: Marcar checkbox
- **Estilo da Seção**: "Padrão (Artigo principal + laterais)"

### **5. Configurar Hero Section**
- ✅ **Habilitar Hero Section**: Marcar checkbox
- **Estilo do Hero**: "Com Imagem"

### **6. Configurar Funcionalidades Extras**
- ✅ **Newsletter**: Marcar checkbox
- ✅ **Categorias**: Marcar checkbox

### **7. Configurar Configurações Avançadas**
- **Colunas do Footer**: "4 Colunas"
- **Estilo dos Cards**: "Moderno"
- **Sidebar**: Desmarcado (não habilitar)

### **8. Salvar**
Clique no botão "Salvar Configurações" no topo da página.

## 📊 Resultado Esperado

Após salvar, o blog CicloePonto terá:

1. **Hero Section** com imagem de fundo
2. **Seção de Destaque** com artigo principal e laterais
3. **Newsletter** integrado na seção de destaque
4. **Layout moderno** com cards estilizados
5. **Footer** com 4 colunas
6. **Categorias** habilitadas

## 🎯 Testando a Configuração

### **1. Clonar o Blog**
```bash
cp -r blog_base cicloeponto-blog
cd cicloeponto-blog
```

### **2. Configurar ID**
```bash
echo "NEXT_PUBLIC_BLOG_ID=4" > .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001" >> .env.local
```

### **3. Executar**
```bash
npm install
npm run dev
```

### **4. Verificar**
Acesse `http://localhost:3002` e verifique se:
- Hero section aparece
- Seção de destaque está visível
- Newsletter está integrado
- Layout está aplicado corretamente

## 🔍 Debug e Troubleshooting

### **Verificar Configurações**
```typescript
// No console do navegador do blog
console.log(themeSettings.layout);
```

### **Verificar API**
```bash
curl http://localhost:3001/api/blogs/4/theme
```

### **Logs do Admin**
Verifique o console do admin platform para erros ao salvar.

## 📝 Próximos Passos

1. **Testar diferentes configurações** para encontrar o layout ideal
2. **Personalizar cores** na aba "Cores"
3. **Configurar SEO** na aba "SEO"
4. **Adicionar branding** na aba "Marca"

---

**Sistema de Layouts** - Configuração visual através do admin platform! 🎨✨
