"use client"

import * as React from "react"
import type { WizardStep, WizardState, HistoricalMatch, AssessmentResult } from "@/types/assessment"
import { historicalMatches, sampleAssessmentResult } from "@/lib/mock-data"

interface WizardContextType {
  state: WizardState
  // Step navigation
  currentStep: WizardStep
  setCurrentStep: (step: WizardStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  canGoNext: boolean
  canGoPrevious: boolean

  // Form data
  requirementText: string
  setRequirementText: (text: string) => void
  epicId: string
  setEpicId: (id: string) => void

  // Historical matches
  matches: HistoricalMatch[]
  selectedMatchIds: string[]
  toggleMatchSelection: (id: string) => void

  // Analysis
  isAnalyzing: boolean
  analysisProgress: number
  startAnalysis: () => Promise<void>
  assessmentResult: AssessmentResult | null

  // Reset
  resetWizard: () => void
}

const WizardContext = React.createContext<WizardContextType | null>(null)

export function useWizard() {
  const context = React.useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider")
  }
  return context
}

const stepOrder: WizardStep[] = ['input', 'matches', 'results']

const initialState: WizardState = {
  currentStep: 'input',
  requirementText: '',
  epicId: '',
  uploadedFiles: [],
  selectedMatchIds: [],
  isAnalyzing: false,
  analysisProgress: 0,
}

interface WizardProviderProps {
  children: React.ReactNode
}

export function WizardProvider({ children }: WizardProviderProps) {
  const [state, setState] = React.useState<WizardState>(initialState)
  const [assessmentResult, setAssessmentResult] = React.useState<AssessmentResult | null>(null)

  const currentStepIndex = stepOrder.indexOf(state.currentStep)

  const setCurrentStep = React.useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  const goToNextStep = React.useCallback(() => {
    if (currentStepIndex < stepOrder.length - 1) {
      setState(prev => ({ ...prev, currentStep: stepOrder[currentStepIndex + 1] }))
    }
  }, [currentStepIndex])

  const goToPreviousStep = React.useCallback(() => {
    if (currentStepIndex > 0) {
      setState(prev => ({ ...prev, currentStep: stepOrder[currentStepIndex - 1] }))
    }
  }, [currentStepIndex])

  const canGoNext = currentStepIndex < stepOrder.length - 1
  const canGoPrevious = currentStepIndex > 0

  const setRequirementText = React.useCallback((text: string) => {
    setState(prev => ({ ...prev, requirementText: text }))
  }, [])

  const setEpicId = React.useCallback((id: string) => {
    setState(prev => ({ ...prev, epicId: id }))
  }, [])

  const toggleMatchSelection = React.useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedMatchIds: prev.selectedMatchIds.includes(id)
        ? prev.selectedMatchIds.filter(matchId => matchId !== id)
        : [...prev.selectedMatchIds, id]
    }))
  }, [])

  const startAnalysis = React.useCallback(async () => {
    setState(prev => ({ ...prev, isAnalyzing: true, analysisProgress: 0 }))

    // Simulate analysis progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setState(prev => ({ ...prev, analysisProgress: i }))
    }

    // Set mock result
    setAssessmentResult(sampleAssessmentResult)

    setState(prev => ({
      ...prev,
      isAnalyzing: false,
      analysisProgress: 100,
      currentStep: 'results',
    }))
  }, [])

  const resetWizard = React.useCallback(() => {
    setState(initialState)
    setAssessmentResult(null)
  }, [])

  const value: WizardContextType = {
    state,
    currentStep: state.currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
    requirementText: state.requirementText,
    setRequirementText,
    epicId: state.epicId,
    setEpicId,
    matches: historicalMatches,
    selectedMatchIds: state.selectedMatchIds,
    toggleMatchSelection,
    isAnalyzing: state.isAnalyzing,
    analysisProgress: state.analysisProgress,
    startAnalysis,
    assessmentResult,
    resetWizard,
  }

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  )
}
