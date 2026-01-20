"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Brain, Loader2, AlertCircle, CheckCircle2, ArrowRight, FileText, Circle } from "lucide-react"
import { useSDLC } from "@/contexts/sdlc-context"
import { AGENTS } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NoAssessmentState } from "@/components/sdlc/no-assessment-state"

export default function SDLCIntelligencePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pipeline, streaming, runImpactPipeline, resetPipeline } = useSDLC()
  const [requirementText, setRequirementText] = React.useState('')
  const [jiraEpicId, setJiraEpicId] = React.useState('')
  const [showForm, setShowForm] = React.useState(false)

  // Auto-show form if 'start' query parameter is present
  React.useEffect(() => {
    if (searchParams.get('start') === 'true') {
      setShowForm(true)
      // Clean up URL
      router.replace('/sdlc-intelligence')
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (requirementText.trim().length < 20) return
    runImpactPipeline(requirementText.trim(), jiraEpicId.trim() || undefined)
  }

  const handleReset = () => {
    resetPipeline()
    setRequirementText('')
    setJiraEpicId('')
    setShowForm(false)
  }

  const handleStartAssessment = () => {
    setShowForm(true)
  }

  const handleViewResults = () => {
    router.push('/sdlc-intelligence/historical-matches')
  }

  const handleLoadSample = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/samples/requirement`)
      if (response.ok) {
        const data = await response.json()
        setRequirementText(data.requirement_text || '')
        setJiraEpicId(data.jira_epic_id || '')
      }
    } catch (error) {
      console.error('Failed to load sample:', error)
    }
  }

  // Use streaming progress from SSE events
  const progressPercent = streaming.isStreaming ? streaming.progressPercent : (pipeline.status === 'completed' ? 100 : 0)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SDLC Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered impact assessment for software requirements
          </p>
        </div>
      </div>

      {/* Main Content */}
      {!pipeline.isRunning && !pipeline.status && !showForm ? (
        // Initial State - Show Start Assessment
        <NoAssessmentState onStartAssessment={handleStartAssessment} />
      ) : !pipeline.isRunning && !pipeline.status && showForm ? (
        // Input Form (after clicking Start Assessment)
        <Card>
          <CardHeader>
            <CardTitle>New Impact Assessment</CardTitle>
            <CardDescription>
              Enter your requirement description to analyze its impact on existing systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requirement">Requirement Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    className="h-7 text-xs"
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    Load Sample Input
                  </Button>
                </div>
                <Textarea
                  id="requirement"
                  placeholder="Describe your requirement in detail. Include functional requirements, technical constraints, and expected outcomes..."
                  value={requirementText}
                  onChange={(e) => setRequirementText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 20 characters required. {requirementText.length} / 20
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="epicId">Jira Epic ID (Optional)</Label>
                <Input
                  id="epicId"
                  placeholder="e.g., PROJ-123"
                  value={jiraEpicId}
                  onChange={(e) => setJiraEpicId(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={requirementText.trim().length < 20}
              >
                Run Impact Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : pipeline.isRunning ? (
        // Running State
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Analysis in Progress
            </CardTitle>
            <CardDescription>
              Processing your requirement through the AI pipeline...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Current Stage */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium">
                Current: {streaming.currentAgentName
                  ? (AGENTS.find(a => a.name === streaming.currentAgentName)?.displayName || streaming.currentAgentName)
                  : 'Starting...'}
              </p>
            </div>

            {/* Pipeline Stages - using AGENTS from SSE streaming */}
            <div className="space-y-2">
              {AGENTS.map((agent, index) => {
                const isComplete = streaming.completedAgents.includes(agent.name)
                const isCurrent = index === streaming.currentAgentIndex

                return (
                  <div
                    key={agent.name}
                    className={`flex items-center gap-3 rounded-lg p-2 ${
                      isCurrent ? 'bg-primary/10' : ''
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/30" />
                    )}
                    <span className={`text-sm ${isComplete ? 'text-muted-foreground' : ''}`}>
                      {agent.displayName}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : pipeline.status === 'error' ? (
        // Error State
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Assessment Failed
            </CardTitle>
            <CardDescription>
              An error occurred during the impact assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                {pipeline.error || 'Unknown error occurred'}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Completed State
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Assessment Complete
            </CardTitle>
            <CardDescription>
              Impact assessment has been generated successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">
                  {pipeline.impactedModules?.total_modules || 0}
                </p>
                <p className="text-xs text-muted-foreground">Modules Impacted</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">
                  {pipeline.estimationEffort?.total_hours || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">
                  {pipeline.jiraStories?.story_count || 0}
                </p>
                <p className="text-xs text-muted-foreground">Jira Stories</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleViewResults} className="flex-1">
                View Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={handleReset} variant="outline">
                New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
