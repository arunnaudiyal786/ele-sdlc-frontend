"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PipelineProvider } from "@/contexts/pipeline-context"
import { StepIndicator } from "@/components/pipeline/step-indicator"

interface PipelineLayoutProps {
  children: React.ReactNode
}

export default function PipelineLayout({ children }: PipelineLayoutProps) {
  const params = useParams()
  const jobId = params?.jobId as string | undefined

  return (
    <PipelineProvider initialJobId={jobId}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/data-engineering">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {jobId ? `Pipeline Job` : 'New Pipeline'}
              </h1>
              {jobId && (
                <p className="text-xs font-mono text-slate-500">{jobId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="rounded-xl border bg-muted/30 p-6 shadow-sm">
          <StepIndicator />
        </div>

        {/* Page content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </PipelineProvider>
  )
}
