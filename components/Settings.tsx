'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from '@/app/SessionContext'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Settings as SettingsIcon } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

const specialties = [
  { value: 'Cloud Computing', code: 'CCP' },
  { value: 'Artificial Intelligence', code: 'AI' },
  { value: 'Cyber Security', code: 'SEC' },
]

export function Settings() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false)
  const [specialty, setSpecialty] = useState('')
  const [fontSize, setFontSize] = useState('medium')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { theme, setTheme } = useTheme()
  const { session } = useSession()
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      fetchUserSpecialty()
    }
  }, [session])

  const fetchUserSpecialty = async () => {
    const nvNumber = session?.user?.email?.split('@')[0]
    if (!nvNumber) return

    const { data, error } = await supabase
      .from('user_specialties')
      .select('specialty')
      .eq('nv_number', nvNumber)
      .single()

    if (error) {
      console.error('Error fetching user specialty:', error)
    } else {
      setSpecialty(data.specialty)
    }
  }

  const updateSpecialty = async (newSpecialty: string) => {
    if (!session?.user?.email) return

    const nvNumber = session.user.email.split('@')[0]
    const grade = nvNumber.startsWith('nv22') ? 12 : nvNumber.startsWith('nv23') ? 11 : nvNumber.startsWith('nv24') ? 10 : null

    if (!grade) {
      toast({
        title: "Error",
        description: "Invalid NV number. Unable to determine grade.",
        variant: "destructive",
      })
      return
    }

    const classString = `${grade}.${specialties.find(s => s.value === newSpecialty)?.code}`

    const { error } = await supabase
      .from('user_specialties')
      .update({ specialty: newSpecialty, class: classString })
      .eq('nv_number', nvNumber)

    if (error) {
      console.error('Error updating specialty:', error)
      toast({
        title: "Error",
        description: "Failed to update specialty. Please try again.",
        variant: "destructive",
      })
    } else {
      setSpecialty(newSpecialty)
      toast({
        title: "Success",
        description: "Your specialty and class have been updated.",
      })
    }
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px'
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } else {
      router.push('/login') // Adjust this path according to your login route
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Password updated successfully. Please log in again.",
      })

      // Reset form and close dialog
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsPasswordResetOpen(false)

      // Sign out the user
      await handleLogout()

    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while resetting password",
        variant: "destructive",
      })
      console.error('Password reset error:', err)
    }
  }

  const openPasswordReset = () => {
    setIsOpen(false)
    setIsPasswordResetOpen(true)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="z-50"
      >
        <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Open settings</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Settings
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              {session && <TabsTrigger value="account">Account</TabsTrigger>}
            </TabsList>
            <TabsContent value="appearance" className="space-y-4">
              <div>
                <Label className="block mb-2">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block mb-2">Font Size</Label>
                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Currently using Inter font. More options coming soon!
              </p>
            </TabsContent>
            {session && (
              <TabsContent value="account" className="space-y-4">
                <div>
                  <Label className="block mb-2">Specialty</Label>
                  <Select value={specialty} onValueChange={updateSpecialty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select specialty" />
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openPasswordReset}
                >
                  Reset Password
                </Button>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label className="block mb-2">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="block mb-2">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="block mb-2">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}