import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GPACalculator from '@/components/GPACalculator';
import Timetable from '@/components/Timetable';
import Pearson from '@/components/Pearson'; // Import Pearson Tracker

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto">
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
        <TabsContent value="pearson" className="mt-6"> {/* Add Pearson Tracker content */}
          <Pearson />
        </TabsContent>
      </Tabs>
    </div>
  );
}
