"use client"

import { WizardProvider, useWizard } from "@/contexts/wizard-context"
import { StepIndicator } from "@/components/assessment/wizard/step-indicator"
import { RequirementInput } from "@/components/assessment/wizard/requirement-input"
import { HistoricalMatches } from "@/components/assessment/wizard/historical-matches"
import { AssessmentComplete } from "@/components/assessment/wizard/assessment-complete"
import { EstimationResult } from "@/components/assessment/wizard/estimation-result"
import { TDDResult } from "@/components/assessment/wizard/tdd-result"
import { JiraResult } from "@/components/assessment/wizard/jira-result"

function WizardContent() {
  const { currentStep, setCurrentStep } = useWizard()

  // Show step indicator only for input and matches steps
  const showStepIndicator = currentStep === 'input' || currentStep === 'matches'

  return (
    <div className="space-y-8">
      {/* Page Header - only show for input and matches steps */}
      {showStepIndicator && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            New Impact Assessment
          </h1>
          <p className="text-muted-foreground">
            Analyze a new requirement to estimate impact, effort, and generate deliverables
          </p>
        </div>
      )}

      {/* Step Indicator - only show for input and matches steps */}
      {showStepIndicator && (
        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />
      )}

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 'input' && <RequirementInput />}
        {currentStep === 'matches' && <HistoricalMatches />}
        {currentStep === 'complete' && <AssessmentComplete />}
        {currentStep === 'estimation' && <EstimationResult />}
        {currentStep === 'tdd' && <TDDResult />}
        {currentStep === 'jira' && <JiraResult />}
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
