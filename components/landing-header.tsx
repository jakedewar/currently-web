"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Waves } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingHeader() {
  return (
    <header className="border-b border-slate-200 dark:border-charcoal-700 sticky top-0 z-50 bg-white/80 dark:bg-charcoal-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Waves className="h-7 w-7 text-blue-600 dark:text-blue-600" />
          <span className="text-xl font-semibold text-slate-900 dark:text-white">Currently</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#problem"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Problem
          </a>
          <a
            href="#solution"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Solution
          </a>
          <Link
            href="/pricing"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            asChild
          >
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 dark:border-charcoal-600 dark:text-slate-300 dark:hover:text-white dark:hover:bg-charcoal-800 bg-transparent"
            asChild
          >
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
