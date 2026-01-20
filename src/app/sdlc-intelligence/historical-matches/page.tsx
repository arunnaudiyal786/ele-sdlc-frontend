"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ArrowLeft, ArrowRight, CheckCircle2, Users, Clock, TrendingUp } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NoAssessmentState } from "@/components/sdlc/no-assessment-state"
import { TechInfoBox, TECH_INFO } from "@/components/sdlc/tech-info-box"
import { cn } from "@/lib/utils"

export default function HistoricalMatchesPage() {
  const { pipeline, isAgentComplete } = useSDLC()
  const isComplete = isAgentComplete('historicalMatches')
  const [displayCount, setDisplayCount] = useState<number>(5)

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

  const historicalMatches = pipeline.historicalMatches || []
  const displayedMatches = historicalMatches.slice(0, displayCount)
  const techInfo = TECH_INFO.historicalMatches

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Historical Matches</h1>
            <p className="text-sm text-muted-foreground">
              Intelligent hybrid search combining semantic and keyword analysis
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      </div>

      {/* Algorithm Info Card - Compact */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Search className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-1">Historical Match Algorithm</h3>
                <p className="text-sm text-muted-foreground">
                  Uses AI-powered hybrid search to find similar past projects by analyzing both meaning and keywords
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-primary">Semantic 70%</div>
                  <p className="text-muted-foreground leading-relaxed">
                    AI understands the meaning and context of your requirement using vector embeddings
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-primary">Keyword 30%</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Matches specific technical terms and important keywords from your requirement
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-primary">RRF Fusion</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Combines both scores using Reciprocal Rank Fusion to rank the best matches
                  </p>
                </div>
              </div>
              <div className="border-t border-primary/10 pt-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">How it works:</strong> Each match gets a combined score.
                  Higher semantic scores mean the AI found similar concepts, while higher keyword scores indicate exact technical term matches.
                  The system returns the top 10 most relevant historical projects to inform your impact assessment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirement Context */}
      <Card>
        <CardHeader>
          <CardTitle>Input Requirement</CardTitle>
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

      {/* Historical Matches with Dropdown */}
      {historicalMatches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Similar Historical Requirements</CardTitle>
                <CardDescription>
                  Found {historicalMatches.length} similar projects ranked by semantic and keyword match
                </CardDescription>
              </div>
              <Select
                value={displayCount.toString()}
                onValueChange={(value) => setDisplayCount(Number(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Show 5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Show 5</SelectItem>
                  <SelectItem value="10">Show 10</SelectItem>
                  <SelectItem value="15">Show 15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayedMatches.map((match, index) => {
              const effortVariance = match.actual_hours && match.estimated_hours
                ? ((match.actual_hours - match.estimated_hours) / match.estimated_hours * 100).toFixed(0)
                : null
              const wasUnderestimated = match.actual_hours > match.estimated_hours

              // Display semantic/keyword scores or fallback message
              const semanticScore = match.score_breakdown?.semantic_score
              const keywordScore = match.score_breakdown?.keyword_score

              return (
                <div
                  key={match.match_id}
                  className="rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary" className="font-mono">
                          #{index + 1}
                        </Badge>
                        <h4 className="font-semibold text-foreground flex-1 min-w-0">
                          {match.epic_name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono",
                            match.match_score >= 0.5 ? "border-primary text-primary" : ""
                          )}
                        >
                          {(match.match_score * 100).toFixed(0)}% match
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {match.description}
                      </p>

                      {/* Tech Stack */}
                      {match.technologies && match.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
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
                      )}

                      {/* Score Breakdown */}
                      <div className="flex gap-4 text-xs">
                        {semanticScore !== undefined && keywordScore !== undefined ? (
                          <>
                            <span className="text-muted-foreground">
                              Semantic: <span className="font-medium text-primary">{(semanticScore * 100).toFixed(0)}%</span>
                            </span>
                            <span className="text-muted-foreground">
                              Keyword: <span className="font-medium text-primary">{(keywordScore * 100).toFixed(0)}%</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Score breakdown not available
                          </span>
                        )}
                        {match.epic_id && (
                          <Badge variant="outline" className="text-xs">
                            Epic: {match.epic_id}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats Panel */}
                    {(match.actual_hours || match.estimated_hours) && (
                      <div className="flex gap-4 text-sm">
                        {match.actual_hours && (
                          <div className="text-center min-w-[70px]">
                            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                              <Clock className="h-3 w-3" />
                              <span>Actual</span>
                            </div>
                            <p className="font-semibold">{match.actual_hours}h</p>
                          </div>
                        )}
                        {match.estimated_hours && (
                          <div className="text-center min-w-[70px]">
                            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Est.</span>
                            </div>
                            <p className="font-semibold">{match.estimated_hours}h</p>
                          </div>
                        )}
                        {effortVariance && (
                          <div className="text-center min-w-[70px]">
                            <div className="text-muted-foreground text-xs mb-1">Variance</div>
                            <p className={cn(
                              "font-semibold",
                              wasUnderestimated ? "text-destructive" : "text-primary"
                            )}>
                              {wasUnderestimated ? "+" : ""}{effortVariance}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

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
