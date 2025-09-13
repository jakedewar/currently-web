'use client'

import { useEffect, useState, memo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { Link } from 'lucide-react'

// Simple in-memory cache for URL metadata
const metadataCache = new Map<string, { data: URLMetadata; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface URLPreviewProps {
  url: string
}

interface URLMetadata {
  title: string
  description: string
  image: string
  siteName: string
  favicon: string
  icon?: string
  docType?: string
}

export const URLPreview = memo(function URLPreview({ url }: URLPreviewProps) {
  const [metadata, setMetadata] = useState<URLMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Validate URL before making request
        try {
          new URL(url)
        } catch {
          setError('Invalid URL format')
          setLoading(false)
          return
        }

        // Check cache first
        const cached = metadataCache.get(url)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setMetadata(cached.data)
          setError(null)
          setLoading(false)
          return
        }

        const response = await fetch(`/api/url-preview?url=${encodeURIComponent(url)}`)
        const data = await response.json()

        if (!response.ok) {
          // Don't retry for authentication errors (401, 403) or client errors (400)
          if (response.status === 401 || response.status === 403 || response.status === 400) {
            setError(data.error || 'Failed to fetch URL preview')
            setMetadata(null)
            setLoading(false)
            return
          }
          
          // Retry for server errors and timeouts only
          if (retryCount < 2 && (response.status >= 500 || response.status === 408)) {
            setRetryCount(prev => prev + 1)
            // Wait before retrying (exponential backoff)
            setTimeout(() => {
              fetchMetadata()
            }, Math.pow(2, retryCount) * 1000)
            return
          }
          
          setError(data.error || 'Failed to fetch URL preview')
          setMetadata(null)
          setLoading(false)
          return
        }

        // Cache the successful result
        metadataCache.set(url, { data: data.metadata, timestamp: Date.now() })
        
        setMetadata(data.metadata)
        setError(null)
        setRetryCount(0) // Reset retry count on success
      } catch (err) {
        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.warn('URL preview failed for:', url, err)
        }
        setError(err instanceof Error ? err.message : 'Failed to load preview')
        setMetadata(null)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if URL is valid and not empty
    if (url && url.trim()) {
      setRetryCount(0) // Reset retry count for new URL
      fetchMetadata()
    } else {
      setLoading(false)
      setError('No URL provided')
    }
  }, [url, retryCount])

  if (loading) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error || !metadata) {
    // Show a simple fallback for failed URL previews
    return (
      <div className="group">
        <div className="overflow-hidden rounded-md border border-dashed border-muted-foreground/20 hover:bg-muted/30 transition-colors">
          <div className="flex gap-4 py-3">
            {/* Left side - Fallback icon */}
            <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-muted/20 flex items-center justify-center">
              <Link className="h-5 w-5 text-muted-foreground/60" />
            </div>

            {/* Right side - Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Link Preview
                  </span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group-hover:underline"
                >
                  <h4 className="text-sm font-medium line-clamp-1 text-blue-600 dark:text-blue-400">
                    {url}
                  </h4>
                </a>
                <p className="text-xs text-muted-foreground/60">
                  Preview unavailable - click to visit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      <div className="overflow-hidden rounded-md hover:bg-muted/30 transition-colors">
        <div className="flex gap-4 py-3">
          {/* Left side - Image/Logo */}
          <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-background">
            {metadata.image ? (
              <Image
                src={metadata.image}
                alt={metadata.title}
                fill
                className="object-cover"
                onError={(e) => {
                  // On error, show favicon instead
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const favicon = target.parentElement?.querySelector('.favicon') as HTMLElement;
                  if (favicon) favicon.style.display = 'block';
                }}
              />
            ) : metadata.icon ? (
              // Show emoji icon for Google Workspace documents
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <span className="text-2xl">{metadata.icon}</span>
              </div>
            ) : metadata.favicon ? (
              <Image
                src={metadata.favicon}
                alt=""
                fill
                className="favicon p-2"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <span className="text-lg font-medium text-primary/40">
                  {metadata.siteName?.[0]?.toUpperCase() || 'L'}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {metadata.siteName}
                </span>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group-hover:underline"
              >
                <h4 className="text-sm font-medium line-clamp-1">
                  {metadata.title}
                </h4>
              </a>
              {metadata.description && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
