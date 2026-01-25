"use client"

import * as React from "react"
import type { WizardStep, WizardState, HistoricalMatch, AssessmentResult } from "@/types/assessment"
import type { HistoricalMatchResult } from "@/lib/api"
import { findHistoricalMatches, generateSessionId } from "@/lib/api"
import { useSDLC } from "./sdlc-context"

/**
 * Transform backend HistoricalMatchResult to frontend HistoricalMatch type.
 * Maps snake_case API fields to camelCase UI fields.
 */
function transformBackendMatch(backendMatch: HistoricalMatchResult): HistoricalMatch {
  return {
    id: backendMatch.match_id,
    epicId: backendMatch.epic_id,
    epicName: backendMatch.epic_name,
    epicDescription: backendMatch.description,
    similarityScore: Math.round(backendMatch.match_score * 100), // Convert 0-1 to 0-100
    technologies: backendMatch.technologies || [],
    modules: [], // Backend doesn't provide modules in search results
    actualEffort: backendMatch.actual_hours || 0,
    estimatedEffort: backendMatch.estimated_hours || 0,
    completionStatus: 'completed', // Historical projects are completed
    teamSize: 0, // Backend doesn't provide team size in search results
    // Optional fields not available from backend search
    lessonsLearned: undefined,
    completedDate: undefined,
  }
}

interface WizardContextType {
  state: WizardState
  // Step navigation
  currentStep: WizardStep
  setCurrentStep: (step: WizardStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  canGoNext: boolean
  canGoPrevious: boolean

  // View mode for completed assessments
  isViewingFromComplete: boolean
  viewMatchesFromComplete: () => void

  // Form data
  requirementText: string
  setRequirementText: (text: string) => void
  epicId: string
  setEpicId: (id: string) => void

  // Historical matches - two-step flow
  matches: HistoricalMatch[]
  selectedMatchIds: string[]
  toggleMatchSelection: (id: string) => void
  isSearching: boolean
  searchError: string | null
  searchMatches: () => Promise<void>  // Step 1: Search for matches

  // Analysis - Step 2: Run pipeline with selected matches
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

const stepOrder: WizardStep[] = ['input', 'matches', 'complete', 'estimation', 'tdd', 'jira']

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
  const [matches, setMatches] = React.useState<HistoricalMatch[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [isViewingFromComplete, setIsViewingFromComplete] = React.useState(false)
  const cleanupRef = React.useRef<(() => void) | null>(null)

  // Access SDLC context for streaming pipeline
  const { runImpactPipeline, streaming, pipeline } = useSDLC()

  const currentStepIndex = stepOrder.indexOf(state.currentStep)

  const setCurrentStep = React.useCallback((step: WizardStep) => {
    // Clear view mode when navigating normally (not through viewMatchesFromComplete)
    setIsViewingFromComplete(false)
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  // Navigate to matches in view-only mode from completed assessment
  const viewMatchesFromComplete = React.useCallback(() => {
    setIsViewingFromComplete(true)
    setState(prev => ({ ...prev, currentStep: 'matches' }))
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

  // Step 1: Search for historical matches (without running full pipeline)
  const searchMatches = React.useCallback(async () => {
    setIsSearching(true)
    setSearchError(null)
    setMatches([])

    try {
      const sessionId = generateSessionId()
      const response = await findHistoricalMatches({
        session_id: sessionId,
        query: state.requirementText,
        max_results: 10,
      })

      // Transform backend matches to frontend format
      const transformedMatches = response.matches.map(transformBackendMatch)
      setMatches(transformedMatches)

      // Navigate to matches step
      setState(prev => ({ ...prev, currentStep: 'matches' }))
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Failed to search for matches')
    } finally {
      setIsSearching(false)
    }
  }, [state.requirementText])

  // Step 2: Start full pipeline analysis with selected matches
  const startAnalysis = React.useCallback(async () => {
    setState(prev => ({ ...prev, isAnalyzing: true, analysisProgress: 0 }))

    // Start the pipeline with selected match IDs
    const cleanup = runImpactPipeline(
      state.requirementText,
      state.epicId || undefined,
      state.selectedMatchIds // Pass selected matches to pipeline
    )
    cleanupRef.current = cleanup
  }, [runImpactPipeline, state.requirementText, state.epicId, state.selectedMatchIds])

  // Watch for pipeline completion to navigate to complete page
  React.useEffect(() => {
    // Check if pipeline is complete
    const isPipelineComplete = pipeline.status === 'completed' ||
                                pipeline.status === 'jira_stories_generated'

    if (state.isAnalyzing && !streaming.isStreaming && isPipelineComplete) {
      // Pipeline finished - navigate to complete page
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisProgress: 100,
        currentStep: 'complete',
      }))
    } else if (state.isAnalyzing && !streaming.isStreaming && pipeline.status === 'error') {
      // Pipeline errored
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisProgress: 0,
      }))
    }
  }, [state.isAnalyzing, streaming.isStreaming, pipeline.status])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  const resetWizard = React.useCallback(() => {
    setState(initialState)
    setAssessmentResult(null)
    setMatches([])
    setSearchError(null)
    setIsViewingFromComplete(false)
  }, [])

  const value: WizardContextType = {
    state,
    currentStep: state.currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
    isViewingFromComplete,
    viewMatchesFromComplete,
    requirementText: state.requirementText,
    setRequirementText,
    epicId: state.epicId,
    setEpicId,
    matches, // Locally stored matches from search
    selectedMatchIds: state.selectedMatchIds,
    toggleMatchSelection,
    isSearching,
    searchError,
    searchMatches,
    isAnalyzing: state.isAnalyzing || streaming.isStreaming,
    analysisProgress: streaming.isStreaming ? streaming.progressPercent : state.analysisProgress,
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
