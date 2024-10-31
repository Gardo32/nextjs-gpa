'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GPACalculator from '@/components/GPACalculator';
import Timetable from '@/components/Timetable';
import Pearson from '@/components/Pearson'; // Import Pearson Tracker
import { useSession } from '@/app/SessionContext'; // Import useSession

export default function Dashboard() {
  const { session, loading: sessionLoading } = useSession(); // Use session from SessionContext
  const [nvNumber, setNvNumber] = useState(''); // State to hold nvNumber
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      if (!session) {
        router.push('/auth');
      } else {
        // Extract nvNumber from the session
        const nvNumber = session.user.email.split('@')[0];
        setNvNumber(nvNumber); // Set nvNumber state

        // Check if user has selected a specialty
        const { data, error } = await supabase
          .from('user_specialties')
          .select('specialty')
          .eq('nv_number', nvNumber);

        if (error) {
          console.error('Error fetching specialty:', error);
        } else if (!data || data.length === 0) {
          router.push('/select-specialty'); // Redirect to specialty selection page
        }
      }
    };

    checkSession();
  }, [session, router]);

  if (sessionLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // Prevent content flash before redirect
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hello {nvNumber} 👋</h1> {/* Greeting message */}
      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-3"> {/* Adjust grid columns to 3 */}
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
          <TabsTrigger value="pearson">Pearson Tracker</TabsTrigger> {/* Add Pearson Tracker tab */}
        </TabsList>
        <TabsContent value="timetable" className="mt-6">
          <Timetable />
        </TabsContent>
        <TabsContent value="gpa" className="mt-6 flex justify-center">
          <GPACalculator />
        </TabsContent>
        <TabsContent value="pearson" className="mt-6"> {/* Pass session to Pearson Tracker */}
          <Pearson session={session} />
        </TabsContent>
      </Tabs>
    </div>
  )
}