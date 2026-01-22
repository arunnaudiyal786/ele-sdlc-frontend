"use client"

import * as React from "react"
import { Upload, FileSearch, GitBranch, RefreshCw, Download, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type JobStep, PIPELINE_STEPS } from "@/lib/api/pipeline"
import { usePipeline } from "@/contexts/pipeline-context"

const stepIcons: Record<JobStep, React.ComponentType<{ className?: string }>> = {
  upload: Upload,
  extract: FileSearch,
  map: GitBranch,
  transform: RefreshCw,
  validate: CheckCircle2,
  export: Download,
}

interface StepIndicatorProps {
  className?: string
}

export function StepIndicator({ className }: StepIndicatorProps) {
  const { currentStep, getStepStatusForJob, jobId } = usePipeline()

  return (
    <div className={cn("w-full", className)}>
      {/* Pipeline flow visualization */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />

        {/* Progress track - gradient from cyan to blue */}
        <div
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
          style={{
            width: `${Math.max(0, (PIPELINE_STEPS.findIndex(s => s.id === currentStep) / (PIPELINE_STEPS.length - 1)) * 100)}%`
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {PIPELINE_STEPS.map((step, index) => {
            const Icon = stepIcons[step.id]
            const status = getStepStatusForJob(step.id)
            const isActive = currentStep === step.id
            const isCompleted = status === 'completed'
            const isError = status === 'error'
            const isPending = status === 'pending'

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
                    isCompleted && "bg-green-500 shadow-lg shadow-green-500/30",
                    isActive && "bg-primary shadow-lg shadow-primary/30",
                    isError && "bg-destructive shadow-lg shadow-destructive/30",
                    isPending && "bg-muted border border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : isError ? (
                    <AlertCircle className="h-5 w-5 text-white" />
                  ) : isActive ? (
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCompleted && "text-green-600 dark:text-green-400",
                      isActive && "text-primary",
                      isError && "text-destructive",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Compact version for sidebar or smaller spaces
export function StepIndicatorCompact({ className }: StepIndicatorProps) {
  const { currentStep, getStepStatusForJob } = usePipeline()

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {PIPELINE_STEPS.map((step, index) => {
        const status = getStepStatusForJob(step.id)
        const isActive = currentStep === step.id
        const isCompleted = status === 'completed'
        const isError = status === 'error'

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                isCompleted && "bg-green-500",
                isActive && "bg-primary ring-2 ring-primary/30",
                isError && "bg-red-500",
                !isCompleted && !isActive && !isError && "bg-muted-foreground/30"
              )}
              title={`${step.label}: ${status}`}
            />
            {index < PIPELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-4",
                  isCompleted ? "bg-green-500/50" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
