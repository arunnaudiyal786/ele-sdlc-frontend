"use client"

import { Users, FolderKanban, ClipboardList, TrendingUp, Maximize2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DashboardStats } from "@/types/assessment"

interface StatsCardsProps {
  stats: DashboardStats
}

const statsConfig = [
  {
    key: 'activeAssessments' as const,
    label: 'Active Employees',
    icon: Users,
  },
  {
    key: 'totalProjects' as const,
    label: 'Number of Projects',
    icon: FolderKanban,
  },
  {
    key: 'pendingReviews' as const,
    label: 'Number of Task',
    icon: ClipboardList,
  },
  {
    key: 'avgAccuracy' as const,
    label: 'Target Percentage Completed',
    icon: TrendingUp,
    suffix: '%',
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((config) => {
        const value = stats[config.key]
        const displayValue = config.suffix
          ? `${value}${config.suffix}`
          : value.toLocaleString()

        return (
          <Card key={config.key} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <config.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">
                      {displayValue}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">Expand</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
