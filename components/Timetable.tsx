'use client'

import { useState, useEffect } from 'react'
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
  const [timeInfo, setTimeInfo] = useState({ current: '', elapsed: '', remaining: '', percentageRemaining: 100 })
  const [currentDay, setCurrentDay] = useState(0)
  const [isWeekend, setIsWeekend] = useState(false)

  useEffect(() => {
    const savedClass = localStorage.getItem('selectedClass')
    if (savedClass) setSelectedClass(savedClass)
    
    const savedDay = localStorage.getItem('currentDay')
    const now = new Date()
    const day = now.getDay()
    
    // Check if it's weekend (Friday or Saturday)
    const weekend = day === 5 || day === 6
    setIsWeekend(weekend)
    
    // Always show Sunday's schedule (0), but only set currentDay to saved day if it's not weekend
    if (savedDay && !weekend) {
      setCurrentDay(parseInt(savedDay))
    } else {
      setCurrentDay(0) // Show Sunday's schedule
    }

    // Set up time update interval regardless of weekend
    const timeInterval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false })
      setTimeInfo(prev => ({ ...prev, current: currentTime }))
    }, 1000)
    
    // Only update class schedule if it's not weekend
    if (!weekend) {
      updateSchedule()
      const scheduleInterval = setInterval(updateSchedule, 1000)
      return () => {
        clearInterval(scheduleInterval)
        clearInterval(timeInterval)
      }
    } else {
      // On weekend, just show the schedule without timers
      const sundaySchedule = timetables[selectedClass]?.schedules[0] || []
      setTodayClasses(sundaySchedule)
      setCurrentClass(null)
      setNextClass(null)
      return () => clearInterval(timeInterval)
    }
  }, [selectedClass])

  const updateSchedule = () => {
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
        updateTimeInfo(classInfo)
        break
      }
    }

    if (!currentClassFound) {
      setCurrentClass(null)
      setNextClass(todaySchedule[0])
      setTimeInfo(prev => ({ ...prev, elapsed: '', remaining: '', percentageRemaining: 100 }))

      // Check if all classes for the day are finished
      if (todaySchedule.length > 0) {
        const lastClass = todaySchedule[todaySchedule.length - 1]
        const [lastEndHour, lastEndMin] = lastClass.end.split(':')
        const lastEndTime = `${lastEndHour.padStart(2, '0')}:${lastEndMin.padStart(2, '0')}`
        
        if (currentTime >= lastEndTime) {
          moveToNextDay()
        }
      }
    }
  }

  const moveToNextDay = () => {
    const nextDay = (currentDay + 1) % 5 // Cycle through 0 (Sunday) to 4 (Thursday)
    setCurrentDay(nextDay)
    localStorage.setItem('currentDay', nextDay.toString())
  }

  const updateTimeInfo = (current) => {
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
      elapsed: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
      remaining: `${Math.floor(remaining / 60)}m ${remaining % 60}s`,
      percentageRemaining
    })
  }

  const getProgressColor = (percentage) => {
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 25) return 'bg-yellow-500'
    if (percentage > 10) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Class Schedule - {getDayName(currentDay)}</CardTitle>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            {isWeekend ? (
              <p className="text-lg font-medium text-orange-500">
                It's weekend! Timers will resume on Sunday.
              </p>
            ) : (
              <>
                <p className="text-lg font-medium">
                  Current Class: {currentClass ? `${currentClass.subject} (${currentClass.room}, ${currentClass.teacher})` : 'None'}
                </p>
                <p className="text-lg font-medium">
                  Next Class: {nextClass ? `${nextClass.subject} (${nextClass.room}, ${nextClass.teacher})` : 'None'}
                </p>
              </>
            )}
          </div>
          <div>
            <p>Current Time: {timeInfo.current}</p>
            {currentClass && !isWeekend && (
              <>
                <p>Time Elapsed: {timeInfo.elapsed}</p>
                <p>Time Remaining: {timeInfo.remaining}</p>
                <div className="mt-2">
                  <Progress 
                    value={timeInfo.percentageRemaining} 
                    className={`h-2 ${getProgressColor(timeInfo.percentageRemaining)}`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Room</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todayClasses.map((classInfo, index) => (
              <TableRow 
                key={index} 
                className={!isWeekend && currentClass?.subject === classInfo.subject ? 'bg-muted' : ''}
              >
                <TableCell>{classInfo.start}</TableCell>
                <TableCell>{classInfo.end}</TableCell>
                <TableCell>{classInfo.subject}</TableCell>
                <TableCell>{classInfo.teacher}</TableCell>
                <TableCell>{classInfo.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}