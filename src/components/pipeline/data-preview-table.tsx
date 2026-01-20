"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, AlertCircle, Copy, Check, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { type EntityType, type ValidationError } from "@/lib/api/pipeline"

interface DataPreviewTableProps {
  entityType: EntityType
  data: Record<string, unknown>[]
  validationErrors?: ValidationError[]
  onDownload?: () => void
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

export function DataPreviewTable({
  entityType,
  data,
  validationErrors = [],
  onDownload,
  className,
}: DataPreviewTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null)
  const [page, setPage] = React.useState(0)
  const pageSize = 10

  if (data.length === 0) {
    return (
      <Card className={cn("border-slate-800 bg-slate-900/50", className)}>
        <CardContent className="py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2 text-slate-500">No data available for {entityType}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get columns from first row
  const columns = Object.keys(data[0])

  // Get errors for a specific row/field
  const getError = (rowIndex: number, field: string) => {
    return validationErrors.find(e =>
      e.row === rowIndex && e.field === field
    )
  }

  const hasRowError = (rowIndex: number) => {
    return validationErrors.some(e => e.row === rowIndex)
  }

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  // Paginate
  const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <Card className={cn("border-slate-800 bg-slate-900/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg capitalize">{entityType} Data Preview</CardTitle>
            <CardDescription className="mt-1">
              {data.length} record{data.length !== 1 ? 's' : ''} • {columns.length} columns
              {validationErrors.length > 0 && (
                <span className="text-rose-400 ml-2">
                  ({validationErrors.length} validation issue{validationErrors.length !== 1 ? 's' : ''})
                </span>
              )}
            </CardDescription>
          </div>
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-800 bg-slate-800/50">
                <th className="w-10 p-2 text-left text-xs font-medium text-slate-500">#</th>
                {columns.slice(0, 8).map(column => (
                  <th
                    key={column}
                    className="p-2 text-left text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[120px]" title={column}>
                        {column}
                      </span>
                      {sortColumn === column && (
                        sortDirection === 'asc'
                          ? <ChevronUp className="h-3 w-3 text-cyan-400" />
                          : <ChevronDown className="h-3 w-3 text-cyan-400" />
                      )}
                      <ColumnTypeBadge value={data[0][column]} />
                    </div>
                  </th>
                ))}
                {columns.length > 8 && (
                  <th className="p-2 text-left text-xs font-medium text-slate-500">
                    +{columns.length - 8} more
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => {
                const actualIndex = page * pageSize + rowIndex
                const isExpanded = expandedRow === actualIndex
                const rowHasError = hasRowError(actualIndex)

                return (
                  <React.Fragment key={actualIndex}>
                    <tr
                      className={cn(
                        "border-b border-slate-800/50 transition-colors cursor-pointer",
                        rowHasError && "bg-rose-500/5",
                        isExpanded && "bg-slate-800/30",
                        !rowHasError && !isExpanded && "hover:bg-slate-800/20"
                      )}
                      onClick={() => setExpandedRow(isExpanded ? null : actualIndex)}
                    >
                      <td className="p-2 font-mono text-xs text-slate-600">
                        {actualIndex + 1}
                      </td>
                      {columns.slice(0, 8).map(column => {
                        const error = getError(actualIndex, column)
                        const value = row[column]

                        return (
                          <td
                            key={column}
                            className={cn(
                              "p-2 font-mono text-xs",
                              error && "text-rose-400",
                              !error && "text-slate-300"
                            )}
                            title={error?.message}
                          >
                            <CellValue value={value} hasError={!!error} />
                          </td>
                        )
                      })}
                      {columns.length > 8 && (
                        <td className="p-2">
                          <ChevronDown className={cn(
                            "h-4 w-4 text-slate-500 transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        </td>
                      )}
                    </tr>

                    {/* Expanded row details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={Math.min(columns.length, 8) + 2} className="p-0">
                          <ExpandedRowDetails
                            row={row}
                            columns={columns}
                            rowIndex={actualIndex}
                            errors={validationErrors.filter(e => e.row === actualIndex)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
            <span className="text-xs text-slate-500">
              Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, data.length)} of {data.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CellValueProps {
  value: unknown
  hasError?: boolean
}

function CellValue({ value, hasError }: CellValueProps) {
  if (value === null || value === undefined) {
    return <span className="text-slate-600 italic">null</span>
  }

  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
        {String(value)}
      </Badge>
    )
  }

  if (typeof value === 'object') {
    return (
      <span className="text-violet-400 truncate max-w-[150px] inline-block">
        {JSON.stringify(value).slice(0, 50)}...
      </span>
    )
  }

  const strValue = String(value)
  if (strValue.length > 40) {
    return (
      <span className="truncate max-w-[150px] inline-block" title={strValue}>
        {strValue.slice(0, 40)}...
      </span>
    )
  }

  return <span>{strValue}</span>
}

interface ColumnTypeBadgeProps {
  value: unknown
}

function ColumnTypeBadge({ value }: ColumnTypeBadgeProps) {
  let type = 'str'
  let color = 'text-slate-500'

  if (value === null || value === undefined) {
    type = 'null'
    color = 'text-slate-600'
  } else if (typeof value === 'number') {
    type = 'num'
    color = 'text-cyan-500'
  } else if (typeof value === 'boolean') {
    type = 'bool'
    color = 'text-amber-500'
  } else if (typeof value === 'object') {
    type = Array.isArray(value) ? 'arr' : 'obj'
    color = 'text-violet-500'
  } else if (typeof value === 'string') {
    // Check if it looks like a date
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      type = 'date'
      color = 'text-emerald-500'
    }
  }

  return (
    <span className={cn("text-[10px] font-normal ml-1", color)}>
      [{type}]
    </span>
  )
}

interface ExpandedRowDetailsProps {
  row: Record<string, unknown>
  columns: string[]
  rowIndex: number
  errors: ValidationError[]
}

function ExpandedRowDetails({ row, columns, rowIndex, errors }: ExpandedRowDetailsProps) {
  const [copied, setCopied] = React.useState(false)

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(row, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-t border-slate-800 bg-slate-800/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400">Row {rowIndex + 1} Details</span>
        <Button variant="ghost" size="sm" onClick={copyJson}>
          {copied ? (
            <>
              <Check className="mr-2 h-3 w-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-3 w-3" />
              Copy JSON
            </>
          )}
        </Button>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="mb-4 rounded-lg bg-rose-500/10 p-3">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-medium mb-2">
            <AlertCircle className="h-4 w-4" />
            Validation Issues
          </div>
          {errors.map((error, i) => (
            <p key={i} className="text-xs text-rose-300 ml-6">
              • <code className="font-mono">{error.field}</code>: {error.message}
            </p>
          ))}
        </div>
      )}

      {/* All fields */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {columns.map(column => {
          const value = row[column]
          const error = errors.find(e => e.field === column)

          return (
            <div
              key={column}
              className={cn(
                "rounded-lg p-2",
                error ? "bg-rose-500/10" : "bg-slate-800/50"
              )}
            >
              <div className="text-xs text-slate-500 mb-1 truncate" title={column}>
                {column}
              </div>
              <div className={cn(
                "font-mono text-xs",
                error ? "text-rose-300" : "text-slate-300"
              )}>
                {value === null || value === undefined ? (
                  <span className="text-slate-600 italic">null</span>
                ) : typeof value === 'object' ? (
                  <pre className="whitespace-pre-wrap text-[10px] max-h-20 overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className="break-all">{String(value)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
