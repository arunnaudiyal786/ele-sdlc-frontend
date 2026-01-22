"use client"

import * as React from "react"
import Link from "next/link"
import { Download, CheckCircle2, Home, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExportPanel, ExportSuccessMessage } from "@/components/pipeline/export-panel"
import { usePipeline } from "@/contexts/pipeline-context"
import { type EntityType } from "@/lib/api/pipeline"

export default function ExportPage() {
  const {
    jobId,
    transformedData,
    exportResults,
    startExport,
    downloadEntityCsv,
    syncToVectorDb,
    isProcessing,
    processingMessage,
    error,
    isStepComplete,
  } = usePipeline()

  const [isSyncing, setIsSyncing] = React.useState(false)
  const isExported = isStepComplete('export')

  // Calculate total records
  const totalRecords = React.useMemo(() => {
    return Object.values(transformedData).reduce((sum, data) => sum + data.length, 0)
  }, [transformedData])

  const handleExport = async () => {
    await startExport()
  }

  const handleDownload = async (entity: EntityType) => {
    await downloadEntityCsv(entity)
  }

  const handleSyncVectorDb = async () => {
    setIsSyncing(true)
    try {
      await syncToVectorDb()
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      {isExported && exportResults && (
        <ExportSuccessMessage
          totalRecords={exportResults.total_records}
          fileCount={exportResults.files_exported.length}
        />
      )}

      {/* Export panel */}
      <ExportPanel
        jobId={jobId || ''}
        exportResults={exportResults}
        onExport={handleExport}
        onDownloadEntity={handleDownload}
        onSyncVectorDb={handleSyncVectorDb}
        isExporting={isProcessing}
        isSyncing={isSyncing}
      />

      {/* Next steps */}
      {isExported && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
            <CardDescription>
              Your data has been exported. Here's what you can do next.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <NextStepCard
                title="Return to Dashboard"
                description="View all pipeline jobs and start a new one"
                icon={Home}
                href="/data-engineering"
              />
              <NextStepCard
                title="Create New Pipeline"
                description="Process another set of documents"
                icon={Plus}
                href="/data-engineering/pipeline/new"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-export summary */}
      {!isExported && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20">
                <Download className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              Ready to Export
            </CardTitle>
            <CardDescription>
              Export your transformed data to CSV files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 border p-4 shadow-sm">
              <h4 className="text-sm font-medium mb-3">Data Summary</h4>
              <div className="grid gap-3 md:grid-cols-4">
                {(['epic', 'estimation', 'tdd', 'story'] as EntityType[]).map(entity => (
                  <div
                    key={entity}
                    className="rounded-lg bg-muted border p-3 text-center shadow-sm"
                  >
                    <p className="text-xl font-bold">
                      {transformedData[entity]?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize font-medium">{entity}s</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Total: <span className="font-semibold">{totalRecords}</span> records ready for export
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface NextStepCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

function NextStepCard({ title, description, icon: Icon, href }: NextStepCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4 shadow-sm transition-all hover:border-cyan-500/50 hover:bg-muted/50 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 shadow-sm">
        <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
