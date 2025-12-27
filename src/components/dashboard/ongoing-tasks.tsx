"use client"

import Link from "next/link"
import { Search, Filter, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { Assessment } from "@/types/assessment"

interface OngoingTasksProps {
  assessments: Assessment[]
}

// Mock team members for avatar display
const teamMembers = [
  { id: 1, name: "Alex M", avatar: "/avatars/alex.jpg" },
  { id: 2, name: "Sarah J", avatar: "/avatars/sarah.jpg" },
  { id: 3, name: "Mike R", avatar: "/avatars/mike.jpg" },
]

function getProgressValue(status: Assessment['status']): number {
  switch (status) {
    case 'draft': return 10
    case 'analyzing': return 51
    case 'completed': return 100
    case 'archived': return 100
    default: return 0
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function OngoingTasks({ assessments }: OngoingTasksProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            On Going Task
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Best performing employee ranking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {assessments.map((assessment, index) => {
          const progress = getProgressValue(assessment.status)

          return (
            <Link
              key={assessment.id}
              href={`/assessments/${assessment.id}`}
              className="block"
            >
              <div
                className={cn(
                  "rounded-lg border border-border p-4 transition-colors hover:bg-muted/50",
                  index === 0 && "border-primary/30 bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium",
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {assessment.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {assessment.title.split(' ').slice(0, 2).join(' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {assessment.description.substring(0, 40)}...
                      </p>
                    </div>
                  </div>

                  {/* Team Avatars */}
                  <div className="flex -space-x-2">
                    {teamMembers.slice(0, 3).map((member) => (
                      <Avatar
                        key={member.id}
                        className="h-8 w-8 border-2 border-background"
                      >
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                {/* Status & Progress */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <p className="font-medium capitalize">{assessment.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Procentation</span>
                      <p className="font-medium">{progress}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date</span>
                      <p className="font-medium">{formatDate(assessment.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress value={progress} className="mt-3 h-1.5" />
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
