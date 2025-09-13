'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Copy, RefreshCw, Smartphone, CircleCheck } from 'lucide-react'

interface DeviceLinkCode {
  code: string
  expires_at: string
}

export function DeviceLinkGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [linkCode, setLinkCode] = useState<DeviceLinkCode | null>(null)
  const { toast } = useToast()

  const generateCode = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/device-link/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate device link code')
      }

      const data = await response.json()
      setLinkCode(data)
      
      toast({
        title: "Device link code generated",
        description: "Use this code in your Chrome extension to connect your account",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyCode = async () => {
    if (!linkCode) return
    
    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(linkCode.code)
      toast({
        title: "Code copied",
        description: "Device link code copied to clipboard",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      })
    } finally {
      setIsCopying(false)
    }
  }

  const isExpired = linkCode ? new Date(linkCode.expires_at) < new Date() : false
  const timeRemaining = linkCode && !isExpired 
    ? Math.max(0, Math.floor((new Date(linkCode.expires_at).getTime() - Date.now()) / 1000))
    : 0

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Connect Chrome Extension
        </CardTitle>
        <CardDescription>
          Generate a code to link your Chrome extension to your Currently account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!linkCode ? (
          <Button 
            onClick={generateCode} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Link Code'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-code">Device Link Code</Label>
              <div className="flex gap-2">
                <Input
                  id="link-code"
                  value={linkCode.code}
                  readOnly
                  className="font-mono text-center text-lg tracking-wider"
                />
                <Button
                  onClick={copyCode}
                  disabled={isCopying}
                  size="sm"
                  variant="outline"
                >
                  {isCopying ? (
                    <CircleCheck className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="secondary">
                    Expires in {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
              </div>
              <Button
                onClick={generateCode}
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                {isGenerating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Open your Currently Chrome extension</p>
              <p>2. Enter this code in the extension</p>
              <p>3. Your extension will be connected to your account</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
