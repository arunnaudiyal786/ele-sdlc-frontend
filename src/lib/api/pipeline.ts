/**
 * API client for Data Engineering Pipeline service (port 8001)
 * Handles document upload, extraction, mapping, transformation, and export
 */

// Base URL for pipeline API
const PIPELINE_API_URL = process.env.NEXT_PUBLIC_PIPELINE_API_URL || 'http://localhost:8001'

// ============================================================================
// Types
// ============================================================================

export type JobStatus =
  | 'created'
  | 'uploading'
  | 'uploaded'
  | 'extracting'
  | 'extracted'
  | 'mapping'
  | 'mapped'
  | 'transforming'
  | 'transformed'
  | 'validating'
  | 'validated'
  | 'exporting'
  | 'completed'
  | 'failed'

export type JobStep = 'upload' | 'extract' | 'map' | 'transform' | 'validate' | 'export'

export interface FileInfo {
  filename: string
  file_path: string
  file_size: number
  document_type: string
  uploaded_at: string
}

export interface PipelineJob {
  job_id: string
  job_type: 'interactive' | 'batch'
  status: JobStatus
  current_step: JobStep | null
  steps_completed: JobStep[]
  files_uploaded: FileInfo[]
  extraction_results: Record<string, ExtractionResult> | null
  mapping_results: Record<string, Record<string, string>> | null
  transformation_results: Record<string, unknown> | null
  validation_results: ValidationResponse | null
  export_results: ExportResult | null
  created_at: string
  updated_at: string
  completed_at: string | null
  error_message: string | null
  warnings: string[]
  metadata: Record<string, unknown>
}

export interface UploadResponse {
  job_id: string
  status: string
  files_received: Array<{
    filename: string
    size: number
    type: string
    document_type: string
  }>
  message: string
}

export interface ExtractRequest {
  use_llm_enhancement?: boolean
  llm_confidence_threshold?: number
}

export interface ExtractionResult {
  document_type: string
  fields_count: number
  tables_count: number
  jira_ids: string[]
  emails: string[]
  confidence: number
  warnings: string[]
  error?: string
}

export interface ExtractResponse {
  job_id: string
  status: string
  extractions: Record<string, ExtractionResult>
  overall_confidence: number
  message: string
}

export interface MappingSuggestion {
  source_field: string
  target_field: string
  confidence: number
  source_value: unknown
  reasoning: string | null
}

export interface MappingSuggestionsResponse {
  job_id: string
  entity_type: string
  suggestions: MappingSuggestion[]
  unmapped_fields: string[]
}

export interface ApplyMappingRequest {
  entity: string
  mappings: Record<string, string>
  user_overrides?: Record<string, unknown>
}

export interface TransformResponse {
  job_id: string
  status: string
  records_created: Record<string, number>
  relationship_summary: Record<string, unknown>
  validation_warnings: string[]
  message: string
}

export interface PreviewResponse {
  job_id: string
  entity: string
  data: Record<string, unknown>[]
  total_count: number
  validation_results: Record<string, unknown>
}

export interface ValidationError {
  entity: string
  row: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResponse {
  job_id: string
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  relationship_integrity: Record<string, unknown>
}

export interface ExportResult {
  files_exported: number
  total_records: number
  export_path: string
}

export interface ExportResponse {
  job_id: string
  status: string
  files_exported: Array<{
    entity: string
    file_path: string
    record_count: number
  }>
  total_records: number
  export_path: string
  message: string
}

export interface SyncResponse {
  job_id: string
  status: string
  synced_files: Array<{
    entity: string
    new_records: number
    target_path: string
  }>
  message: string
  next_step: string
}

export interface JobListItem {
  job_id: string
  job_type: 'interactive' | 'batch'
  status: JobStatus
  current_step: JobStep | null
  created_at: string
  updated_at: string | null
  files_count: number
  error_message: string | null
}

export interface JobListResponse {
  jobs: JobListItem[]
  total_count: number
  page: number
  page_size: number
}

export interface HealthResponse {
  status: string
  version: string
  ollama_status: string
  disk_space_mb: number | null
  timestamp: string
}

// ============================================================================
// Pipeline Steps Configuration
// ============================================================================

export const PIPELINE_STEPS: Array<{
  id: JobStep
  label: string
  description: string
  statusBefore: JobStatus
  statusAfter: JobStatus
}> = [
  {
    id: 'upload',
    label: 'Upload',
    description: 'Upload source documents',
    statusBefore: 'created',
    statusAfter: 'uploaded',
  },
  {
    id: 'extract',
    label: 'Extract',
    description: 'Extract structured data',
    statusBefore: 'uploaded',
    statusAfter: 'extracted',
  },
  {
    id: 'map',
    label: 'Map',
    description: 'Map fields to schema',
    statusBefore: 'extracted',
    statusAfter: 'mapped',
  },
  {
    id: 'transform',
    label: 'Transform',
    description: 'Transform & validate',
    statusBefore: 'mapped',
    statusAfter: 'validated',
  },
  {
    id: 'export',
    label: 'Export',
    description: 'Export CSV files',
    statusBefore: 'validated',
    statusAfter: 'completed',
  },
]

export const ENTITY_TYPES = ['epic', 'estimation', 'tdd', 'story'] as const
export type EntityType = (typeof ENTITY_TYPES)[number]

// ============================================================================
// API Functions
// ============================================================================

class PipelineApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'PipelineApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new PipelineApiError(
      errorData.detail || `API error: ${response.status}`,
      response.status,
      errorData
    )
  }
  return response.json()
}

/**
 * Check pipeline API health
 */
export async function checkPipelineHealth(): Promise<HealthResponse> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/health`)
  return handleResponse<HealthResponse>(response)
}

/**
 * Upload files to create a new pipeline job
 */
export async function uploadFiles(formData: FormData): Promise<UploadResponse> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/upload`, {
    method: 'POST',
    body: formData,
  })
  return handleResponse<UploadResponse>(response)
}

/**
 * Get job status and details
 */
export async function getJobStatus(jobId: string): Promise<PipelineJob> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/jobs/${jobId}`)
  return handleResponse<PipelineJob>(response)
}

/**
 * Get list of files uploaded for a job
 */
export async function getJobFiles(jobId: string): Promise<{ job_id: string; files: FileInfo[] }> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/jobs/${jobId}/files`)
  return handleResponse<{ job_id: string; files: FileInfo[] }>(response)
}

/**
 * Run extraction on uploaded documents
 */
export async function runExtraction(
  jobId: string,
  options?: ExtractRequest
): Promise<ExtractResponse> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/extract/${jobId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options || {}),
  })
  return handleResponse<ExtractResponse>(response)
}

/**
 * Get AI-suggested field mappings for an entity
 */
export async function getMappingSuggestions(
  jobId: string,
  entity: EntityType
): Promise<MappingSuggestionsResponse> {
  const response = await fetch(
    `${PIPELINE_API_URL}/api/v1/pipeline/mapping-suggestions/${jobId}?entity=${entity}`
  )
  return handleResponse<MappingSuggestionsResponse>(response)
}

/**
 * Apply confirmed field mappings
 */
export async function applyMapping(
  jobId: string,
  entity: EntityType,
  mappings: Record<string, string>
): Promise<{ job_id: string; status: string; entity: string; applied_mappings: Record<string, string> }> {
  const response = await fetch(
    `${PIPELINE_API_URL}/api/v1/pipeline/apply-mapping/${jobId}?entity=${entity}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mappings),
    }
  )
  return handleResponse(response)
}

/**
 * Run transformation on mapped data
 */
export async function runTransformation(jobId: string): Promise<TransformResponse> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/transform/${jobId}`, {
    method: 'POST',
  })
  return handleResponse<TransformResponse>(response)
}

/**
 * Get preview of transformed data for an entity
 */
export async function getPreview(
  jobId: string,
  entity: EntityType,
  limit = 10,
  offset = 0
): Promise<PreviewResponse> {
  const params = new URLSearchParams({
    entity,
    limit: limit.toString(),
    offset: offset.toString(),
  })
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/preview/${jobId}?${params}`)
  return handleResponse<PreviewResponse>(response)
}

/**
 * Run validation on transformed data
 */
export async function runValidation(jobId: string): Promise<ValidationResponse> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/validation/${jobId}`)
  return handleResponse<ValidationResponse>(response)
}

/**
 * Export data to CSV files
 */
export async function runExport(jobId: string): Promise<ExportResponse> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/export/${jobId}`, {
    method: 'POST',
  })
  return handleResponse<ExportResponse>(response)
}

/**
 * Download a specific entity's CSV file
 */
export async function downloadCsv(jobId: string, entity: EntityType): Promise<Blob> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/export/${jobId}/${entity}`)
  if (!response.ok) {
    throw new PipelineApiError(`Failed to download ${entity} CSV`, response.status)
  }
  return response.blob()
}

/**
 * Sync exported data to main vector database
 */
export async function syncVectorDb(jobId: string): Promise<SyncResponse> {
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/sync-vector-db/${jobId}`, {
    method: 'POST',
  })
  return handleResponse<SyncResponse>(response)
}

/**
 * List all pipeline jobs
 */
export async function listJobs(limit = 50, offset = 0): Promise<JobListResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  })
  const response = await fetch(`${PIPELINE_API_URL}/api/v1/pipeline/jobs?${params}`)
  return handleResponse<JobListResponse>(response)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the current step from job status
 */
export function getCurrentStepFromStatus(status: JobStatus): JobStep {
  const statusToStep: Record<JobStatus, JobStep> = {
    created: 'upload',
    uploading: 'upload',
    uploaded: 'extract',
    extracting: 'extract',
    extracted: 'map',
    mapping: 'map',
    mapped: 'transform',
    transforming: 'transform',
    transformed: 'transform',
    validating: 'transform',
    validated: 'export',
    exporting: 'export',
    completed: 'export',
    failed: 'upload',
  }
  return statusToStep[status] || 'upload'
}

/**
 * Check if a step is completed based on job status
 */
export function isStepCompleted(status: JobStatus, step: JobStep): boolean {
  const completedStatuses: Record<JobStep, JobStatus[]> = {
    upload: ['uploaded', 'extracting', 'extracted', 'mapping', 'mapped', 'transforming', 'transformed', 'validating', 'validated', 'exporting', 'completed'],
    extract: ['extracted', 'mapping', 'mapped', 'transforming', 'transformed', 'validating', 'validated', 'exporting', 'completed'],
    map: ['mapped', 'transforming', 'transformed', 'validating', 'validated', 'exporting', 'completed'],
    transform: ['transformed', 'validating', 'validated', 'exporting', 'completed'],
    validate: ['validated', 'exporting', 'completed'],
    export: ['completed'],
  }
  return completedStatuses[step]?.includes(status) || false
}

/**
 * Get step status (pending, active, completed, error)
 */
export function getStepStatus(
  jobStatus: JobStatus,
  step: JobStep
): 'pending' | 'active' | 'completed' | 'error' {
  if (jobStatus === 'failed') {
    const currentStep = getCurrentStepFromStatus(jobStatus)
    if (currentStep === step) return 'error'
  }

  if (isStepCompleted(jobStatus, step)) return 'completed'

  const currentStep = getCurrentStepFromStatus(jobStatus)
  if (currentStep === step) return 'active'

  return 'pending'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

/**
 * Get status color class
 */
export function getStatusColor(status: JobStatus): string {
  const colors: Record<JobStatus, string> = {
    created: 'text-slate-400',
    uploading: 'text-cyan-400',
    uploaded: 'text-cyan-400',
    extracting: 'text-cyan-400',
    extracted: 'text-cyan-400',
    mapping: 'text-cyan-400',
    mapped: 'text-cyan-400',
    transforming: 'text-cyan-400',
    transformed: 'text-cyan-400',
    validating: 'text-amber-400',
    validated: 'text-emerald-400',
    exporting: 'text-cyan-400',
    completed: 'text-emerald-400',
    failed: 'text-rose-400',
  }
  return colors[status] || 'text-slate-400'
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(status: JobStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'default'
  if (status === 'failed') return 'destructive'
  if (['extracting', 'transforming', 'exporting', 'validating'].includes(status)) return 'secondary'
  return 'outline'
}
