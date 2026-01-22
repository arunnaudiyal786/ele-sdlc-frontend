"use client"

import * as React from "react"
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  Loader2,
  RefreshCw,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type ExportResponse, type EntityType, formatFileSize } from "@/lib/api/pipeline"

interface ExportPanelProps {
  jobId: string
  exportResults: ExportResponse | null
  onExport: () => void
  onDownloadEntity: (entity: EntityType) => void
  onSyncVectorDb: () => void
  isExporting?: boolean
  isSyncing?: boolean
  className?: string
}

export function ExportPanel({
  jobId,
  exportResults,
  onExport,
  onDownloadEntity,
  onSyncVectorDb,
  isExporting = false,
  isSyncing = false,
  className,
}: ExportPanelProps) {
  const hasExported = exportResults && exportResults.files_exported.length > 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Export action card */}
      {!hasExported && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20">
                <Download className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              Export Data
            </CardTitle>
            <CardDescription>
              Export transformed data to CSV files for each entity type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onExport}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
              size="lg"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Export All CSV Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Export results */}
      {hasExported && (
        <Card className="border-green-500/30 bg-green-500/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 shadow-lg shadow-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-700 dark:text-green-400">Export Complete</CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300/60">
                  {exportResults.total_records} total records exported to {exportResults.files_exported.length} files
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File list */}
            <div className="grid gap-3 md:grid-cols-2">
              {exportResults.files_exported.map(file => (
                <ExportedFileCard
                  key={file.entity}
                  entity={file.entity as EntityType}
                  recordCount={file.record_count}
                  onDownload={() => onDownloadEntity(file.entity as EntityType)}
                />
              ))}
            </div>

            {/* Re-export button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={onExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Re-exporting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-export Files
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vector DB Sync */}
      {hasExported && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
                <Database className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              Sync to Vector Database
            </CardTitle>
            <CardDescription>
              Optional: Copy exported data to the main vector database for use in impact assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-400">Important</p>
                  <p className="text-amber-300/80 mt-1">
                    This will append the exported records to the existing CSV files in <code className="bg-slate-800 px-1 rounded">data/raw/</code>.
                    After syncing, run the reindex script to update the vector database:
                  </p>
                  <code className="block mt-2 text-xs bg-slate-800 p-2 rounded font-mono text-slate-300">
                    python scripts/reindex.py && python scripts/init_vector_db.py
                  </code>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onSyncVectorDb}
              disabled={isSyncing}
              className="w-full border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Sync to Vector Database
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Job summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Job ID</span>
              <p className="font-mono mt-1">{jobId}</p>
            </div>
            {exportResults && (
              <>
                <div>
                  <span className="text-muted-foreground">Export Path</span>
                  <p className="font-mono text-xs text-muted-foreground mt-1 truncate" title={exportResults.export_path}>
                    {exportResults.export_path}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ExportedFileCardProps {
  entity: EntityType
  recordCount: number
  onDownload: () => void
}

function ExportedFileCard({ entity, recordCount, onDownload }: ExportedFileCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4 shadow-sm transition-all hover:border-green-500/50 hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 dark:bg-green-500/20 shadow-sm">
          <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-medium capitalize">{entity}s.csv</p>
          <p className="text-xs text-muted-foreground">{recordCount} records</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDownload}
        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-500/10"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Success message component
interface ExportSuccessMessageProps {
  totalRecords: number
  fileCount: number
  className?: string
}

export function ExportSuccessMessage({ totalRecords, fileCount, className }: ExportSuccessMessageProps) {
  return (
    <div className={cn(
      "flex items-center gap-4 rounded-lg bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 p-6 shadow-lg",
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 shadow-lg shadow-green-500/20">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">Pipeline Complete!</h3>
        <p className="mt-1">
          Successfully exported <span className="font-semibold text-green-700 dark:text-green-300">{totalRecords}</span> records
          to <span className="font-semibold text-green-700 dark:text-green-300">{fileCount}</span> CSV files.
        </p>
      </div>
    </div>
  )
}
