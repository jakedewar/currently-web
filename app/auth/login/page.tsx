import { Waves } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
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
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your Currently account
              </p>
            </div>
            <LoginForm />
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
                Your work, organized and accessible
              </h2>
              <p className="text-muted-foreground">
                Pick up exactly where you left off. Currently keeps your projects, documents, and team collaboration seamlessly connected across all your tools.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>2,400+ teams trust Currently daily</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Save 2.5 hours every day</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>50+ seamless integrations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
