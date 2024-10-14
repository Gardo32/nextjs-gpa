'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GPACalculator from '@/components/GPACalculator'

export default function Dashboard() {
  const [session, setSession] = useState(true) // Assuming user is always logged in for this case
  const [loading, setLoading] = useState(false) // No need to load session from Supabase
  const router = useRouter()

  useEffect(() => {
    // Simulate a session check (this can be replaced with other auth logic if needed)
    setLoading(false)
    if (!session) {
      router.push('/')
    }
  }, [router, session])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null // Prevent content flash before redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      <GPACalculator />
    </div>
  )
}
