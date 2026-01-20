"use client"

import * as React from "react"
import Link from "next/link"
import {
  Database,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  type JobListItem,
  type JobStatus,
  listJobs,
  formatDate,
  getStatusBadgeVariant,
  getCurrentStepFromStatus,
} from "@/lib/api/pipeline"

export default function DataEngineeringPage() {
  const [jobs, setJobs] = React.useState<JobListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch jobs on mount
  React.useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await listJobs(50, 0)
      setJobs(response.jobs || [])
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setError('Pipeline service unavailable. Make sure the backend is running on port 8001.')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate stats
  const stats = React.useMemo(() => {
    const today = new Date().toDateString()
    const completedToday = jobs.filter(j =>
      j.status === 'completed' && j.updated_at && new Date(j.updated_at).toDateString() === today
    ).length
    const active = jobs.filter(j =>
      !['completed', 'failed'].includes(j.status)
    ).length
    const failed = jobs.filter(j => j.status === 'failed').length

    return { total: jobs.length, completedToday, active, failed }
  }, [jobs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Data Engineering</h1>
            <p className="text-sm text-muted-foreground">
              Transform source documents into structured data
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/data-engineering/pipeline/new">
            <Plus className="mr-2 h-4 w-4" />
            New Pipeline
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={stats.total}
          icon={FileSpreadsheet}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Active Pipelines"
          value={stats.active}
          icon={Zap}
          color="amber"
          pulse={stats.active > 0}
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Jobs list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              Pipeline Jobs
            </CardTitle>
            <CardDescription>Recent document processing jobs</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchJobs}
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
              <p className="text-muted-foreground text-center max-w-md mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchJobs}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <JobRow key={job.job_id} job={job} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick start guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickStartStep
              number={1}
              title="Upload Documents"
              description="Upload DOCX (Epic, TDD, Stories) and XLSX (Estimation) files"
            />
            <QuickStartStep
              number={2}
              title="Review & Map Fields"
              description="AI suggests field mappings - review and adjust as needed"
            />
            <QuickStartStep
              number={3}
              title="Export to CSV"
              description="Export structured data and sync to the vector database"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'amber' | 'red'
  pulse?: boolean
}

function StatCard({ title, value, icon: Icon, color, pulse }: StatCardProps) {
  const colorConfig = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            colorConfig[color]
          )}>
            <Icon className={cn("h-5 w-5 text-white", pulse && "animate-pulse")} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface JobRowProps {
  job: JobListItem
}

function JobRow({ job }: JobRowProps) {
  const currentStep = getCurrentStepFromStatus(job.status)
  const isActive = !['completed', 'failed'].includes(job.status)

  const getStatusIcon = () => {
    if (job.status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (job.status === 'failed') return <AlertCircle className="h-4 w-4 text-red-500" />
    return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
  }

  const getStatusBadge = () => {
    if (job.status === 'completed') return "bg-green-100 text-green-700 border-green-200"
    if (job.status === 'failed') return "bg-red-100 text-red-700 border-red-200"
    return "bg-blue-100 text-blue-700 border-blue-200"
  }

  return (
    <Link
      href={`/data-engineering/pipeline/${job.job_id}/${currentStep === 'upload' ? 'extract' : currentStep}`}
      className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        {getStatusIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm font-medium truncate">{job.job_id}</p>
          <Badge variant="outline" className={cn("capitalize text-xs", getStatusBadge())}>
            {job.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(job.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="h-3 w-3" />
            {job.files_count || 0} files
          </span>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold">No pipeline jobs yet</h3>
      <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
        Create your first pipeline to transform documents into structured data
      </p>
      <Button asChild className="mt-6">
        <Link href="/data-engineering/pipeline/new">
          <Plus className="mr-2 h-4 w-4" />
          Create First Pipeline
        </Link>
      </Button>
    </div>
  )
}

interface QuickStartStepProps {
  number: number
  title: string
  description: string
}

function QuickStartStep({ number, title, description }: QuickStartStepProps) {
  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-muted/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
        {number}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
