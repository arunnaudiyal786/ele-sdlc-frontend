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
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-800" />

        {/* Progress track */}
        <div
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
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
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted && "border-emerald-500 bg-emerald-500/20",
                    isActive && "border-cyan-400 bg-cyan-400/20 ring-4 ring-cyan-400/20",
                    isError && "border-rose-500 bg-rose-500/20",
                    isPending && "border-slate-700 bg-slate-900",
                    // Glow effect for active
                    isActive && "shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : isError ? (
                    <AlertCircle className="h-5 w-5 text-rose-400" />
                  ) : isActive ? (
                    <div className="relative">
                      <Icon className="h-5 w-5 text-cyan-400" />
                      {/* Pulse animation */}
                      <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/30" />
                    </div>
                  ) : (
                    <Icon className={cn("h-5 w-5", isPending ? "text-slate-600" : "text-slate-400")} />
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCompleted && "text-emerald-400",
                      isActive && "text-cyan-400",
                      isError && "text-rose-400",
                      isPending && "text-slate-500"
                    )}
                  >
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs",
                      isActive ? "text-slate-400" : "text-slate-600"
                    )}
                  >
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
                isCompleted && "bg-emerald-500",
                isActive && "bg-cyan-400 ring-2 ring-cyan-400/30",
                isError && "bg-rose-500",
                !isCompleted && !isActive && !isError && "bg-slate-700"
              )}
              title={`${step.label}: ${status}`}
            />
            {index < PIPELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-4",
                  isCompleted ? "bg-emerald-500/50" : "bg-slate-800"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
