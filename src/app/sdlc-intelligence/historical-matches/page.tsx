"use client"

import Link from "next/link"
import { Search, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { useSDLC } from "@/contexts/sdlc-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NoAssessmentState } from "@/components/sdlc/no-assessment-state"

export default function HistoricalMatchesPage() {
  const { pipeline, isAgentComplete } = useSDLC()
  const isComplete = isAgentComplete('historicalMatches')

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Historical Matches</h1>
            <p className="text-sm text-muted-foreground">
              Find similar past projects and requirements
            </p>
          </div>
        </div>

        <NoAssessmentState
          icon={Search}
          title="No historical matches available yet."
          description="Run an impact assessment to find similar projects."
          asLink
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <Search className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Historical Matches</h1>
            <p className="text-sm text-muted-foreground">
              Similar projects have been identified
            </p>
          </div>
        </div>
        <Badge className="bg-green-500/10 text-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      </div>

      {/* Requirement Context */}
      <Card>
        <CardHeader>
          <CardTitle>Analyzed Requirement</CardTitle>
          <CardDescription>
            The requirement that was matched against historical projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {pipeline.requirementText || 'No requirement text available'}
          </p>
          {pipeline.jiraEpicId && (
            <Badge variant="outline" className="mt-3">
              Epic: {pipeline.jiraEpicId}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-medium">Historical Match Analysis Complete</p>
              <p className="text-sm text-muted-foreground">
                Similar projects have been identified and used to inform the impact assessment.
                The system automatically selected the most relevant matches based on semantic similarity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/sdlc-intelligence">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sdlc-intelligence/estimation-sheet">
            Next: Estimation Sheet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
