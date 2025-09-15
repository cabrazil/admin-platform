import { useState } from 'react';
import Image from 'next/image';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashImageSearchProps {
  onSelectImage: (imageUrl: string) => void;
  defaultImageUrl?: string;
}

export default function UnsplashImageSearch({ onSelectImage, defaultImageUrl }: UnsplashImageSearchProps) {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(defaultImageUrl || null);

  const searchImages = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao buscar imagens');
      }
      
      const data = await response.json();
      setImages(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar imagens');
      console.error('Erro ao buscar imagens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onSelectImage(imageUrl);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar imagens no Unsplash..."
          className="flex-1 p-2 border border-gray-300 rounded-md"
          onKeyDown={(e) => e.key === 'Enter' && searchImages()}
        />
        <button
          onClick={searchImages}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative h-40 border rounded-md overflow-hidden cursor-pointer ${
                selectedImage === image.urls.regular ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleImageSelect(image.urls.regular)}
            >
              <Image
                src={image.urls.small}
                alt={image.alt_description || 'Imagem do Unsplash'}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Imagem selecionada:</h3>
          <div className="relative h-60 w-full border rounded-md overflow-hidden">
            <Image
              src={selectedImage}
              alt="Imagem selecionada"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
