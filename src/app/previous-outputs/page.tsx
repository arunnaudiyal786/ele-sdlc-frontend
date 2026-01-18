"use client"

import * as React from "react"
import {
  History,
  Loader2,
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCircle2,
  Search,
  Calculator,
  FileCode,
  ListTodo,
  TrendingUp,
  Users,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Code,
  ShieldAlert,
} from "lucide-react"
import { listSessions, getPipelineSummary } from "@/lib/api"
import type { SessionSummaryItem, PipelineResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Status badge with green "Completed" styling
function StatusBadge({ status, hasHours, hasPoints }: {
  status: string
  hasHours?: boolean
  hasPoints?: boolean
}) {
  const completedStatuses = ['completed', 'risks_generated', 'code_impact_generated', 'jira_stories_generated']
  const isCompleted = completedStatuses.includes(status) || hasHours || hasPoints

  if (isCompleted) {
    return (
      <Badge variant="outline" className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-medium">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1 bg-slate-500/10 text-slate-600 border-slate-500/20">
      <Clock className="h-3 w-3" />
      {status === 'unknown' ? 'Pending' : (status || 'Pending')}
    </Badge>
  )
}

// Format date compactly
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Loading skeleton
function SessionsSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

// Empty state
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No previous outputs</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          Run an impact assessment to see results here.
        </p>
        <Button variant="outline" onClick={onRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardContent>
    </Card>
  )
}

// Section header component for nested collapsibles
function SectionHeader({
  icon: Icon,
  title,
  badge,
  isOpen
}: {
  icon: React.ElementType
  title: string
  badge?: React.ReactNode
  isOpen: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-muted/50 rounded-md transition-colors">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-sm">{title}</span>
      {badge}
      <ChevronDown className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
    </div>
  )
}

// Historical Matches Section Content
function HistoricalMatchesSection({ data }: { data: PipelineResponse }) {
  const matches = data.historical_matches || []

  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground py-2 px-3">No historical matches found</p>
  }

  return (
    <div className="space-y-2 py-2 px-3">
      {matches.map((match, idx) => (
        <div key={idx} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 border">
          <Badge variant="outline" className="font-mono text-xs shrink-0">
            {match.epic_id}
          </Badge>
          <span className="text-sm flex-1 truncate">{match.epic_name}</span>
          <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-xs shrink-0">
            {(match.match_score * 100).toFixed(0)}% match
          </Badge>
        </div>
      ))}
    </div>
  )
}

// Estimation Section Content
function EstimationSection({ data }: { data: PipelineResponse }) {
  const estimation = data.estimation_effort_output

  if (!estimation) {
    return <p className="text-sm text-muted-foreground py-2 px-3">No estimation data</p>
  }

  return (
    <div className="py-2 px-3 space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Total Hours</span>
          </div>
          <p className="text-xl font-bold mt-1">{estimation.total_hours}h</p>
        </div>
        <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-600">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Dev Hours</span>
          </div>
          <p className="text-xl font-bold mt-1">{estimation.total_dev_hours}h</p>
        </div>
        <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">QA Hours</span>
          </div>
          <p className="text-xl font-bold mt-1">{estimation.total_qa_hours}h</p>
        </div>
        <div className="p-3 rounded-md bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2 text-orange-600">
            <Calculator className="h-4 w-4" />
            <span className="text-xs font-medium">Story Points</span>
          </div>
          <p className="text-xl font-bold mt-1">{estimation.story_points}</p>
        </div>
      </div>

      {/* Confidence Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        <Badge className={`text-xs ${
          estimation.confidence === 'HIGH' ? 'bg-emerald-500/15 text-emerald-600' :
          estimation.confidence === 'MEDIUM' ? 'bg-yellow-500/15 text-yellow-600' :
          'bg-red-500/15 text-red-600'
        } border-0`}>
          {estimation.confidence}
        </Badge>
      </div>

      {/* Module Breakdown */}
      {estimation.modules && estimation.modules.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 font-medium">Module</th>
                <th className="text-right p-2 font-medium">Dev</th>
                <th className="text-right p-2 font-medium">QA</th>
                <th className="text-right p-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {estimation.modules.map((mod, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{mod.module_name}</td>
                  <td className="text-right p-2">{mod.dev_hours}h</td>
                  <td className="text-right p-2">{mod.qa_hours}h</td>
                  <td className="text-right p-2 font-medium">{mod.total_hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// TDD Section Content
function TDDSection({ data }: { data: PipelineResponse }) {
  const tdd = data.tdd_output

  if (!tdd) {
    return <p className="text-sm text-muted-foreground py-2 px-3">No TDD generated</p>
  }

  return (
    <div className="py-2 px-3 space-y-3">
      {/* TDD Header */}
      <div className="flex items-center gap-3">
        <h4 className="font-medium">{tdd.tdd_name}</h4>
        {tdd.architecture_pattern && (
          <Badge variant="outline">{tdd.architecture_pattern}</Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{tdd.technical_components?.length || 0} components</span>
        <span>{tdd.tdd_dependencies?.length || 0} dependencies</span>
      </div>

      {/* Description */}
      {tdd.tdd_description && (
        <p className="text-sm text-muted-foreground">{tdd.tdd_description}</p>
      )}

      {/* Components */}
      {tdd.technical_components && tdd.technical_components.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Components</h5>
          <div className="flex flex-wrap gap-2">
            {tdd.technical_components.map((comp, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {typeof comp === 'string' ? comp : comp.name || comp.component_name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {tdd.tdd_dependencies && tdd.tdd_dependencies.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Dependencies</h5>
          <div className="flex flex-wrap gap-2">
            {tdd.tdd_dependencies.map((dep, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-mono">
                {typeof dep === 'string' ? dep : dep.name || dep.dependency}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Jira Stories Section Content
function JiraStoriesSection({ data }: { data: PipelineResponse }) {
  const jira = data.jira_stories_output

  if (!jira) {
    return <p className="text-sm text-muted-foreground py-2 px-3">No Jira stories generated</p>
  }

  return (
    <div className="py-2 px-3 space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <ListTodo className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{jira.story_count} stories</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calculator className="h-4 w-4 text-orange-500" />
          <span className="text-sm">{jira.total_story_points} pts</span>
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-2">
        {jira.stories.map((story, idx) => (
          <Collapsible key={idx}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors">
                <Badge
                  variant="secondary"
                  className={`text-xs shrink-0 ${
                    story.story_type === 'Story' ? 'bg-blue-500/10 text-blue-600' :
                    story.story_type === 'Task' ? 'bg-purple-500/10 text-purple-600' :
                    'bg-orange-500/10 text-orange-600'
                  }`}
                >
                  {story.story_type}
                </Badge>
                <span className="text-sm flex-1 truncate">{story.title}</span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {story.story_points} pts
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-4 mt-2 p-3 bg-muted/30 rounded-md border-l-2 border-primary/20 space-y-2">
                <p className="text-sm">{story.description}</p>
                {story.acceptance_criteria && story.acceptance_criteria.length > 0 && (
                  <div>
                    <h6 className="text-xs font-medium text-muted-foreground mb-1">Acceptance Criteria</h6>
                    <ul className="text-sm space-y-1">
                      {story.acceptance_criteria.map((ac, acIdx) => (
                        <li key={acIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
                          <span>{ac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}

// Code Impact Section Content
function CodeImpactSection({ data }: { data: PipelineResponse }) {
  const codeImpact = data.code_impact_output

  if (!codeImpact || !codeImpact.files || codeImpact.files.length === 0) {
    return <p className="text-sm text-muted-foreground py-2 px-3">No code impact analysis</p>
  }

  return (
    <div className="py-2 px-3 space-y-2">
      {codeImpact.files.map((file, idx) => (
        <div key={idx} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 border">
          <Code className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-mono flex-1 truncate">{file.file_path || file.file_name}</span>
          <Badge
            variant="outline"
            className={`text-xs ${
              file.change_type === 'NEW' ? 'bg-green-500/10 text-green-600 border-green-500/30' :
              file.change_type === 'MODIFY' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
              'bg-red-500/10 text-red-600 border-red-500/30'
            }`}
          >
            {file.change_type}
          </Badge>
          {file.language && (
            <Badge variant="secondary" className="text-xs">{file.language}</Badge>
          )}
        </div>
      ))}
    </div>
  )
}

// Risks Section Content
function RisksSection({ data }: { data: PipelineResponse }) {
  const risks = data.risks_output

  if (!risks || !risks.risks || risks.risks.length === 0) {
    return <p className="text-sm text-muted-foreground py-2 px-3">No risks identified</p>
  }

  return (
    <div className="py-2 px-3 space-y-2">
      {risks.risks.map((risk, idx) => (
        <div key={idx} className="p-3 rounded-md border space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                risk.severity === 'HIGH' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                risk.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                'bg-green-500/10 text-green-600 border-green-500/30'
              }`}
            >
              {risk.severity}
            </Badge>
            {risk.category && (
              <Badge variant="secondary" className="text-xs">{risk.category}</Badge>
            )}
          </div>
          <p className="text-sm">{risk.description}</p>
          {risk.mitigation && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Mitigation:</span> {risk.mitigation}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// Single Session Card with Collapsible View
function SessionCard({
  session,
  sessionData,
  isLoading,
  isExpanded,
  onToggle,
  onLoad,
}: {
  session: SessionSummaryItem
  sessionData: PipelineResponse | null
  isLoading: boolean
  isExpanded: boolean
  onToggle: () => void
  onLoad: () => void
}) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    historical: true,
    estimation: false,
    tdd: false,
    jira: false,
    codeImpact: false,
    risks: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleViewClick = () => {
    if (!sessionData && !isLoading) {
      onLoad()
    }
    onToggle()
  }

  // Count available sections
  const hasHistorical = sessionData?.historical_matches && sessionData.historical_matches.length > 0
  const hasEstimation = !!sessionData?.estimation_effort_output
  const hasTDD = !!sessionData?.tdd_output
  const hasJira = !!sessionData?.jira_stories_output
  const hasCodeImpact = sessionData?.code_impact_output?.files && sessionData.code_impact_output.files.length > 0
  const hasRisks = sessionData?.risks_output?.risks && sessionData.risks_output.risks.length > 0

  return (
    <Card className={`transition-all ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      {/* Session Header */}
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-28">
            <p className="text-xs text-muted-foreground">{formatDate(session.created_at)}</p>
          </div>
          <StatusBadge
            status={session.status}
            hasHours={!!session.total_hours}
            hasPoints={!!session.total_story_points}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">
              {session.requirement_text?.substring(0, 80) || 'No requirement text'}
              {(session.requirement_text?.length || 0) > 80 ? '...' : ''}
            </p>
            {(session.total_hours || session.total_story_points) && (
              <div className="flex items-center gap-3 mt-1">
                {session.total_hours && (
                  <span className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {session.total_hours}h
                  </span>
                )}
                {session.total_story_points && (
                  <span className="text-xs text-muted-foreground">
                    <Calculator className="h-3 w-3 inline mr-1" />
                    {session.total_story_points} pts
                  </span>
                )}
              </div>
            )}
          </div>
          <Button
            variant={isExpanded ? "secondary" : "outline"}
            size="sm"
            onClick={handleViewClick}
            disabled={isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {isExpanded ? 'Close' : 'View'}
          </Button>
        </div>
      </CardHeader>

      {/* Expanded Content with Nested Collapsibles */}
      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading session data...</span>
            </div>
          ) : sessionData ? (
            <div className="border rounded-lg divide-y">
              {/* Historical Matches */}
              <Collapsible open={openSections.historical} onOpenChange={() => toggleSection('historical')}>
                <CollapsibleTrigger className="w-full">
                  <SectionHeader
                    icon={Search}
                    title="Historical Matches"
                    badge={hasHistorical && (
                      <Badge variant="secondary" className="text-xs">
                        {sessionData.historical_matches?.length}
                      </Badge>
                    )}
                    isOpen={openSections.historical}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <HistoricalMatchesSection data={sessionData} />
                </CollapsibleContent>
              </Collapsible>

              {/* Estimation */}
              <Collapsible open={openSections.estimation} onOpenChange={() => toggleSection('estimation')}>
                <CollapsibleTrigger className="w-full">
                  <SectionHeader
                    icon={Calculator}
                    title="Estimation"
                    badge={hasEstimation && (
                      <Badge variant="secondary" className="text-xs">
                        {sessionData.estimation_effort_output?.total_hours}h
                      </Badge>
                    )}
                    isOpen={openSections.estimation}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <EstimationSection data={sessionData} />
                </CollapsibleContent>
              </Collapsible>

              {/* TDD */}
              <Collapsible open={openSections.tdd} onOpenChange={() => toggleSection('tdd')}>
                <CollapsibleTrigger className="w-full">
                  <SectionHeader
                    icon={FileCode}
                    title="Technical Design Document"
                    badge={hasTDD && (
                      <Badge variant="secondary" className="text-xs">
                        {sessionData.tdd_output?.technical_components?.length || 0} components
                      </Badge>
                    )}
                    isOpen={openSections.tdd}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <TDDSection data={sessionData} />
                </CollapsibleContent>
              </Collapsible>

              {/* Jira Stories */}
              <Collapsible open={openSections.jira} onOpenChange={() => toggleSection('jira')}>
                <CollapsibleTrigger className="w-full">
                  <SectionHeader
                    icon={ListTodo}
                    title="Jira Stories"
                    badge={hasJira && (
                      <Badge variant="secondary" className="text-xs">
                        {sessionData.jira_stories_output?.story_count} stories
                      </Badge>
                    )}
                    isOpen={openSections.jira}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <JiraStoriesSection data={sessionData} />
                </CollapsibleContent>
              </Collapsible>

              {/* Code Impact */}
              <Collapsible open={openSections.codeImpact} onOpenChange={() => toggleSection('codeImpact')}>
                <CollapsibleTrigger className="w-full">
                  <SectionHeader
                    icon={Code}
                    title="Code Impact"
                    badge={hasCodeImpact && (
                      <Badge variant="secondary" className="text-xs">
                        {sessionData.code_impact_output?.files?.length} files
                      </Badge>
                    )}
                    isOpen={openSections.codeImpact}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CodeImpactSection data={sessionData} />
                </CollapsibleContent>
              </Collapsible>

              {/* Risks */}
              <Collapsible open={openSections.risks} onOpenChange={() => toggleSection('risks')}>
                <CollapsibleTrigger className="w-full">
                  <SectionHeader
                    icon={ShieldAlert}
                    title="Risks"
                    badge={hasRisks && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${sessionData.risks_output?.high_severity_count ? 'bg-red-500/10 text-red-600' : ''}`}
                      >
                        {sessionData.risks_output?.risks?.length} risks
                        {sessionData.risks_output?.high_severity_count ? ` (${sessionData.risks_output.high_severity_count} high)` : ''}
                      </Badge>
                    )}
                    isOpen={openSections.risks}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <RisksSection data={sessionData} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Failed to load session data</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function PreviousOutputsPage() {
  const [sessions, setSessions] = React.useState<SessionSummaryItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Session data cache and loading state
  const [sessionDataCache, setSessionDataCache] = React.useState<Record<string, PipelineResponse>>({})
  const [loadingSession, setLoadingSession] = React.useState<string | null>(null)
  const [expandedSession, setExpandedSession] = React.useState<string | null>(null)

  // Extract error message
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'object' && err !== null) {
      const errorObj = err as Record<string, unknown>
      if (typeof errorObj.detail === 'string') return errorObj.detail
      if (typeof errorObj.message === 'string') return errorObj.message
    }
    return 'An error occurred'
  }

  // Fetch sessions
  const fetchSessions = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await listSessions(50, 0)
      setSessions(response.sessions)
      setTotal(response.total)
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Load individual session
  const handleLoadSession = async (sessionId: string) => {
    if (sessionDataCache[sessionId]) return

    setLoadingSession(sessionId)
    try {
      const data = await getPipelineSummary(sessionId)
      setSessionDataCache(prev => ({ ...prev, [sessionId]: data }))
    } catch (err) {
      console.error('Failed to load session:', err)
    } finally {
      setLoadingSession(null)
    }
  }

  // Toggle session expansion
  const handleToggleSession = (sessionId: string) => {
    setExpandedSession(prev => prev === sessionId ? null : sessionId)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-180px)]">
      {/* Compact Header */}
      <div className="flex items-center justify-between py-4 px-1 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Previous Outputs</h1>
            <p className="text-xs text-muted-foreground">{total} assessments</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive mb-4 shrink-0">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSessions}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !error && <SessionsSkeleton />}

      {/* Empty State */}
      {!isLoading && !error && sessions.length === 0 && <EmptyState onRefresh={fetchSessions} />}

      {/* Sessions List */}
      {!isLoading && !error && sessions.length > 0 && (
        <div className="flex-1 overflow-auto space-y-3 pr-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              sessionData={sessionDataCache[session.session_id] || null}
              isLoading={loadingSession === session.session_id}
              isExpanded={expandedSession === session.session_id}
              onToggle={() => handleToggleSession(session.session_id)}
              onLoad={() => handleLoadSession(session.session_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
