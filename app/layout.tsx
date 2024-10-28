'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { Toaster } from "@/components/ui/toaster"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, FileSpreadsheet, Award, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <header className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl font-bold">G12 Utils</h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {session ? (
                    <>
                      {/* Existing buttons */}
                      <Button onClick={handleSignOut} variant="ghost" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/auth">Sign In</Link>
                    </Button>
                  )}
                  <ModeToggle />
                </div>
              </div>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}