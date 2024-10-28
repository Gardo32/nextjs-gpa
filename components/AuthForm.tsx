'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Check if the email ends with @nvtc.edu.bh
    if (!email.endsWith('@nvtc.edu.bh')) {
      setError('Only @nvtc.edu.bh email addresses can sign up.')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else {
      setError('Check your email for the confirmation link.')
    }
    setIsLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login / Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Sign In'}
            </Button>
            <Button type="button" onClick={handleSignUp} className="w-full" variant="outline" disabled={isLoading}>
              Sign Up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}