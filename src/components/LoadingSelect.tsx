import { Loader2 } from 'lucide-react'

interface LoadingSelectProps {
  children: React.ReactNode
  isLoading: boolean
  loadingText?: string
  className?: string
}

export function LoadingSelect({ 
  children, 
  isLoading, 
  loadingText = "Carregando...",
  className = ""
}: LoadingSelectProps) {
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <select 
          disabled 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        >
          <option value="">{loadingText}</option>
        </select>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
