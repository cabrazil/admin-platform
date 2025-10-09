-- Script de Setup do CicloePonto Blog - VERSÃO CORRIGIDA
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela Category primeiro
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Category'
ORDER BY ordinal_position;

-- 2. Criar Categorias para CicloePonto (blogId=4)
-- Baseado na estrutura que você mostrou: [{"idx":0,"id":14,"title":"Análises Emocionais","slug":"analises-emocionais","createdAt":"2025-08-26 00:58:35.538","updatedAt":"2025-08-26 01:02:11.2","description":"Análises profundas sobre como os filmes despertam emoções","imageUrl":null,"parentId":null,"aiKeywords":null,"aiPrompt":null,"blogId":3}]

INSERT INTO "Category" (title, slug, description, "blogId", "createdAt", "updatedAt", "aiKeywords", "aiPrompt") VALUES
('Mountain Bike', 'mountain-bike', 'Bicicletas para trilhas e montanhas', 4, NOW(), NOW(), 
 '["mountain bike", "trilha", "montanha", "off-road", "MTB"]',
 'Crie conteúdo sobre mountain bikes, incluindo dicas de trilhas, manutenção e equipamentos necessários para ciclismo off-road'),

('Bike Elétrica', 'bike-eletrica', 'Bicicletas elétricas para todos os tipos de uso', 4, NOW(), NOW(),
 '["bike elétrica", "e-bike", "elétrica", "bateria", "motor"]',
 'Crie conteúdo sobre bicicletas elétricas, incluindo autonomia, tipos de motor, manutenção e melhores práticas'),

('Bike Feminina', 'bike-feminina', 'Bicicletas desenvolvidas especialmente para mulheres', 4, NOW(), NOW(),
 '["bike feminina", "mulher", "ergonomia", "conforto", "design"]',
 'Crie conteúdo sobre bicicletas femininas, incluindo ergonomia, conforto, design e dicas específicas para mulheres'),

('Bike Masculina', 'bike-masculina', 'Bicicletas desenvolvidas especialmente para homens', 4, NOW(), NOW(),
 '["bike masculina", "homem", "performance", "resistência", "tecnologia"]',
 'Crie conteúdo sobre bicicletas masculinas, incluindo performance, resistência, tecnologia e equipamentos'),

('Ergométrica', 'ergometrica', 'Bicicletas ergométricas para exercícios indoor', 4, NOW(), NOW(),
 '["ergométrica", "indoor", "exercício", "fitness", "casa"]',
 'Crie conteúdo sobre bicicletas ergométricas, incluindo exercícios, benefícios, manutenção e dicas de uso'),

('Speed', 'speed', 'Bicicletas de velocidade e competição', 4, NOW(), NOW(),
 '["speed", "velocidade", "competição", "aerodinâmica", "performance"]',
 'Crie conteúdo sobre bicicletas speed, incluindo aerodinâmica, performance, competição e equipamentos'),

('Aro 26', 'aro-26', 'Bicicletas com aro 26 polegadas', 4, NOW(), NOW(),
 '["aro 26", "26 polegadas", "tamanho", "rodas", "diâmetro"]',
 'Crie conteúdo sobre bicicletas aro 26, incluindo vantagens, desvantagens, tipos e recomendações'),

('Marcas', 'marcas', 'Análises e comparações de marcas de bicicletas', 4, NOW(), NOW(),
 '["marcas", "caloi", "oggi", "trek", "specialized", "giant"]',
 'Crie conteúdo sobre marcas de bicicletas, incluindo análises, comparações, história e recomendações');

-- 3. Verificar se as categorias foram criadas
SELECT 'Categorias criadas para CicloePonto:' as info, COUNT(*) as total FROM "Category" WHERE "blogId" = 4;

-- 4. Listar as categorias criadas
SELECT id, title, slug, description FROM "Category" WHERE "blogId" = 4 ORDER BY title;
