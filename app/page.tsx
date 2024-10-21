import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import GPACalculator from '@/components/GPACalculator'
import Timetable from '@/components/Timetable'

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
        </TabsList>
        <TabsContent value="timetable" className="mt-6">
          <Timetable />
        </TabsContent>
        <TabsContent value="gpa" className="mt-6">
          <GPACalculator />
        </TabsContent>
      </Tabs>
    </div>
  )
}