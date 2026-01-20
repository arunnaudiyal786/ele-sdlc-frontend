"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GitBranch, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldMappingEditor, EntityMappingTabs } from "@/components/pipeline/field-mapping-editor"
import { usePipeline } from "@/contexts/pipeline-context"
import { type EntityType, ENTITY_TYPES } from "@/lib/api/pipeline"

// Target schema fields for each entity
const TARGET_SCHEMAS: Record<EntityType, string[]> = {
  epic: [
    'epic_id', 'epic_name', 'req_id', 'jira_id', 'req_description',
    'status', 'epic_priority', 'epic_owner', 'epic_team',
    'epic_start_date', 'epic_target_date', 'created_at', 'updated_at'
  ],
  estimation: [
    'dev_est_id', 'epic_id', 'module_id', 'task_description', 'complexity',
    'dev_effort_hours', 'qa_effort_hours', 'total_effort_hours', 'total_story_points',
    'risk_level', 'estimation_method', 'confidence_level', 'estimated_by',
    'estimation_date', 'other_params'
  ],
  tdd: [
    'tdd_id', 'epic_id', 'dev_est_id', 'tdd_name', 'tdd_description',
    'tdd_version', 'tdd_status', 'tdd_author', 'technical_components',
    'design_decisions', 'tdd_dependencies', 'architecture_pattern',
    'security_considerations', 'performance_requirements', 'created_at', 'updated_at'
  ],
  story: [
    'jira_story_id', 'dev_est_id', 'epic_id', 'tdd_id', 'issue_type',
    'summary', 'description', 'assignee', 'status', 'story_points',
    'sprint', 'priority', 'labels', 'acceptance_criteria',
    'story_created_date', 'story_updated_date', 'other_params'
  ],
}

type EntityStatus = 'pending' | 'loading' | 'ready' | 'applied'

export default function MapPage() {
  const router = useRouter()
  const {
    jobId,
    uploadedFiles,
    mappingSuggestions,
    appliedMappings,
    fetchMappingSuggestions,
    applyEntityMapping,
    isProcessing,
    error,
  } = usePipeline()

  // Determine which entities have documents
  const availableEntities = React.useMemo(() => {
    const docTypes = new Set(uploadedFiles.map(f => f.document_type))
    return ENTITY_TYPES.filter(e => docTypes.has(e))
  }, [uploadedFiles])

  const [activeEntity, setActiveEntity] = React.useState<EntityType>(availableEntities[0] || 'estimation')
  const [entityStatus, setEntityStatus] = React.useState<Record<EntityType, EntityStatus>>({
    epic: 'pending',
    estimation: 'pending',
    tdd: 'pending',
    story: 'pending',
  })

  // Load suggestions when switching entities
  React.useEffect(() => {
    if (activeEntity && entityStatus[activeEntity] === 'pending') {
      loadSuggestions(activeEntity)
    }
  }, [activeEntity])

  const loadSuggestions = async (entity: EntityType) => {
    setEntityStatus(prev => ({ ...prev, [entity]: 'loading' }))
    try {
      await fetchMappingSuggestions(entity)
      setEntityStatus(prev => ({ ...prev, [entity]: 'ready' }))
    } catch (err) {
      console.error(`Failed to load suggestions for ${entity}:`, err)
      setEntityStatus(prev => ({ ...prev, [entity]: 'pending' }))
    }
  }

  const handleApplyMappings = async (mappings: Record<string, string>) => {
    await applyEntityMapping(activeEntity, mappings)
    setEntityStatus(prev => ({ ...prev, [activeEntity]: 'applied' }))
  }

  // Check if all available entities are mapped
  const allMapped = availableEntities.every(e => entityStatus[e] === 'applied')

  const handleContinue = () => {
    router.push(`/data-engineering/pipeline/${jobId}/transform`)
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-cyan-400" />
            Field Mapping
          </CardTitle>
          <CardDescription>
            Review AI-suggested field mappings and adjust as needed.
            Map fields from your source documents to the target schema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress summary */}
          <div className="flex items-center gap-4">
            {availableEntities.map(entity => {
              const status = entityStatus[entity]
              return (
                <div
                  key={entity}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 transition-all capitalize",
                    status === 'applied' && "bg-emerald-500/20 text-emerald-400",
                    status === 'ready' && "bg-cyan-500/20 text-cyan-400",
                    status === 'loading' && "bg-slate-800 text-slate-400",
                    status === 'pending' && "bg-slate-800/50 text-slate-500"
                  )}
                >
                  {status === 'applied' && <CheckCircle2 className="h-4 w-4" />}
                  {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span className="text-sm font-medium">{entity}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-4">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Entity tabs */}
      <EntityMappingTabs
        entities={availableEntities}
        activeEntity={activeEntity}
        onEntityChange={setActiveEntity}
        entityStatus={entityStatus}
      />

      {/* Mapping editor for active entity */}
      <FieldMappingEditor
        entityType={activeEntity}
        suggestions={mappingSuggestions[activeEntity] || []}
        targetFields={TARGET_SCHEMAS[activeEntity]}
        onApplyMappings={handleApplyMappings}
        isLoading={entityStatus[activeEntity] === 'loading'}
        disabled={isProcessing || entityStatus[activeEntity] === 'applied'}
      />

      {/* Applied mapping indicator */}
      {entityStatus[activeEntity] === 'applied' && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">
            Mappings applied for <span className="capitalize font-medium">{activeEntity}</span>.
            {!allMapped && " Continue with other entities or proceed to transformation."}
          </p>
        </div>
      )}

      {/* Continue button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {availableEntities.filter(e => entityStatus[e] === 'applied').length} of {availableEntities.length} entities mapped
        </p>
        <Button
          onClick={handleContinue}
          disabled={!allMapped && availableEntities.filter(e => entityStatus[e] === 'applied').length === 0}
          className="min-w-[200px] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
          size="lg"
        >
          Continue to Transform
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
