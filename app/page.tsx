'use client'
import { useState } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import GPACalculator from '@/components/GPACalculator';
import Timetable from '@/components/Timetable';

const Expandable = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
      >
        <span>{title}</span>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>
      {isExpanded && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Timetable />
      <GPACalculator />
    </main>
  );
}
