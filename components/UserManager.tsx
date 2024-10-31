'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSession } from '@/app/SessionContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserManager() {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClientComponentClient()
  const { session } = useSession()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('user_specialties')
      .select('*')
      .order('nv_number', { ascending: true })

    if (error) {
      setError('Failed to fetch users')
      console.error('Error fetching users:', error)
    } else {
      setUsers(data)
    }
    setLoading(false)
  }

  const startEditing = (user) => {
    setEditingUser({ ...user })
    setIsDialogOpen(true)
  }

  const handleInputChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value })
  }

  const saveChanges = async () => {
    const { error } = await supabase
      .from('user_specialties')
      .update(editingUser)
      .eq('nv_number', editingUser.nv_number)

    if (error) {
      setError('Failed to update user')
      console.error('Error updating user:', error)
    } else {
      fetchUsers()
      setEditingUser(null)
      setIsDialogOpen(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const currentUserNvNumber = session?.user?.email?.split('@')[0]

  if (currentUserNvNumber !== 'nv22084') {
    return <div>Access denied. Only nv22084 can manage users.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NV Number</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.nv_number}>
                <TableCell>{user.nv_number}</TableCell>
                <TableCell>{user.grade}</TableCell>
                <TableCell>{user.specialty}</TableCell>
                <TableCell>{user.class}</TableCell>
                <TableCell>{user.Role}</TableCell>
                <TableCell>
                  <Button onClick={() => startEditing(user)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    name="grade"
                    value={editingUser.grade}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={editingUser.specialty}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    name="class"
                    value={editingUser.class}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="Role">Role</Label>
                  <Input
                    id="Role"
                    name="Role"
                    value={editingUser.Role}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button onClick={saveChanges}>Save</Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}