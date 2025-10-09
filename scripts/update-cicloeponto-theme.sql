-- Script para atualizar o tema do CicloePonto
-- Execute este script no SQL Editor do Supabase

-- Verificar se o blog CicloePonto existe
SELECT 'Verificando blog CicloePonto...' as status;
SELECT id, name, slug FROM "Blog" WHERE id = 4;

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
    "defaultMetaDescription": "O CicloePonto é um blog sobre bicicletas de aventura, lazer e elétricas, onde produzimos análises de produtos para ciclismo."
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
SELECT 'Tema atualizado com sucesso!' as status;
SELECT 'Blog CicloePonto:' as info, id, name, "themeSettingsJson" FROM "Blog" WHERE id = 4;
