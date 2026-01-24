"use client"

import { Upload, Link2, Loader2, FileText } from "lucide-react"
import { useWizard } from "@/contexts/wizard-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function RequirementInput() {
  const {
    requirementText,
    setRequirementText,
    epicId,
    setEpicId,
    goToNextStep,
    isAnalyzing,
  } = useWizard()

  const canProceed = requirementText.trim().length > 20

  const handleAnalyze = () => {
    if (canProceed) {
      goToNextStep()
    }
  }

  const handleLoadSample = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/samples/requirement`)
      if (response.ok) {
        const data = await response.json()
        setRequirementText(data.requirement_text || '')
        setEpicId(data.jira_epic_id || '')
      }
    } catch (error) {
      console.error('Failed to load sample:', error)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Requirement</CardTitle>
          <CardDescription>
            Paste or type the new requirement, feature description, or epic details.
            The AI will analyze it to find similar historical projects and estimate impact.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Requirement Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="requirement">Requirement Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                className="h-7 text-xs"
              >
                <FileText className="mr-1 h-3 w-3" />
                Load Sample Input
              </Button>
            </div>
            <Textarea
              id="requirement"
              placeholder="Describe the requirement in detail. Include functionality, user stories, technical considerations, and any constraints..."
              className="min-h-[200px] resize-none"
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {requirementText.length} characters - Minimum 20 characters required
            </p>
          </div>

          {/* Optional Epic ID */}
          <div className="space-y-2">
            <Label htmlFor="epicId">Jira Epic ID (Optional)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="epicId"
                  placeholder="EPIC-1234"
                  className="pl-9"
                  value={epicId}
                  onChange={(e) => setEpicId(e.target.value)}
                />
              </div>
              <Button variant="outline" disabled={!epicId}>
                Fetch Details
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Link an existing Jira Epic to auto-populate requirement details
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attach Documents (Optional)</Label>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50">
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Drop files here or click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, Word, or text files up to 10MB
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Browse Files
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={!canProceed || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Find Similar Projects"
          )}
        </Button>
      </div>
    </div>
  )
}
