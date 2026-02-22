import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import PWAProvider from '@/components/pwa/PWAProvider'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

// Dynamic import for client component with SSR disabled
const Sidebar = dynamic(() => import('@/components/Sidebar'), { 
  ssr: false,
  loading: () => <div className="hidden md:flex md:w-64" /> 
})

export const metadata: Metadata = {
  title: 'Abdullah Junior | AI Chief of Staff',
  description: 'Your AI-powered Digital Employee - Automate emails, tasks, social media, and scheduling',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Abdullah Junior',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Abdullah Junior" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased relative")}>
        {/* Global Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.015] mix-blend-overlay">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex min-h-screen">
              {/* Sidebar */}
              <Sidebar />

              {/* Main content area */}
              <main className="flex-1 overflow-auto min-w-0">
                <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
                  {children}
                </div>
              </main>
            </div>

            <PWAProvider />
            <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
