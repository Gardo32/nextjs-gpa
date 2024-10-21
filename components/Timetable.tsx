'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { chosenPresetVariable } from './GPACalculator'

const timetables = {
    1: {
      label: '12.AI',
      schedules: {
        0: [ // Sunday
        { subject: "ML301", teacher: "AA", room: "B7", start: "07:15", end: "08:45" },
        { subject: "DL301", teacher: "SG/AA", room: "C1", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },            
        { subject: "DL301", teacher: "SG/AA", room: "C1", start: "09:50", end: "10:35" },
        { subject: "English", teacher: "SS", room: "A5", start: "10:35", end: "12:05" },
        { subject: "Physics", teacher: "SK", room: "Ph. Lab", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "Physics", teacher: "SK", room: "Ph. Lab", start: "13:05", end: "13:45" },
    ],
    1: [ // Monday
        { subject: "GRD301", teacher: "AA/AA", room: "B7", start: "07:15", end: "08:45" },
        { subject: "ML301", teacher: "AA", room: "C1", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "ML301", teacher: "AA", room: "C1", start: "09:50", end: "10:35" },
        { subject: "Arab", teacher: "AM", room: "A8", start: "10:35", end: "11:20" },
        { subject: "Math", teacher: "JA", room: "B3", start: "11:20", end: "12:05" },
        { subject: "English", teacher: "SS", room: "A5", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "English", teacher: "SS", room: "A5", start: "13:05", end: "13:45" },
    ],
    2: [ // Tuesday
        { subject: "GRD301", teacher: "AA/AA", room: "B7", start: "07:15", end: "08:45" },
        { subject: "Math", teacher: "JA", room: "B3", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "Math", teacher: "JA", room: "B3", start: "09:50", end: "10:35" },
        { subject: "Chemistry", teacher: "RY/DN", room: "CH. Lab", start: "10:35", end: "11:20" },
        { subject: "English", teacher: "SS", room: "A5", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "English", teacher: "SS", room: "A5", start: "13:05", end: "13:45" },
    ],
    3: [ // Wednesday 
        { subject: "English", teacher: "SS", room: "A5", start: "07:15", end: "08:45" },
        { subject: "Islam", teacher: "AR", room: "A1", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "Historey", teacher: "SZ", room: "A7", start: "09:50", end: "10:35" },
        { subject: "DL301", teacher: "SG/AA", room: "B7", start: "10:35", end: "12:05" },
        { subject: "IOT301", teacher: "AA", room: "B7", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "IOT301", teacher: "AA", room: "B7", start: "13:05", end: "13:45" },

    ],
    4: [ 
        { subject: "Physics", teacher: "SK", room: "B9", start: "07:00", end: "08:20" },
        { subject: "IOT301", teacher: "AA", room: "B7", start: "08:20", end: "09:00" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:00", end: "09:15" },
        { subject: "IOT301", teacher: "AA", room: "B7", start: "09:15", end: "09:55" },
        { subject: "Math", teacher: "JA", room: "B3", start: "09:55", end: "11:15" },
        { subject: "Historey", teacher: "SZ", room: "A7", start: "11:15", end: "11:55" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "11:55", end: "12:10" },
        { subject: "Arab", teacher: "AM", room: "A8", start: "12:10", end: "12:50" },
        { subject: "Clubs", teacher: "???", room: "???", start: "12:55", end: "13:45" },
    ]
      }
    },
    0: {
      label: '12.CCP',
      schedules: {
        0: [ // Sunday
        { subject: "GRD301", teacher: "AK/MS", room: "B8", start: "07:15", end: "08:45" },
        { subject: "Math", teacher: "KNT/JA", room: "B3", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "Math", teacher: "KNT/JA", room: "B3", start: "09:50", end: "10:35" },
        { subject: "Arab", teacher: "AM", room: "A8", start: "10:35", end: "11:20" },
        { subject: "ISL", teacher: "AR", room: "A8", start: "11:20", end: "12:05" },
        { subject: "IOT301", teacher: "AA", room: "B7", start: "12:05", end: "12:45"},
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "IOT301", teacher: "AA", room: "B7", start: "13:05", end: "13:45" },
    ],
    1: [ // Monday
        { subject: "Chem", teacher: "DN/AH", room: "CHM. Lab", start: "07:15", end: "08:45" },
        { subject: "Math", teacher: "KNT/JA", room: "B3", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "Historey", teacher: "AR", room: "A7", start: "09:50", end: "10:35" },
        { subject: "English", teacher: "SS", room: "A5", start: "10:35", end: "12:05" },
        { subject: "ARC301", teacher: "AK", room: "B8", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "ARC301", teacher: "AK", room: "B8", start: "13:05", end: "13:45" },
    ],
    2: [ // Tuesday
        { subject: "Historey", teacher: "AR", room: "A7", start: "07:15", end: "08:00" },
        { subject: "Arab", teacher: "AM", room: "A8", start: "08:00", end: "08:45" },
        { subject: "English", teacher: "SS", room: "A6", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "English", teacher: "SS", room: "A6", start: "09:50", end: "10:35" },
        { subject: "GRD301", teacher: "AK/MS", room: "B8", start: "10:35", end: "12:05" },
        { subject: "Physics", teacher: "SK", room: "B9", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "Physics", teacher: "SK", room: "B9", start: "13:05", end: "13:45" },
    ],
    3: [ // Wednesday 
        { subject: "ARC301", teacher: "AK", room: "B8", start: "07:15", end: "08:45" },
        { subject: "Physics", teacher: "SK", room: "Ph. Lab", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "Physics", teacher: "SK", room: "Ph. Lab", start: "09:50", end: "10:35" },
        { subject: "CC301", teacher: "AK", room: "B8", start: "10:35", end: "12:05" },
        { subject: "English", teacher: "SS", room: "A5", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "English", teacher: "SS", room: "A5", start: "13:05", end: "13:45" },

    ],
    4: [ 
        { subject: "CC301", teacher: "AK", room: "B8", start: "07:00", end: "08:20" },
        { subject: "English", teacher: "SS", room: "A5", start: "08:20", end: "09:00" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:00", end: "09:15" },
        { subject: "English", teacher: "SS", room: "A5", start: "09:15", end: "09:55" },
        { subject: "IOT301", teacher: "AA", room: "B7", start: "09:55", end: "11:15" },
        { subject: "Math", teacher: "KNT/JA", room: "B3", start: "11:15", end: "11:55" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "11:55", end: "12:10" },
        { subject: "Math", teacher: "KNT/JA", room: "B3", start: "12:10", end: "12:50" },
        { subject: "Clubs", teacher: "???", room: "???", start: "12:55", end: "13:45" },
    ]
      }
    },
    2: {
      label: '12.SEC',
      schedules: {
        0: [ // Sunday
        { subject: "Math", teacher: "KNT", room: "B3", start: "07:15", end: "08:00" },
        { subject: "History", teacher: "SZ", room: "A7", start: "08:00", end: "08:45" },
        { subject: "GDV301", teacher: "HA", room: "C3", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "GDV301", teacher: "HA", room: "C3", start: "09:50", end: "10:35" },
        { subject: "IOT301", teacher: "KM/AA", room: "B7", start: "10:35", end: "12:05" },
        { subject: "English", teacher: "SS", room: "A5", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "English", teacher: "SS", room: "A5", start: "13:05", end: "13:45" },
    ],
    1: [ // Monday
        { subject: "English", teacher: "AA", room: "A5", start: "07:15", end: "08:45" },
        { subject: "Phy", teacher: "SK", room: "Ph.Lab", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "Physics", teacher: "SK", room: "Ph.Lab", start: "09:50", end: "10:35" },
        { subject: "SEC311", teacher: "KM", room: "C3", start: "10:35", end: "12:05" },
        { subject: "Islam", teacher: "AR", room: "A7", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "Arab", teacher: "AM", room: "A8", start: "13:05", end: "13:45" },
    ],
    2: [ // Tuesday
        { subject: "Math", teacher: "KNT", room: "B3", start: "07:15", end: "08:45" },
        { subject: "GRD301", teacher: "KM/IA", room: "C4", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "GRD301", teacher: "KM/IA", room: "C4", start: "09:50", end: "10:35" },
        { subject: "Physics", teacher: "SK", room: "B9", start: "10:35", end: "11:20" },
        { subject: "Chemistry", teacher: "RY/DN", room: "CH.Lab", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "Chemistry", teacher: "RY/DN", room: "CH.Lab", start: "13:05", end: "13:45" },
    ],
    3: [ // Wednesday 
        { subject: "GDV301", teacher: "HA", room: "C3", start: "07:15", end: "08:45" },
        { subject: "IOT301", teacher: "KM/AA", room: "B7", start: "08:45", end: "09:30" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:30", end: "09:50" },
        { subject: "IOT301", teacher: "KM/AA", room: "B7", start: "09:50", end: "10:35" },
        { subject: "English", teacher: "SS", room: "A5", start: "10:35", end: "12:05" },
        { subject: "Math", teacher: "KNT", room: "B3", start: "12:05", end: "12:45" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "12:45", end: "13:05" },
        { subject: "Math", teacher: "KNT", room: "B3", start: "13:05", end: "13:45" },
    ],
    4: [ 
        { subject: "English", teacher: "SS", room: "A5", start: "07:00", end: "08:20" },
        { subject: "GRD301", teacher: "KM/IA", room: "C4", start: "08:20", end: "09:00" },
        { subject: "Break 1", teacher: "N/A", room: "N/A", start: "09:00", end: "09:15" },
        { subject: "GRD301", teacher: "KM/IA", room: "C4", start: "09:15", end: "09:55" },
        { subject: "History", teacher: "SZ", room: "A7", start: "09:55", end: "10:35" },
        { subject: "Arab", teacher: "AM", room: "A8", start: "10:35", end: "11:15" },
        { subject: "SEC311", teacher: "KM", room: "C3", start: "11:15", end: "11:55" },
        { subject: "Break 2", teacher: "N/A", room: "N/A", start: "11:55", end: "12:10" },
        { subject: "SEC", teacher: "KM", room: "C3", start: "12:10", end: "12:50" },
        { subject: "Clubs", teacher: "???", room: "???", start: "12:55", end: "13:45" },
    ]
      }
    }
  };

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