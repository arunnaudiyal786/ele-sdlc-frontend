"use client"

import * as React from "react"
import { Upload, FileSpreadsheet, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatFileSize } from "@/lib/api/pipeline"

interface FileWithType {
  file: File
  type: 'epic' | 'estimation' | 'tdd' | 'story'
  isValid: boolean
  error?: string
}

interface FileDropzoneProps {
  onFilesChange: (files: FileWithType[]) => void
  files: FileWithType[]
  isUploading?: boolean
  uploadProgress?: number
  disabled?: boolean
}

const FILE_TYPE_CONFIG = {
  epic: {
    label: 'Epic Requirements',
    accept: '.docx',
    icon: FileText,
    required: false,
    description: 'Epic/requirement description document',
  },
  estimation: {
    label: 'Estimation Sheet',
    accept: '.xlsx,.xls',
    icon: FileSpreadsheet,
    required: true,
    description: 'Estimation spreadsheet (required)',
  },
  tdd: {
    label: 'TDD Document',
    accept: '.docx',
    icon: FileText,
    required: false,
    description: 'Technical Design Document',
  },
  story: {
    label: 'Stories Document',
    accept: '.docx',
    icon: FileText,
    required: false,
    description: 'User stories document',
  },
}

type FileType = keyof typeof FILE_TYPE_CONFIG

export function FileDropzone({
  onFilesChange,
  files,
  isUploading = false,
  uploadProgress = 0,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRefs = React.useRef<Record<FileType, HTMLInputElement | null>>({
    epic: null,
    estimation: null,
    tdd: null,
    story: null,
  })

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading) {
      setIsDragOver(true)
    }
  }, [disabled, isUploading])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (disabled || isUploading) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [disabled, isUploading])

  const processFiles = (newFiles: File[]) => {
    const processedFiles: FileWithType[] = [...files]

    newFiles.forEach(file => {
      const ext = file.name.toLowerCase().split('.').pop()
      let type: FileType | null = null
      let isValid = true
      let error: string | undefined

      // Auto-detect type based on extension and filename
      if (ext === 'xlsx' || ext === 'xls') {
        type = 'estimation'
      } else if (ext === 'docx') {
        const nameLower = file.name.toLowerCase()
        if (nameLower.includes('epic') || nameLower.includes('requirement')) {
          type = 'epic'
        } else if (nameLower.includes('tdd') || nameLower.includes('design')) {
          type = 'tdd'
        } else if (nameLower.includes('story') || nameLower.includes('stories')) {
          type = 'story'
        } else {
          // Default to epic for unclassified DOCX
          type = 'epic'
        }
      } else {
        isValid = false
        error = 'Unsupported file type. Use DOCX or XLSX files.'
        type = 'epic' // Fallback
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        isValid = false
        error = 'File size exceeds 10MB limit'
      }

      // Remove existing file of same type
      const existingIndex = processedFiles.findIndex(f => f.type === type)
      if (existingIndex >= 0) {
        processedFiles.splice(existingIndex, 1)
      }

      processedFiles.push({ file, type: type!, isValid, error })
    })

    onFilesChange(processedFiles)
  }

  const handleFileSelect = (type: FileType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const file = selectedFiles[0]
    const ext = file.name.toLowerCase().split('.').pop()
    const config = FILE_TYPE_CONFIG[type]
    let isValid = true
    let error: string | undefined

    // Validate extension
    const allowedExts = config.accept.split(',').map(e => e.replace('.', ''))
    if (!allowedExts.includes(ext || '')) {
      isValid = false
      error = `Expected ${config.accept} file`
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      isValid = false
      error = 'File size exceeds 10MB limit'
    }

    const updatedFiles = files.filter(f => f.type !== type)
    updatedFiles.push({ file, type, isValid, error })
    onFilesChange(updatedFiles)

    // Reset input
    e.target.value = ''
  }

  const removeFile = (type: FileType) => {
    onFilesChange(files.filter(f => f.type !== type))
  }

  const getFileForType = (type: FileType) => files.find(f => f.type === type)

  return (
    <div className="space-y-6">
      {/* Main dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragOver && "border-primary bg-primary/5",
          !isDragOver && "border-border hover:border-muted-foreground/50",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full",
          isDragOver ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Upload className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-semibold">
          {isDragOver ? 'Drop files here' : 'Drag & drop your documents'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          or select files for each document type below
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Supported formats: DOCX (Epic, TDD, Stories), XLSX (Estimation)
        </p>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading files...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* File type slots */}
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.entries(FILE_TYPE_CONFIG) as [FileType, typeof FILE_TYPE_CONFIG[FileType]][]).map(([type, config]) => {
          const fileData = getFileForType(type)
          const Icon = config.icon

          return (
            <div
              key={type}
              className={cn(
                "relative rounded-lg border p-4 transition-colors",
                fileData?.isValid && "border-green-200 bg-green-50",
                fileData && !fileData.isValid && "border-red-200 bg-red-50",
                !fileData && "bg-muted/50 hover:bg-muted"
              )}
            >
              {/* Required badge */}
              {config.required && !fileData && (
                <span className="absolute -top-2 right-3 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                  Required
                </span>
              )}

              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  fileData?.isValid && "bg-green-100 text-green-600",
                  fileData && !fileData.isValid && "bg-red-100 text-red-600",
                  !fileData && "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{config.label}</h4>
                    {fileData?.isValid && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {fileData && !fileData.isValid && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  {fileData ? (
                    <div className="mt-1">
                      <p className="truncate text-sm text-muted-foreground">
                        {fileData.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileData.file.size)}
                      </p>
                      {fileData.error && (
                        <p className="mt-1 text-xs text-red-600">{fileData.error}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
                  )}
                </div>

                <div className="shrink-0">
                  {fileData ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      onClick={() => removeFile(type)}
                      disabled={isUploading || disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <input
                        ref={el => { fileInputRefs.current[type] = el }}
                        type="file"
                        accept={config.accept}
                        onChange={handleFileSelect(type)}
                        className="hidden"
                        disabled={isUploading || disabled}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[type]?.click()}
                        disabled={isUploading || disabled}
                      >
                        Select
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
