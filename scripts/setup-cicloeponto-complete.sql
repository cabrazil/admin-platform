-- Script COMPLETO para configurar o CicloePonto
-- Execute este script no SQL Editor do Supabase
-- Este script executa todos os passos necessários na ordem correta

-- ========================================
-- PASSO 1: VERIFICAR SE O BLOG EXISTE
-- ========================================
SELECT 'Verificando blog CicloePonto...' as status;
SELECT id, name, slug, domain FROM "Blog" WHERE id = 4;

-- ========================================
-- PASSO 2: CRIAR CATEGORIAS
-- ========================================
SELECT 'Criando categorias...' as status;

INSERT INTO "Category" (title, slug, description, "blogId", "createdAt", "updatedAt") VALUES
('Mountain Bike', 'mountain-bike', 'Bicicletas para trilhas e montanhas', 4, NOW(), NOW()),
('Bike Elétrica', 'bike-eletrica', 'Bicicletas com assistência elétrica', 4, NOW(), NOW()),
('Bike Feminina', 'bike-feminina', 'Bicicletas desenvolvidas para mulheres', 4, NOW(), NOW()),
('Speed', 'speed', 'Bicicletas de velocidade e competição', 4, NOW(), NOW()),
('Aro 26', 'aro-26', 'Bicicletas com rodas de 26 polegadas', 4, NOW(), NOW()),
('Marcas', 'marcas', 'Informações sobre marcas de bicicletas', 4, NOW(), NOW()),
('Acessórios', 'acessorios', 'Acessórios e equipamentos para ciclismo', 4, NOW(), NOW()),
('Manutenção', 'manutencao', 'Dicas e guias de manutenção', 4, NOW(), NOW())
ON CONFLICT (slug, "blogId") DO NOTHING;

-- Verificar categorias criadas
SELECT 'Categorias criadas:' as status, COUNT(*) as total FROM "Category" WHERE "blogId" = 4;

-- ========================================
-- PASSO 3: CRIAR AUTHOR
-- ========================================
SELECT 'Criando author...' as status;

INSERT INTO "Author" (name, role, "imageUrl", bio, email, "blogId", "createdAt", "updatedAt") 
VALUES (
  'CicloePonto Editorial', 
  'Editor Chefe', 
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  'Equipe editorial especializada em ciclismo e bicicletas, trazendo as melhores dicas e análises do mercado.',
  'editorial@cicloeponto.com', 
  4, 
  NOW(), 
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verificar author criado
SELECT 'Author criado:' as status, id, name, email FROM "Author" WHERE "blogId" = 4;

-- ========================================
-- PASSO 4: CRIAR ARTIGOS
-- ========================================
SELECT 'Criando artigos...' as status;

INSERT INTO "Article" (title, slug, description, content, "imageUrl", "categoryId", "authorId", "blogId", date, published, "createdAt", "updatedAt") VALUES
('Top 5 Melhores Bicicletas Leves para Pedalar 2025', 'top-5-melhores-bicicletas-leves-para-pedalar-2025', 
 'Descubra as 5 melhores bicicletas leves do mercado em 2025, perfeitas para pedalar com conforto e eficiência.',
 '# Top 5 Melhores Bicicletas Leves para Pedalar 2025

## Introdução

As bicicletas leves são ideais para quem busca praticidade e conforto no dia a dia. Em 2025, o mercado oferece opções incríveis que combinam leveza, durabilidade e preço acessível.

## 1. Caloi 10 - A Clássica Brasileira
- **Peso**: 12kg
- **Preço**: R$ 1.200
- **Ideal para**: Iniciantes e uso urbano
- **Características**: Quadro de aço, 21 marchas, freios a tambor

## 2. Oggi Pista 7 - Moderna e Eficiente
- **Peso**: 11kg
- **Preço**: R$ 1.500
- **Ideal para**: Ciclismo urbano
- **Características**: Quadro de alumínio, 7 velocidades, freios V-Brake

## 3. Trek FX 2 - Tecnologia e Conforto
- **Peso**: 10.5kg
- **Preço**: R$ 2.800
- **Ideal para**: Ciclistas experientes
- **Características**: Quadro de alumínio, 18 marchas, freios hidráulicos

## 4. Specialized Sirrus 2.0 - Performance
- **Peso**: 10kg
- **Preço**: R$ 3.200
- **Ideal para**: Performance e velocidade
- **Características**: Quadro de carbono, 18 marchas, geometria otimizada

## 5. Giant Escape 3 - Equilíbrio Perfeito
- **Peso**: 11.5kg
- **Preço**: R$ 1.800
- **Ideal para**: Uso misto (urbano e trilha leve)
- **Características**: Quadro de alumínio, 21 marchas, pneus híbridos

## Conclusão

Escolher uma bicicleta leve é fundamental para uma boa experiência de pedalada. Considere seu orçamento, tipo de uso e nível de experiência antes de decidir.',
 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13',
 (SELECT id FROM "Category" WHERE slug = 'bike-feminina' AND "blogId" = 4),
 (SELECT id FROM "Author" WHERE "blogId" = 4 LIMIT 1),
 28, NOW(), true, NOW(), NOW()),

('Top 10 Melhores Marcas de Bicicleta | Nacionais e Importadas 2025', 'top-10-melhores-marcas-bicicleta-nacionais-importadas-2025',
 'Conheça as 10 melhores marcas de bicicletas do mercado brasileiro e internacional em 2025.',
 '# Top 10 Melhores Marcas de Bicicleta | Nacionais e Importadas 2025

## Marcas Nacionais

### 1. Caloi
- **História**: Mais de 70 anos no mercado brasileiro
- **Especialidade**: Bicicletas urbanas e mountain bikes
- **Preço**: R$ 800 - R$ 3.000

### 2. Oggi
- **História**: Fundada em 1995, focada em inovação
- **Especialidade**: Bicicletas de alta performance
- **Preço**: R$ 1.200 - R$ 5.000

### 3. Monark
- **História**: Tradição de mais de 100 anos
- **Especialidade**: Bicicletas clássicas e ergométricas
- **Preço**: R$ 600 - R$ 2.500

## Marcas Importadas

### 4. Trek
- **Origem**: Estados Unidos
- **Especialidade**: Mountain bikes e road bikes
- **Preço**: R$ 2.000 - R$ 15.000

### 5. Specialized
- **Origem**: Estados Unidos
- **Especialidade**: Bicicletas de alta performance
- **Preço**: R$ 3.000 - R$ 20.000

### 6. Giant
- **Origem**: Taiwan
- **Especialidade**: Bicicletas para todos os tipos
- **Preço**: R$ 1.500 - R$ 12.000

### 7. Cannondale
- **Origem**: Estados Unidos
- **Especialidade**: Inovação e tecnologia
- **Preço**: R$ 2.500 - R$ 18.000

### 8. Scott
- **Origem**: Suíça
- **Especialidade**: Mountain bikes e road bikes
- **Preço**: R$ 2.000 - R$ 16.000

### 9. Orbea
- **Origem**: Espanha
- **Especialidade**: Bicicletas personalizadas
- **Preço**: R$ 2.500 - R$ 14.000

### 10. Bianchi
- **Origem**: Itália
- **Especialidade**: Road bikes clássicas
- **Preço**: R$ 3.000 - R$ 20.000

## Como Escolher a Melhor Marca

1. **Defina seu orçamento**
2. **Considere o tipo de uso**
3. **Pesquise a rede de assistência**
4. **Avalie a garantia oferecida**
5. **Teste antes de comprar**

## Conclusão

Cada marca tem suas particularidades e pontos fortes. A escolha ideal depende do seu perfil, orçamento e objetivos com a bicicleta.',
 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13',
 (SELECT id FROM "Category" WHERE slug = 'marcas' AND "blogId" = 4),
 (SELECT id FROM "Author" WHERE "blogId" = 4 LIMIT 1),
 33, NOW(), true, NOW(), NOW()),

('Top 10 Melhores Bicicletas Aro 26 | Guia Completo 2025', 'top-10-melhores-bicicletas-aro-26-guia-completo-2025',
 'Guia completo com as 10 melhores bicicletas aro 26 do mercado em 2025, incluindo análises detalhadas.',
 '# Top 10 Melhores Bicicletas Aro 26 | Guia Completo 2025

## Por que Escolher Aro 26?

As bicicletas aro 26 oferecem:
- **Estabilidade**: Maior controle em terrenos irregulares
- **Durabilidade**: Rodas mais resistentes
- **Versatilidade**: Ideais para diversos tipos de terreno
- **Preço**: Geralmente mais acessíveis

## Top 10 Bicicletas Aro 26

### 1. Caloi Explorer 26
- **Preço**: R$ 1.200
- **Especialidade**: Trilhas leves
- **Características**: 21 marchas, freios V-Brake

### 2. Oggi Mountain Bike 26
- **Preço**: R$ 1.800
- **Especialidade**: Mountain bike
- **Características**: Suspensão dianteira, 24 marchas

### 3. Trek Marlin 5
- **Preço**: R$ 2.500
- **Especialidade**: Trilhas intermediárias
- **Características**: Quadro de alumínio, 21 marchas

### 4. Specialized Rockhopper
- **Preço**: R$ 3.200
- **Especialidade**: Mountain bike avançada
- **Características**: Suspensão dupla, 27 marchas

### 5. Giant Talon 3
- **Preço**: R$ 2.800
- **Especialidade**: Trilhas e estrada
- **Características**: Quadro de alumínio, 21 marchas

### 6. Cannondale Trail 6
- **Preço**: R$ 3.500
- **Especialidade**: Performance
- **Características**: Quadro de alumínio, 24 marchas

### 7. Scott Aspect 950
- **Preço**: R$ 2.900
- **Especialidade**: Trilhas técnicas
- **Características**: Suspensão dianteira, 21 marchas

### 8. Orbea MX 26
- **Preço**: R$ 3.100
- **Especialidade**: Mountain bike
- **Características**: Quadro de alumínio, 24 marchas

### 9. Bianchi C-Sport
- **Preço**: R$ 2.600
- **Especialidade**: Estrada e trilha leve
- **Características**: 21 marchas, freios V-Brake

### 10. Monark Explorer 26
- **Preço**: R$ 1.500
- **Especialidade**: Uso urbano e trilha leve
- **Características**: 21 marchas, freios a tambor

## Dicas de Manutenção

1. **Limpeza regular** das correntes e engrenagens
2. **Verificação** dos freios mensalmente
3. **Calibragem** dos pneus semanalmente
4. **Lubrificação** das partes móveis
5. **Inspeção** do quadro e rodas

## Conclusão

As bicicletas aro 26 continuam sendo uma excelente opção para quem busca versatilidade e durabilidade. Escolha baseada no seu tipo de uso e orçamento.',
 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13',
 (SELECT id FROM "Category" WHERE slug = 'aro-26' AND "blogId" = 4),
 (SELECT id FROM "Author" WHERE "blogId" = 4 LIMIT 1),
 32, NOW(), true, NOW(), NOW()),

('Top 6 Melhores Bikes Speed | Guia Completo 2025', 'top-6-melhores-bikes-speed-guia-completo-2025',
 'Descubra as 6 melhores bikes speed do mercado em 2025, perfeitas para velocidade e competição.',
 '# Top 6 Melhores Bikes Speed | Guia Completo 2025

## O que é uma Bike Speed?

As bikes speed são bicicletas projetadas para:
- **Velocidade**: Aerodinâmica otimizada
- **Eficiência**: Transmissão de energia máxima
- **Performance**: Componentes de alta qualidade
- **Competição**: Uso em provas e treinos

## Top 6 Bikes Speed

### 1. Trek Domane SL 5
- **Preço**: R$ 8.500
- **Especialidade**: Endurance
- **Características**: Quadro de carbono, 22 marchas

### 2. Specialized Roubaix
- **Preço**: R$ 12.000
- **Especialidade**: Conforto e velocidade
- **Características**: Suspensão Future Shock, 22 marchas

### 3. Giant Defy Advanced 2
- **Preço**: R$ 7.800
- **Especialidade**: Performance
- **Características**: Quadro de carbono, 22 marchas

### 4. Cannondale Synapse Carbon
- **Preço**: R$ 9.200
- **Especialidade**: Endurance
- **Características**: Quadro de carbono, 22 marchas

### 5. Scott Addict 20
- **Preço**: R$ 10.500
- **Especialidade**: Velocidade
- **Características**: Quadro de carbono, 22 marchas

### 6. Orbea Orca M30
- **Preço**: R$ 8.900
- **Especialidade**: Competição
- **Características**: Quadro de carbono, 22 marchas

## Componentes Essenciais

### Quadro
- **Material**: Carbono (ideal) ou alumínio
- **Geometria**: Agressiva para velocidade
- **Peso**: Quanto menor, melhor

### Rodas
- **Aro**: 700c (padrão)
- **Perfil**: Alto para aerodinâmica
- **Material**: Carbono ou alumínio

### Transmissão
- **Marchas**: 22 velocidades (ideal)
- **Coroa**: 50/34T (compact)
- **Cassete**: 11-32T

## Dicas de Treino

1. **Treino de base**: Desenvolva resistência
2. **Intervalos**: Melhore a velocidade
3. **Subidas**: Fortaleça as pernas
4. **Técnica**: Otimize a pedalada
5. **Nutrição**: Mantenha energia

## Conclusão

As bikes speed são investimentos sérios para quem busca performance. Considere seu nível e objetivos antes de escolher.',
 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13',
 (SELECT id FROM "Category" WHERE slug = 'speed' AND "blogId" = 4),
 (SELECT id FROM "Author" WHERE "blogId" = 4 LIMIT 1),
 31, NOW(), true, NOW(), NOW());

-- ========================================
-- PASSO 5: CONFIGURAR TEMA DO CICLOEPONTO
-- ========================================
SELECT 'Configurando tema do CicloePonto...' as status;

-- Atualizar themeSettingsJson do blog CicloePonto
UPDATE "Blog" 
SET "themeSettingsJson" = '{
  "seo": {
    "socialImage": "/images/social-share.png",
    "defaultKeywords": [
      "Mountain Bike",
      "Bike Elétrica", 
      "Bike Feminina",
      "Bike Masculina",
      "Ergométrica"
    ],
    "defaultMetaDescription": "O CicloePonto é um site sobre bicicletas de aventura e lazer, no qual produzimos guias de compras e análises de produtos para ciclismo."
  },
  "fonts": {
    "bodyFont": "Inter, sans-serif",
    "headingFont": "Montserrat, sans-serif"
  },
  "colors": {
    "accent": "#FF9F1C",
    "primary": "#2EC4B6",
    "secondary": "#FF9F1C", 
    "background": "#011627",
    "textPrimary": "#FDFFFC",
    "textSecondary": "#E0E0E0"
  },
  "footer": {
    "description": "Os melhores reviews de todos os tipos de bike",
    "copyrightText": "© 2025 cicloeponto.com.br. Todos os direitos reservados."
  },
  "layout": {
    "homeLayout": "featured",
    "headerStyle": "default",
    "footerColumns": 4,
    "sidebarEnabled": false,
    "sidebarPosition": "right",
    "articleCardStyle": "default",
    "heroSectionStyle": "default",
    "categoriesEnabled": true,
    "newsletterEnabled": false,
    "heroSectionEnabled": true,
    "featuredSectionStyle": "default",
    "featuredSectionEnabled": true
  },
  "branding": {
    "favicon": "/favicon.ico",
    "logoDark": "/images/cbrazil_logo_dark.png",
    "logoLight": "/images/cbrazil_logo.png",
    "siteTitle": "cicloeponto.com.br"
  },
  "customCode": {
    "js": "",
    "css": ""
  },
  "socialLinks": {
    "github": "https://github.com/cbrazil",
    "twitter": "https://twitter.com/cicloeponto",
    "linkedin": "https://linkedin.com/in/cicloeponto"
  }
}'::jsonb
WHERE id = 4;

-- Verificar se o tema foi aplicado
SELECT 'Tema configurado:' as status, "themeSettingsJson" FROM "Blog" WHERE id = 4;

-- ========================================
-- PASSO 6: VERIFICAR RESULTADOS
-- ========================================
SELECT 'Configuração completa!' as status;

-- Resumo final
SELECT 'RESUMO FINAL:' as info;
SELECT 'Blog:' as tipo, id, name FROM "Blog" WHERE id = 4;
SELECT 'Categorias:' as tipo, COUNT(*) as total FROM "Category" WHERE "blogId" = 4;
SELECT 'Authors:' as tipo, COUNT(*) as total FROM "Author" WHERE "blogId" = 4;
SELECT 'Artigos:' as tipo, COUNT(*) as total FROM "Article" WHERE "blogId" = 4;

-- Listar categorias criadas
SELECT 'Categorias criadas:' as info;
SELECT id, title, slug FROM "Category" WHERE "blogId" = 4 ORDER BY title;

-- Listar artigos criados
SELECT 'Artigos criados:' as info;
SELECT id, title, slug, "categoryId" FROM "Article" WHERE "blogId" = 4 ORDER BY title;
