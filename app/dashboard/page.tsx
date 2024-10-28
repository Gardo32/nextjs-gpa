'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GPACalculator from '@/components/GPACalculator';
import Timetable from '@/components/Timetable';
import Pearson from '@/components/Pearson'; // Import Pearson Tracker

export default function Dashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      // Check active sessions and sets the user
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)

      if (!session) {
        router.push('/auth')
      } else {
        // Check if user has selected a specialty
        const nvNumber = session.user.email.split('@')[0]
        const { data, error } = await supabase
          .from('user_specialties')
          .select('specialty')
          .eq('nv_number', nvNumber)

        if (error) {
          console.error('Error fetching specialty:', error)
        } else if (!data || data.length === 0) {
          router.push('/select-specialty') // Redirect to specialty selection page
        }
      }
    }

    checkSession()

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null // Prevent content flash before redirect
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-3"> {/* Adjust grid columns to 3 */}
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
          <TabsTrigger value="pearson">Pearson Tracker</TabsTrigger> {/* Add Pearson Tracker tab */}
        </TabsList>
        <TabsContent value="timetable" className="mt-6">
          <Timetable />
        </TabsContent>
        <TabsContent value="gpa" className="mt-6 flex justify-center">
          <GPACalculator />
        </TabsContent>
        <TabsContent value="pearson" className="mt-6"> {/* Add Pearson Tracker content */}
          <Pearson />
        </TabsContent>
      </Tabs>
    </div>
  )
}