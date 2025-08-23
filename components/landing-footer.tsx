import { Waves } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="py-8 px-4 bg-white dark:bg-charcoal-950 border-t border-slate-200 dark:border-charcoal-700">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Waves className="h-5 w-5 text-blue-600 dark:text-blue-600" />
            <span className="font-semibold text-slate-900 dark:text-white">Currently</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              Security
            </a>
            <a href="mailto:investors@currently.com" className="hover:text-slate-900 dark:hover:text-white">
              Investors
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
