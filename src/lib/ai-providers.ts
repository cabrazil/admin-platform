import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type AIProvider = 'openai' | 'gemini' | 'claude'

export interface GenerationOptions {
  topic: string
  promptContent?: string
  categoryName?: string
  authorName?: string
  provider?: AIProvider
}

export interface GeneratedContent {
  title: string
  description: string
  content: string
  imageDescription: string
  provider: AIProvider
  model: string
}

export interface AIProviderConfig {
  name: string
  description: string
  models: string[]
  isConfigured: boolean
  maxTokens: number
}

// Configurações dos provedores
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    name: 'OpenAI GPT-4',
    description: 'Modelo avançado com excelente compreensão de contexto e criatividade',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    isConfigured: !!process.env.OPENAI_API_KEY,
    maxTokens: 4000
  },
  gemini: {
    name: 'Google Gemini Pro',
    description: 'Modelo do Google com forte capacidade de raciocínio e análise',
    models: ['gemini-pro', 'gemini-pro-vision'],
    isConfigured: !!process.env.GOOGLE_API_KEY,
    maxTokens: 3000
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Modelo especializado em escrita criativa e análise detalhada',
    models: ['claude-3-sonnet', 'claude-3-haiku'],
    isConfigured: !!process.env.ANTHROPIC_API_KEY,
    maxTokens: 4000
  }
}

/**
 * Gerar conteúdo com OpenAI
 */
async function generateWithOpenAI(options: GenerationOptions): Promise<GeneratedContent> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { topic, promptContent, categoryName, authorName } = options

  try {
    if (promptContent) {
      // Usar prompt personalizado
      const htmlInstructions = `

IMPORTANTE: Use HTML válido e bem estruturado para formatação:
- Use <p> para parágrafos
- Use <h2> para subtítulos principais  
- Use <h3> para subtítulos secundários
- Use <ul> e <li> para listas
- Use <strong> para negrito
- Use <em> para itálico
- Use <blockquote> para citações

Certifique-se de que todo o HTML seja válido e bem formatado.`
      
      const finalPrompt = promptContent.replace('{topic}', topic) + htmlInstructions

      const fullContentResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: finalPrompt }],
        max_tokens: 4000,
        temperature: 0.7,
      })

      const fullContent = fullContentResponse.choices[0]?.message?.content?.trim() || `Artigo sobre ${topic}`
      
      const titleMatch = fullContent.match(/<h1.*?>(.*?)<\/h1>/i)
      const title = titleMatch ? titleMatch[1] : `Artigo sobre ${topic}`

      const descriptionMatch = fullContent.match(/<p.*?>(.*?)<\/p>/i)
      const description = descriptionMatch ? descriptionMatch[1] : fullContent.substring(0, 150)

      const content = fullContent.replace(/<h1.*?>.*?<\/h1>/is, '').trim()

      const imageDescription = await generateImageDescriptionWithOpenAI(topic, categoryName)

      return {
        title,
        description,
        content,
        imageDescription,
        provider: 'openai',
        model: 'gpt-4'
      }
    } else {
      // Lógica padrão
      const titlePrompt = `Gere um título conciso e impactante para um artigo sobre ${categoryName || 'tecnologia'} sobre o tema: ${topic}. O título deve ter no máximo 8 palavras, ser atraente e NÃO deve começar com a palavra "Título" ou conter essa palavra em nenhum lugar do texto.`
      
      const titleResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: titlePrompt }],
        max_tokens: 50,
        temperature: 0.7,
      })
      
      const title = titleResponse.choices[0]?.message?.content?.trim() || `Artigo sobre ${topic}`

      const descriptionPrompt = `Gere uma descrição curta e direta (máximo 100 caracteres) para um artigo sobre ${categoryName || 'tecnologia'} sobre o tema: ${topic}. A descrição deve ser impactante.`
      
      const descriptionResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: descriptionPrompt }],
        max_tokens: 50,
        temperature: 0.7,
      })
      
      const description = descriptionResponse.choices[0]?.message?.content?.trim() || `Descrição do artigo sobre ${topic}`

      const contentPrompt = `Escreva um artigo completo sobre ${categoryName || 'tecnologia'} sobre o tema: ${topic}. O título do artigo é: "${title}". A descrição do artigo é: "${description}". 

O artigo deve ser informativo, bem estruturado e fácil de entender. NÃO inclua o título no início do texto. Comece diretamente com a introdução do artigo.

IMPORTANTE: Use HTML válido e bem estruturado para formatação:
- Use <p> para parágrafos
- Use <h2> para subtítulos principais
- Use <h3> para subtítulos secundários
- Use <ul> e <li> para listas
- Use <strong> para negrito
- Use <em> para itálico
- Use <blockquote> para citações

Exemplo de estrutura:
<p>Introdução do artigo...</p>

<h2>Primeiro Subtítulo</h2>
<p>Conteúdo do primeiro subtítulo...</p>

<h3>Subseção</h3>
<p>Conteúdo da subseção...</p>

<h2>Segundo Subtítulo</h2>
<p>Conteúdo do segundo subtítulo...</p>

Certifique-se de que todo o HTML seja válido e bem formatado.`
      
      const contentResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: contentPrompt }],
        max_tokens: 2000,
        temperature: 0.7,
      })
      
      const content = contentResponse.choices[0]?.message?.content?.trim() || `Conteúdo do artigo sobre ${topic}`

      const imageDescription = await generateImageDescriptionWithOpenAI(topic, categoryName)

      return {
        title,
        description,
        content,
        imageDescription,
        provider: 'openai',
        model: 'gpt-4'
      }
    }
  } catch (error) {
    console.error('❌ Erro na geração com OpenAI:', error)
    throw error
  }
}

/**
 * Gerar conteúdo com Google Gemini
 */
async function generateWithGemini(options: GenerationOptions): Promise<GeneratedContent> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  const { topic, promptContent, categoryName, authorName } = options

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    if (promptContent) {
      // Usar prompt personalizado
      const htmlInstructions = `

IMPORTANTE: Use HTML válido e bem estruturado para formatação:
- Use <p> para parágrafos
- Use <h2> para subtítulos principais  
- Use <h3> para subtítulos secundários
- Use <ul> e <li> para listas
- Use <strong> para negrito
- Use <em> para itálico
- Use <blockquote> para citações

Certifique-se de que todo o HTML seja válido e bem formatado.`
      
      const finalPrompt = promptContent.replace('{topic}', topic) + htmlInstructions

      const result = await model.generateContent(finalPrompt)
      const fullContent = result.response.text().trim() || `Artigo sobre ${topic}`
      
      const titleMatch = fullContent.match(/<h1.*?>(.*?)<\/h1>/i)
      const title = titleMatch ? titleMatch[1] : `Artigo sobre ${topic}`

      const descriptionMatch = fullContent.match(/<p.*?>(.*?)<\/p>/i)
      const description = descriptionMatch ? descriptionMatch[1] : fullContent.substring(0, 150)

      const content = fullContent.replace(/<h1.*?>.*?<\/h1>/is, '').trim()

      const imageDescription = await generateImageDescriptionWithGemini(topic, categoryName)

      return {
        title,
        description,
        content,
        imageDescription,
        provider: 'gemini',
        model: 'gemini-pro'
      }
    } else {
      // Lógica padrão
      const titlePrompt = `Gere um título conciso e impactante para um artigo sobre ${categoryName || 'tecnologia'} sobre o tema: ${topic}. O título deve ter no máximo 8 palavras, ser atraente e NÃO deve começar com a palavra "Título".`
      
      const titleResult = await model.generateContent(titlePrompt)
      const title = titleResult.response.text().trim() || `Artigo sobre ${topic}`

      const descriptionPrompt = `Gere uma descrição curta e direta (máximo 100 caracteres) para um artigo sobre ${categoryName || 'tecnologia'} sobre o tema: ${topic}. A descrição deve ser impactante.`
      
      const descriptionResult = await model.generateContent(descriptionPrompt)
      const description = descriptionResult.response.text().trim() || `Descrição do artigo sobre ${topic}`

      const contentPrompt = `Escreva um artigo completo sobre ${categoryName || 'tecnologia'} sobre o tema: ${topic}. O título do artigo é: "${title}". A descrição do artigo é: "${description}". 

O artigo deve ser informativo, bem estruturado e fácil de entender. NÃO inclua o título no início do texto. Comece diretamente com a introdução do artigo.

IMPORTANTE: Use HTML válido e bem estruturado para formatação:
- Use <p> para parágrafos
- Use <h2> para subtítulos principais
- Use <h3> para subtítulos secundários
- Use <ul> e <li> para listas
- Use <strong> para negrito
- Use <em> para itálico
- Use <blockquote> para citações

Certifique-se de que todo o HTML seja válido e bem formatado.`
      
      const contentResult = await model.generateContent(contentPrompt)
      const content = contentResult.response.text().trim() || `Conteúdo do artigo sobre ${topic}`

      const imageDescription = await generateImageDescriptionWithGemini(topic, categoryName)

      return {
        title,
        description,
        content,
        imageDescription,
        provider: 'gemini',
        model: 'gemini-pro'
      }
    }
  } catch (error) {
    console.error('❌ Erro na geração com Gemini:', error)
    throw error
  }
}

/**
 * Gerar conteúdo com Claude (Anthropic)
 */
async function generateWithClaude(options: GenerationOptions): Promise<GeneratedContent> {
  const { topic, promptContent, categoryName, authorName } = options

  try {
    // Implementação básica - você precisará instalar o SDK da Anthropic
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    
    // Por enquanto, vamos usar um fallback
    console.log('⚠️ Claude não implementado ainda, usando fallback')
    return generateFallbackContent(topic, 'claude', 'claude-3-sonnet')
  } catch (error) {
    console.error('❌ Erro na geração com Claude:', error)
    throw error
  }
}

/**
 * Gerar descrição de imagem com OpenAI
 */
async function generateImageDescriptionWithOpenAI(topic: string, categoryName?: string): Promise<string> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const imagePrompt = `Gere uma descrição curta e específica para uma imagem que represente visualmente o tema: ${topic} em um artigo sobre ${categoryName || 'tecnologia'}. A descrição deve ser focada em elementos visuais relacionados ao tema.`
    
    const imageResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: imagePrompt }],
      max_tokens: 100,
      temperature: 0.7,
    })
    
    return imageResponse.choices[0]?.message?.content?.trim() || `Imagem representativa de ${topic}`
  } catch (error) {
    console.error('❌ Erro ao gerar descrição da imagem com OpenAI:', error)
    return `Imagem representativa de ${topic}`
  }
}

/**
 * Gerar descrição de imagem com Gemini
 */
async function generateImageDescriptionWithGemini(topic: string, categoryName?: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const imagePrompt = `Gere uma descrição curta e específica para uma imagem que represente visualmente o tema: ${topic} em um artigo sobre ${categoryName || 'tecnologia'}. A descrição deve ser focada em elementos visuais relacionados ao tema.`
    
    const result = await model.generateContent(imagePrompt)
    return result.response.text().trim() || `Imagem representativa de ${topic}`
  } catch (error) {
    console.error('❌ Erro ao gerar descrição da imagem com Gemini:', error)
    return `Imagem representativa de ${topic}`
  }
}

/**
 * Conteúdo de fallback quando IA falha
 */
function generateFallbackContent(topic: string, provider: AIProvider = 'openai', model: string = 'fallback'): GeneratedContent {
  const content = `<p>A ${topic} é um tema fascinante que tem despertado o interesse de muitos pesquisadores e entusiastas nos últimos anos. Este artigo visa explorar os principais aspectos relacionados a este assunto, oferecendo uma visão abrangente e atualizada.</p>

<h2>História e Evolução</h2>
<p>Para compreender melhor a ${topic}, é fundamental analisar suas origens e evolução histórica. Desde os primeiros registros até os desenvolvimentos mais recentes, podemos observar uma trajetória marcada por inovações e descobertas significativas.</p>

<h2>Aplicações Práticas</h2>
<p>Um dos aspectos mais importantes da ${topic} é sua aplicação prática no mundo real. Diversos setores têm se beneficiado dos avanços nesta área, resultando em melhorias significativas em processos e produtos.</p>

<h3>Benefícios Principais</h3>
<ul>
<li>Melhoria na eficiência operacional</li>
<li>Redução de custos</li>
<li>Maior precisão nos resultados</li>
<li>Facilitação de processos complexos</li>
</ul>

<h2>Futuro e Desenvolvimentos</h2>
<p>É importante destacar que a ${topic} não é um conceito estático, mas sim um campo em constante evolução. Novas pesquisas e tecnologias continuam expandindo os limites do que é possível, abrindo caminho para futuras descobertas.</p>

<h2>Conclusão</h2>
<p>Em conclusão, a ${topic} representa uma área de conhecimento fundamental para o desenvolvimento tecnológico e científico atual. Seu estudo e aplicação continuam sendo essenciais para enfrentar os desafios do futuro e aproveitar as oportunidades que surgem.</p>`
  
  return {
    title: `Artigo sobre ${topic}`,
    description: `Descrição do artigo sobre ${topic}`,
    content,
    imageDescription: `Imagem representativa de ${topic}`,
    provider,
    model
  }
}

/**
 * Gerar conteúdo com o provedor especificado
 */
export async function generateArticleContent(options: GenerationOptions): Promise<GeneratedContent> {
  const { provider = 'openai' } = options

  try {
    // Verificar se o provedor está configurado
    if (!AI_PROVIDERS[provider].isConfigured) {
      console.warn(`⚠️ ${AI_PROVIDERS[provider].name} não está configurado, usando fallback`)
      return generateFallbackContent(options.topic, provider)
    }

    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(options)
      case 'gemini':
        return await generateWithGemini(options)
      case 'claude':
        return await generateWithClaude(options)
      default:
        throw new Error(`Provedor de IA não suportado: ${provider}`)
    }
  } catch (error) {
    console.error(`❌ Erro na geração com ${provider}:`, error)
    
    // Fallback para conteúdo simulado
    return generateFallbackContent(options.topic, provider)
  }
}

/**
 * Verificar se um provedor está configurado
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  return AI_PROVIDERS[provider].isConfigured
}

/**
 * Obter provedores disponíveis
 */
export function getAvailableProviders(): AIProvider[] {
  return Object.entries(AI_PROVIDERS)
    .filter(([_, config]) => config.isConfigured)
    .map(([provider, _]) => provider as AIProvider)
}

/**
 * Obter configuração de um provedor
 */
export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  return AI_PROVIDERS[provider]
}
