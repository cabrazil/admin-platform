export default function TestEditPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teste de Página Simples</h1>
      <p>Se você está vendo esta página, o problema não está no Next.js básico.</p>
      <p>Data e hora: {new Date().toLocaleString()}</p>
    </div>
  )
}
