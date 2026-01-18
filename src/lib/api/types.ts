// Backend API Types - matching ele-sdlc-backend schemas

// Pipeline Status - matches backend status progression
export type PipelineStatus =
  | 'created'
  | 'requirement_submitted'
  | 'matches_found'
  | 'matches_selected'
  | 'impacted_modules_generated'
  | 'estimation_effort_completed'
  | 'tdd_generated'
  | 'jira_stories_generated'
  | 'code_impact_generated'
  | 'risks_generated'
  | 'completed'
  | 'error'

// Historical Match from search
export interface HistoricalMatchResult {
  match_id: string
  epic_id: string
  epic_name: string
  description: string
  match_score: number
  score_breakdown: {
    semantic_score: number
    keyword_score: number
  }
  technologies: string[]
  actual_hours: number
  estimated_hours: number
}

// Impacted Module - matches backend ModuleItem model
export interface ImpactedModule {
  name: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  reason: string
}

// Impacted Modules Output
export interface ImpactedModulesOutput {
  functional_modules: ImpactedModule[]
  technical_modules: ImpactedModule[]
  total_modules: number
}

// Effort Breakdown - matches backend EffortBreakdown model
export interface EffortBreakdown {
  category: string
  dev_hours: number
  qa_hours: number
  description: string
}

// Estimation Effort Output
export interface EstimationEffortOutput {
  total_dev_hours: number
  total_qa_hours: number
  total_hours: number
  story_points: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  breakdown: EffortBreakdown[]
  notes?: string
}

// TDD Output - matches backend TDDResponse model
export interface TDDOutput {
  session_id: string
  agent: string
  tdd_name: string
  tdd_description: string
  technical_components: string[]
  design_decisions: string
  architecture_pattern: string
  security_considerations: string
  performance_requirements: string
  tdd_dependencies: string[]
  markdown_content: string
  markdown_file_path?: string
  generated_at: string
}

// Jira Story
export interface JiraStory {
  story_id?: string
  title: string
  description?: string
  story_type: 'Story' | 'Task' | 'Bug' | 'Spike'
  story_points: number
  acceptance_criteria?: string[]
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  labels?: string[]
}

// Jira Stories Output
export interface JiraStoriesOutput {
  stories: JiraStory[]
  total_story_points: number
  story_count: number
}

// Code Impact File
export interface CodeImpactFile {
  file_id: string
  file_path: string
  repository: string
  change_type: 'new' | 'modified' | 'deleted'
  language: string
  reason: string
  estimated_lines: number
}

// Code Impact Output
export interface CodeImpactOutput {
  files: CodeImpactFile[]
  repositories_affected: string[]
  total_files: number
  total_estimated_lines: number
}

// Risk
export interface Risk {
  risk_id: string
  title: string
  description: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
  category: 'technical' | 'resource' | 'schedule' | 'scope' | 'integration'
  mitigation: string
}

// Risks Output
export interface RisksOutput {
  risks: Risk[]
  high_severity_count: number
  total_risks: number
}

// Pipeline Request
export interface PipelineRequest {
  session_id: string
  requirement_text: string
  jira_epic_id?: string
  selected_matches?: string[]
}

// Pipeline Response - full response from run-pipeline endpoint
export interface PipelineResponse {
  session_id: string
  status: PipelineStatus
  impacted_modules_output: ImpactedModulesOutput | null
  estimation_effort_output: EstimationEffortOutput | null
  tdd_output: TDDOutput | null
  jira_stories_output: JiraStoriesOutput | null
  code_impact_output: CodeImpactOutput | null
  risks_output: RisksOutput | null
  error_message: string | null
  messages: Array<{ role: string; content: string }>
  // Historical matches from hybrid search
  historical_matches?: HistoricalMatchResult[]
  requirement_text?: string
  extracted_keywords?: string[]
}

// Health Check Response
export interface HealthResponse {
  status: string
  version: string
  ollama: string
}

// Session Summary for list view
export interface SessionSummaryItem {
  session_id: string
  created_at: string
  status: PipelineStatus
  requirement_text?: string
  jira_epic_id?: string
  total_story_points?: number
  total_hours?: number
}

// Session List Response
export interface SessionListResponse {
  sessions: SessionSummaryItem[]
  total: number
  limit: number
  offset: number
}

// ============================================
// Streaming Types for SSE Agent Progress
// ============================================

// Stream event types from backend
export type StreamEventType =
  | 'pipeline_start'
  | 'agent_complete'
  | 'pipeline_complete'
  | 'pipeline_error'

// Stream event data payload
export interface StreamEventData {
  agent_name?: string
  agent_index?: number
  total_agents?: number
  status?: PipelineStatus
  output?: Record<string, unknown>
  error?: string
  progress_percent?: number
}

// SSE event structure
export interface StreamEvent {
  type: StreamEventType
  session_id: string
  timestamp: string
  data: StreamEventData
}

// Agent info for UI display
export interface AgentInfo {
  name: string
  displayName: string
  description: string
}

// Agent list in execution order - matches backend AGENT_ORDER
export const AGENTS: AgentInfo[] = [
  { name: 'requirement', displayName: 'Extracting Keywords', description: 'Parsing requirement text' },
  { name: 'historical_match', displayName: 'Finding Historical Matches', description: 'Searching similar projects' },
  { name: 'auto_select', displayName: 'Selecting Matches', description: 'Auto-selecting top matches' },
  { name: 'impacted_modules', displayName: 'Analyzing Impacted Modules', description: 'Identifying affected modules' },
  { name: 'estimation_effort', displayName: 'Generating Estimation', description: 'Calculating effort hours' },
  { name: 'tdd', displayName: 'Creating TDD', description: 'Generating technical design' },
  { name: 'jira_stories', displayName: 'Generating Jira Stories', description: 'Creating user stories' },
  { name: 'code_impact', displayName: 'Analyzing Code Impact', description: 'Identifying code changes' },
  { name: 'risks', displayName: 'Assessing Risks', description: 'Evaluating project risks' },
]
