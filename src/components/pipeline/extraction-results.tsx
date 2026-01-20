"use client"

import * as React from "react"
import { FileText, FileSpreadsheet, AlertTriangle, CheckCircle2, Hash, Mail, Tag, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { type ExtractionResult } from "@/lib/api/pipeline"

interface ExtractionResultsProps {
  results: Record<string, ExtractionResult>
  className?: string
}

export function ExtractionResults({ results, className }: ExtractionResultsProps) {
  const entries = Object.entries(results)

  if (entries.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed border-slate-800 p-8 text-center", className)}>
        <p className="text-slate-500">No extraction results yet</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {entries.map(([filename, result]) => (
        <ExtractionResultCard key={filename} filename={filename} result={result} />
      ))}
    </div>
  )
}

interface ExtractionResultCardProps {
  filename: string
  result: ExtractionResult
}

function ExtractionResultCard({ filename, result }: ExtractionResultCardProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasError = !!result.error
  const hasWarnings = result.warnings && result.warnings.length > 0
  const confidence = result.confidence || 0

  const Icon = filename.toLowerCase().endsWith('.xlsx') || filename.toLowerCase().endsWith('.xls')
    ? FileSpreadsheet
    : FileText

  return (
    <Card className={cn(
      "border-slate-800 bg-slate-900/50 transition-all",
      hasError && "border-rose-500/50",
      !hasError && confidence >= 0.8 && "border-emerald-500/30",
      !hasError && confidence >= 0.5 && confidence < 0.8 && "border-amber-500/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              hasError ? "bg-rose-500/20 text-rose-400" : "bg-cyan-500/20 text-cyan-400"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-slate-200">
                {filename}
              </CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {result.document_type}
                </Badge>
                {hasError ? (
                  <Badge variant="destructive" className="text-xs">Error</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      confidence >= 0.8 && "border-emerald-500/50 text-emerald-400",
                      confidence >= 0.5 && confidence < 0.8 && "border-amber-500/50 text-amber-400",
                      confidence < 0.5 && "border-rose-500/50 text-rose-400"
                    )}
                  >
                    {Math.round(confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {!hasError && (
            <ConfidenceMeter value={confidence} />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {hasError ? (
          <div className="rounded-lg bg-rose-500/10 p-4">
            <p className="text-sm text-rose-400">{result.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={Hash}
                label="Fields Extracted"
                value={result.fields_count}
                color="cyan"
              />
              <StatCard
                icon={FileText}
                label="Tables Found"
                value={result.tables_count}
                color="violet"
              />
              <StatCard
                icon={Tag}
                label="Jira IDs"
                value={result.jira_ids?.length || 0}
                color="emerald"
              />
              <StatCard
                icon={Mail}
                label="Emails"
                value={result.emails?.length || 0}
                color="amber"
              />
            </div>

            {/* Jira IDs and Emails */}
            {(result.jira_ids?.length > 0 || result.emails?.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {result.jira_ids?.map(id => (
                  <Badge key={id} variant="secondary" className="font-mono text-xs">
                    {id}
                  </Badge>
                ))}
                {result.emails?.map(email => (
                  <Badge key={email} variant="outline" className="text-xs">
                    {email}
                  </Badge>
                ))}
              </div>
            )}

            {/* Warnings */}
            {hasWarnings && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/20">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}</span>
                  <ChevronDown className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    isOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-1">
                  {result.warnings.map((warning, i) => (
                    <p key={i} className="text-xs text-slate-400 pl-6">
                      • {warning}
                    </p>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: 'cyan' | 'violet' | 'emerald' | 'amber'
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    violet: 'bg-violet-500/10 text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
  }

  return (
    <div className="rounded-lg bg-slate-800/50 p-3">
      <div className="flex items-center gap-2">
        <div className={cn("rounded p-1", colorClasses[color])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="mt-1 text-xl font-semibold text-slate-200 font-mono">{value}</p>
    </div>
  )
}

interface ConfidenceMeterProps {
  value: number
  className?: string
}

function ConfidenceMeter({ value, className }: ConfidenceMeterProps) {
  const percentage = Math.round(value * 100)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 w-24 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percentage >= 80 && "bg-gradient-to-r from-emerald-500 to-emerald-400",
            percentage >= 50 && percentage < 80 && "bg-gradient-to-r from-amber-500 to-amber-400",
            percentage < 50 && "bg-gradient-to-r from-rose-500 to-rose-400"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-mono",
        percentage >= 80 && "text-emerald-400",
        percentage >= 50 && percentage < 80 && "text-amber-400",
        percentage < 50 && "text-rose-400"
      )}>
        {percentage}%
      </span>
    </div>
  )
}

// Summary card for overall extraction stats
interface ExtractionSummaryProps {
  results: Record<string, ExtractionResult>
  overallConfidence: number
  className?: string
}

export function ExtractionSummary({ results, overallConfidence, className }: ExtractionSummaryProps) {
  const entries = Object.entries(results)
  const successCount = entries.filter(([, r]) => !r.error).length
  const errorCount = entries.filter(([, r]) => r.error).length

  return (
    <div className={cn(
      "rounded-lg border border-slate-800 bg-slate-900/50 p-4",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-slate-300">{successCount} files processed</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-sm text-rose-400">{errorCount} errors</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Overall Confidence:</span>
          <ConfidenceMeter value={overallConfidence} />
        </div>
      </div>
    </div>
  )
}
