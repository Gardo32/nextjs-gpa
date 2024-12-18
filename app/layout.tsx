'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { SessionProvider, useSession } from './SessionContext'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Settings } from '@/components/Settings'

const inter = Inter({ subsets: ['latin'] })

function Header() {
  const { session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (session) {
      const fetchUserRole = async () => {
        const nvNumber = session.user.email.split('@')[0]
        const { data } = await supabase
          .from('user_specialties')
          .select('Role')
          .eq('nv_number', nvNumber)
          .single()
        setIsAdmin(data?.Role === 'admin')
      }
      fetchUserRole()
    }
  }, [session, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const renderAdminButton = () => {
    if (!session || !isAdmin) return null
    
    if (pathname === '/dashboard') {
      return (
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      )
    }
    
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    )
  }

  return (
    <header className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">G12 Utils</h1>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {renderAdminButton()}
          {session ? (
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
          <Settings />
        </div>
      </div>
    </header>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}