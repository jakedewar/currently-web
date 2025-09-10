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
import { Waves, Zap, Brain, Clock, Sparkles, Sailboat } from "lucide-react"
import Image from "next/image"
import { FloatingElement } from "@/components/floating-element"
import { ProductDemo } from "@/components/product-demo"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const { toast } = useToast()

  const handleBoatClick = () => {
    toast({
      title: "",
      description: (
        <div className="flex justify-center">
          <Image
            src="/broplease.jpg"
            alt="Bro please use Currently"
            width={350}
            height={250}
            className="rounded-xl shadow-lg border-2 border-white/20"
          />
        </div>
      ),
      className: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800 max-w-sm p-4",
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
            className="mb-6 text-primary"
          >
            <Sparkles className="h-3 w-3 mr-2" />
            New • Team Collaboration & Project Organization
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Stop losing important work
            <br />
            in scattered tools and conversations
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Currently keeps everything your team needs for each project in one place. No more hunting through Slack threads, lost Google Docs, or forgotten tasks. Just organized Streams with all your resources, tasks, and progress in one workspace.
          </p>

          {/* Key Metrics */}
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="text-center">
              <div className="font-semibold text-primary">One Place</div>
              <div className="text-muted-foreground">All Project Resources</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">No More</div>
              <div className="text-muted-foreground">Lost Information</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">Team</div>
              <div className="text-muted-foreground">Always in Sync</div>
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
            Built for modern teams
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
          onBoatClick={handleBoatClick}
        >
          <Sailboat className="w-3 h-3 text-primary/80" />
        </FloatingElement>
      </div>

      {/* Problem Statement */}
      <section id="problem" className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Every team knows this frustration</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              &quot;Where did we discuss that feature?&quot; &quot;What was that important link?&quot; &quot;Who was working on that task?&quot; Important work gets buried in Slack threads, lost in email chains, and scattered across dozens of tools. Teams waste hours every week just trying to find what they need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">2.5 hrs</div>
              <div className="font-medium text-foreground mb-2">Lost Per Day</div>
              <div className="text-sm text-muted-foreground">
                Teams spend hours searching for information that should be easy to find
              </div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">89</div>
              <div className="font-medium text-foreground mb-2">
                Apps Per Team
              </div>
              <div className="text-sm text-muted-foreground">
                Information scattered across dozens of tools makes collaboration chaotic
              </div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">60%</div>
              <div className="font-medium text-foreground mb-2">Can&apos;t Find Info</div>
              <div className="text-sm text-muted-foreground">
                Most workers struggle to locate the information they need to do their job
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
              Everything your team needs, organized in Streams
            </h2>
            <p className="text-lg text-muted-foreground">
              Stop the chaos. Currently organizes every project into a Stream with all related resources, tasks, and conversations in one place. No more hunting through tools or asking &quot;where did we put that?&quot;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Never lose important work again</h3>
                  <p className="text-sm text-muted-foreground">Everything in one Stream</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Every project gets its own Stream with all related resources, tasks, and progress. No more &quot;where did we put that document?&quot; or &quot;what was that important link?&quot; Everything is organized and easy to find.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Save 2.5 hours every day</h3>
                  <p className="text-sm text-muted-foreground">Stop searching, start building</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                No more hunting through Slack threads or digging through Google Drive. Add URLs, documents, and tasks to your Streams. Everything you need is organized and searchable in one place.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Keep your team in sync</h3>
                  <p className="text-sm text-muted-foreground">Everyone knows what&apos;s happening</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Invite team members to Streams and work together seamlessly. Everyone can see progress, access resources, and stay updated. No more &quot;did you see that message?&quot; or &quot;where are we on this?&quot;
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Works everywhere you do</h3>
                  <p className="text-sm text-muted-foreground">Chrome extension included</p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  Available
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Access your Streams directly from your browser. Found an important link? Add it to your Stream instantly. No context switching, no lost information. Work flows naturally.
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
                  How does Currently help my team?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Currently helps teams organize their work into Streams, manage resources and tasks, and collaborate more effectively. By providing a structured way to organize projects and share resources, teams can stay organized and work together more efficiently.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  What features does Currently offer?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Currently offers Stream-based project organization, resource and task management, team collaboration tools, organization management, and a Chrome extension for browser-based access. It&apos;s designed to help teams organize projects and collaborate effectively.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  Is my data secure?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Yes, your data security is our top priority. Currently uses industry-standard encryption and security practices. Your data is stored securely with Supabase, and we follow GDPR compliance standards. Your project and collaboration data belongs to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  How much does Currently cost?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Currently is currently in development and available for free. We&apos;re building the platform and gathering feedback from early users. Pricing plans will be announced as we approach our official launch.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  How do I get started with Currently?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Getting started is easy! Sign up for a free account, create your first organization, and start creating Streams to organize your team&apos;s work. You can also install the Chrome extension for browser-based access to your streams. No credit card required.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#1a1a1d] text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Stop losing important work. Start using Streams.</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join teams who have eliminated the daily hunt for information and can finally focus on building great products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="default"
              asChild
            >
              <Link href="/auth/sign-up">
                <Waves className="h-4 w-4 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/20 bg-inherit text-white hover:bg-white hover:text-primary"
            >
              Learn More
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70 mt-4">No credit card required • Free to use</p>
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
