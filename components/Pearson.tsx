'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, AlertTriangle, XCircle, Cloud, Cpu, Shield, Edit2, Clock, GraduationCap } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from '@/app/SessionContext'

export default function PearsonTracker() {
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [newAssignment, setNewAssignment] = useState({ name: '', dueDate: '', major: '', grade: '' })
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMajors, setSelectedMajors] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClientComponentClient()
  const { session } = useSession()

  const specialties = [
    { value: 'Cloud Computing', code: 'CCP' },
    { value: 'Artificial Intelligence', code: 'AI' },
    { value: 'Cyber Security', code: 'SEC' },
  ]

  const majorOptions = [
    { value: 'CCP', label: 'Cloud Computing', icon: Cloud, color: 'text-blue-500', userValue: 'Cloud Computing' },
    { value: 'AI', label: 'Artificial Intelligence', icon: Cpu, color: 'text-green-500', userValue: 'Artificial Intelligence' },
    { value: 'SEC', label: 'Cyber Security', icon: Shield, color: 'text-red-500', userValue: 'Cyber Security' }
  ]

  const gradeOptions = [
    { value: 'grade12', label: 'Grade 12', icon: GraduationCap },
    { value: 'grade11', label: 'Grade 11', icon: GraduationCap }
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;
      try {
        const nvNumber = session.user.email.split('@')[0];
        const { data, error } = await supabase
          .from('user_specialties')
          .select('specialty, grade')
          .eq('nv_number', nvNumber)
          .single();

        if (error) throw error;
        if (data) {
          const userMajor = specialties.find(s => s.value === data.specialty)?.code;
          setSelectedMajors(userMajor ? [userMajor] : []);
          setGradeFilter(`grade${data.grade}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, supabase]);

  useEffect(() => {
    fetchAssignments()
    const interval = setInterval(fetchAssignments, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkPassword = () => {
    const appPassword = process.env.NEXT_PUBLIC_APP_PASSWORD
    if (password === appPassword) {
      setIsAuthorized(true)
    } else {
      alert('Incorrect password')
    }
  }

  const getAssignmentStatus = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    
    if (now > due) {
      return { 
        icon: <Clock className="text-gray-500 w-6 h-6" />, 
        label: 'Expired',
        className: 'text-gray-500'
      }
    } else if ((due - now) > (7 * 24 * 60 * 60 * 1000)) {
      return { 
        icon: <CheckCircle className="text-green-500 w-6 h-6" />, 
        label: 'Safe',
        className: 'text-green-500'
      }
    } else if ((due - now) > (2 * 24 * 60 * 60 * 1000)) {
      return { 
        icon: <AlertTriangle className="text-yellow-500 w-6 h-6" />, 
        label: 'Caution',
        className: 'text-yellow-500'
      }
    } else {
      return { 
        icon: <XCircle className="text-red-500 w-6 h-6" />, 
        label: 'Danger',
        className: 'text-red-500'
      }
    }
  }

  const getMajorIcon = (major) => {
    const option = majorOptions.find(opt => opt.value === major)
    if (option) {
      const Icon = option.icon
      return <Icon className={`w-6 h-6 ${option.color}`} />
    }
    return null
  }

  const getGradeIcon = (grade) => {
    const option = gradeOptions.find(opt => opt.value === grade)
    if (option) {
      return <option.icon className="w-6 h-6 text-purple-500" />
    }
    return null
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDateForInput = (dateString) => {
    return new Date(dateString).toISOString().slice(0, 16)
  }

  const handleMajorToggle = (major) => {
    setSelectedMajors(prev => {
      const majorCode = specialties.find(s => s.value === major)?.code || major;
      if (prev.includes(majorCode)) {
        return prev.filter(m => m !== majorCode);
      } else {
        return [...prev, majorCode];
      }
    });
  };

  const getFilteredAssignments = () => {
    if (selectedMajors.length === 0 && gradeFilter === 'all' && statusFilter === 'all') {
      return assignments;
    }
    
    return assignments.filter(assignment => {
      const status = getAssignmentStatus(assignment.due_date).label;
      const matchesMajor = selectedMajors.length === 0 || selectedMajors.includes(assignment.major) || assignment.major === 'global';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || assignment.grade === gradeFilter;
      return matchesMajor && matchesStatus && matchesGrade;
    });
  };

  const getAssignmentMajors = (assignment) => {
    if (assignment.major === 'global') {
      return majorOptions.map(option => ({
        icon: option.icon,
        color: option.color
      }))
    }
    const option = majorOptions.find(opt => opt.value === assignment.major)
    return option ? [{
      icon: option.icon,
      color: option.color
    }] : []
  }

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

    const { data, error } = await supabase
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
      dueDate: formatDateForInput(assignment.due_date)
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

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Pearson Assignment Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {majorOptions.map(major => (
              <Button
                key={major.value}
                onClick={() => handleMajorToggle(major.userValue)}
                variant={selectedMajors.includes(major.value) ? "default" : "outline"}
                className={`flex items-center space-x-2 ${
                  selectedMajors.includes(major.value) 
                    ? "bg-primary text-primary-foreground" 
                    : ""
                }`}
              >
                <major.icon className={major.color} />
                <span>{major.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto p-2 rounded-lg border"
            >
              <option value="all">All Statuses</option>
              <option value="Safe">Safe</option>
              <option value="Caution">Caution</option>
              <option value="Danger">Danger</option>
              <option value="Expired">Expired</option>
            </select>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full md:w-auto p-2 rounded-lg border"
            >
              <option value="all">All Grades</option>
              {gradeOptions.map(grade => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {getFilteredAssignments().map((assignment) => {
            const { icon, label, className } = getAssignmentStatus(assignment.due_date)
            const formattedDueDate = formatDate(assignment.due_date)
            const assignmentMajors = getAssignmentMajors(assignment)
            return (
              <div 
                key={assignment.id} 
                className={`flex justify-between items-center p-4 border rounded-lg ${label === 'Expired' ? 'opacity-60' : ''}`}
              >
                <div className="flex-1">
                  <p className="font-medium text-lg">{assignment.name}</p>
                  <p className={`text-sm ${className}`}>Due: {formattedDueDate}</p>
                  <p className="text-sm text-purple-500">
                    {gradeOptions.find(g => g.value === assignment.grade)?.label || 'No Grade'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Major Icons */}
                  <div className="flex space-x-1">
                    {assignmentMajors.map((major, index) => {
                      const Icon = major.icon
                      return (
                        <Icon key={index} className={`w-6 h-6 ${major.color}`} />
                      )
                    })}
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {icon}
                    <p className={`font-medium ${className}`}>{label}</p>
                  </div>

                  {/* Admin Controls */}
                  {isAuthorized && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline"
                        onClick={() => startEditing(assignment)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => deleteAssignment(assignment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Admin Section */}
        {isAuthorized ? (
          <div className="mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Assignment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Assignment Details</DialogTitle>
                </DialogHeader>
                
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
                <Button onClick={addAssignment}>
                  Submit
                </Button>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Assignment</DialogTitle>
                </DialogHeader>
                {editingAssignment && (
                  <>
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
                    <Button onClick={updateAssignment}>
                      Save Changes
                    </Button>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Admin Login</h2>
            <div className="flex items-center space-x-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={checkPassword}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}