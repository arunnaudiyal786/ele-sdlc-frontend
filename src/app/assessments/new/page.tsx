"use client"

import { WizardProvider, useWizard } from "@/contexts/wizard-context"
import { StepIndicator } from "@/components/assessment/wizard/step-indicator"
import { RequirementInput } from "@/components/assessment/wizard/requirement-input"
import { HistoricalMatches } from "@/components/assessment/wizard/historical-matches"
import { ResultsSummary } from "@/components/assessment/wizard/results-summary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function WizardContent() {
  const { currentStep, setCurrentStep } = useWizard()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          New Impact Assessment
        </h1>
        <p className="text-muted-foreground">
          Analyze a new requirement to estimate impact, effort, and generate deliverables
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 'input' && <RequirementInput />}
        {currentStep === 'matches' && <HistoricalMatches />}
        {currentStep === 'results' && <ResultsSummary />}
      </div>
    </div>
  )
}

export default function NewAssessmentPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
