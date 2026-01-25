"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WizardStep } from "@/types/assessment"

interface StepIndicatorProps {
  currentStep: WizardStep
  onStepClick?: (step: WizardStep) => void
}

const steps: { id: WizardStep; label: string; number: number }[] = [
  { id: 'input', label: 'Input Requirement', number: 1 },
  { id: 'matches', label: 'Historical Matches', number: 2 },
  { id: 'complete', label: 'Impact Results', number: 3 },
]

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = step.id === currentStep
        const isPast = index < currentIndex

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <button
              onClick={() => isPast && onStepClick?.(step.id)}
              disabled={!isPast}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2 transition-colors",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && "bg-success/10 text-success cursor-pointer hover:bg-success/20",
                !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                  isCurrent && "bg-primary-foreground text-primary",
                  isCompleted && "bg-success text-success-foreground",
                  !isCurrent && !isCompleted && "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </span>
              <span className="text-sm font-medium">{step.label}</span>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-12",
                  index < currentIndex ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
