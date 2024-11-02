import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, Award, Book } from "lucide-react";
import { useTheme } from 'next-themes';

const CustomCalendar = ({ selectedDate, onSelect, assignments, quizzes }) => {
  const { theme } = useTheme();

  const daysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const getEventStatus = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;

    if (diffTime < 0) {
      return { 
        icon: <Clock className="w-4 h-4 text-gray-500" />, 
        bgColor: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300',
        textColor: 'text-white',  
      };
    } else if (diffTime > (7 * 24 * 60 * 60 * 1000)) {
      return { 
        icon: <CheckCircle className="w-4 h-4 text-green-500" />, 
        bgColor: theme === 'dark' ? 'bg-green-700' : 'bg-green-200',
        textColor: 'text-white',  
      };
    } else if (diffTime > (2 * 24 * 60 * 60 * 1000)) {
      return { 
        icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />, 
        bgColor: theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-300',
        textColor: 'text-black',  
      };
    } else {
      return { 
        icon: <XCircle className="w-4 h-4 text-red-500" />, 
        bgColor: theme === 'dark' ? 'bg-red-700' : 'bg-red-300',
        textColor: 'text-white',  
      };
    }
  };

  const getDayStatus = (date) => {
    const dayEvents = [
      ...assignments.filter(a => new Date(a.due_date).toDateString() === date.toDateString()),
      ...quizzes.filter(q => new Date(q.date).toDateString() === date.toDateString())
    ];

    if (dayEvents.length === 0) {
      return {
        bgColor: theme === 'dark' ? 'bg-black border border-white' : 'bg-white hover:bg-gray-50',
        textColor: theme === 'dark' ? 'text-white' : 'text-black',
        events: []
      };
    }

    // Sort events by urgency
    const sortedEvents = dayEvents.sort((a, b) => {
      const statusA = getEventStatus(a.due_date || a.date);
      const statusB = getEventStatus(b.due_date || b.date);
      const priorityMap = { 'Danger': 0, 'Caution': 1, 'Safe': 2, 'Expired': 3 };
      return priorityMap[statusA.label] - priorityMap[statusB.label];
    });

    const mostUrgentStatus = getEventStatus(sortedEvents[0].due_date || sortedEvents[0].date);
    const quizzesOnDay = quizzes.filter(q => new Date(q.date).toDateString() === date.toDateString());

    if (quizzesOnDay.length > 0) {
      const quizType = quizzesOnDay[0].type;
      const quizIcon = quizType === 'summative' 
        ? <Award className="w-4 h-4 text-yellow-600" />
        : <Book className="w-4 h-4 text-silver" />;

      return {
        bgColor: quizType === 'summative' ? (theme === 'dark' ? 'bg-yellow-700' : 'bg-yellow-200') : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'),
        textColor: theme === 'dark' ? 'text-white' : 'text-black', // Change text color for quiz days
        events: dayEvents,
        icon: quizIcon
      };
    }

    return {
      ...mostUrgentStatus,
      events: dayEvents
    };
  };

  const days = daysInMonth(selectedDate);

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className={`p-2 text-center font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          {day}
        </div>
      ))}
      {Array.from({ length: days[0].getDay() }, (_, i) => (
        <div key={`empty-${i}`} className="p-4" />
      ))}
      {days.map((date) => {
        const { bgColor, textColor, icon, events } = getDayStatus(date);
        const isToday = new Date().toDateString() === date.toDateString();
        const isSelected = selectedDate.toDateString() === date.toDateString();

        return (
          <div
            key={date.toString()}
            className={`relative p-4 rounded-lg cursor-pointer transition-colors
              ${bgColor} 
              ${isSelected ? 'ring-2 ring-primary' : ''} 
              ${isToday ? 'font-bold' : ''}`}
            onClick={() => onSelect(date)}
          >
            <div className={`flex items-center justify-between ${textColor}`}>
              <span>{date.getDate()}</span>
              {events.length > 0 && (
                <div className="flex flex-col items-end">
                  {icon}
                  {events.length > 1 && (
                    <span className="text-xs font-medium mt-1">
                      {events.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomCalendar;
