// Backend API Types - matching ele-sdlc-backend schemas
//
// IMPORTANT: Backend uses on-demand document retrieval architecture:
// - Single project_index ChromaDB collection (not 5 separate collections)
// - Historical match returns ProjectMatch objects converted to MatchResult for backward compatibility
// - Auto-select node loads full TDD, estimation, and jira_stories documents on-demand
// - Agents receive loaded_projects containing parsed documents
// - All agent response types now include session_id, agent, and generated_at fields

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

// Historical Match Request - for find-matches endpoint
export interface HistoricalMatchRequest {
  session_id: string
  query: string
  semantic_weight?: number
  keyword_weight?: number
  max_results?: number
}

// Historical Match Response - from find-matches endpoint
export interface HistoricalMatchResponse {
  session_id: string
  total_matches: number
  matches: HistoricalMatchResult[]
  search_time_ms: number
}

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

// Impacted Modules Output - matches backend ImpactedModulesResponse
export interface ImpactedModulesOutput {
  session_id: string
  agent: string
  functional_modules: ImpactedModule[]
  technical_modules: ImpactedModule[]
  total_modules: number
  generated_at: string
}

// Effort Breakdown - matches backend EffortBreakdown model
export interface EffortBreakdown {
  category: string
  dev_hours: number
  qa_hours: number
  description: string
}

// Estimation Effort Output - matches backend EstimationEffortResponse
export interface EstimationEffortOutput {
  session_id: string
  agent: string
  total_dev_hours: number
  total_qa_hours: number
  total_hours: number
  story_points: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  breakdown: EffortBreakdown[]
  generated_at: string
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

// Jira Stories Output - matches backend JiraStoriesResponse
export interface JiraStoriesOutput {
  session_id: string
  agent: string
  stories: JiraStory[]
  story_count: number
  total_story_points: number
  generated_at: string
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

// Code Impact Output - matches backend CodeImpactResponse
export interface CodeImpactOutput {
  session_id: string
  agent: string
  files: CodeImpactFile[]
  total_files: number
  repositories_affected: string[]
  generated_at: string
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

// Risks Output - matches backend RisksResponse
export interface RisksOutput {
  session_id: string
  agent: string
  risks: Risk[]
  total_risks: number
  high_severity_count: number
  generated_at: string
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
// Note: code_impact and risks agents are disabled
export const AGENTS: AgentInfo[] = [
  { name: 'requirement', displayName: 'Extracting Keywords', description: 'Parsing requirement text' },
  { name: 'historical_match', displayName: 'Finding Historical Matches', description: 'Searching similar projects' },
  { name: 'auto_select', displayName: 'Selecting Matches', description: 'Auto-selecting top matches' },
  { name: 'impacted_modules', displayName: 'Analyzing Impacted Modules', description: 'Identifying affected modules' },
  { name: 'estimation_effort', displayName: 'Generating Estimation', description: 'Calculating effort hours' },
  { name: 'tdd', displayName: 'Creating TDD', description: 'Generating technical design' },
  { name: 'jira_stories', displayName: 'Generating Jira Stories', description: 'Creating user stories' },
  // Disabled agents:
  // { name: 'code_impact', displayName: 'Analyzing Code Impact', description: 'Identifying code changes' },
  // { name: 'risks', displayName: 'Assessing Risks', description: 'Evaluating project risks' },
]
