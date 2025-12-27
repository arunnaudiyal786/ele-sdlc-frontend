"use client"

import { ArrowLeft, Loader2, Check, Users, Clock, TrendingUp } from "lucide-react"
import { useWizard } from "@/contexts/wizard-context"
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
    analysisProgress,
  } = useWizard()

  const canProceed = selectedMatchIds.length > 0

  const handleGenerateAssessment = async () => {
    await startAnalysis()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Analysis Progress Overlay */}
      {isAnalyzing && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Analyzing Impact...</h3>
                <p className="text-sm text-muted-foreground">
                  AI is generating your impact assessment based on selected historical matches
                </p>
              </div>
              <Progress value={analysisProgress} className="w-64" />
              <p className="text-sm font-medium text-primary">
                {analysisProgress}% Complete
              </p>
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
