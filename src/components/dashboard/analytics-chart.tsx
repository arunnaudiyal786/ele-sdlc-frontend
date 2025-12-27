"use client"

import { TrendingUp, Download } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { MonthlyAnalytics } from "@/types/assessment"

interface AnalyticsChartProps {
  data: MonthlyAnalytics[]
}

const chartConfig = {
  projectsDone: {
    label: "Project Done",
    color: "hsl(var(--chart-1))",
  },
  projectsTasks: {
    label: "Project Task",
    color: "hsl(var(--chart-2))",
  },
  projectsGoal: {
    label: "Project Goal",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Graphs and Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Projects completed per month based on trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Project Done</span>
            <span className="text-sm font-medium">137</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Project Task</span>
            <span className="text-sm font-medium">123</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-3" />
            <span className="text-sm text-muted-foreground">Project Goal</span>
            <span className="text-sm font-medium">84</span>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-muted-foreground text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-muted-foreground text-xs"
            />
            <ChartTooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="projectsDone"
              fill="var(--color-projectsDone)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="projectsTasks"
              fill="var(--color-projectsTasks)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="projectsGoal"
              fill="var(--color-projectsGoal)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
