import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { OngoingTasks } from "@/components/dashboard/ongoing-tasks"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import {
  dashboardStats,
  monthlyAnalytics,
  assessments,
  notifications,
} from "@/lib/mock-data"

export default function DashboardPage() {
  // Get the first warning notification for the alert banner
  const alertNotification = notifications.find(n => n.type === 'warning' && !n.read)

  // Get ongoing assessments (draft or analyzing)
  const ongoingAssessments = assessments.filter(
    a => a.status === 'draft' || a.status === 'analyzing'
  )

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertNotification && (
        <AlertBanner notification={alertNotification} />
      )}

      {/* Stats Cards */}
      <StatsCards stats={dashboardStats} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ongoing Tasks */}
        <OngoingTasks assessments={ongoingAssessments.length > 0 ? ongoingAssessments : assessments.slice(0, 3)} />

        {/* Analytics Chart */}
        <AnalyticsChart data={monthlyAnalytics} />
      </div>

      {/* Quick Action - New Assessment Button */}
      <div className="fixed bottom-6 right-6">
        <Link href="/assessments/new">
          <Button size="lg" className="h-14 gap-2 rounded-full px-6 shadow-lg">
            <Plus className="h-5 w-5" />
            New Impact Assessment
          </Button>
        </Link>
      </div>
    </div>
  )
}
