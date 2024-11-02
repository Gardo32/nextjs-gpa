'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { timetables } from '@/lib/timetable'

export default function AssignmentQuizManager() {
  const [newAssignment, setNewAssignment] = useState({ name: '', dueDate: '', major: '', grade: '' })
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newQuiz, setNewQuiz] = useState({ name: '', date: '', class: '', period: '', type: 'formative' })
  const [quizzes, setQuizzes] = useState([])
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [selectedDay, setSelectedDay] = useState('0') // Default to Sunday

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

  const classOptions = Object.entries(timetables).map(([key, value]) => ({
    value: key,
    label: value.label
  }))

  useEffect(() => {
    fetchAssignments()
    fetchQuizzes()
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

  const addQuiz = async () => {
    const { error } = await supabase
      .from('quizzes')
      .insert([newQuiz])

    if (error) {
      console.error('Error adding quiz:', error)
    } else {
      setNewQuiz({ name: '', date: '', class: '', period: '', type: 'formative' })
      fetchQuizzes()
    }
  }

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching quizzes:', error)
    } else {
      setQuizzes(data)
    }
  }

  const startEditingQuiz = (quiz) => {
    setEditingQuiz(quiz)
    setIsEditDialogOpen(true)
  }

  const updateQuiz = async () => {
    if (!editingQuiz) return

    const { error } = await supabase
      .from('quizzes')
      .update(editingQuiz)
      .eq('id', editingQuiz.id)

    if (error) {
      console.error('Error updating quiz:', error)
    } else {
      fetchQuizzes()
      setEditingQuiz(null)
      setIsEditDialogOpen(false)
    }
  }

  const deleteQuiz = async (id) => {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting quiz:', error)
    } else {
      fetchQuizzes()
    }
  }

  const getPeriodOptions = () => {
    if (!newQuiz.class || !selectedDay) return []
    const schedule = timetables[newQuiz.class]?.schedules[selectedDay] || []
    return schedule
      .filter(period => period.subject !== 'Break 1' && period.subject !== 'Break 2')
      .map(period => ({
        value: period.start,
        label: `${period.subject} (${period.start} - ${period.end})`
      }))
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
            <Select
              value={newAssignment.major}
              onValueChange={(value) => setNewAssignment({ ...newAssignment, major: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Major" />
              </SelectTrigger>
              <SelectContent>
                {majorOptions.map(major => (
                  <SelectItem key={major.value} value={major.value}>
                    {major.label}
                  </SelectItem>
                ))}
                <SelectItem value="global">All Majors</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newAssignment.grade}
              onValueChange={(value) => setNewAssignment({ ...newAssignment, grade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Quizzes</h2>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Quiz Name"
            value={newQuiz.name}
            onChange={(e) => setNewQuiz({ ...newQuiz, name: e.target.value })}
          />
          <Input
            type="date"
            value={newQuiz.date}
            onChange={(e) => setNewQuiz({ ...newQuiz, date: e.target.value })}
          />
          <Select value={newQuiz.class} onValueChange={(value) => setNewQuiz({ ...newQuiz, class: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map(classOption => (
                <SelectItem key={classOption.value} value={classOption.value}>{classOption.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sunday</SelectItem>
              <SelectItem value="1">Monday</SelectItem>
              <SelectItem value="2">Tuesday</SelectItem>
              <SelectItem value="3">Wednesday</SelectItem>
              <SelectItem value="4">Thursday</SelectItem>
            </SelectContent>
          </Select>
          <Select value={newQuiz.period} onValueChange={(value) => setNewQuiz({ ...newQuiz, period: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {getPeriodOptions().map(period => (
                <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={newQuiz.type} onValueChange={(value) => setNewQuiz({ ...newQuiz, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select quiz type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formative">Formative</SelectItem>
              <SelectItem value="summative">Summative</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addQuiz}>Add Quiz</Button>
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Upcoming Quizzes</h3>
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium">{quiz.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(quiz.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      {classOptions.find(c => c.value === quiz.class)?.label} - Period {quiz.period} - {quiz.type.charAt(0).toUpperCase() + quiz.type.slice(1)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => startEditingQuiz(quiz)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => deleteQuiz(quiz.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingAssignment ? 'Assignment' : 'Quiz'}</DialogTitle>
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
              <Select
                value={editingAssignment.major}
                onValueChange={(value) => setEditingAssignment({ ...editingAssignment, major: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Major" />
                </SelectTrigger>
                <SelectContent>
                  {majorOptions.map(major => (
                    <SelectItem key={major.value} value={major.value}>
                      {major.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="global">All Majors</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={editingAssignment.grade}
                onValueChange={(value) => setEditingAssignment({ ...editingAssignment, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map(grade => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={updateAssignment}>Save Changes</Button>
            </div>
          )}
          {editingQuiz && (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Quiz Name"
                value={editingQuiz.name}
                onChange={(e) => setEditingQuiz({ ...editingQuiz, name: e.target.value })}
              />
              <Input
                type="date"
                value={editingQuiz.date}
                onChange={(e) => setEditingQuiz({ ...editingQuiz, date: e.target.value })}
              />
              <Select value={editingQuiz.class} onValueChange={(value) => setEditingQuiz({ ...editingQuiz, class: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map(classOption => (
                    <SelectItem key={classOption.value} value={classOption.value}>{classOption.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editingQuiz.period} onValueChange={(value) => setEditingQuiz({ ...editingQuiz, period: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {getPeriodOptions().map(period => (
                    <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={editingQuiz.type} onValueChange={(value) => setEditingQuiz({ ...editingQuiz, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quiz type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formative">Formative</SelectItem>
                  <SelectItem value="summative">Summative</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={updateQuiz}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}