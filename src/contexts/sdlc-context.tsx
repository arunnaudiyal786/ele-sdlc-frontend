"use client"

import * as React from "react"
import {
  runPipelineStreaming,
  generateSessionId,
  AGENTS,
  type PipelineStatus,
  type PipelineResponse,
  type ImpactedModulesOutput,
  type EstimationEffortOutput,
  type TDDOutput,
  type JiraStoriesOutput,
  type CodeImpactOutput,
  type RisksOutput,
  type StreamEvent,
  type HistoricalMatchResult,
} from "@/lib/api"

// Agent completion status type
export type AgentName =
  | 'historicalMatches'
  | 'estimationSheet'
  | 'tddGeneration'
  | 'jiraStories'

// Pipeline execution state
interface PipelineState {
  isRunning: boolean
  sessionId: string | null
  status: PipelineStatus | null
  error: string | null
  // Input (stored locally)
  requirementText: string
  jiraEpicId: string
  // Agent outputs from backend
  historicalMatches: HistoricalMatchResult[]
  impactedModules: ImpactedModulesOutput | null
  estimationEffort: EstimationEffortOutput | null
  tdd: TDDOutput | null
  jiraStories: JiraStoriesOutput | null
  codeImpact: CodeImpactOutput | null
  risks: RisksOutput | null
  // Messages from pipeline
  messages: Array<{ role: string; content: string }>
}

// Agent completion tracking
interface AgentCompletionState {
  historicalMatchesComplete: boolean
  estimationSheetComplete: boolean
  tddGenerationComplete: boolean
  jiraStoriesComplete: boolean
}

// Streaming progress state
export interface StreamingState {
  isStreaming: boolean
  currentAgentIndex: number
  currentAgentName: string | null
  completedAgents: string[]
  progressPercent: number
}

interface SDLCContextType {
  // Pipeline state
  pipeline: PipelineState
  // Agent completion
  agentCompletion: AgentCompletionState
  // Streaming progress
  streaming: StreamingState
  // Actions
  runImpactPipeline: (requirementText: string, jiraEpicId?: string, selectedMatchIds?: string[]) => () => void
  resetPipeline: () => void
  loadSession: (response: PipelineResponse) => void
  // Agent status helpers
  isAgentComplete: (agent: AgentName) => boolean
  setAgentStatus: (agent: AgentName, complete: boolean) => void
}

const SDLCContext = React.createContext<SDLCContextType | null>(null)

export function useSDLC() {
  const context = React.useContext(SDLCContext)
  if (!context) {
    throw new Error("useSDLC must be used within an SDLCProvider")
  }
  return context
}

const initialPipelineState: PipelineState = {
  isRunning: false,
  sessionId: null,
  status: null,
  error: null,
  requirementText: '',
  jiraEpicId: '',
  historicalMatches: [],
  impactedModules: null,
  estimationEffort: null,
  tdd: null,
  jiraStories: null,
  codeImpact: null,
  risks: null,
  messages: [],
}

const initialAgentCompletion: AgentCompletionState = {
  historicalMatchesComplete: false,
  estimationSheetComplete: false,
  tddGenerationComplete: false,
  jiraStoriesComplete: false,
}

const initialStreamingState: StreamingState = {
  isStreaming: false,
  currentAgentIndex: -1,
  currentAgentName: null,
  completedAgents: [],
  progressPercent: 0,
}

// Map backend status to agent completion state
function getAgentCompletionFromStatus(status: PipelineStatus | null): AgentCompletionState {
  if (!status) return initialAgentCompletion

  const statusProgression: PipelineStatus[] = [
    'matches_found',
    'matches_selected',
    'impacted_modules_generated',
    'estimation_effort_completed',
    'tdd_generated',
    'jira_stories_generated',
    'code_impact_generated',
    'risks_generated',
    'completed',
  ]

  const currentIndex = statusProgression.indexOf(status)

  return {
    historicalMatchesComplete: currentIndex >= 0, // matches_found or later
    estimationSheetComplete: currentIndex >= 3,   // estimation_effort_completed or later
    tddGenerationComplete: currentIndex >= 4,     // tdd_generated or later
    jiraStoriesComplete: currentIndex >= 5,       // jira_stories_generated or later
  }
}

interface SDLCProviderProps {
  children: React.ReactNode
}

export function SDLCProvider({ children }: SDLCProviderProps) {
  const [pipeline, setPipeline] = React.useState<PipelineState>(initialPipelineState)
  const [agentCompletion, setAgentCompletion] = React.useState<AgentCompletionState>(initialAgentCompletion)
  const [streaming, setStreaming] = React.useState<StreamingState>(initialStreamingState)

  // Run the full impact assessment pipeline with streaming
  const runImpactPipeline = React.useCallback((
    requirementText: string,
    jiraEpicId?: string,
    selectedMatchIds?: string[]
  ): () => void => {
    const sessionId = generateSessionId()

    // Set running state
    setPipeline(prev => ({
      ...prev,
      isRunning: true,
      sessionId,
      status: 'created',
      error: null,
      requirementText,
      jiraEpicId: jiraEpicId || '',
      messages: [],
    }))
    setAgentCompletion(initialAgentCompletion)
    setStreaming({
      isStreaming: true,
      currentAgentIndex: -1,
      currentAgentName: null,
      completedAgents: [],
      progressPercent: 0,
    })

    // Start streaming pipeline
    const cleanup = runPipelineStreaming(
      {
        session_id: sessionId,
        requirement_text: requirementText,
        jira_epic_id: jiraEpicId,
        selected_matches: selectedMatchIds,
      },
      {
        onPipelineStart: () => {
          setStreaming(prev => ({
            ...prev,
            isStreaming: true,
            currentAgentIndex: 0, // First agent is now running
            currentAgentName: 'requirement', // First agent name
            progressPercent: 0,
          }))
        },

        onAgentComplete: (event: StreamEvent) => {
          const { agent_name, agent_index, progress_percent, status, output } = event.data

          // Calculate next agent index and name
          const nextAgentIndex = (agent_index ?? -1) + 1
          const nextAgentName = nextAgentIndex < AGENTS.length ? AGENTS[nextAgentIndex].name : null

          // Update streaming progress
          setStreaming(prev => ({
            ...prev,
            currentAgentIndex: nextAgentIndex,
            currentAgentName: nextAgentName, // Show NEXT agent as current (the one about to run)
            completedAgents: agent_name
              ? [...prev.completedAgents, agent_name]
              : prev.completedAgents,
            progressPercent: progress_percent ?? prev.progressPercent,
          }))

          // Update agent completion based on status
          if (status) {
            setAgentCompletion(getAgentCompletionFromStatus(status))
          }

          // Update pipeline outputs incrementally
          if (output) {
            // Backend uses "all_matches" during streaming, "historical_matches" at completion
            const matches = (output.all_matches || output.historical_matches) as HistoricalMatchResult[] | undefined

            setPipeline(prev => ({
              ...prev,
              status: status ?? prev.status,
              historicalMatches: matches ?? prev.historicalMatches,
              impactedModules: output.impacted_modules_output as ImpactedModulesOutput ?? prev.impactedModules,
              estimationEffort: output.estimation_effort_output as EstimationEffortOutput ?? prev.estimationEffort,
              tdd: output.tdd_output as TDDOutput ?? prev.tdd,
              jiraStories: output.jira_stories_output as JiraStoriesOutput ?? prev.jiraStories,
              codeImpact: output.code_impact_output as CodeImpactOutput ?? prev.codeImpact,
              risks: output.risks_output as RisksOutput ?? prev.risks,
            }))
          }
        },

        onPipelineComplete: (event: StreamEvent) => {
          const { output, status } = event.data

          setStreaming(prev => ({
            ...prev,
            isStreaming: false,
            progressPercent: 100,
          }))

          // Backend uses "all_matches" during streaming, "historical_matches" at completion
          const matches = (output?.all_matches || output?.historical_matches) as HistoricalMatchResult[] | undefined

          // Final update with all outputs
          setPipeline(prev => ({
            ...prev,
            isRunning: false,
            status: status ?? 'completed',
            historicalMatches: matches ?? prev.historicalMatches,
            impactedModules: (output?.impacted_modules_output as ImpactedModulesOutput) ?? prev.impactedModules,
            estimationEffort: (output?.estimation_effort_output as EstimationEffortOutput) ?? prev.estimationEffort,
            tdd: (output?.tdd_output as TDDOutput) ?? prev.tdd,
            jiraStories: (output?.jira_stories_output as JiraStoriesOutput) ?? prev.jiraStories,
            codeImpact: (output?.code_impact_output as CodeImpactOutput) ?? prev.codeImpact,
            risks: (output?.risks_output as RisksOutput) ?? prev.risks,
            messages: (output?.messages as Array<{ role: string; content: string }>) ?? prev.messages,
          }))

          setAgentCompletion(getAgentCompletionFromStatus(status ?? 'completed'))
        },

        onError: (error: Error) => {
          setStreaming(prev => ({
            ...prev,
            isStreaming: false,
          }))
          setPipeline(prev => ({
            ...prev,
            isRunning: false,
            status: 'error',
            error: error.message,
          }))
        },
      }
    )

    return cleanup
  }, [])

  // Reset pipeline to initial state
  const resetPipeline = React.useCallback(() => {
    setPipeline(initialPipelineState)
    setAgentCompletion(initialAgentCompletion)
    setStreaming(initialStreamingState)
  }, [])

  // Load a previous session from a PipelineResponse
  const loadSession = React.useCallback((response: PipelineResponse) => {
    setPipeline({
      isRunning: false,
      sessionId: response.session_id,
      status: response.status,
      error: response.error_message,
      requirementText: response.requirement_text || '', // Not available in summary response
      jiraEpicId: '',
      historicalMatches: response.historical_matches || [],
      impactedModules: response.impacted_modules_output,
      estimationEffort: response.estimation_effort_output,
      tdd: response.tdd_output,
      jiraStories: response.jira_stories_output,
      codeImpact: response.code_impact_output,
      risks: response.risks_output,
      messages: response.messages || [],
    })
    setAgentCompletion(getAgentCompletionFromStatus(response.status))
    setStreaming(initialStreamingState)
  }, [])

  // Check if a specific agent is complete
  const isAgentComplete = React.useCallback((agent: AgentName): boolean => {
    switch (agent) {
      case 'historicalMatches':
        return agentCompletion.historicalMatchesComplete
      case 'estimationSheet':
        return agentCompletion.estimationSheetComplete
      case 'tddGeneration':
        return agentCompletion.tddGenerationComplete
      case 'jiraStories':
        return agentCompletion.jiraStoriesComplete
      default:
        return false
    }
  }, [agentCompletion])

  // Manually set agent status (for testing)
  const setAgentStatus = React.useCallback((agent: AgentName, complete: boolean) => {
    setAgentCompletion(prev => {
      switch (agent) {
        case 'historicalMatches':
          return { ...prev, historicalMatchesComplete: complete }
        case 'estimationSheet':
          return { ...prev, estimationSheetComplete: complete }
        case 'tddGeneration':
          return { ...prev, tddGenerationComplete: complete }
        case 'jiraStories':
          return { ...prev, jiraStoriesComplete: complete }
        default:
          return prev
      }
    })
  }, [])

  const value: SDLCContextType = {
    pipeline,
    agentCompletion,
    streaming,
    runImpactPipeline,
    resetPipeline,
    loadSession,
    isAgentComplete,
    setAgentStatus,
  }

  return (
    <SDLCContext.Provider value={value}>
      {children}
    </SDLCContext.Provider>
  )
}
