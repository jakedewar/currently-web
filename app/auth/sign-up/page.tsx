import { Waves } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { SignUpForm } from "@/components/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity">
            <Waves className="size-5 text-primary" />
            <span className="text-foreground">Currently</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Create your account
              </h1>
              <p className="text-muted-foreground">
                Join thousands of teams using Currently
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <SignUpForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/50">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <Waves className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Transform how your team works
              </h2>
              <p className="text-muted-foreground">
                Unlock your team&apos;s full potential with intelligent project organization, real-time collaboration, and powerful automation that adapts to your workflow.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Free for up to 5 team members</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Start instantly, no credit card</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Full access for 14 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
