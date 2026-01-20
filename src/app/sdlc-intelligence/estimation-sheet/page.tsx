"use client"

import Link from "next/link"
import { Calculator, ArrowLeft, ArrowRight, TrendingUp, Clock, Users } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NoAssessmentState } from "@/components/sdlc/no-assessment-state"
import { TechInfoBox, TECH_INFO } from "@/components/sdlc/tech-info-box"

export default function EstimationSheetPage() {
  const { pipeline, isAgentComplete } = useSDLC()
  const isComplete = isAgentComplete('estimationSheet')
  const estimation = pipeline.estimationEffort
  const modules = pipeline.impactedModules

  if (!isComplete || !estimation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Estimation Sheet</h1>
            <p className="text-sm text-muted-foreground">
              View effort estimations and resource planning
            </p>
          </div>
        </div>

        <NoAssessmentState
          icon={Calculator}
          title="No estimation data available yet."
          description="Run an impact assessment to generate estimates."
          asLink
        />
      </div>
    )
  }

  const confidenceColor = {
    HIGH: 'text-green-500 bg-green-500/10',
    MEDIUM: 'text-yellow-500 bg-yellow-500/10',
    LOW: 'text-red-500 bg-red-500/10',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Estimation Sheet</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered effort estimation using historical data patterns
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {estimation.confidence} Confidence
        </Badge>
      </div>

      {/* Algorithm Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-1">Estimation Algorithm</h3>
                <p className="text-sm text-muted-foreground">
                  Uses AI to analyze historical project data and complexity to generate accurate effort estimates
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-primary">AI Analysis</div>
                  <p className="text-muted-foreground leading-relaxed">
                    LLM analyzes historical matches and impacted modules to calculate effort
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-primary">Smart Breakdown</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatically distributes hours across dev, QA, and story points by category
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-primary">Confidence Score</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Provides confidence level based on similarity to historical projects
                  </p>
                </div>
              </div>
              <div className="border-t border-primary/10 pt-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">How it works:</strong> The AI examines similar past projects and impacted modules to estimate effort.
                  It generates dev hours, QA hours, and story points with a category-wise breakdown.
                  Higher confidence means more similar historical projects were found to base the estimate on.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/sdlc-intelligence/historical-matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Historical Matches
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sdlc-intelligence/tdd-generation">
            Next: TDD Generation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estimation.total_hours}</p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estimation.total_dev_hours}</p>
                <p className="text-xs text-muted-foreground">Dev Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estimation.total_qa_hours}</p>
                <p className="text-xs text-muted-foreground">QA Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Calculator className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estimation.story_points}</p>
                <p className="text-xs text-muted-foreground">Story Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Effort Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Effort Breakdown by Module</CardTitle>
          <CardDescription>
            Detailed estimation for each impacted module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead className="text-right">Dev Hours</TableHead>
                <TableHead className="text-right">QA Hours</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[200px]">Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimation.breakdown.map((item, index) => {
                const totalHours = item.dev_hours + item.qa_hours
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className="text-right">{item.dev_hours}h</TableCell>
                    <TableCell className="text-right">{item.qa_hours}h</TableCell>
                    <TableCell className="text-right font-medium">{totalHours}h</TableCell>
                    <TableCell>
                      <Progress
                        value={(totalHours / estimation.total_hours) * 100}
                        className="h-2"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Impacted Modules */}
      {modules && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Functional Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Functional Modules</CardTitle>
              <CardDescription>
                {modules.functional_modules.length} modules impacted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {modules.functional_modules.map((mod, index) => (
                <div key={`functional-${index}`} className="flex items-start justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{mod.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mod.reason}</p>
                  </div>
                  <Badge variant={mod.impact === 'HIGH' ? 'destructive' : mod.impact === 'MEDIUM' ? 'default' : 'secondary'}>
                    {mod.impact}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Technical Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technical Modules</CardTitle>
              <CardDescription>
                {modules.technical_modules.length} modules impacted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {modules.technical_modules.map((mod, index) => (
                <div key={`technical-${index}`} className="flex items-start justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{mod.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mod.reason}</p>
                  </div>
                  <Badge variant={mod.impact === 'HIGH' ? 'destructive' : mod.impact === 'MEDIUM' ? 'default' : 'secondary'}>
                    {mod.impact}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notes */}
      {estimation.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{estimation.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
