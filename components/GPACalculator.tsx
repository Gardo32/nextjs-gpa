'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { presets } from '@/lib/presets'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from '@/app/SessionContext'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function GPACalculator() {
  const [subjects, setSubjects] = useState([{ name: '', marks: '', hours: '' }])
  const [gpa, setGPA] = useState('N/A')
  const [estimatedGPA, setEstimatedGPA] = useState('N/A')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [minError, setMinError] = useState(0)
  const [maxError, setMaxError] = useState(0)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const { session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserClass = async () => {
      try {
        if (!session) {
          setError('No active session. Please log in.')
          setLoading(false)
          return
        }

        const nvNumber = session.user.email.split('@')[0]
        const { data, error } = await supabase
          .from('user_specialties')
          .select('class')
          .eq('nv_number', nvNumber)
          .single()

        if (error) {
          console.error('Error fetching class:', error)
          setError('Failed to fetch your class information. Please try again later.')
        } else if (data) {
          loadPreset(data.class)
        } else {
          setError('No class information found. Please contact support.')
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching class:', error)
        setError('Failed to fetch class information. Please try again later.')
        setLoading(false)
      }
    }

    fetchUserClass()
  }, [session, supabase])

  const loadPreset = (presetName: string) => {
    setSelectedPreset(presetName)
    const preset = presets[presetName as keyof typeof presets]
    if (preset) {
      setSubjects(preset.subjects.map((name, index) => ({
        name,
        marks: '',
        hours: preset.hours[index].toString()
      })))
      setMinError(0);
      setMaxError(0);
    }
  }

  const finalExamMarkEstimation = (start: number, finish: number, hour: number, mark: number): number => {
    if (start > finish) {
      throw new Error("Start should be less than or equal to finish.");
    }

    const weights: number[] = [];
    for (let i = start; i <= finish; i++) {
      let weight: number;
      if (hour > (finish - start) / 2) {
        weight = 1 / (Math.abs(i - start) + 1);
      } else {
        weight = 1 / (Math.abs(finish - i) + 1);
      }
      weights.push(weight);
    }

    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    const selectedNumber = weightedRandomChoice(start, finish, normalizedWeights);
    
    return 60 * (mark / 100) + (40 - selectedNumber);
  }

  const weightedRandomChoice = (start: number, finish: number, weights: number[]): number => {
    const randomValue = Math.random();
    let cumulativeWeight = 0;

    for (let i = start; i <= finish; i++) {
      cumulativeWeight += weights[i - start];
      if (randomValue < cumulativeWeight) {
        return i;
      }
    }
    return finish;
  }

  const calculateGPA = () => {
    let totalMarks = 0
    let totalHours = 0
    let estimatedTotalMarks = 0

    subjects.forEach(subject => {
      const marks = parseFloat(subject.marks)
      const hours = parseFloat(subject.hours)

      if (!isNaN(marks) && !isNaN(hours)) {
        totalMarks += marks * hours
        totalHours += hours
        
        const estimatedMarks = finalExamMarkEstimation(minError, maxError, hours, marks);
        estimatedTotalMarks += estimatedMarks * hours
      }
    })

    const calculatedGPA = totalHours > 0 ? (totalMarks / totalHours) : 0
    const estimatedFinalGPA = totalHours > 0 ? (estimatedTotalMarks / totalHours) : 0

    setGPA(calculatedGPA.toFixed(2))
    setEstimatedGPA(estimatedFinalGPA.toFixed(2))

    toast({
      title: "Success",
      description: "Your GPA has been calculated.",
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">GPA Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <style jsx global>{`
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preset-selector">Your Class:</Label>
            <Select value={selectedPreset} onValueChange={loadPreset}>
              <SelectTrigger id="preset-selector">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(presets).map((presetKey) => (
                  <SelectItem key={presetKey} value={presetKey}>
                    {presetKey}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="min-error">Minimum Error:</Label>
              <Input
                type="number"
                id="min-error"
                value={minError}
                onChange={(e) => setMinError(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="max-error">Maximum Error:</Label>
              <Input
                type="number"
                id="max-error"
                value={maxError}
                onChange={(e) => setMaxError(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder={`Subject ${index + 1}`}
                  value={subject.name}
                  readOnly
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  min="0"
                  max="100"
                  value={subject.marks}
                  onChange={(e) => {
                    const value = Math.min(parseInt(e.target.value) || 0, 100);
                    const newSubjects = [...subjects]
                    newSubjects[index] = { ...newSubjects[index], marks: value.toString() }
                    setSubjects(newSubjects)
                  }}
                />
                <Input
                  type="number"
                  placeholder="Hours"
                  min="1"
                  value={subject.hours}
                  readOnly
                />
              </div>
            ))}
          </div>

          <Button onClick={calculateGPA} className="w-full">Calculate GPA</Button>

          <div className="text-center text-2xl font-bold">
            Your GPA is: {gpa}
          </div>
          <div className="text-center text-xl font-semibold">
            Estimated Final GPA: {estimatedGPA}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}