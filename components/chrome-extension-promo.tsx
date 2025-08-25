"use client"

import { Chrome, Download, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ChromeExtensionPromo() {
  const [isVisible, setIsVisible] = useState(true)

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('chrome-extension-dismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  const handleDownload = () => {
    // Replace with actual Chrome Web Store URL
    window.open('https://chrome.google.com/webstore/detail/currently/your-extension-id', '_blank')
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('chrome-extension-dismissed', 'true')
  }

  // Check if user has already dismissed the promo
  if (!isVisible) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Chrome className="w-4 h-4 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground">Chrome Extension</h4>
              <Badge variant="outline" className="text-xs text-primary">
                New
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Install the Currently extension to capture work items directly from your browser
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs"
              >
                <Download className="w-3 h-3" />
                Install
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="h-7 w-7 p-0"
              >
                <X className="w-3 h-3" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
