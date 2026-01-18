// API Client for ele-sdlc-backend

import type {
  PipelineRequest,
  PipelineResponse,
  HealthResponse,
  StreamEvent,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.detail || `API error: ${response.status}`,
      response.status,
      errorData
    )
  }

  return response.json()
}

// Health check - verify backend is available
export async function checkHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>('/api/v1/health')
}

// Run full pipeline - main entry point for impact assessment
export async function runPipeline(
  request: PipelineRequest
): Promise<PipelineResponse> {
  return fetchApi<PipelineResponse>('/api/v1/impact/run-pipeline', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// Get pipeline summary for a session
export async function getPipelineSummary(
  sessionId: string
): Promise<PipelineResponse> {
  return fetchApi<PipelineResponse>(`/api/v1/impact/${sessionId}/summary`)
}

// Generate a unique session ID
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `session-${timestamp}-${random}`
}

export { ApiError }

// ============================================
// SSE Streaming for Real-time Agent Progress
// ============================================

// Callbacks for streaming events
export interface StreamCallbacks {
  onPipelineStart?: () => void
  onAgentComplete?: (event: StreamEvent) => void
  onPipelineComplete?: (event: StreamEvent) => void
  onError?: (error: Error) => void
}

// Parse SSE chunk into StreamEvent
function parseSSEChunk(chunk: string): StreamEvent | null {
  const lines = chunk.split('\n')
  let data = ''

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      data = line.slice(6)
    }
  }

  if (!data) return null

  try {
    return JSON.parse(data) as StreamEvent
  } catch {
    return null
  }
}

/**
 * Run pipeline with SSE streaming for real-time progress updates.
 * Returns a cleanup function to abort the request.
 */
export function runPipelineStreaming(
  request: PipelineRequest,
  callbacks: StreamCallbacks
): () => void {
  const url = `${API_BASE_URL}/api/v1/impact/run-pipeline/stream`
  const controller = new AbortController()

  // Start the streaming request
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.detail || `API error: ${response.status}`,
          response.status,
          errorData
        )
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Split on double newlines (SSE event separator)
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        // Process complete events
        for (const part of parts) {
          if (!part.trim()) continue

          const event = parseSSEChunk(part)
          if (!event) continue

          switch (event.type) {
            case 'pipeline_start':
              callbacks.onPipelineStart?.()
              break
            case 'agent_complete':
              callbacks.onAgentComplete?.(event)
              break
            case 'pipeline_complete':
              callbacks.onPipelineComplete?.(event)
              break
            case 'pipeline_error':
              callbacks.onError?.(new Error(event.data.error || 'Pipeline error'))
              break
          }
        }
      }
    })
    .catch((error) => {
      // Don't report abort errors
      if (error.name === 'AbortError') return
      callbacks.onError?.(error)
    })

  // Return cleanup function
  return () => controller.abort()
}
