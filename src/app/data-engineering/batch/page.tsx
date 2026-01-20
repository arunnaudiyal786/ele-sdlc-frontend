"use client"

import * as React from "react"
import Link from "next/link"
import {
  RefreshCw,
  FolderInput,
  Play,
  Square,
  AlertCircle,
  FolderOpen,
  Cpu,
  FileOutput,
  Sparkles,
  Terminal,
  Eye,
  Activity,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function BatchProcessingPage() {
  const [isWatcherRunning, setIsWatcherRunning] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleStartWatcher = () => {
    setIsWatcherRunning(true)
  }

  const handleStopWatcher = () => {
    setIsWatcherRunning(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <RefreshCw className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Batch Processing</h1>
          <p className="text-sm text-muted-foreground">
            Automated document processing with folder watching
          </p>
        </div>
      </div>

      {/* Watcher status */}
      <Card className={cn(
        isWatcherRunning && "border-green-200"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isWatcherRunning ? "bg-green-500" : "bg-muted"
            )}>
              <FolderInput className={cn(
                "h-5 w-5",
                isWatcherRunning ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            Folder Watcher
          </CardTitle>
          <CardDescription>
            Monitor the inbox folder for new document sets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status display */}
          <div className={cn(
            "rounded-lg border p-4",
            isWatcherRunning ? "border-green-200 bg-green-50" : "bg-muted/50"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  isWatcherRunning ? "bg-green-500" : "bg-muted"
                )}>
                  {isWatcherRunning ? (
                    <Activity className="h-6 w-6 text-white animate-pulse" />
                  ) : (
                    <Square className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {isWatcherRunning ? 'Watcher Active' : 'Watcher Stopped'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">
                      data/pipeline/inbox/
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant={isWatcherRunning ? "default" : "secondary"}>
                <span className={cn(
                  "mr-1.5 inline-block h-2 w-2 rounded-full",
                  isWatcherRunning ? "bg-green-300 animate-pulse" : "bg-muted-foreground"
                )} />
                {isWatcherRunning ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Action button */}
          <div className="flex gap-3">
            {isWatcherRunning ? (
              <Button
                onClick={handleStopWatcher}
                variant="outline"
                size="lg"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Watcher
              </Button>
            ) : (
              <Button
                onClick={handleStartWatcher}
                size="lg"
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Watcher
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            How Batch Processing Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <ProcessStep
              number={1}
              title="Drop Files in Inbox"
              description="Place your document sets in the data/pipeline/inbox/ folder."
              icon={FolderInput}
            />
            <ProcessStep
              number={2}
              title="Auto-Detection"
              description="The watcher detects new files and creates a pipeline job."
              icon={Eye}
            />
            <ProcessStep
              number={3}
              title="Auto-Processing"
              description="Files are extracted, mapped, transformed, and exported."
              icon={Cpu}
            />
            <ProcessStep
              number={4}
              title="Output Ready"
              description="Completed jobs appear in data/pipeline/completed/."
              icon={FileOutput}
            />
          </div>
        </CardContent>
      </Card>

      {/* Beta notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-700">Beta Feature</p>
              <p className="mt-1 text-sm text-amber-600">
                Batch processing is available via the backend CLI. For production use:
              </p>
              <div className="mt-3 rounded-lg bg-white border border-amber-200 p-3">
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4 text-amber-600 shrink-0" />
                  <code className="text-sm font-mono text-amber-800">
                    python -m pipeline.watchers.batch_processor
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link to interactive mode */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Prefer step-by-step control?
        </p>
        <Button variant="outline" asChild>
          <Link href="/data-engineering/pipeline/new">
            <Sparkles className="mr-2 h-4 w-4" />
            Use Interactive Mode
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

interface ProcessStepProps {
  number: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

function ProcessStep({ number, title, description, icon: Icon }: ProcessStepProps) {
  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-muted/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{title}</h4>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
