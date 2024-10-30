'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from '@/app/SessionContext'
import AssignmentManager from '@/components/AssignmentManager'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { session } = useSession()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session) {
        router.push('/')
        return
      }

      try {
        const nvNumber = session.user.email.split('@')[0]
        const { data, error } = await supabase
          .from('user_specialties')
          .select('Role')
          .eq('nv_number', nvNumber)
          .single()

        if (error) throw error
        
        if (data?.Role !== 'admin') {
          router.push('/')
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [session, router, supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="assignments">
            <AssignmentManager />
          </TabsContent>
          <TabsContent value="users">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p>User management features will be implemented here.</p>
          </TabsContent>
          <TabsContent value="settings">
            <h2 className="text-xl font-semibold mb-4">Admin Settings</h2>
            <p>Admin settings and configurations will be available here.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
