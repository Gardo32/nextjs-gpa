'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit2 } from "lucide-react"

export default function AssignmentManager() {
  const [newAssignment, setNewAssignment] = useState({ name: '', dueDate: '', major: '', grade: '' })
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const supabase = createClientComponentClient()

  const majorOptions = [
    { value: 'CCP', label: 'Cloud Computing' },
    { value: 'AI', label: 'Artificial Intelligence' },
    { value: 'SEC', label: 'Cyber Security' }
  ]

  const gradeOptions = [
    { value: 'grade12', label: 'Grade 12' },
    { value: 'grade11', label: 'Grade 11' }
  ]

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching assignments:', error)
    } else {
      setAssignments(data)
    }
  }

  const addAssignment = async () => {
    const dueDateISO = new Date(newAssignment.dueDate).toISOString()

    const { error } = await supabase
      .from('assignments')
      .insert([{ 
        name: newAssignment.name, 
        due_date: dueDateISO, 
        major: newAssignment.major,
        grade: newAssignment.grade 
      }])

    if (error) {
      console.error('Error adding assignment:', error)
    } else {
      fetchAssignments()
      setNewAssignment({ name: '', dueDate: '', major: '', grade: '' })
    }
  }

  const startEditing = (assignment) => {
    setEditingAssignment({
      ...assignment,
      dueDate: new Date(assignment.due_date).toISOString().slice(0, 16)
    })
    setIsEditDialogOpen(true)
  }

  const updateAssignment = async () => {
    if (!editingAssignment) return

    const dueDateISO = new Date(editingAssignment.dueDate).toISOString()

    const { error } = await supabase
      .from('assignments')
      .update({
        name: editingAssignment.name,
        due_date: dueDateISO,
        major: editingAssignment.major,
        grade: editingAssignment.grade
      })
      .eq('id', editingAssignment.id)

    if (error) {
      console.error('Error updating assignment:', error)
    } else {
      fetchAssignments()
      setEditingAssignment(null)
      setIsEditDialogOpen(false)
    }
  }

  const deleteAssignment = async (id) => {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting assignment:', error)
    } else {
      fetchAssignments()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Add New Assignment</h2>
        <Card>
          <CardContent className="space-y-4 pt-4">
            <Input
              type="text"
              placeholder="Assignment Name"
              value={newAssignment.name}
              onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
            />
            <Input
              type="datetime-local"
              placeholder="Due Date"
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            />
            <select
              value={newAssignment.major}
              onChange={(e) => setNewAssignment({ ...newAssignment, major: e.target.value })}
              className="w-full p-2 rounded-lg border"
            >
              <option value="">Select Major</option>
              {majorOptions.map(major => (
                <option key={major.value} value={major.value}>
                  {major.label}
                </option>
              ))}
              <option value="global">All Majors</option>
            </select>
            <select
              value={newAssignment.grade}
              onChange={(e) => setNewAssignment({ ...newAssignment, grade: e.target.value })}
              className="w-full p-2 rounded-lg border"
            >
              <option value="">Select Grade</option>
              {gradeOptions.map(grade => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
            <Button onClick={addAssignment}>Add Assignment</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Assignments</h2>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-medium">{assignment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(assignment.due_date).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    {majorOptions.find(m => m.value === assignment.major)?.label || 'All Majors'} - {' '}
                    {gradeOptions.find(g => g.value === assignment.grade)?.label}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => startEditing(assignment)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => deleteAssignment(assignment.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          {editingAssignment && (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Assignment Name"
                value={editingAssignment.name}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, name: e.target.value })}
              />
              <Input
                type="datetime-local"
                placeholder="Due Date"
                value={editingAssignment.dueDate}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, dueDate: e.target.value })}
              />
              <select
                value={editingAssignment.major}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, major: e.target.value })}
                className="w-full p-2 rounded-lg border"
              >
                <option value="">Select Major</option>
                {majorOptions.map(major => (
                  <option key={major.value} value={major.value}>
                    {major.label}
                  </option>
                ))}
                <option value="global">All Majors</option>
              </select>
              <select
                value={editingAssignment.grade}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, grade: e.target.value })}
                className="w-full p-2 rounded-lg border"
              >
                <option value="">Select Grade</option>
                {gradeOptions.map(grade => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
              <Button onClick={updateAssignment}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}