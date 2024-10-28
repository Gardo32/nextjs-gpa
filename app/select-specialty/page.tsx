'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster, toast } from 'react-hot-toast'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select" // Assuming you have a Select component

const specialties = [
  { value: 'Cloud Computing', code: 'CCP' },
  { value: 'Artificial Intelligence', code: 'AI' },
  { value: 'Cyber Security', code: 'SEC' },
]

export default function SelectSpecialty() {
  const [email, setEmail] = useState('')
  const [specialty, setSpecialty] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth') // Redirect to auth if not logged in
      } else {
        setEmail(session.user.email) // Set email from session
      }
    }
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Extract NV number from email (case insensitive)
    const nvNumber = email.split('@')[0].toLowerCase()
    const grade = nvNumber.startsWith('nv22') ? 12 : nvNumber.startsWith('nv23') ? 11 : nvNumber.startsWith('nv24') ? 10 : null

    if (!grade) {
      toast.error('Invalid NV number. Please check your email.')
      return
    }

    const classString = `${grade}.${specialties.find(s => s.value === specialty)?.code}`

    // Insert data into Supabase
    const { error } = await supabase
      .from('user_specialties')
      .insert([{ nv_number: nvNumber, grade, specialty, class: classString }])

    if (error) {
      toast.error('Error uploading data: ' + error.message)
    } else {
      toast.success('Data uploaded successfully!')
      router.push('/dashboard') // Redirect to dashboard after successful upload
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Select Your Specialty</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select
                id="specialty"
                value={specialty}
                onValueChange={setSpecialty}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec.code} value={spec.value}>
                      {spec.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
          <Toaster />
        </CardContent>
      </Card>
    </div>
  )
}