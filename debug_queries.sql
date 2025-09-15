-- ========================================
-- DEBUG: Verificar dados do Blog ID = 3
-- ========================================

-- 1. Verificar se o blog 3 existe
SELECT 
  id,
  name,
  slug,
  status,
  owner_id,
  created_at,
  updated_at
FROM "Blog" 
WHERE id = 3;

-- 2. Listar todas as categorias do blog 3
SELECT 
  id,
  title,
  slug,
  description,
  image_url,
  parent_id,
  ai_keywords,
  ai_prompt,
  created_at,
  updated_at
FROM "Category" 
WHERE blog_id = 3
ORDER BY title ASC;

-- 3. Listar todos os autores do blog 3
SELECT 
  id,
  name,
  role,
  image_url,
  bio,
  signature,
  email,
  website,
  social,
  skills,
  ai_model,
  is_ai,
  created_at,
  updated_at
FROM "Author" 
WHERE blog_id = 3
ORDER BY name ASC;

-- 4. Verificar se há artigos no blog 3
SELECT 
  id,
  title,
  slug,
  category_id,
  author_id,
  published,
  created_at
FROM "Article" 
WHERE blog_id = 3
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar se há prompts no blog 3
SELECT 
  id,
  name,
  content,
  is_active,
  created_at,
  updated_at
FROM "AiPrompt" 
WHERE blog_id = 3
ORDER BY name ASC;

-- 6. Contagem geral do blog 3
SELECT 
  'Blog' as tabela,
  COUNT(*) as total
FROM "Blog" 
WHERE id = 3

UNION ALL

SELECT 
  'Categories' as tabela,
  COUNT(*) as total
FROM "Category" 
WHERE blog_id = 3

UNION ALL

SELECT 
  'Authors' as tabela,
  COUNT(*) as total
FROM "Author" 
WHERE blog_id = 3

UNION ALL

SELECT 
  'Articles' as tabela,
  COUNT(*) as total
FROM "Article" 
WHERE blog_id = 3

UNION ALL

SELECT 
  'Prompts' as tabela,
  COUNT(*) as total
FROM "AiPrompt" 
WHERE blog_id = 3;
