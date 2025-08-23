"use client"

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  FileText, 
  Image, 
  Calendar,
  Search,
  Zap
} from 'lucide-react'

export function ProductDemo() {
  return (
    <div className="relative max-w-4xl mx-auto">
      <Card className="p-6 bg-white dark:bg-charcoal-900 border-slate-200 dark:border-charcoal-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Search className="h-4 w-4" />
            <span>Search across all tools...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-charcoal-800 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-sm">Slack conversation</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Design team • 2 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-charcoal-800 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-sm">Product requirements</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Notion • Updated 1 hour ago</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-charcoal-800 rounded-lg">
              <Image className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium text-sm">UI mockups</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Figma • 3 hours ago</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-charcoal-800 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <div className="font-medium text-sm">Project timeline</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Linear • Due in 2 days</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-charcoal-800 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <div className="font-medium text-sm">Quick actions</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Currently AI • Smart suggestions</div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  AI Powered
                </Badge>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Currently automatically organizes your work into contextual streams, so you can find anything instantly.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
            <Link href="/auth/sign-up">Try Currently Free</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
