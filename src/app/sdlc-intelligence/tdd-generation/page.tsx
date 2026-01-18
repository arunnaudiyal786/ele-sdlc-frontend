"use client"

import Link from "next/link"
import { FileCode, ArrowLeft, ArrowRight, Layers, GitBranch, Shield, Database } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { NoAssessmentState } from "@/components/sdlc/no-assessment-state"

export default function TDDGenerationPage() {
  const { pipeline, isAgentComplete } = useSDLC()
  const isComplete = isAgentComplete('tddGeneration')
  const tdd = pipeline.tdd

  if (!isComplete || !tdd) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">TDD Generation</h1>
            <p className="text-sm text-muted-foreground">
              Technical Design Document generation
            </p>
          </div>
        </div>

        <NoAssessmentState
          icon={FileCode}
          title="No TDD available yet."
          description="Run an impact assessment to generate the Technical Design Document."
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
            <FileCode className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{tdd.tdd_name}</h1>
            <p className="text-sm text-muted-foreground">
              Technical Design Document
            </p>
          </div>
        </div>
        <Badge variant="outline">{tdd.architecture_pattern}</Badge>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{tdd.technical_components.length}</p>
                <p className="text-xs text-muted-foreground">Components</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xl font-bold">{tdd.tdd_dependencies.length}</p>
                <p className="text-xs text-muted-foreground">Dependencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xl font-bold">{tdd.performance_requirements ? 'Yes' : 'No'}</p>
                <p className="text-xs text-muted-foreground">Performance Req</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xl font-bold">{tdd.security_considerations ? 'Yes' : 'No'}</p>
                <p className="text-xs text-muted-foreground">Security Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="details">Technical Details</TabsTrigger>
          <TabsTrigger value="markdown">Full Document</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Design Decisions */}
          <Card>
            <CardHeader>
              <CardTitle>Design Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {tdd.design_decisions}
              </p>
            </CardContent>
          </Card>

          {/* Dependencies */}
          <Card>
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
              <CardDescription>External services and systems this feature depends on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tdd.tdd_dependencies.map((dep, i) => (
                  <Badge key={i} variant="outline">
                    {dep}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Components</CardTitle>
              <CardDescription>Technologies and frameworks used in this implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {tdd.technical_components.map((component, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-bold">
                      {i + 1}
                    </div>
                    <span className="font-medium">{component}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* TDD Description */}
          {tdd.tdd_description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {tdd.tdd_description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Performance Requirements */}
          {tdd.performance_requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {tdd.performance_requirements}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Security Considerations */}
          {tdd.security_considerations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {tdd.security_considerations}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="markdown">
          <Card>
            <CardHeader>
              <CardTitle>Full Technical Design Document</CardTitle>
              <CardDescription>Complete markdown content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
                  {tdd.markdown_content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/sdlc-intelligence/estimation-sheet">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Estimation Sheet
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sdlc-intelligence/jira-stories">
            Next: Jira Stories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
