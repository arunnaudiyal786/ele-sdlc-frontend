"use client"

import Link from "next/link"
import { ArrowLeft, Download, ExternalLink, FileText, Clock, AlertTriangle, Code2, ListTodo } from "lucide-react"
import { useWizard } from "@/contexts/wizard-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export function ResultsSummary() {
  const { assessmentResult, goToPreviousStep, resetWizard } = useWizard()

  if (!assessmentResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No assessment results available.</p>
        <Button variant="link" onClick={goToPreviousStep}>
          Go back to select matches
        </Button>
      </div>
    )
  }

  const { effortEstimation, functionalModules, technicalModules, jiraStories, codeImpacts, risks } = assessmentResult

  const highSeverityRisks = risks.filter(r => r.severity === 'HIGH').length
  const totalModules = functionalModules.length + technicalModules.length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Effort</p>
                <p className="text-2xl font-bold">{effortEstimation.totalDevHours + effortEstimation.totalQAHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ListTodo className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Story Points</p>
                <p className="text-2xl font-bold">{effortEstimation.storyPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modules Impacted</p>
                <p className="text-2xl font-bold">{totalModules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risks</p>
                <p className="text-2xl font-bold">{highSeverityRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Score */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estimation Confidence</p>
              <p className="text-sm text-muted-foreground">
                Based on {assessmentResult.selectedMatchIds.length} similar historical projects
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={effortEstimation.confidenceScore} className="w-32" />
              <span className="text-lg font-bold text-primary">
                {effortEstimation.confidenceScore}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs Preview */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modules">Modules ({totalModules})</TabsTrigger>
          <TabsTrigger value="effort">Effort</TabsTrigger>
          <TabsTrigger value="stories">Stories ({jiraStories.length})</TabsTrigger>
          <TabsTrigger value="code">Code ({codeImpacts.length})</TabsTrigger>
          <TabsTrigger value="risks">Risks ({risks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Impacted Modules</CardTitle>
              <CardDescription>
                Functional and technical modules affected by this requirement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...functionalModules, ...technicalModules].slice(0, 5).map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {module.type}
                      </Badge>
                      <span className="font-medium">{module.name}</span>
                    </div>
                    <Badge
                      variant={
                        module.impactSeverity === 'HIGH'
                          ? 'destructive'
                          : module.impactSeverity === 'MEDIUM'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {module.impactSeverity}
                    </Badge>
                  </div>
                ))}
                {totalModules > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    +{totalModules - 5} more modules
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effort">
          <Card>
            <CardHeader>
              <CardTitle>Effort Breakdown</CardTitle>
              <CardDescription>
                Estimated hours by module and activity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-primary/5 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Development</p>
                  <p className="text-3xl font-bold text-primary">{effortEstimation.totalDevHours}h</p>
                </div>
                <div className="rounded-lg bg-success/5 p-4 text-center">
                  <p className="text-sm text-muted-foreground">QA Testing</p>
                  <p className="text-3xl font-bold text-success">{effortEstimation.totalQAHours}h</p>
                </div>
                <div className="rounded-lg bg-warning/5 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Design</p>
                  <p className="text-3xl font-bold text-warning">{effortEstimation.totalDesignHours}h</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium">Historical Comparison</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Avg: {effortEstimation.historicalComparison.averageEffort}h
                  </span>
                  <span className="text-muted-foreground">
                    Min: {effortEstimation.historicalComparison.minEffort}h
                  </span>
                  <span className="text-muted-foreground">
                    Max: {effortEstimation.historicalComparison.maxEffort}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stories">
          <Card>
            <CardHeader>
              <CardTitle>Generated Jira Stories</CardTitle>
              <CardDescription>
                Auto-generated stories ready for import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jiraStories.slice(0, 5).map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{story.type}</Badge>
                      <span className="font-medium">{story.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{story.storyPoints} pts</Badge>
                      <Badge
                        variant={
                          story.priority === 'HIGH'
                            ? 'destructive'
                            : story.priority === 'MEDIUM'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {story.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
                {jiraStories.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    +{jiraStories.length - 5} more stories
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Code Impact Analysis</CardTitle>
              <CardDescription>
                Files and repositories affected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {codeImpacts.slice(0, 5).map((impact) => (
                  <div
                    key={impact.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{impact.filePath}</p>
                        <p className="text-xs text-muted-foreground">{impact.repository}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{impact.language}</Badge>
                      <Badge
                        variant={
                          impact.changeType === 'new'
                            ? 'default'
                            : impact.changeType === 'modified'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {impact.changeType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Identified Risks</CardTitle>
              <CardDescription>
                Potential risks and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {risks.slice(0, 5).map((risk) => (
                  <div
                    key={risk.id}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          risk.severity === 'HIGH' ? 'text-destructive' :
                          risk.severity === 'MEDIUM' ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                        <span className="font-medium">{risk.title}</span>
                      </div>
                      <Badge
                        variant={
                          risk.severity === 'HIGH'
                            ? 'destructive'
                            : risk.severity === 'MEDIUM'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            Create Jira Tickets
          </Button>
        </div>
      </div>
    </div>
  )
}
