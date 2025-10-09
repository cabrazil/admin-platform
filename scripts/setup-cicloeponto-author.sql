-- Script para criar Author do CicloePonto
-- Execute ANTES do script de artigos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se já existe um Author para o CicloePonto
SELECT id, name, email FROM "Author" WHERE "blogId" = 4;

-- 2. Criar Author para CicloePonto (blogId=4)
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
);

-- 3. Verificar se o Author foi criado
SELECT id, name, email, "blogId" FROM "Author" WHERE "blogId" = 4;
