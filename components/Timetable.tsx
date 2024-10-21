'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { timetables } from '../lib/timetable'

export default function ClassSchedule() {
  const [selectedClass, setSelectedClass] = useState('0')
  const [currentClass, setCurrentClass] = useState(null)
  const [nextClass, setNextClass] = useState(null)
  const [todayClasses, setTodayClasses] = useState([])
  const [timeInfo, setTimeInfo] = useState({ current: '', elapsed: '', remaining: '' })

  useEffect(() => {
    const savedClass = localStorage.getItem('selectedClass')
    if (savedClass) setSelectedClass(savedClass)
    
    updateSchedule()
    const interval = setInterval(updateSchedule, 1000)
    return () => clearInterval(interval)
  }, [selectedClass]) // Add selectedClass dependency

  const updateSchedule = () => {
    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
    const currentDay = now.getDay() // No need to adjust, use 0-6 range
    
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
      setTimeInfo({ current: currentTime, elapsed: '', remaining: '' })
    }
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

    setTimeInfo({
      current: now.toLocaleTimeString('en-US', { hour12: false }),
      elapsed: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
      remaining: `${Math.floor(remaining / 60)}m ${remaining % 60}s`
    })
  }

  const Expandable = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="font-medium">{title}</h3>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>
      
      {isExpanded && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Class Schedule</CardTitle>
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-lg font-medium">
              Current Class: {currentClass ? `${currentClass.subject} (${currentClass.room}, ${currentClass.teacher})` : 'None'}
            </p>
            <p className="text-lg font-medium">
              Next Class: {nextClass ? `${nextClass.subject} (${nextClass.room}, ${nextClass.teacher})` : 'None'}
            </p>
          </div>
          <div>
            <p>Current Time: {timeInfo.current}</p>
            {currentClass && (
              <>
                <p>Time Elapsed: {timeInfo.elapsed}</p>
                <p>Time Remaining: {timeInfo.remaining}</p>
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
                className={currentClass?.subject === classInfo.subject ? 'bg-muted' : ''}
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