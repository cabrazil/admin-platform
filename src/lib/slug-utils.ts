/**
 * Gera um slug limpo a partir de um texto
 * Remove acentos, caracteres especiais e converte para formato URL-friendly
 */
export function generateSlug(text: string): string {
  // Mapeamento de caracteres acentuados para não acentuados
  const accentMap: { [key: string]: string } = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c',
    'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A', 'Å': 'A',
    'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
    'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
    'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
    'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
    'Ý': 'Y',
    'Ñ': 'N',
    'Ç': 'C'
  };

  return text
    // Converte para minúsculas
    .toLowerCase()
    // Remove aspas e parênteses primeiro
    .replace(/["'()]/g, '')
    // Substitui caracteres acentuados
    .replace(/[áàãâäåéèêëíìîïóòõôöúùûüýÿñç]/g, (match) => accentMap[match] || match)
    // Remove caracteres especiais, mantém apenas letras, números, espaços e hífens
    .replace(/[^a-z0-9\s-]/g, '')
    // Remove espaços extras
    .trim()
    // Substitui espaços por hífens
    .replace(/\s+/g, '-')
    // Remove hífens duplicados
    .replace(/-+/g, '-')
    // Remove hífens no início e fim
    .replace(/^-+|-+$/g, '');
}

/**
 * Gera um slug único verificando se já existe no banco
 */
export async function generateUniqueSlug(
  baseText: string,
  existingSlugs: string[],
  maxAttempts: number = 10
): Promise<string> {
  const baseSlug = generateSlug(baseText);
  
  // Se o slug base não existe, retorna ele
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Tenta adicionar números até encontrar um slug único
  for (let i = 1; i <= maxAttempts; i++) {
    const candidateSlug = `${baseSlug}-${i}`;
    if (!existingSlugs.includes(candidateSlug)) {
      return candidateSlug;
    }
  }
  
  // Se não conseguir em maxAttempts, adiciona timestamp
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
}

/**
 * Valida se um slug é válido
 */
export function isValidSlug(slug: string): boolean {
  // Deve conter apenas letras minúsculas, números e hífens
  // Não pode começar ou terminar com hífen
  // Deve ter pelo menos 1 caractere
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0;
}

/**
 * Função de teste para verificar a geração de slugs
 */
export function testSlugGeneration(): void {
  const testCases = [
    '"Os 12 Macacos" (1995): A Vibe, a Trama e a Análise Emocional do Filme',
    '"1917" (2019): Uma Análise da Tensão, da Vibe e da Técnica do Filme',
    'João & Maria: Ação e Reação!',
    'São Paulo - Cidade Maravilhosa',
    'Ação & Reação: O Filme (2024)',
    'Café com Leite: Uma História Brasileira',
  ];

  console.log('🧪 Testando geração de slugs:');
  testCases.forEach(testCase => {
    const slug = generateSlug(testCase);
    console.log(`"${testCase}" → "${slug}"`);
  });
  
  // Teste específico do problema
  console.log('\n🔍 Teste específico:');
  const problemCase = '"1917" (2019): Uma Análise da Tensão, da Vibe e da Técnica do Filme';
  const result = generateSlug(problemCase);
  console.log(`Problema: "${problemCase}" → "${result}"`);
  console.log('Esperado: 1917-2019-uma-analise-da-tensao-da-vibe-e-da-tecnica-do-filme');
  console.log('Correto:', result === '1917-2019-uma-analise-da-tensao-da-vibe-e-da-tecnica-do-filme');
}
