"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


const chartConfig = {
  created: {
    label: "Created",
    color: "#4ade80",
  },
  deleted: {
    label: "Deleted",
    color: "#f87171",
  },
  modified: {
    label: "Modified",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function CompareBarComponent({chartData, selectedDates}: {chartData: {day: string, created: number, deleted: number, modified: number}[], selectedDates: string}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Between {selectedDates} and Today</CardTitle>
        <CardDescription>{selectedDates} vs Today</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="created" fill="var(--color-created)" radius={4} />
            <Bar dataKey="deleted" fill="var(--color-deleted)" radius={4} />
            <Bar dataKey="modified" fill="var(--color-modified)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
           {(() => {
             const prevValue = chartData[0]?.created || 0;
             const currentValue = chartData[1]?.created || 0;
             const growthPercentage = prevValue === 0 
               ? currentValue > 0 ? 100 : 0
               : ((currentValue - prevValue) / prevValue * 100).toFixed(1);
             const isGrowth = currentValue > prevValue;
             return (
               <>
                 <span className="text-green-500">Created</span>
                 Users changed by
                 <span className={`${isGrowth ? 'text-green-500' : 'text-red-500'}`}>
                  {growthPercentage}% 
                 </span>
                from {selectedDates} to today 
                 {isGrowth ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
               </>
             );
           })()}
        </div>
        
        <div className="flex gap-2 font-medium leading-none">
           {(() => {
             const prevValue = chartData[0]?.deleted || 0;
             const currentValue = chartData[1]?.deleted || 0;
             const growthPercentage = prevValue === 0 
               ? currentValue > 0 ? 100 : 0
               : ((currentValue - prevValue) / prevValue * 100).toFixed(1);
             const isGrowth = currentValue > prevValue;
             return (
               <>
               <span className="text-red-500">Deleted</span>
                 Users changed by
                 <span className={`${isGrowth ? 'text-green-500' : 'text-red-500'}`}>
                  {growthPercentage}% 
                 </span>
                from {selectedDates} to today 
                 {isGrowth ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
               </>
             );
           })()}
        </div>
        
        <div className="flex gap-2 font-medium leading-none">
           {(() => {
             const prevValue = chartData[0]?.modified || 0;
             const currentValue = chartData[1]?.modified || 0;
             const growthPercentage = prevValue === 0 
               ? currentValue > 0 ? 100 : 0
               : ((currentValue - prevValue) / prevValue * 100).toFixed(1);
             const isGrowth = currentValue > prevValue;
             return (
               <>
               <span className="text-blue-500">Modified</span>
                 Users changed by
                 <span className={`${isGrowth ? 'text-green-500' : 'text-red-500'}`}>
                  {growthPercentage}% 
                 </span>
                from {selectedDates} to today 
                 {isGrowth ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
               </>
             );
           })()}
        </div>
        
        <div className="leading-none text-muted-foreground">
          Showing users analytics between {selectedDates} and today.
        </div>
      </CardFooter>
    </Card>
  )
}
