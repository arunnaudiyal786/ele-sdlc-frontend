"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  Loader2,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileDropzone } from "@/components/pipeline/file-dropzone"
import { usePipeline } from "@/contexts/pipeline-context"

interface FileWithType {
  file: File
  type: 'epic' | 'estimation' | 'tdd' | 'story'
  isValid: boolean
  error?: string
}

export default function NewPipelinePage() {
  const router = useRouter()
  const { createNewJob, isProcessing, error } = usePipeline()
  const [files, setFiles] = React.useState<FileWithType[]>([])
  const [uploadProgress, setUploadProgress] = React.useState(0)

  // Check if we have the required estimation file
  const hasEstimation = files.some(f => f.type === 'estimation' && f.isValid)
  const hasValidFiles = files.some(f => f.isValid)
  const canSubmit = hasEstimation && hasValidFiles && !isProcessing

  const handleSubmit = async () => {
    if (!canSubmit) return

    // Build FormData
    const formData = new FormData()

    files.forEach(({ file, type }) => {
      const fieldName = type === 'estimation' ? 'estimation_doc' :
                        type === 'epic' ? 'epic_doc' :
                        type === 'tdd' ? 'tdd_doc' :
                        'stories_doc'
      formData.append(fieldName, file)
    })

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const jobId = await createNewJob(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Navigate to extract page
      router.push(`/data-engineering/pipeline/${jobId}/extract`)
    } catch (err) {
      setUploadProgress(0)
      console.error('Upload failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main upload card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            Upload Source Documents
          </CardTitle>
          <CardDescription>
            Upload your source documents to begin the data engineering pipeline.
            An estimation spreadsheet (XLSX) is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileDropzone
            files={files}
            onFilesChange={setFiles}
            isUploading={isProcessing}
            uploadProgress={uploadProgress}
          />

          {/* Validation messages */}
          {!hasEstimation && files.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                An estimation spreadsheet (XLSX) is required to proceed.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          )}

          {/* Success indicator when files are ready */}
          {canSubmit && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Ready to upload</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {files.filter(f => f.isValid).length} valid document{files.filter(f => f.isValid).length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              size="lg"
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload & Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
            Supported Document Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <DocumentTypeHelp
              title="Estimation Sheet"
              extension=".xlsx, .xls"
              description="Excel spreadsheet containing effort estimates, story points, and task breakdowns"
              icon={FileSpreadsheet}
              required
            />
            <DocumentTypeHelp
              title="Epic Document"
              extension=".docx"
              description="Word document with epic/requirement descriptions and acceptance criteria"
              icon={FileText}
            />
            <DocumentTypeHelp
              title="TDD Document"
              extension=".docx"
              description="Technical Design Document with architecture and implementation details"
              icon={FileText}
            />
            <DocumentTypeHelp
              title="Stories Document"
              extension=".docx"
              description="User stories document with detailed story descriptions and tasks"
              icon={FileText}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface DocumentTypeHelpProps {
  title: string
  extension: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  required?: boolean
}

function DocumentTypeHelp({ title, extension, description, icon: Icon, required }: DocumentTypeHelpProps) {
  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-muted/30 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{title}</h4>
          {required ? (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-medium">
              Required
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border font-medium">
              Optional
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{extension}</p>
      </div>
    </div>
  )
}
