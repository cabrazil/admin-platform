import { ImagePreview } from './ImagePreview'

// Exemplo de uso do componente ImagePreview
export function ImagePreviewExample() {
  const examples = [
    {
      title: "URL Externa",
      imageUrl: "https://via.placeholder.com/300x200/0066CC/FFFFFF?text=URL+Externa",
      description: "Imagem de URL externa"
    },
    {
      title: "Caminho Local",
      imageUrl: "images/blog/articles/2025/outubro/imagem_blog_6filmes_1.jpg",
      description: "Imagem local do projeto"
    },
    {
      title: "Caminho com Barra",
      imageUrl: "/images/blog/articles/2025/outubro/imagem_blog_6filmes_1.jpg",
      description: "Imagem local com barra inicial"
    },
    {
      title: "URL Inválida",
      imageUrl: "caminho/inexistente/imagem.jpg",
      description: "Caminho que não existe (mostra erro)"
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Exemplos do ImagePreview</h2>
      
      {examples.map((example, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">{example.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{example.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Preview Padrão:</h4>
              <ImagePreview
                imageUrl={example.imageUrl}
                alt={`Exemplo ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Preview com Debug:</h4>
              <ImagePreview
                imageUrl={example.imageUrl}
                alt={`Exemplo ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
                showDebugInfo={true}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
