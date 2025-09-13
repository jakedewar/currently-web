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

    // Handle Google Workspace URLs with hard-coded metadata
    const hostname = parsedUrl.hostname.toLowerCase()
    const pathname = parsedUrl.pathname.toLowerCase()
    
    if (hostname.includes('docs.google.com') || hostname.includes('sheets.google.com') || 
        hostname.includes('drive.google.com') || hostname.includes('slides.google.com')) {
      
      // Extract document type and ID from URL
      let docType = 'Document'
      let icon = '📄'
      
      if (hostname.includes('sheets.google.com') || pathname.includes('/spreadsheets/')) {
        docType = 'Spreadsheet'
        icon = '📊'
      } else if (hostname.includes('slides.google.com') || pathname.includes('/presentation/')) {
        docType = 'Presentation'
        icon = '📽️'
      } else if (hostname.includes('drive.google.com')) {
        docType = 'File'
        icon = '📁'
      }
      
      // Try to extract document name from URL parameters
      const urlParams = parsedUrl.searchParams
      const title = urlParams.get('title') || `Google ${docType}`
      
      return NextResponse.json({
        success: true,
        metadata: {
          title: title,
          description: `Google ${docType} - Click to open in Google Workspace`,
          image: '',
          siteName: 'Google Workspace',
          favicon: 'https://www.google.com/favicon.ico',
          icon: icon,
          docType: docType
        }
      })
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
    // Only log detailed errors in development and for non-401 errors
    if (process.env.NODE_ENV === 'development' && 
        !(error instanceof Error && error.message.includes('401'))) {
      console.error('Error fetching URL metadata for:', url, error)
    }
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json({ 
          error: 'Authentication required',
          details: 'This URL requires authentication to access'
        }, { status: 403 })
      }
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json({ 
          error: 'Unable to reach the URL',
          details: 'The website may be down or the URL is incorrect'
        }, { status: 400 })
      }
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json({ 
          error: 'Request timeout',
          details: 'The website took too long to respond'
        }, { status: 408 })
      }
      if (error.message.includes('CERT_HAS_EXPIRED') || error.message.includes('SSL')) {
        return NextResponse.json({ 
          error: 'SSL certificate error',
          details: 'The website has an invalid SSL certificate'
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch URL metadata',
      details: 'Unable to retrieve preview information for this URL'
    }, { status: 500 })
  }
}
