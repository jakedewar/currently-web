import { NextResponse } from 'next/server'
import getMetadata from 'metadata-scraper'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Only allow HTTP/HTTPS URLs
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP and HTTPS URLs are supported' }, { status: 400 })
    }

    // Set a timeout for the metadata fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const metadata = await getMetadata(url, {
        timeout: 8000, // 8 second timeout for the library
      })
      
      clearTimeout(timeoutId)
      
      const hostname = parsedUrl.hostname
      
      return NextResponse.json({
        success: true,
        metadata: {
          title: metadata.title || '',
          description: metadata.description || '',
          image: metadata.image || '',
          siteName: metadata.provider || hostname,
          favicon: metadata.icon || `https://${hostname}/favicon.ico`,
        }
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 })
      }
      
      throw fetchError
    }
  } catch (error) {
    console.error('Error fetching URL metadata:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json({ error: 'Unable to reach the URL' }, { status: 400 })
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to fetch URL metadata' }, { status: 500 })
  }
}
