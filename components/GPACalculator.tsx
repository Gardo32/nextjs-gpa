'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { presets } from '@/lib/presets'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function GPACalculator() {
  const [numSubjects, setNumSubjects] = useState(1)
  const [subjects, setSubjects] = useState([{ name: '', marks: '', hours: '' }])
  const [gpa, setGPA] = useState('N/A')
  const [selectedPreset, setSelectedPreset] = useState('')
  const router = useRouter()

  useEffect(() => {
    setSubjects(Array(numSubjects).fill({ name: '', marks: '', hours: '' }))
  }, [numSubjects])

  const loadPreset = (presetName: string) => {
    setSelectedPreset(presetName)
    const preset = presets[presetName as keyof typeof presets]
    if (preset) {
      setNumSubjects(preset.num_subjects)
      setSubjects(preset.subjects.map((name, index) => ({
        name,
        marks: '',
        hours: preset.hours[index].toString()
      })))
    }
  }

  const calculateGPA = () => {
    let totalMarks = 0
    let totalHours = 0

    subjects.forEach(subject => {
      const marks = parseFloat(subject.marks)
      const hours = parseFloat(subject.hours)

      if (!isNaN(marks) && !isNaN(hours)) {
        totalMarks += marks * hours
        totalHours += hours
      }
    })

    const calculatedGPA = totalHours > 0 ? (totalMarks / totalHours) : 0
    setGPA(calculatedGPA.toFixed(2))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-3xl font-bold">GPA Calculator</CardTitle>
        <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preset-selector">Select a preset:</Label>
            <Select value={selectedPreset} onValueChange={loadPreset}>
              <SelectTrigger id="preset-selector">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CCP">CCP</SelectItem>
                <SelectItem value="SEC">SEC</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num-subjects">Enter the number of subjects:</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                id="num-subjects"
                min="1"
                value={numSubjects}
                onChange={(e) => setNumSubjects(parseInt(e.target.value) || 1)}
                className="flex-grow"
              />
              <Button onClick={() => setSubjects(Array(numSubjects).fill({ name: '', marks: '', hours: '' }))}>
                Update Subjects
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder={`Subject ${index + 1}`}
                  value={subject.name}
                  onChange={(e) => {
                    const newSubjects = [...subjects]
                    newSubjects[index] = { ...newSubjects[index], name: e.target.value }
                    setSubjects(newSubjects)
                  }}
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  min="0"
                  max="100"
                  value={subject.marks}
                  onChange={(e) => {
                    const newSubjects = [...subjects]
                    newSubjects[index] = { ...newSubjects[index], marks: e.target.value }
                    setSubjects(newSubjects)
                  }}
                />
                <Input
                  type="number"
                  placeholder="Hours"
                  min="1"
                  value={subject.hours}
                  onChange={(e) => {
                    const newSubjects = [...subjects]
                    newSubjects[index] = { ...newSubjects[index], hours: e.target.value }
                    setSubjects(newSubjects)
                  }}
                />
              </div>
            ))}
          </div>

          <Button onClick={calculateGPA} className="w-full">Calculate GPA</Button>

          <div className="text-center text-2xl font-bold">
            Your GPA is: {gpa}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}