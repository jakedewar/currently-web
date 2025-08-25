import { NextResponse } from 'next/server'
import getMetadata from 'metadata-scraper'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const metadata = await getMetadata(url)
    const hostname = new URL(url).hostname
    
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
  } catch (error) {
    console.error('Error fetching URL metadata:', error)
    return NextResponse.json({ error: 'Failed to fetch URL metadata' }, { status: 500 })
  }
}
