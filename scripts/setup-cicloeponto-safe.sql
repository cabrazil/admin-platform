-- Script de Setup do CicloePonto Blog - VERSÃO SEGURA
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Verificar estrutura da tabela Category
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Category'
ORDER BY ordinal_position;

-- PASSO 2: Verificar dados existentes para entender a estrutura
SELECT * FROM "Category" LIMIT 3;

-- PASSO 3: Verificar se blogId existe (pode ser blog_id ou blogId)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'Category'
AND (column_name = 'blogId' OR column_name = 'blog_id' OR column_name = 'blogid');

-- PASSO 4: Se a estrutura estiver correta, execute as inserções abaixo
-- (Descomente as linhas abaixo após verificar a estrutura)

/*
-- Criar Categorias para CicloePonto (blogId=4)
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

-- Verificar se as categorias foram criadas
SELECT 'Categorias criadas para CicloePonto:' as info, COUNT(*) as total FROM "Category" WHERE "blogId" = 4;
*/
