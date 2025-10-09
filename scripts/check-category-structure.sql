-- Script para verificar a estrutura da tabela Category
-- Execute este script primeiro para entender a estrutura real

-- 1. Verificar estrutura da tabela Category
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Category'
ORDER BY ordinal_position;

-- 2. Verificar se existe alguma tabela relacionada a blogs
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%blog%' OR table_name LIKE '%Blog%';

-- 3. Verificar dados existentes na tabela Category
SELECT * FROM "Category" LIMIT 5;

-- 4. Verificar se existe coluna blog_id (com underscore)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'Category'
AND column_name LIKE '%blog%';
