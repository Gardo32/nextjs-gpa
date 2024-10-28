'use client'

import { useState, useEffect, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from "@/components/ui/progress"
import { timetables } from '../lib/timetable'

export default function ClassSchedule() {
  const [selectedClass, setSelectedClass] = useState('0')
  const [currentClass, setCurrentClass] = useState(null)
  const [nextClass, setNextClass] = useState(null)
  const [todayClasses, setTodayClasses] = useState([])
  const [timeInfo, setTimeInfo] = useState({
    current: '',
    elapsed: '',
    remaining: '',
    percentageRemaining: 100
  })
  const [currentDay, setCurrentDay] = useState(0)
  const [isWeekend, setIsWeekend] = useState(false)

  // Helper function to format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const updateTimeInfo = useCallback((current) => {
    if (!current) return

    const now = new Date()
    const [startHour, startMin] = current.start.split(':')
    const [endHour, endMin] = current.end.split(':')

    const startTime = new Date(now)
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0)

    const endTime = new Date(now)
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0)

    const elapsed = Math.max(0, Math.floor((now - startTime) / 1000))
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
    const totalDuration = Math.floor((endTime - startTime) / 1000)
    const percentageRemaining = Math.round((remaining / totalDuration) * 100)

    setTimeInfo({
      current: now.toLocaleTimeString('en-US', { hour12: false }),
      elapsed: formatTime(elapsed),
      remaining: formatTime(remaining),
      percentageRemaining
    })
  }, [])

  const updateSchedule = useCallback(() => {
    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
    
    const todaySchedule = timetables[selectedClass]?.schedules[currentDay] || []
    setTodayClasses(todaySchedule)

    let currentClassFound = false
    for (let i = 0; i < todaySchedule.length; i++) {
      const classInfo = todaySchedule[i]
      const [startHour, startMin] = classInfo.start.split(':')
      const [endHour, endMin] = classInfo.end.split(':')
      const startTime = `${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')}`
      const endTime = `${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}`

      if (currentTime >= startTime && currentTime < endTime) {
        setCurrentClass(classInfo)
        setNextClass(todaySchedule[i + 1] || null)
        currentClassFound = true
        break
      }
    }

    if (!currentClassFound) {
      setCurrentClass(null)
      setNextClass(todaySchedule[0])
      setTimeInfo(prev => ({ ...prev, elapsed: '', remaining: '', percentageRemaining: 100 }))
    }
  }, [selectedClass, currentDay])

  useEffect(() => {
    const savedClass = localStorage.getItem('selectedClass')
    if (savedClass) setSelectedClass(savedClass)
    
    const now = new Date()
    const day = now.getDay()
    
    const weekend = day === 5 || day === 6
    setIsWeekend(weekend)
    
    const adjustedDay = weekend ? 0 : (day === 0 ? 0 : day)
    setCurrentDay(adjustedDay)

    // Update current time and timers every second
    const timerInterval = setInterval(() => {
      if (currentClass) {
        updateTimeInfo(currentClass)
      } else {
        setTimeInfo(prev => ({
          ...prev,
          current: new Date().toLocaleTimeString('en-US', { hour12: false })
        }))
      }
    }, 1000)
    
    // Check for schedule changes every second
    const scheduleInterval = setInterval(updateSchedule, 1000)
    
    // Initial updates
    updateSchedule()
    
    return () => {
      clearInterval(timerInterval)
      clearInterval(scheduleInterval)
    }
  }, [selectedClass, updateSchedule, currentClass, updateTimeInfo])

  const getProgressColor = (percentage) => {
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 25) return 'bg-yellow-500'
    if (percentage > 10) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
    return days[day]
  }
  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">
          Class Schedule - {getDayName(currentDay)}
        </CardTitle>
        <div className="flex items-center gap-4">
          <Select 
            value={selectedClass} 
            onValueChange={(value) => {
              setSelectedClass(value)
              localStorage.setItem('selectedClass', value)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timetables).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            {isWeekend ? (
              <p className="text-lg font-medium text-orange-500">
                It&apos;s weekend! Showing Sunday&apos;s schedule.
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Class</p>
                  <p className="text-lg font-medium">
                    {currentClass 
                      ? `${currentClass.subject} (${currentClass.room}, ${currentClass.teacher})`
                      : 'No class in session'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Next Class</p>
                  <p className="text-lg font-medium">
                    {nextClass 
                      ? `${nextClass.subject} (${nextClass.room}, ${nextClass.teacher})`
                      : 'No more classes today'}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Time</p>
              <p className="text-lg font-medium">{timeInfo.current}</p>
            </div>
            {currentClass && !isWeekend && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Time Elapsed</p>
                    <p className="text-lg font-medium">{timeInfo.elapsed}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Time Remaining</p>
                    <p className="text-lg font-medium">{timeInfo.remaining}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <Progress 
                    value={timeInfo.percentageRemaining} 
                    className={`h-3 ${getProgressColor(timeInfo.percentageRemaining)}`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
  
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Start</TableHead>
                <TableHead className="w-[100px]">End</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="w-[100px]">Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayClasses.map((classInfo, index) => (
                <TableRow 
                  key={index} 
                  className={
                    !isWeekend && currentClass?.subject === classInfo.subject 
                      ? 'bg-muted' 
                      : ''
                  }
                >
                  <TableCell>{classInfo.start}</TableCell>
                  <TableCell>{classInfo.end}</TableCell>
                  <TableCell className="font-medium">{classInfo.subject}</TableCell>
                  <TableCell>{classInfo.teacher}</TableCell>
                  <TableCell>{classInfo.room}</TableCell>
                </TableRow>
              ))}
              {todayClasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No classes scheduled for today
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}