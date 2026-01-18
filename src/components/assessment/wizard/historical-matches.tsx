"use client"

import { ArrowLeft, Loader2, Check, Users, Clock, TrendingUp, Circle } from "lucide-react"
import { useWizard } from "@/contexts/wizard-context"
import { useSDLC } from "@/contexts/sdlc-context"
import { AGENTS } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

export function HistoricalMatches() {
  const {
    matches,
    selectedMatchIds,
    toggleMatchSelection,
    goToPreviousStep,
    startAnalysis,
    isAnalyzing,
  } = useWizard()

  const { streaming } = useSDLC()

  const canProceed = selectedMatchIds.length > 0

  const handleGenerateAssessment = async () => {
    await startAnalysis()
  }

  // Use real streaming progress if streaming, otherwise fallback
  const progressPercent = streaming.isStreaming ? streaming.progressPercent : (isAnalyzing ? 0 : 100)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Analysis Progress with Agent Checklist */}
      {isAnalyzing && (
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
                    {streaming.completedAgents.length} of {AGENTS.length} agents complete
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

              {/* Agent checklist grid */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {AGENTS.map((agent, idx) => {
                  const isComplete = streaming.completedAgents.includes(agent.name)
                  const isCurrent = idx === streaming.currentAgentIndex
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
      )}

      {!isAnalyzing && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Similar Historical Projects</CardTitle>
              <CardDescription>
                Select projects to use as baseline for impact estimation.
                The AI found {matches.length} similar projects based on your requirement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.map((match) => {
                const isSelected = selectedMatchIds.includes(match.id)
                const effortVariance = ((match.actualEffort - match.estimatedEffort) / match.estimatedEffort * 100).toFixed(0)
                const wasUnderestimated = match.actualEffort > match.estimatedEffort

                return (
                  <div
                    key={match.id}
                    onClick={() => toggleMatchSelection(match.id)}
                    className={cn(
                      "cursor-pointer rounded-lg border p-4 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleMatchSelection(match.id)}
                        />
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-foreground">
                              {match.epicName}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-mono",
                                match.similarityScore >= 90 && "border-success text-success",
                                match.similarityScore >= 70 && match.similarityScore < 90 && "border-warning text-warning",
                                match.similarityScore < 70 && "border-muted-foreground text-muted-foreground"
                              )}
                            >
                              {match.similarityScore}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {match.epicDescription}
                          </p>

                          {/* Tech Stack */}
                          <div className="flex flex-wrap gap-1">
                            {match.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Team</span>
                          </div>
                          <p className="font-semibold">{match.teamSize}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Actual</span>
                          </div>
                          <p className="font-semibold">{match.actualEffort}h</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span>Est.</span>
                          </div>
                          <p className="font-semibold">{match.estimatedEffort}h</p>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Variance</div>
                          <p
                            className={cn(
                              "font-semibold",
                              wasUnderestimated ? "text-destructive" : "text-success"
                            )}
                          >
                            {wasUnderestimated ? "+" : ""}{effortVariance}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lessons Learned */}
                    {match.lessonsLearned && (
                      <div className="mt-3 rounded-md bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                          <strong>Lessons Learned:</strong> {match.lessonsLearned}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={goToPreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleGenerateAssessment}
              disabled={!canProceed}
            >
              <Check className="mr-2 h-4 w-4" />
              Generate Assessment ({selectedMatchIds.length} selected)
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
