import { useState } from 'react'
import { AlertCircle, Image as ImageIcon } from 'lucide-react'
import { BlogImageManager } from '@/utils/blogImageConfig'

interface ImagePreviewProps {
  imageUrl: string
  alt?: string
  className?: string
  showDebugInfo?: boolean
  blogId: number
}

export function ImagePreview({ 
  imageUrl, 
  alt = "Preview", 
  className = "w-full h-32 object-cover rounded border",
  showDebugInfo = false,
  blogId
}: ImagePreviewProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Inicializa o gerenciador de imagens do blog
  const imageManager = new BlogImageManager(blogId)
  const processedUrl = imageManager.processImageUrl(imageUrl)
  const debugInfo = imageManager.getDebugInfo(imageUrl)

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    console.warn('Erro ao carregar imagem:', debugInfo)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    console.log('Imagem carregada com sucesso:', debugInfo)
  }

  if (hasError) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 ${className}`}>
        <AlertCircle className="h-8 w-8 mb-2" />
        <span className="text-sm font-medium">Imagem não encontrada</span>
        <span className="text-xs text-center mt-1">
          O arquivo não existe no servidor atual
        </span>
        {showDebugInfo && (
          <div className="mt-3 text-xs text-gray-400 text-center bg-gray-50 p-2 rounded">
            <div><strong>Blog:</strong> {debugInfo.blogConfig.blogName} (ID: {debugInfo.blogConfig.blogId})</div>
            <div><strong>Caminho original:</strong> {imageUrl}</div>
            <div><strong>URL processada:</strong> {processedUrl}</div>
            <div><strong>Base Path:</strong> {debugInfo.blogConfig.basePath}</div>
            {debugInfo.externalAssetsPath && (
              <div><strong>External Assets Path:</strong> {debugInfo.externalAssetsPath}</div>
            )}
            {debugInfo.isExternalAsset && debugInfo.fullPath && (
              <div><strong>Caminho absoluto completo:</strong> {debugInfo.fullPath}</div>
            )}
            <div><strong>Blog Externo:</strong> {debugInfo.isExternalBlog ? 'Sim' : 'Não'}</div>
            {debugInfo.isExternalAsset && (
              <div><strong>Tipo:</strong> Asset externo (servido via API)</div>
            )}
            <div className="mt-2 text-red-500">
              <strong>Possíveis soluções:</strong>
              <br />• {debugInfo.isExternalBlog ? 'Copie a imagem do projeto externo' : 'Verifique se o arquivo existe no projeto'}
              {debugInfo.isExternalAsset && (
                <>
                  <br />• Verifique se o arquivo existe em: {debugInfo.fullPath}
                  <br />• Verifique se a rota de API está funcionando: {processedUrl}
                </>
              )}
              <br />• Use uma URL externa permitida: {debugInfo.blogConfig.allowedExternalDomains.join(', ')}
              <br />• Verifique as permissões de acesso ao diretório
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-100 border border-gray-300 rounded flex items-center justify-center ${className}`}>
          <div className="flex flex-col items-center">
            <ImageIcon className="h-6 w-6 animate-pulse mb-2" />
            <span className="text-sm text-gray-500">Carregando...</span>
          </div>
        </div>
      )}
      
      <img
        src={processedUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
      
      {showDebugInfo && !isLoading && !hasError && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div><strong>Blog:</strong> {debugInfo.blogConfig.blogName}</div>
          <div><strong>Caminho original:</strong> {imageUrl}</div>
          <div><strong>URL processada:</strong> {processedUrl}</div>
          {debugInfo.isExternalAsset && debugInfo.fullPath && (
            <div><strong>Caminho absoluto:</strong> {debugInfo.fullPath}</div>
          )}
          <div><strong>Domínios permitidos:</strong> {debugInfo.blogConfig.allowedExternalDomains.join(', ')}</div>
        </div>
      )}
    </div>
  )
}
