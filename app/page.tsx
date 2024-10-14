'use client'

import { useEffect, useState } from 'react'
import AuthForm from '@/components/AuthForm'
import GPACalculator from '@/components/GPACalculator'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {session ? <GPACalculator /> : <AuthForm />}
    </main>
  )
}