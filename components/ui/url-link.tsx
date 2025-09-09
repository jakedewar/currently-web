import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UrlLinkProps {
  url: string
  className?: string
  maxLength?: number
}

export function UrlLink({ url, className, maxLength = 30 }: UrlLinkProps) {
  const truncateUrl = (url: string, maxLength: number) => {
    if (url.length <= maxLength) return url
    
    // Remove protocol for display
    const withoutProtocol = url.replace(/^https?:\/\//, '')
    
    if (withoutProtocol.length <= maxLength) return withoutProtocol
    
    // Truncate and add ellipsis
    return withoutProtocol.substring(0, maxLength - 3) + '...'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click events
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors",
        className
      )}
      title={url}
    >
      <span className="truncate">{truncateUrl(url, maxLength)}</span>
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </button>
  )
}
