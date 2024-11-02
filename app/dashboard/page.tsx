'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import GPACalculator from '@/components/GPACalculator'
import Timetable from '@/components/Timetable'
import Pearson from '@/components/Pearson'
import QuizAssignmentCalendar from '@/components/QuizAssignmentCalendar'
import { useSession } from '@/app/SessionContext'

export default function Dashboard() {
  const { session, loading: sessionLoading } = useSession()
  const [nvNumber, setNvNumber] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      if (!session) {
        router.push('/auth')
      } else {
        const nvNumber = session.user.email.split('@')[0]
        setNvNumber(nvNumber)

        const { data, error } = await supabase
          .from('user_specialties')
          .select('specialty')
          .eq('nv_number', nvNumber)

        if (error) {
          console.error('Error fetching specialty:', error)
        } else if (!data || data.length === 0) {
          router.push('/select-specialty')
        }
      }
    }

    checkSession()
  }, [session, router, supabase])

  if (sessionLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hello {nvNumber} 👋</h1>
      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
          <TabsTrigger value="pearson">Pearson Tracker</TabsTrigger>
          <TabsTrigger value="calendar">Quiz & Assignment Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="timetable" className="mt-6">
          <Timetable />
        </TabsContent>
        <TabsContent value="gpa" className="mt-6 flex justify-center">
          <GPACalculator />
        </TabsContent>
        <TabsContent value="pearson" className="mt-6">
          <Pearson session={session} />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <QuizAssignmentCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}