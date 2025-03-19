"use client"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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

export function PieChartComponent({chartData}: {chartData: {label: string, value: number}[]}) {
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
          <CardDescription>Created, Deleted, Modified</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex justify-center items-center">
          <div className="h-[250px] w-full flex items-center justify-center">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>User Analytics</CardTitle>
        <CardDescription>Created, Deleted, Modified</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex justify-center items-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full min-h-[250px]"
        >
          <PieChart width={300} height={250}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              stroke="1"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ value, label }) => `${label}: ${value}`}
            >
              {chartData.map((entry: {label: string, value: number}) => {
                const configKey = entry.label?.toLowerCase();
                let colorToUse = "#d1d5db";
                
                if (configKey === "created") colorToUse = chartConfig.created.color;
                else if (configKey === "deleted") colorToUse = chartConfig.deleted.color;
                else if (configKey === "modified") colorToUse = chartConfig.modified.color;
                
                return (
                  <Cell 
                    key={entry.label} 
                    fill={colorToUse}
                    stroke="transparent"
                  />
                );
              })}
            </Pie>
            <ChartLegend 
              content={<ChartLegendContent />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
