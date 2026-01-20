"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  type PipelineJob,
  type JobStatus,
  type JobStep,
  type FileInfo,
  type ExtractionResult,
  type MappingSuggestion,
  type ValidationResponse,
  type ExportResponse,
  type EntityType,
  type ExtractRequest,
  ENTITY_TYPES,
  PIPELINE_STEPS,
  uploadFiles,
  getJobStatus,
  getJobFiles,
  runExtraction,
  getMappingSuggestions,
  applyMapping,
  runTransformation,
  getPreview,
  runValidation,
  runExport,
  downloadCsv,
  syncVectorDb,
  getCurrentStepFromStatus,
  isStepCompleted,
  getStepStatus,
} from "@/lib/api/pipeline"

// ============================================================================
// Types
// ============================================================================

interface PipelineContextState {
  // Current job
  currentJob: PipelineJob | null
  jobId: string | null
  isLoading: boolean
  error: string | null

  // Step-specific data
  uploadedFiles: FileInfo[]
  extractionResults: Record<string, ExtractionResult>
  mappingSuggestions: Record<EntityType, MappingSuggestion[]>
  appliedMappings: Record<EntityType, Record<string, string>>
  transformedData: Record<EntityType, Record<string, unknown>[]>
  validationResults: ValidationResponse | null
  exportResults: ExportResponse | null

  // UI state
  currentStep: JobStep
  isProcessing: boolean
  processingMessage: string | null
}

interface PipelineContextActions {
  // Job lifecycle
  createNewJob: (files: FormData) => Promise<string>
  loadJob: (jobId: string) => Promise<void>
  refreshJobStatus: () => Promise<void>
  clearJob: () => void

  // Step actions
  startExtraction: (options?: ExtractRequest) => Promise<void>
  fetchMappingSuggestions: (entity: EntityType) => Promise<void>
  applyEntityMapping: (entity: EntityType, mappings: Record<string, string>) => Promise<void>
  startTransformation: () => Promise<void>
  fetchValidation: () => Promise<void>
  startExport: () => Promise<void>
  downloadEntityCsv: (entity: EntityType) => Promise<void>
  syncToVectorDb: () => Promise<void>
  fetchPreview: (entity: EntityType) => Promise<Record<string, unknown>[]>

  // Navigation
  goToStep: (step: JobStep) => void
  canProceedToStep: (step: JobStep) => boolean

  // Helpers
  getStepStatusForJob: (step: JobStep) => 'pending' | 'active' | 'completed' | 'error'
  isStepComplete: (step: JobStep) => boolean
}

type PipelineContextType = PipelineContextState & PipelineContextActions

// ============================================================================
// Initial State
// ============================================================================

const initialState: PipelineContextState = {
  currentJob: null,
  jobId: null,
  isLoading: false,
  error: null,
  uploadedFiles: [],
  extractionResults: {},
  mappingSuggestions: {
    epic: [],
    estimation: [],
    tdd: [],
    story: [],
  },
  appliedMappings: {
    epic: {},
    estimation: {},
    tdd: {},
    story: {},
  },
  transformedData: {
    epic: [],
    estimation: [],
    tdd: [],
    story: [],
  },
  validationResults: null,
  exportResults: null,
  currentStep: 'upload',
  isProcessing: false,
  processingMessage: null,
}

// ============================================================================
// Context
// ============================================================================

const PipelineContext = React.createContext<PipelineContextType | null>(null)

export function usePipeline() {
  const context = React.useContext(PipelineContext)
  if (!context) {
    throw new Error("usePipeline must be used within a PipelineProvider")
  }
  return context
}

// ============================================================================
// Provider
// ============================================================================

interface PipelineProviderProps {
  children: React.ReactNode
  initialJobId?: string
}

export function PipelineProvider({ children, initialJobId }: PipelineProviderProps) {
  const router = useRouter()
  const [state, setState] = React.useState<PipelineContextState>(initialState)

  // Load job on mount if initialJobId provided
  React.useEffect(() => {
    if (initialJobId) {
      loadJob(initialJobId)
    }
  }, [initialJobId])

  // ============================================================================
  // Job Lifecycle
  // ============================================================================

  const createNewJob = React.useCallback(async (formData: FormData): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, isProcessing: true, processingMessage: 'Uploading files...' }))

    try {
      const response = await uploadFiles(formData)
      const jobId = response.job_id

      // Load the new job
      const job = await getJobStatus(jobId)

      setState(prev => ({
        ...prev,
        currentJob: job,
        jobId,
        uploadedFiles: job.files_uploaded,
        currentStep: 'extract',
        isLoading: false,
        isProcessing: false,
        processingMessage: null,
      }))

      return jobId
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload files'
      setState(prev => ({ ...prev, error: message, isLoading: false, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [])

  const loadJob = React.useCallback(async (jobId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const job = await getJobStatus(jobId)
      const currentStep = getCurrentStepFromStatus(job.status)

      setState(prev => ({
        ...prev,
        currentJob: job,
        jobId,
        uploadedFiles: job.files_uploaded,
        extractionResults: job.extraction_results || {},
        appliedMappings: {
          epic: job.mapping_results?.epic || {},
          estimation: job.mapping_results?.estimation || {},
          tdd: job.mapping_results?.tdd || {},
          story: job.mapping_results?.story || {},
        },
        validationResults: job.validation_results || null,
        currentStep,
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load job'
      setState(prev => ({ ...prev, error: message, isLoading: false }))
      throw err
    }
  }, [])

  const refreshJobStatus = React.useCallback(async (): Promise<void> => {
    if (!state.jobId) return

    try {
      const job = await getJobStatus(state.jobId)
      const currentStep = getCurrentStepFromStatus(job.status)

      setState(prev => ({
        ...prev,
        currentJob: job,
        currentStep,
      }))
    } catch (err) {
      console.error('Failed to refresh job status:', err)
    }
  }, [state.jobId])

  const clearJob = React.useCallback(() => {
    setState(initialState)
  }, [])

  // ============================================================================
  // Step Actions
  // ============================================================================

  const startExtraction = React.useCallback(async (options?: ExtractRequest): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    setState(prev => ({ ...prev, isProcessing: true, processingMessage: 'Extracting data from documents...', error: null }))

    try {
      const response = await runExtraction(state.jobId, options)

      setState(prev => ({
        ...prev,
        extractionResults: response.extractions,
        currentStep: 'map',
        isProcessing: false,
        processingMessage: null,
      }))

      await refreshJobStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Extraction failed'
      setState(prev => ({ ...prev, error: message, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [state.jobId, refreshJobStatus])

  const fetchMappingSuggestions = React.useCallback(async (entity: EntityType): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    setState(prev => ({ ...prev, isProcessing: true, processingMessage: `Getting AI suggestions for ${entity}...` }))

    try {
      const response = await getMappingSuggestions(state.jobId, entity)

      setState(prev => ({
        ...prev,
        mappingSuggestions: {
          ...prev.mappingSuggestions,
          [entity]: response.suggestions,
        },
        isProcessing: false,
        processingMessage: null,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get mapping suggestions'
      setState(prev => ({ ...prev, error: message, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [state.jobId])

  const applyEntityMapping = React.useCallback(async (
    entity: EntityType,
    mappings: Record<string, string>
  ): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    setState(prev => ({ ...prev, isProcessing: true, processingMessage: `Applying ${entity} mappings...` }))

    try {
      await applyMapping(state.jobId, entity, mappings)

      setState(prev => ({
        ...prev,
        appliedMappings: {
          ...prev.appliedMappings,
          [entity]: mappings,
        },
        isProcessing: false,
        processingMessage: null,
      }))

      await refreshJobStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply mappings'
      setState(prev => ({ ...prev, error: message, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [state.jobId, refreshJobStatus])

  const startTransformation = React.useCallback(async (): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    setState(prev => ({ ...prev, isProcessing: true, processingMessage: 'Transforming data...', error: null }))

    try {
      await runTransformation(state.jobId)

      setState(prev => ({
        ...prev,
        currentStep: 'transform',
        isProcessing: false,
        processingMessage: null,
      }))

      await refreshJobStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transformation failed'
      setState(prev => ({ ...prev, error: message, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [state.jobId, refreshJobStatus])

  const fetchPreview = React.useCallback(async (entity: EntityType): Promise<Record<string, unknown>[]> => {
    if (!state.jobId) throw new Error('No active job')

    try {
      const response = await getPreview(state.jobId, entity, 100, 0)

      setState(prev => ({
        ...prev,
        transformedData: {
          ...prev.transformedData,
          [entity]: response.data,
        },
      }))

      return response.data
    } catch (err) {
      console.error(`Failed to fetch preview for ${entity}:`, err)
      return []
    }
  }, [state.jobId])

  const fetchValidation = React.useCallback(async (): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    setState(prev => ({ ...prev, isProcessing: true, processingMessage: 'Validating data...', error: null }))

    try {
      const response = await runValidation(state.jobId)

      setState(prev => ({
        ...prev,
        validationResults: response,
        isProcessing: false,
        processingMessage: null,
      }))

      await refreshJobStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed'
      setState(prev => ({ ...prev, error: message, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [state.jobId, refreshJobStatus])

  const startExport = React.useCallback(async (): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    setState(prev => ({ ...prev, isProcessing: true, processingMessage: 'Exporting CSV files...', error: null }))

    try {
      const response = await runExport(state.jobId)

      setState(prev => ({
        ...prev,
        exportResults: response,
        currentStep: 'export',
        isProcessing: false,
        processingMessage: null,
      }))

      await refreshJobStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      setState(prev => ({ ...prev, error: message, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [state.jobId, refreshJobStatus])

  const downloadEntityCsv = React.useCallback(async (entity: EntityType): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    try {
      const blob = await downloadCsv(state.jobId, entity)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${state.jobId}_${entity}s.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed'
      setState(prev => ({ ...prev, error: message }))
      throw err
    }
  }, [state.jobId])

  const syncToVectorDb = React.useCallback(async (): Promise<void> => {
    if (!state.jobId) throw new Error('No active job')

    setState(prev => ({ ...prev, isProcessing: true, processingMessage: 'Syncing to vector database...', error: null }))

    try {
      await syncVectorDb(state.jobId)

      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingMessage: null,
      }))

      await refreshJobStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vector DB sync failed'
      setState(prev => ({ ...prev, error: message, isProcessing: false, processingMessage: null }))
      throw err
    }
  }, [state.jobId, refreshJobStatus])

  // ============================================================================
  // Navigation
  // ============================================================================

  const goToStep = React.useCallback((step: JobStep) => {
    if (!state.jobId) return

    const stepRoutes: Record<JobStep, string> = {
      upload: `/data-engineering/pipeline/new`,
      extract: `/data-engineering/pipeline/${state.jobId}/extract`,
      map: `/data-engineering/pipeline/${state.jobId}/map`,
      transform: `/data-engineering/pipeline/${state.jobId}/transform`,
      validate: `/data-engineering/pipeline/${state.jobId}/transform`,
      export: `/data-engineering/pipeline/${state.jobId}/export`,
    }

    router.push(stepRoutes[step])
  }, [state.jobId, router])

  const canProceedToStep = React.useCallback((step: JobStep): boolean => {
    if (!state.currentJob) return step === 'upload'

    const stepOrder: JobStep[] = ['upload', 'extract', 'map', 'transform', 'export']
    const currentIndex = stepOrder.indexOf(getCurrentStepFromStatus(state.currentJob.status))
    const targetIndex = stepOrder.indexOf(step)

    return targetIndex <= currentIndex + 1
  }, [state.currentJob])

  // ============================================================================
  // Helpers
  // ============================================================================

  const getStepStatusForJob = React.useCallback((step: JobStep): 'pending' | 'active' | 'completed' | 'error' => {
    if (!state.currentJob) return step === 'upload' ? 'active' : 'pending'
    return getStepStatus(state.currentJob.status, step)
  }, [state.currentJob])

  const isStepComplete = React.useCallback((step: JobStep): boolean => {
    if (!state.currentJob) return false
    return isStepCompleted(state.currentJob.status, step)
  }, [state.currentJob])

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: PipelineContextType = {
    ...state,
    createNewJob,
    loadJob,
    refreshJobStatus,
    clearJob,
    startExtraction,
    fetchMappingSuggestions,
    applyEntityMapping,
    startTransformation,
    fetchValidation,
    startExport,
    downloadEntityCsv,
    syncToVectorDb,
    fetchPreview,
    goToStep,
    canProceedToStep,
    getStepStatusForJob,
    isStepComplete,
  }

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  )
}
