import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { Toaster } from "@/components/ui/toaster"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, FileSpreadsheet, Award } from 'lucide-react' // Import the Award icon

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Grade 12 Utils',
  description: 'Utilities for NVTC Grade 12 IT students',
  icons: {
    icon: "./designer_6lW_icon.ico",
    apple: "./designer_6lW_icon.ico",
    shortcut: "./designer_6lW_icon.ico"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
                  {/* Exams Button */}
                  <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Link href="https://nasservocational-my.sharepoint.com/:x:/g/personal/mussab_aswad_nvtc_edu_bh/EfVGxHZP6J5Jia0sHIsd0SwBTKKbDtEq4r4SFJ4tullmmA?e=dx9kpT&nav=MTVfe0M2RjJFMEQ4LUI2NTMtMEI0MC1CMDExLTVFRUJDNzYwRjMxQX0" target="_blank" rel="noopener noreferrer">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exams
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="sm:hidden">
                    <Link href="https://nasservocational-my.sharepoint.com/:x:/g/personal/mussab_aswad_nvtc_edu_bh/EfVGxHZP6J5Jia0sHIsd0SwBTKKbDtEq4r4SFJ4tullmmA?e=dx9kpT&nav=MTVfe0M2RjJFMEQ4LUI2NTMtMEI0MC1CMDExLTVFRUJDNzYwRjMxQX0" target="_blank" rel="noopener noreferrer">
                      <FileSpreadsheet className="h-5 w-5" />
                      <span className="sr-only">Exams</span>
                    </Link>
                  </Button>

                  {/* Certification Guide Button */}
                  <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Link href="https://gardo32.github.io/Cloud-Guide/" target="_blank" rel="noopener noreferrer">
                      <Award className="h-4 w-4 mr-2" />
                      Certification Guide
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="sm:hidden">
                    <Link href="https://gardo32.github.io/Cloud-Guide/" target="_blank" rel="noopener noreferrer">
                      <Award className="h-5 w-5" />
                      <span className="sr-only">Certification Guide</span>
                    </Link>
                  </Button>

                  {/* Moodle Button */}
                  <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Link href="https://moodle.nvtc.edu.bh" target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Moodle
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="sm:hidden">
                    <Link href="https://moodle.nvtc.edu.bh" target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-5 w-5" />
                      <span className="sr-only">Moodle</span>
                    </Link>
                  </Button>

                  {/* SIS Button */}
                  <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Link href="https://sis.nvtc.edu.bh" target="_blank" rel="noopener noreferrer">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      SIS
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="sm:hidden">
                    <Link href="https://sis.nvtc.edu.bh" target="_blank" rel="noopener noreferrer">
                      <GraduationCap className="h-5 w-5" />
                      <span className="sr-only">SIS</span>
                    </Link>
                  </Button>

                  {/* Theme Toggle */}
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
