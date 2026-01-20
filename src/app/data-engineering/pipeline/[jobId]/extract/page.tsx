"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FileSearch, Loader2, AlertCircle, Settings2, Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ExtractionResults, ExtractionSummary } from "@/components/pipeline/extraction-results"
import { usePipeline } from "@/contexts/pipeline-context"

export default function ExtractPage() {
  const router = useRouter()
  const {
    jobId,
    uploadedFiles,
    extractionResults,
    startExtraction,
    isProcessing,
    processingMessage,
    error,
    isStepComplete,
  } = usePipeline()

  const [useLlmEnhancement, setUseLlmEnhancement] = React.useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = React.useState([0.7])

  const hasResults = Object.keys(extractionResults).length > 0
  const isExtracted = isStepComplete('extract')

  // Calculate overall confidence
  const overallConfidence = React.useMemo(() => {
    const entries = Object.values(extractionResults)
    if (entries.length === 0) return 0
    const sum = entries.reduce((acc, r) => acc + (r.confidence || 0), 0)
    return sum / entries.length
  }, [extractionResults])

  const handleExtract = async () => {
    await startExtraction({
      use_llm_enhancement: useLlmEnhancement,
      llm_confidence_threshold: confidenceThreshold[0],
    })
  }

  const handleContinue = () => {
    router.push(`/data-engineering/pipeline/${jobId}/map`)
  }

  return (
    <div className="space-y-6">
      {/* Files summary */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSearch className="h-5 w-5 text-cyan-400" />
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {uploadedFiles.map(file => (
              <div
                key={file.filename}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2"
              >
                <span className="text-sm text-slate-300">{file.filename}</span>
                <span className="text-xs text-slate-500 capitalize">
                  ({file.document_type})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extraction options */}
      {!hasResults && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-violet-400" />
              Extraction Options
            </CardTitle>
            <CardDescription>
              Configure how documents are processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* LLM Enhancement toggle */}
            <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <Label htmlFor="llm-enhancement" className="text-slate-200">
                    LLM Enhancement
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use AI to improve extraction for low-confidence fields
                  </p>
                </div>
              </div>
              <Switch
                id="llm-enhancement"
                checked={useLlmEnhancement}
                onCheckedChange={setUseLlmEnhancement}
              />
            </div>

            {/* Confidence threshold slider */}
            {useLlmEnhancement && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-200">
                    LLM Trigger Threshold
                  </Label>
                  <span className="text-sm font-mono text-cyan-400">
                    {Math.round(confidenceThreshold[0] * 100)}%
                  </span>
                </div>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  min={0.3}
                  max={0.9}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Fields with confidence below this threshold will be enhanced using AI
                </p>
              </div>
            )}

            {/* Extract button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleExtract}
                disabled={isProcessing || uploadedFiles.length === 0}
                className="min-w-[200px] bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {processingMessage || 'Extracting...'}
                  </>
                ) : (
                  <>
                    <FileSearch className="mr-2 h-5 w-5" />
                    Run Extraction
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-4">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Extraction results */}
      {hasResults && (
        <>
          <ExtractionSummary
            results={extractionResults}
            overallConfidence={overallConfidence}
          />

          <ExtractionResults results={extractionResults} />

          {/* Continue button */}
          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              className="min-w-[200px] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
              size="lg"
            >
              Continue to Mapping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
