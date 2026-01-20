"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getJobStatus, getCurrentStepFromStatus } from "@/lib/api/pipeline"

/**
 * Job overview page - redirects to the appropriate step based on job status
 */
export default function JobOverviewPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.jobId as string

  React.useEffect(() => {
    if (!jobId) {
      router.replace('/data-engineering')
      return
    }

    // Fetch job status and redirect to current step
    getJobStatus(jobId)
      .then(job => {
        const currentStep = getCurrentStepFromStatus(job.status)
        const stepRoute = currentStep === 'upload' ? 'extract' : currentStep
        router.replace(`/data-engineering/pipeline/${jobId}/${stepRoute}`)
      })
      .catch(() => {
        // Job not found, redirect to hub
        router.replace('/data-engineering')
      })
  }, [jobId, router])

  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading job...</span>
      </div>
    </div>
  )
}
