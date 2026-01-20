"use client"

import * as React from "react"
import { ArrowRight, Check, X, Sparkles, AlertCircle, ChevronDown, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { type MappingSuggestion, type EntityType } from "@/lib/api/pipeline"

interface FieldMappingEditorProps {
  entityType: EntityType
  suggestions: MappingSuggestion[]
  targetFields: string[]
  onApplyMappings: (mappings: Record<string, string>) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

interface MappingState {
  sourceField: string
  targetField: string
  confidence: number
  sourceValue: unknown
  reasoning: string | null
  accepted: boolean
  modified: boolean
}

export function FieldMappingEditor({
  entityType,
  suggestions,
  targetFields,
  onApplyMappings,
  isLoading = false,
  disabled = false,
  className,
}: FieldMappingEditorProps) {
  const [mappings, setMappings] = React.useState<MappingState[]>([])
  const [showUnmapped, setShowUnmapped] = React.useState(true)

  // Initialize mappings from suggestions
  React.useEffect(() => {
    const initialMappings = suggestions.map(s => ({
      sourceField: s.source_field,
      targetField: s.target_field,
      confidence: s.confidence,
      sourceValue: s.source_value,
      reasoning: s.reasoning,
      accepted: s.confidence >= 0.7, // Auto-accept high confidence
      modified: false,
    }))
    setMappings(initialMappings)
  }, [suggestions])

  const mappedTargetFields = new Set(
    mappings.filter(m => m.accepted).map(m => m.targetField)
  )
  const unmappedFields = targetFields.filter(f => !mappedTargetFields.has(f))

  const handleAccept = (index: number) => {
    setMappings(prev => prev.map((m, i) =>
      i === index ? { ...m, accepted: true, modified: true } : m
    ))
  }

  const handleReject = (index: number) => {
    setMappings(prev => prev.map((m, i) =>
      i === index ? { ...m, accepted: false, modified: true } : m
    ))
  }

  const handleChangeTarget = (index: number, newTarget: string) => {
    setMappings(prev => prev.map((m, i) =>
      i === index ? { ...m, targetField: newTarget, modified: true } : m
    ))
  }

  const handleApply = () => {
    const finalMappings: Record<string, string> = {}
    mappings
      .filter(m => m.accepted)
      .forEach(m => {
        finalMappings[m.sourceField] = m.targetField
      })
    onApplyMappings(finalMappings)
  }

  const acceptedCount = mappings.filter(m => m.accepted).length
  const totalCount = mappings.length

  return (
    <Card className={cn("border-slate-800 bg-slate-900/50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg capitalize">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              {entityType} Field Mappings
            </CardTitle>
            <CardDescription className="mt-1">
              Review AI-suggested field mappings and adjust as needed
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {acceptedCount}/{totalCount} mapped
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mapping suggestions */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span>Getting AI suggestions...</span>
            </div>
          </div>
        ) : mappings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2 text-slate-500">No mapping suggestions available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mappings.map((mapping, index) => (
              <MappingRow
                key={`${mapping.sourceField}-${index}`}
                mapping={mapping}
                targetFields={targetFields}
                onAccept={() => handleAccept(index)}
                onReject={() => handleReject(index)}
                onChangeTarget={(target) => handleChangeTarget(index, target)}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        {/* Unmapped target fields */}
        {unmappedFields.length > 0 && (
          <Collapsible open={showUnmapped} onOpenChange={setShowUnmapped}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/20">
              <AlertCircle className="h-4 w-4" />
              <span>{unmappedFields.length} unmapped target field{unmappedFields.length > 1 ? 's' : ''}</span>
              <ChevronDown className={cn(
                "ml-auto h-4 w-4 transition-transform",
                showUnmapped && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="flex flex-wrap gap-2 rounded-lg bg-slate-800/50 p-3">
                {unmappedFields.map(field => (
                  <Badge key={field} variant="outline" className="font-mono text-xs text-slate-400">
                    {field}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Apply button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleApply}
            disabled={disabled || acceptedCount === 0}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            Apply {acceptedCount} Mappings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface MappingRowProps {
  mapping: MappingState
  targetFields: string[]
  onAccept: () => void
  onReject: () => void
  onChangeTarget: (target: string) => void
  disabled?: boolean
}

function MappingRow({
  mapping,
  targetFields,
  onAccept,
  onReject,
  onChangeTarget,
  disabled,
}: MappingRowProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(mapping.targetField)

  const confidence = Math.round(mapping.confidence * 100)
  const isHighConfidence = confidence >= 80
  const isMediumConfidence = confidence >= 50 && confidence < 80

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border p-3 transition-all",
        mapping.accepted && "border-emerald-500/30 bg-emerald-500/5",
        !mapping.accepted && "border-slate-800 bg-slate-800/30 opacity-60"
      )}
    >
      {/* Source field */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-slate-300 truncate">
            {mapping.sourceField}
          </code>
          {mapping.sourceValue !== undefined && mapping.sourceValue !== null && (
            <span className="text-xs text-slate-500 truncate max-w-[150px]">
              = "{String(mapping.sourceValue).slice(0, 30)}{String(mapping.sourceValue).length > 30 ? '...' : ''}"
            </span>
          )}
        </div>
        {mapping.reasoning && (
          <p className="mt-1 text-xs text-slate-500 truncate">{mapping.reasoning}</p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className={cn(
        "h-4 w-4 shrink-0",
        mapping.accepted ? "text-emerald-400" : "text-slate-600"
      )} />

      {/* Target field */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm font-mono text-slate-300"
            >
              {targetFields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-emerald-400 hover:text-emerald-300"
              onClick={() => {
                onChangeTarget(editValue)
                setIsEditing(false)
              }}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-400 hover:text-slate-300"
              onClick={() => {
                setEditValue(mapping.targetField)
                setIsEditing(false)
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-cyan-400 truncate">
              {mapping.targetField}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300"
              onClick={() => setIsEditing(true)}
              disabled={disabled}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Confidence badge */}
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 font-mono text-xs",
          isHighConfidence && "border-emerald-500/50 text-emerald-400",
          isMediumConfidence && "border-amber-500/50 text-amber-400",
          !isHighConfidence && !isMediumConfidence && "border-rose-500/50 text-rose-400"
        )}
      >
        {confidence}%
      </Badge>

      {/* Accept/Reject buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8",
            mapping.accepted
              ? "text-emerald-400 bg-emerald-500/20"
              : "text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10"
          )}
          onClick={onAccept}
          disabled={disabled}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8",
            !mapping.accepted
              ? "text-rose-400 bg-rose-500/20"
              : "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
          )}
          onClick={onReject}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Entity tabs for managing multiple entity mappings
interface EntityMappingTabsProps {
  entities: EntityType[]
  activeEntity: EntityType
  onEntityChange: (entity: EntityType) => void
  entityStatus: Record<EntityType, 'pending' | 'loading' | 'ready' | 'applied'>
  className?: string
}

export function EntityMappingTabs({
  entities,
  activeEntity,
  onEntityChange,
  entityStatus,
  className,
}: EntityMappingTabsProps) {
  return (
    <div className={cn("flex gap-2 border-b border-slate-800 pb-2", className)}>
      {entities.map(entity => {
        const status = entityStatus[entity]
        const isActive = entity === activeEntity

        return (
          <button
            key={entity}
            onClick={() => onEntityChange(entity)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-t-lg transition-all capitalize",
              isActive
                ? "text-cyan-400 bg-slate-800"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            )}
          >
            {entity}
            {status === 'applied' && (
              <Check className="absolute -top-1 -right-1 h-4 w-4 text-emerald-400" />
            )}
            {status === 'loading' && (
              <div className="absolute -top-1 -right-1 h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}
