"use client"

import { CheckCircle2, Loader2, Check, Circle, History, Calculator, FileCode, ListTodo, ArrowRight } from "lucide-react"
import { useWizard } from "@/contexts/wizard-context"
import { useSDLC } from "@/contexts/sdlc-context"
import { AGENTS } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AssessmentComplete() {
  const { setCurrentStep, resetWizard, isAnalyzing } = useWizard()
  const { pipeline, streaming } = useSDLC()

  const handleViewResults = () => {
    setCurrentStep('estimation')
  }

  const handleNewAssessment = () => {
    resetWizard()
  }

  const handleViewMatches = () => {
    setCurrentStep('matches')
  }

  const handleViewEstimation = () => {
    setCurrentStep('estimation')
  }

  const handleViewTDD = () => {
    setCurrentStep('tdd')
  }

  const handleViewJira = () => {
    setCurrentStep('jira')
  }

  // Extract metrics from pipeline data
  const modulesImpacted = pipeline.impactedModules?.total_modules || 0
  const totalHours = pipeline.estimationEffort?.total_hours || 0
  const jiraStories = pipeline.jiraStories?.story_count || 0

  // Check if pipeline is complete
  const isPipelineComplete = pipeline.status === 'completed' ||
                              pipeline.status === 'jira_stories_generated'

  // Show progress view if still analyzing
  if (isAnalyzing && !isPipelineComplete) {
    // Filter to show only visible agents (after historical matching setup)
    const visibleAgents = AGENTS.filter(agent =>
      !['requirement', 'historical_match', 'auto_select'].includes(agent.name)
    )

    // Count only visible agents for progress display
    const visibleCompleted = streaming.completedAgents.filter(name =>
      !['requirement', 'historical_match', 'auto_select'].includes(name)
    ).length

    const allAgentsComplete = streaming.completedAgents.length === AGENTS.length
    const progressPercent = allAgentsComplete ? 100 : streaming.progressPercent

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-6">
            <div className="space-y-6">
              {/* Header with spinner */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Analysis in Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Processing your requirement through the AI pipeline...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{progressPercent}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {visibleCompleted} of {visibleAgents.length} agents complete
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              {/* Current agent indicator */}
              {streaming.currentAgentName && (
                <div className="rounded-lg bg-background/50 p-3">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-medium">
                      {AGENTS.find(a => a.name === streaming.currentAgentName)?.displayName || streaming.currentAgentName}
                    </span>
                  </p>
                </div>
              )}

              {/* Agent checklist grid - only show visible agents */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {visibleAgents.map((agent) => {
                  const isComplete = streaming.completedAgents.includes(agent.name)
                  const isCurrent = agent.name === streaming.currentAgentName
                  const isPending = !isComplete && !isCurrent

                  return (
                    <div
                      key={agent.name}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-all",
                        isComplete && "border-green-500/30 bg-green-500/5",
                        isCurrent && "border-primary bg-primary/5 shadow-sm",
                        isPending && "border-border bg-background/30 opacity-60"
                      )}
                    >
                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        isComplete && "bg-green-500 text-white",
                        isCurrent && "bg-primary text-primary-foreground",
                        isPending && "bg-muted text-muted-foreground"
                      )}>
                        {isComplete ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : isCurrent ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          isComplete && "text-green-700 dark:text-green-400",
                          isCurrent && "text-primary",
                          isPending && "text-muted-foreground"
                        )}>
                          {agent.displayName}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show completion view when pipeline is done
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Assessment Complete Header Card */}
      <Card className="border-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle className="text-green-600">Assessment Complete</CardTitle>
          </div>
          <CardDescription>
            Impact assessment has been generated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{modulesImpacted}</p>
              <p className="text-sm text-muted-foreground mt-1">Modules Impacted</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{totalHours}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Hours</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{jiraStories}</p>
              <p className="text-sm text-muted-foreground mt-1">Jira Stories</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleViewResults} className="w-full" size="lg">
              View Results
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex gap-3">
              <Button onClick={handleViewMatches} variant="outline" className="flex-1">
                <History className="mr-2 h-4 w-4" />
                View Selected Matches
              </Button>
              <Button onClick={handleNewAssessment} variant="outline" className="flex-1">
                New Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimation Sheet Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Estimation Sheet</CardTitle>
                <CardDescription>
                  AI-powered effort estimation using historical data patterns
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleViewEstimation}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{pipeline.estimationEffort?.total_hours || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Hours</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{pipeline.estimationEffort?.total_dev_hours || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Dev Hours</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{pipeline.estimationEffort?.total_qa_hours || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">QA Hours</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{pipeline.estimationEffort?.story_points || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Story Points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TDD Generation Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>TDD Generation</CardTitle>
                <CardDescription>
                  AI-generated Technical Design Document
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleViewTDD}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Architecture Pattern</p>
              <p className="text-base">{pipeline.tdd?.architecture_pattern || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Components</p>
              <p className="text-base">
                {pipeline.tdd?.technical_components?.length || 0} technical components defined
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jira Stories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Jira Stories</CardTitle>
                <CardDescription>
                  AI-decomposed user stories and tasks ready for your backlog
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleViewJira}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{pipeline.jiraStories?.story_count || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Stories</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold">{pipeline.jiraStories?.total_story_points || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Story Points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
