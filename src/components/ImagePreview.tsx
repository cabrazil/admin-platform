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
    // Debug info available in debugInfo variable if needed
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    // Image loaded successfully
  }

  if (hasError) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 ${className}`}>
        <AlertCircle className="h-8 w-8 mb-2" />
        <span className="text-sm font-medium">Imagem não encontrada</span>
        {showDebugInfo && (
          <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded max-w-full overflow-hidden">
            <div className="truncate"><strong>Original:</strong> {imageUrl}</div>
            <div className="truncate"><strong>Processada:</strong> {processedUrl}</div>
            {debugInfo.fullPath && (
              <div className="truncate"><strong>Caminho:</strong> {debugInfo.fullPath}</div>
            )}
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
          <div className="truncate"><strong>URL:</strong> {processedUrl}</div>
        </div>
      )}
    </div>
  )
}
