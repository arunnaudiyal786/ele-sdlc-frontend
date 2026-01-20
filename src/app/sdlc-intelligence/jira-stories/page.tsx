"use client"

import Link from "next/link"
import { ListTodo, ArrowLeft, CheckCircle2, AlertTriangle, Bug, Lightbulb } from "lucide-react"
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { NoAssessmentState } from "@/components/sdlc/no-assessment-state"
import { TechInfoBox, TECH_INFO } from "@/components/sdlc/tech-info-box"

const storyTypeIcons = {
  Story: ListTodo,
  Task: CheckCircle2,
  Bug: Bug,
  Spike: Lightbulb,
}

const priorityColors = {
  HIGH: 'bg-red-500/10 text-red-500 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  LOW: 'bg-green-500/10 text-green-500 border-green-500/20',
}

export default function JiraStoriesPage() {
  const { pipeline, isAgentComplete } = useSDLC()
  const isComplete = isAgentComplete('jiraStories')
  const jiraData = pipeline.jiraStories
  const codeImpact = pipeline.codeImpact
  const risks = pipeline.risks

  if (!isComplete || !jiraData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ListTodo className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jira Stories</h1>
            <p className="text-sm text-muted-foreground">
              Generated user stories and tasks
            </p>
          </div>
        </div>

        <NoAssessmentState
          icon={ListTodo}
          title="No Jira stories available yet."
          description="Run an impact assessment to generate stories."
          asLink
        />
      </div>
    )
  }

  const stories = jiraData.stories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ListTodo className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jira Stories</h1>
            <p className="text-sm text-muted-foreground">
              AI-decomposed user stories and tasks ready for your backlog
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {jiraData.story_count} stories
        </Badge>
      </div>

      {/* Algorithm Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ListTodo className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-1">Jira Story Generation Algorithm</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligently breaks down requirements into actionable user stories with acceptance criteria
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="font-bold text-primary">Smart Decomposition</div>
                  <p className="text-muted-foreground leading-relaxed">
                    AI analyzes TDD and estimation to create Stories, Tasks, and Spikes based on work nature
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-primary">Story Sizing</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatically assigns story points aligned with effort estimation breakdown
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-primary">Acceptance Criteria</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Generates clear acceptance criteria derived from requirements and technical design
                  </p>
                </div>
              </div>
              <div className="border-t border-primary/10 pt-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">How it works:</strong> The AI examines the TDD, estimation breakdown, and impacted modules to decompose work.
                  It creates properly sized stories with descriptions, acceptance criteria, and priorities.
                  Story types (Story/Task/Spike) are automatically determined based on the nature of work, and story points are distributed to match the effort estimate.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/sdlc-intelligence/tdd-generation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            TDD Generation
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sdlc-intelligence">
            New Assessment
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{jiraData.story_count}</p>
            <p className="text-xs text-muted-foreground">Total Stories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{jiraData.total_story_points}</p>
            <p className="text-xs text-muted-foreground">Story Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Stories List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Stories</CardTitle>
          <CardDescription>
            Review and export to Jira
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {stories.map((story, index) => {
            const Icon = storyTypeIcons[story.story_type] || ListTodo
            const storyKey = story.story_id || `story-${index}`
            return (
              <Collapsible key={storyKey} className="border rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3 text-left">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium truncate">{story.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">{story.story_points} pts</Badge>
                    <Badge className={priorityColors[story.priority]}>
                      {story.priority}
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-4">
                  {/* Description */}
                  {story.description && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{story.description}</p>
                    </div>
                  )}

                  {/* Acceptance Criteria */}
                  {story.acceptance_criteria && story.acceptance_criteria.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Acceptance Criteria</p>
                      <ul className="space-y-1">
                        {story.acceptance_criteria.map((criterion, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Labels */}
                  {story.labels && story.labels.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Labels</p>
                      <div className="flex flex-wrap gap-1">
                        {story.labels.map((label, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </CardContent>
      </Card>

      {/* Risks Section */}
      {risks && risks.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Identified Risks
            </CardTitle>
            <CardDescription>
              {risks.total_risks} risks identified, {risks.high_severity_count} high severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.risks.map((risk) => (
                <div key={risk.risk_id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{risk.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant={risk.severity === 'HIGH' ? 'destructive' : risk.severity === 'MEDIUM' ? 'default' : 'secondary'}>
                        {risk.severity}
                      </Badge>
                      <Badge variant="outline">{risk.category}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                  <div className="text-sm">
                    <span className="font-medium">Mitigation: </span>
                    <span className="text-muted-foreground">{risk.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Impact Section */}
      {codeImpact && codeImpact.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Code Impact</CardTitle>
            <CardDescription>
              {codeImpact.total_files} files across {codeImpact.repositories_affected.length} repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {codeImpact.files.slice(0, 10).map((file) => (
                <div key={file.file_id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant={file.change_type === 'new' ? 'default' : file.change_type === 'modified' ? 'secondary' : 'destructive'}>
                      {file.change_type}
                    </Badge>
                    <code className="truncate text-xs">{file.file_path}</code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">{file.language}</Badge>
                    <span className="text-muted-foreground">~{file.estimated_lines} lines</span>
                  </div>
                </div>
              ))}
              {codeImpact.files.length > 10 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  And {codeImpact.files.length - 10} more files...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
