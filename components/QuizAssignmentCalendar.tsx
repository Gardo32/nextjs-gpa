import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@/app/SessionContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, Cloud, Cpu, Shield, Clock, GraduationCap } from "lucide-react";
import CustomCalendar from './CustomCalendar';

const specialties = [
  { value: 'Cloud Computing', code: 'CCP' },
  { value: 'Artificial Intelligence', code: 'AI' },
  { value: 'Cyber Security', code: 'SEC' },
];

const majorOptions = [
  { value: 'CCP', label: 'Cloud Computing', icon: Cloud, color: 'text-blue-500', userValue: 'Cloud Computing' },
  { value: 'AI', label: 'Artificial Intelligence', icon: Cpu, color: 'text-green-500', userValue: 'Artificial Intelligence' },
  { value: 'SEC', label: 'Cyber Security', icon: Shield, color: 'text-red-500', userValue: 'Cyber Security' }
];

const gradeOptions = [
  { value: 'grade12', label: 'Grade 12', icon: GraduationCap },
  { value: 'grade11', label: 'Grade 11', icon: GraduationCap }
];

export default function QuizAssignmentCalendar() {
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supabase = createClientComponentClient();
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      fetchAssignmentsAndQuizzes();
      const interval = setInterval(fetchAssignmentsAndQuizzes, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchAssignmentsAndQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: assignmentsData, error: assignmentsError }, { data: quizzesData, error: quizzesError }] = await Promise.all([
        supabase.from('assignments').select('*').order('due_date', { ascending: true }),
        supabase.from('quizzes').select('*').order('date', { ascending: true })
      ]);

      if (assignmentsError) throw assignmentsError;
      if (quizzesError) throw quizzesError;

      setAssignments(assignmentsData || []);
      setQuizzes(quizzesData || []);
    } catch (error) {
      console.error('Error fetching assignments and quizzes:', error);
      setError('Failed to fetch assignments and quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;
    
    if (diffTime < 0) {
      return { 
        icon: <Clock className="text-gray-500 w-6 h-6" />, 
        label: 'Expired',
        className: 'text-gray-500'
      };
    } else if (diffTime > (7 * 24 * 60 * 60 * 1000)) {
      return { 
        icon: <CheckCircle className="text-green-500 w-6 h-6" />, 
        label: 'Safe',
        className: 'text-green-500'
      };
    } else if (diffTime > (2 * 24 * 60 * 60 * 1000)) {
      return { 
        icon: <AlertTriangle className="text-yellow-500 w-6 h-6" />, 
        label: 'Caution',
        className: 'text-yellow-500'
      };
    } else {
      return { 
        icon: <XCircle className="text-red-500 w-6 h-6" />, 
        label: 'Danger',
        className: 'text-red-500'
      };
    }
  };

  const getMajorIcon = (major) => {
    const option = majorOptions.find(opt => opt.value === major);
    if (option) {
      const Icon = option.icon;
      return <Icon className={`w-6 h-6 ${option.color}`} />;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

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

  const getFilteredEvents = () => {
    const filteredAssignments = assignments.filter(assignment => {
      const status = getEventStatus(assignment.due_date).label;
      const matchesMajor = selectedMajors.length === 0 || selectedMajors.includes(assignment.major);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || assignment.grade === gradeFilter;
      return matchesMajor && matchesStatus && matchesGrade;
    });

    const filteredQuizzes = quizzes.filter(quiz => {
      const status = getEventStatus(quiz.date).label;
      const matchesMajor = selectedMajors.length === 0 || selectedMajors.includes(quiz.class);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesMajor && matchesStatus;
    });

    return [...filteredAssignments, ...filteredQuizzes].sort((a, b) => {
      const dateA = new Date(a.due_date || a.date);
      const dateB = new Date(b.due_date || b.date);
      return dateA - dateB;
    });
  };

  if (loading) return <div className="flex justify-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Assignment and Quiz Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomCalendar
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          assignments={assignments}
          quizzes={quizzes}
        />
        
        {/* Filters */}
        <div className="mb-6 space-y-4 mt-4">
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

        {/* Events List */}
        <div className="space-y-4">
          {getFilteredEvents().map((event) => {
            const { icon, label, className } = getEventStatus(event.due_date || event.date);
            const formattedDate = formatDate(event.due_date || event.date);
            const isQuiz = 'date' in event;
            
            return (
              <div 
                key={event.id} 
                className={`flex justify-between items-center p-4 border rounded-lg ${label === 'Expired' ? 'opacity-60' : ''}`}
              >
                <div className="flex-1">
                  <p className="font-medium text-lg">{event.name}</p>
                  <p className={`text-sm ${className}`}>
                    {isQuiz ? 'Quiz Date' : 'Due'}: {formattedDate}
                  </p>
                  {!isQuiz && (
                    <p className="text-sm text-purple-500">
                      {gradeOptions.find(g => g.value === event.grade)?.label || 'No Grade'}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Major Icon */}
                  <div className="flex space-x-1">
                    {getMajorIcon(isQuiz ? event.class : event.major)}
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {icon}
                    <p className={`font-medium ${className}`}>{label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}