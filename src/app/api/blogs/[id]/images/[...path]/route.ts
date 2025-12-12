import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { BLOG_IMAGE_CONFIGS } from '@/utils/blogImageConfig'

/**
 * Rota para servir imagens de diretórios externos
 * Exemplo: /api/blogs/3/images/blog/articles/2025/outubro/imagem.jpg
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const { id, path: pathSegments } = await params
    const blogId = parseInt(id)

    if (isNaN(blogId)) {
      return NextResponse.json(
        { error: 'ID do blog inválido' },
        { status: 400 }
      )
    }

    // Verifica se o blog tem configuração de assets externos
    const blogConfig = BLOG_IMAGE_CONFIGS[blogId]
    if (!blogConfig || !blogConfig.externalAssetsPath) {
      return NextResponse.json(
        { error: 'Blog não configurado para assets externos' },
        { status: 404 }
      )
    }

    // Reconstrói o caminho relativo da imagem
    // pathSegments já vem decodificado pelo Next.js
    const imagePath = pathSegments.join('/')

    // Monta o caminho absoluto completo
    const fullPath = path.join(blogConfig.externalAssetsPath, imagePath)

    // Validação de segurança: garante que o caminho está dentro do diretório permitido
    const normalizedFullPath = path.normalize(fullPath)
    const normalizedBasePath = path.normalize(blogConfig.externalAssetsPath)

    if (!normalizedFullPath.startsWith(normalizedBasePath)) {
      return NextResponse.json(
        { error: 'Caminho inválido' },
        { status: 403 }
      )
    }

    // Verifica se o arquivo existe
    if (!existsSync(normalizedFullPath)) {
      return NextResponse.json(
        {
          error: 'Imagem não encontrada',
          path: normalizedFullPath,
          exists: false
        },
        { status: 404 }
      )
    }

    // Lê o arquivo
    const fileBuffer = await readFile(normalizedFullPath)

    // Determina o tipo MIME baseado na extensão
    const ext = path.extname(normalizedFullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    // Retorna a imagem com os headers apropriados
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erro ao servir imagem:', error)
    return NextResponse.json(
      { error: 'Erro ao processar imagem' },
      { status: 500 }
    )
  }
}

