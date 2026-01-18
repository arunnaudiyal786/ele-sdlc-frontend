"use client"

import Link from "next/link"
import { Search, ArrowLeft, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NoAssessmentStateProps {
  /** Handler for button click (used when navigating doesn't require Link) */
  onStartAssessment?: () => void
  /** Custom icon to display (defaults to Search) */
  icon?: LucideIcon
  /** Main message shown to user */
  title?: string
  /** Secondary message shown below title */
  description?: string
  /** If true, renders a Link to /sdlc-intelligence instead of button with handler */
  asLink?: boolean
}

export function NoAssessmentState({
  onStartAssessment,
  icon: Icon = Search,
  title = "No historical matches available yet.",
  description = "Run an impact assessment to find similar projects.",
  asLink = false,
}: NoAssessmentStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground text-center mb-2">
          {title}
        </p>
        <p className="text-muted-foreground text-center mb-6">
          {description}
        </p>
        {asLink ? (
          <Button asChild size="lg">
            <Link href="/sdlc-intelligence">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Assessment
            </Link>
          </Button>
        ) : (
          <Button onClick={onStartAssessment} size="lg">
            Start Assessment
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
