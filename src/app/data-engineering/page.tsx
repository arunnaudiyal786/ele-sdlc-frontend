import { Database } from "lucide-react"

export default function DataEngineeringPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Engineering</h1>
          <p className="text-sm text-muted-foreground">
            Manage data pipelines and engineering workflows
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Data Engineering features coming soon.
        </p>
      </div>
    </div>
  )
}
