'use client'

import { useEffect, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

interface URLPreviewProps {
  url: string
}

interface URLMetadata {
  title: string
  description: string
  image: string
  siteName: string
  favicon: string
}

export function URLPreview({ url }: URLPreviewProps) {
  const [metadata, setMetadata] = useState<URLMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/url-preview?url=${encodeURIComponent(url)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch URL preview')
        }

        setMetadata(data.metadata)
        setError(null)
      } catch (err) {
        console.error('Error fetching URL preview:', err)
        setError(err instanceof Error ? err.message : 'Failed to load preview')
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [url])

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
    return null
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
}
