"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Table,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataPreviewTable } from "@/components/pipeline/data-preview-table"
import { usePipeline } from "@/contexts/pipeline-context"
import { type EntityType, ENTITY_TYPES } from "@/lib/api/pipeline"

export default function TransformPage() {
  const router = useRouter()
  const {
    jobId,
    currentJob,
    appliedMappings,
    transformedData,
    validationResults,
    startTransformation,
    fetchPreview,
    fetchValidation,
    isProcessing,
    processingMessage,
    error,
    isStepComplete,
    downloadEntityCsv,
  } = usePipeline()

  const [activeTab, setActiveTab] = React.useState<EntityType>('epic')
  const [isLoadingPreview, setIsLoadingPreview] = React.useState<Record<EntityType, boolean>>({
    epic: false,
    estimation: false,
    tdd: false,
    story: false,
  })

  const isTransformed = isStepComplete('transform')
  const isValidated = validationResults !== null

  // Load preview for active tab
  React.useEffect(() => {
    if (isTransformed && transformedData[activeTab].length === 0 && !isLoadingPreview[activeTab]) {
      loadPreview(activeTab)
    }
  }, [activeTab, isTransformed])

  const loadPreview = async (entity: EntityType) => {
    setIsLoadingPreview(prev => ({ ...prev, [entity]: true }))
    try {
      await fetchPreview(entity)
    } catch (err) {
      console.error(`Failed to load preview for ${entity}:`, err)
    } finally {
      setIsLoadingPreview(prev => ({ ...prev, [entity]: false }))
    }
  }

  const handleTransform = async () => {
    await startTransformation()
    // Auto-run validation after transformation
    await fetchValidation()
  }

  const handleContinue = () => {
    router.push(`/data-engineering/pipeline/${jobId}/export`)
  }

  // Get entities with data
  const entitiesWithData = ENTITY_TYPES.filter(e =>
    Object.keys(appliedMappings[e] || {}).length > 0
  )

  // Count records per entity
  const recordCounts = React.useMemo(() => {
    const counts: Record<EntityType, number> = {
      epic: transformedData.epic?.length || 0,
      estimation: transformedData.estimation?.length || 0,
      tdd: transformedData.tdd?.length || 0,
      story: transformedData.story?.length || 0,
    }
    return counts
  }, [transformedData])

  const totalRecords = Object.values(recordCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Transform action card */}
      {!isTransformed && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-cyan-400" />
              Transform Data
            </CardTitle>
            <CardDescription>
              Transform mapped fields into the target schema format with generated IDs and relationships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mapping summary */}
            <div className="rounded-lg bg-slate-800/50 p-4">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Mappings to Apply</h4>
              <div className="flex flex-wrap gap-3">
                {entitiesWithData.map(entity => (
                  <div
                    key={entity}
                    className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-2"
                  >
                    <span className="text-sm text-slate-300 capitalize">{entity}</span>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(appliedMappings[entity] || {}).length} fields
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Transform button */}
            <div className="flex justify-end">
              <Button
                onClick={handleTransform}
                disabled={isProcessing || entitiesWithData.length === 0}
                className="min-w-[200px] bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {processingMessage || 'Transforming...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Run Transformation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-4">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Transformation results */}
      {isTransformed && (
        <>
          {/* Summary card */}
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-emerald-400">Transformation Complete</CardTitle>
                  <CardDescription>
                    {totalRecords} total records created across {entitiesWithData.length} entities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4">
                {ENTITY_TYPES.map(entity => (
                  <div
                    key={entity}
                    className={cn(
                      "rounded-lg p-3 text-center",
                      recordCounts[entity] > 0
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-slate-800/50 border border-slate-700"
                    )}
                  >
                    <p className="text-2xl font-bold text-slate-100">{recordCounts[entity]}</p>
                    <p className="text-xs text-slate-500 capitalize">{entity}s</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validation results */}
          {isValidated && (
            <Card className={cn(
              "border",
              validationResults.valid
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {validationResults.valid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="text-emerald-400">Validation Passed</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      <span className="text-amber-400">Validation Issues Found</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              {!validationResults.valid && (
                <CardContent>
                  <div className="space-y-2">
                    {validationResults.errors.slice(0, 5).map((error, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-rose-300">
                          <span className="font-mono text-xs">{error.entity}</span>
                          {error.row !== undefined && ` row ${error.row}`}:
                          {' '}{error.message}
                        </span>
                      </div>
                    ))}
                    {validationResults.errors.length > 5 && (
                      <p className="text-xs text-slate-500 ml-6">
                        ...and {validationResults.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Data preview tabs */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5 text-cyan-400" />
                Data Preview
              </CardTitle>
              <CardDescription>
                Preview transformed data for each entity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
                <TabsList className="mb-4">
                  {ENTITY_TYPES.map(entity => (
                    <TabsTrigger
                      key={entity}
                      value={entity}
                      className="capitalize"
                      disabled={recordCounts[entity] === 0}
                    >
                      {entity}
                      {recordCounts[entity] > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {recordCounts[entity]}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {ENTITY_TYPES.map(entity => (
                  <TabsContent key={entity} value={entity}>
                    {isLoadingPreview[entity] ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                      </div>
                    ) : transformedData[entity].length > 0 ? (
                      <DataPreviewTable
                        entityType={entity}
                        data={transformedData[entity]}
                        validationErrors={validationResults?.errors.filter(e => e.entity === entity)}
                        onDownload={() => downloadEntityCsv(entity)}
                      />
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        No {entity} data available
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Continue button */}
          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              className="min-w-[200px] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
              size="lg"
            >
              Continue to Export
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
