"use client"

//import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Waves, Zap, Brain, Chrome, Clock, Sparkles, Sailboat } from "lucide-react"
import { FloatingElement } from "@/components/floating-element"
import { ProductDemo } from "@/components/product-demo"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const { toast } = useToast()

  const handleDiscountClick = () => {
    toast({
      title: "🎉 Special Discount Unlocked!",
      description: "You found our hidden treasure! Use code SAILBOAT10 for 10% off your first year of Currently Pro.",
      className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400",
      action: (
        <Button
          variant="outline"
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
          onClick={() => {
            navigator.clipboard.writeText("SAILBOAT10")
            toast({
              title: "Code Copied!",
              description: "SAILBOAT10 has been copied to your clipboard.",
              className: "bg-blue-500 text-white border-blue-400",
            })
          }}
        >
          Copy Code
        </Button>
      ),
    })
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Waves className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold text-foreground">Currently</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#problem"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Problem
            </a>
            <a
              href="#solution"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Solution
            </a>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4x">
          <Badge
            variant="secondary"
            className="mb-6"
          >
            <Sparkles className="h-3 w-3 mr-2" />
            New • Smart Context for Teams
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Stop losing work in the chaos
            <br />
            of 89 different tools
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Currently organizes everything your team needs - from that crucial Slack thread to the final design file - so you can focus on building instead of hunting. Teams save 2.5 hours daily and ship 40% faster.
          </p>

          {/* Key Metrics */}
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="text-center">
              <div className="font-semibold text-primary">100+</div>
              <div className="text-muted-foreground">Active Streams</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">4</div>
              <div className="text-muted-foreground">Tool Integrations</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">40%</div>
              <div className="text-muted-foreground">Less Context Switching</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Button
              size="lg"
              asChild
            >
              <Link href="/auth/sign-up">
                <Waves className="h-4 w-4 mr-2" />
                Try Currently
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
            >
              Book Demo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Trusted by teams at Klaviyo
          </p>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative h-16 overflow-hidden">
        {/* Background wave layer */}
        <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
          <path
            d="M0,65 C200,15 400,95 600,65 C800,35 1000,95 1200,65 L1200,120 L0,120 Z"
            className="fill-muted/20"
          >
            <animate
              attributeName="d"
              values="M0,65 C200,15 400,95 600,65 C800,35 1000,95 1200,65 L1200,120 L0,120 Z;
                    M0,65 C200,95 400,15 600,65 C800,95 1000,15 1200,65 L1200,120 L0,120 Z;
                    M0,65 C200,15 400,95 600,65 C800,35 1000,95 1200,65 L1200,120 L0,120 Z"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Main wave layer */}
        <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
          <path
            d="M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z"
            className="fill-muted/50"
          >
            <animate
              attributeName="d"
              values="M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z;
                    M0,60 C300,110 600,10 900,60 C1050,90 1150,20 1200,60 L1200,120 L0,120 Z;
                    M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Floating Element */}
        <FloatingElement
          animationType="sail"
          animationDuration="180s"
          delay="0s"
          className="top-6"
          onDiscountClick={handleDiscountClick}
        >
          <Sailboat className="w-3 h-3 text-primary/80" />
        </FloatingElement>
      </div>

      {/* Problem Statement */}
      <section id="problem" className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The hidden cost of tool overload</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every time you switch between Slack, Notion, Figma, and Jira, you lose focus. Every time you can&apos;t find that important conversation or design file, you waste time. This isn&apos;t just annoying - it&apos;s costing your team hours of productive work every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">89</div>
              <div className="font-medium text-foreground mb-2">Average apps per organization</div>
              <div className="text-sm text-muted-foreground">
                <a
                  href="https://www.okta.com/businesses-at-work/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline transition-colors"
                >
                  Okta Businesses @ Work Report 2024
                </a>
              </div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">40%</div>
              <div className="font-medium text-foreground mb-2">
                Productivity loss from context switching
              </div>
              <div className="text-sm text-muted-foreground">
                <a
                  href="https://www.researchgate.net/publication/318570356_The_Cost_of_Interrupted_Work_More_Speed_and_Stress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline transition-colors"
                >
                  University of California Study
                </a>
              </div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">60%</div>
              <div className="font-medium text-foreground mb-2">Of workers struggle to find information</div>
              <div className="text-sm text-muted-foreground">
                <a
                  href="https://www.mckinsey.com/mgi/our-research/productivity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline transition-colors"
                >
                  McKinsey Global Institute
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative h-16 overflow-hidden rotate-180">
        {/* Subtle background wave layer */}
        <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
          <path
            d="M0,70 C200,20 400,100 600,70 C800,40 1000,100 1200,70 L1200,120 L0,120 Z"
            className="fill-muted/30"
          >
            <animate
              attributeName="d"
              values="M0,70 C200,20 400,100 600,70 C800,40 1000,100 1200,70 L1200,120 L0,120 Z;
                    M0,70 C200,100 400,20 600,70 C800,100 1000,20 1200,70 L1200,120 L0,120 Z;
                    M0,70 C200,20 400,100 600,70 C800,40 1000,100 1200,70 L1200,120 L0,120 Z"
              dur="7s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Main wave layer */}
        <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
          <path
            d="M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z"
            className="fill-background"
          >
            <animate
              attributeName="d"
              values="M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z;
                    M0,60 C300,110 600,10 900,60 C1050,90 1150,20 1200,60 L1200,120 L0,120 Z;
                    M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* Solution */}
      <section id="solution" className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Product Demo */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                See Currently in action
              </h3>
              <p className="text-muted-foreground">
                Experience how Currently organizes your team&apos;s work into contextual streams
              </p>
            </div>
            <ProductDemo />
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need, exactly when you need it
            </h2>
            <p className="text-lg text-muted-foreground">
              Currently works in the background, automatically organizing your team&apos;s work so you can find anything instantly. No more digging through Slack history or hunting for the right Google Doc. Just focus on building great products.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Never lose track of important work</h3>
                  <p className="text-sm text-muted-foreground">Automatic project organization</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Currently groups everything related to your project - design files, conversations, documents, and tickets - so you can see the full picture at a glance. No more wondering &quot;where did we discuss that feature?&quot;
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Find anything in seconds</h3>
                  <p className="text-sm text-muted-foreground">Instant search across all tools</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Search across Slack, Notion, Figma, and 50+ other tools from one place. Find that crucial conversation, design file, or document without opening 10 different tabs.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pick up where you left off</h3>
                  <p className="text-sm text-muted-foreground">Smart activity tracking</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Instantly return to any work you&apos;ve touched - whether it was yesterday or last week. Currently remembers what you were working on and gets you back to it in one click.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI that actually helps you work</h3>
                  <p className="text-sm text-muted-foreground">Predictive workflow optimization</p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  Coming Soon
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                AI that predicts what you need next, identifies blockers before they happen, and automatically prioritizes your work based on deadlines and team velocity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative h-16 overflow-hidden">
        {/* Subtle background wave layer */}
        <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
          <path
            d="M0,70 C200,20 400,100 600,70 C800,40 1000,100 1200,70 L1200,120 L0,120 Z"
            className="fill-muted/30"
          >
            <animate
              attributeName="d"
              values="M0,70 C200,20 400,100 600,70 C800,40 1000,100 1200,70 L1200,120 L0,120 Z;
                    M0,70 C200,100 400,20 600,70 C800,100 1000,20 1200,70 L1200,120 L0,120 Z;
                    M0,70 C200,20 400,100 600,70 C800,40 1000,100 1200,70 L1200,120 L0,120 Z"
              dur="9s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Main wave layer */}
        <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
          <path
            d="M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z"
            className="fill-background"
          >
            <animate
              attributeName="d"
              values="M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z;
                    M0,60 C300,110 600,10 900,60 C1050,90 1150,20 1200,60 L1200,120 L0,120 Z;
                    M0,60 C300,10 600,110 900,60 C1050,20 1150,90 1200,60 L1200,120 L0,120 Z"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Currently
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  How does Currently save me time?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Currently eliminates the daily hunt for information by automatically organizing everything your team needs. Instead of searching through Slack history, digging through Google Drive, or asking teammates &quot;where did we discuss that feature?&quot;, everything is organized and searchable in one place. Teams typically save 2.5 hours daily.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  What tools does Currently work with?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Currently works with the tools you already use: Google Docs, Notion, Figma, Slack, Jira, Linear, and 50+ other popular tools. It automatically detects when you&apos;re working in these tools and organizes the content so you can find anything instantly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  Is my data secure?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Yes, your data security is our top priority. Currently processes data locally in your browser and only syncs encrypted metadata to our servers. We never store the actual content of your documents or conversations - just enough information to help you find what you need.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  How much does Currently cost?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Start free with up to 5 users - no credit card required. Pro plans start at $12/month per user for unlimited projects and advanced features. Enterprise plans are available for larger teams with custom pricing and dedicated support.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  Can I try Currently before buying?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Absolutely! You can start using Currently for free with up to 5 users. No credit card required. The free plan includes core features like automatic project organization and search across all your tools. You can upgrade to Pro anytime to unlock advanced features.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#1a1a1d] text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Stop losing 2.5 hours every day to tool chaos</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join 2,400+ teams who&apos;ve eliminated the daily hunt for information and can finally focus on building great products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="default"
              asChild
            >
              <Link href="/auth/sign-up">
                <Chrome className="h-4 w-4 mr-2" />
                Start Free Trial
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/20 bg-inherit text-white hover:bg-white hover:text-primary"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Waves className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Currently</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
              <a href="#" className="hover:text-foreground">
                Security
              </a>
              <a href="mailto:investors@currently.com" className="hover:text-foreground">
                Investors
              </a>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
