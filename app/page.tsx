import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import GPACalculator from '@/components/GPACalculator'
import Timetable from '@/components/Timetable'

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
          <Link href="https://nasservocational-my.sharepoint.com/:x:/g/personal/mussab_aswad_nvtc_edu_bh/EfVGxHZP6J5Jia0sHIsd0SwBTKKbDtEq4r4SFJ4tullmmA?e=dx9kpT&nav=MTVfe0M2RjJFMEQ4LUI2NTMtMEI0MC1CMDExLTVFRUJDNzYwRjMxQX0" passHref legacyBehavior>
            <TabsTrigger value="resources" asChild>
              <a>Resources</a>
            </TabsTrigger>
          </Link>
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