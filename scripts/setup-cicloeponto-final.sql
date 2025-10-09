-- Script de Setup do CicloePonto Blog - VERSÃO FINAL
-- Baseado no schema correto da tabela Category
-- Execute este script no SQL Editor do Supabase

-- 1. Criar Categorias para CicloePonto (blogId=4)
INSERT INTO "Category" (title, slug, description, "blogId", "createdAt", "updatedAt", "aiKeywords", "aiPrompt") VALUES
('Mountain Bike', 'mountain-bike', 'Bicicletas para trilhas e montanhas', 4, NOW(), NOW(), 
 ARRAY['mountain bike', 'trilha', 'montanha', 'off-road', 'MTB'],
 'Crie conteúdo sobre mountain bikes, incluindo dicas de trilhas, manutenção e equipamentos necessários para ciclismo off-road'),

('Bike Elétrica', 'bike-eletrica', 'Bicicletas elétricas para todos os tipos de uso', 4, NOW(), NOW(),
 ARRAY['bike elétrica', 'e-bike', 'elétrica', 'bateria', 'motor'],
 'Crie conteúdo sobre bicicletas elétricas, incluindo autonomia, tipos de motor, manutenção e melhores práticas'),

('Bike Feminina', 'bike-feminina', 'Bicicletas desenvolvidas especialmente para mulheres', 4, NOW(), NOW(),
 ARRAY['bike feminina', 'mulher', 'ergonomia', 'conforto', 'design'],
 'Crie conteúdo sobre bicicletas femininas, incluindo ergonomia, conforto, design e dicas específicas para mulheres'),

('Bike Masculina', 'bike-masculina', 'Bicicletas desenvolvidas especialmente para homens', 4, NOW(), NOW(),
 ARRAY['bike masculina', 'homem', 'performance', 'resistência', 'tecnologia'],
 'Crie conteúdo sobre bicicletas masculinas, incluindo performance, resistência, tecnologia e equipamentos'),

('Ergométrica', 'ergometrica', 'Bicicletas ergométricas para exercícios indoor', 4, NOW(), NOW(),
 ARRAY['ergométrica', 'indoor', 'exercício', 'fitness', 'casa'],
 'Crie conteúdo sobre bicicletas ergométricas, incluindo exercícios, benefícios, manutenção e dicas de uso'),

('Speed', 'speed', 'Bicicletas de velocidade e competição', 4, NOW(), NOW(),
 ARRAY['speed', 'velocidade', 'competição', 'aerodinâmica', 'performance'],
 'Crie conteúdo sobre bicicletas speed, incluindo aerodinâmica, performance, competição e equipamentos'),

('Aro 26', 'aro-26', 'Bicicletas com aro 26 polegadas', 4, NOW(), NOW(),
 ARRAY['aro 26', '26 polegadas', 'tamanho', 'rodas', 'diâmetro'],
 'Crie conteúdo sobre bicicletas aro 26, incluindo vantagens, desvantagens, tipos e recomendações'),

('Marcas', 'marcas', 'Análises e comparações de marcas de bicicletas', 4, NOW(), NOW(),
 ARRAY['marcas', 'caloi', 'oggi', 'trek', 'specialized', 'giant'],
 'Crie conteúdo sobre marcas de bicicletas, incluindo análises, comparações, história e recomendações');

-- 2. Verificar se as categorias foram criadas
SELECT 'Categorias criadas para CicloePonto:' as info, COUNT(*) as total FROM "Category" WHERE "blogId" = 4;

-- 3. Listar as categorias criadas
SELECT id, title, slug, description, "aiKeywords" FROM "Category" WHERE "blogId" = 4 ORDER BY title;

-- 4. Verificar se o blog CicloePonto existe
SELECT id, name, slug FROM "Blog" WHERE id = 4;
