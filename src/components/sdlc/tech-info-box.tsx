"use client"

import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Technical Info Box Component - displays technical logic explanations
interface TechInfoBoxProps {
  title: string
  items: { label: string; value: string }[]
}

export function TechInfoBox({ title, items }: TechInfoBoxProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1.5 rounded-full hover:bg-blue-500/10 text-blue-600"
        >
          <Info className="h-4 w-4" />
          <span className="text-xs font-medium">How it works</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10">
              <Info className="h-4 w-4 text-blue-500" />
            </div>
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
          <div className="space-y-2.5">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[100px,1fr] gap-2 text-xs">
                <span className="font-medium text-muted-foreground">{item.label}</span>
                <span className="text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Technical info content for each section
export const TECH_INFO = {
  historicalMatches: {
    title: "Historical Match Algorithm",
    items: [
      { label: "Method", value: "Hybrid search combining semantic and keyword matching" },
      { label: "Semantic", value: "70% weight - ChromaDB vector similarity using all-minilm embeddings" },
      { label: "Keyword", value: "30% weight - TF-IDF based keyword overlap scoring" },
      { label: "Fusion", value: "Reciprocal Rank Fusion to combine both scores" },
      { label: "Top K", value: "Returns top 10 matches above 0.3 threshold" },
    ]
  },
  estimation: {
    title: "Estimation Algorithm",
    items: [
      { label: "Method", value: "LLM-based analysis using historical data patterns" },
      { label: "Model", value: "phi3:mini via Ollama for cost-effective inference" },
      { label: "Input", value: "Historical matches, impacted modules, requirement complexity" },
      { label: "Output", value: "Dev hours, QA hours, story points with confidence level" },
      { label: "Breakdown", value: "Category-wise effort distribution based on module impact" },
    ]
  },
  tdd: {
    title: "TDD Generation Algorithm",
    items: [
      { label: "Method", value: "LLM-generated technical design from context" },
      { label: "Input", value: "Requirement text, similar TDDs from historical matches" },
      { label: "Architecture", value: "Suggests patterns based on matched project architectures" },
      { label: "Components", value: "Technical stack derived from similar past implementations" },
      { label: "Output", value: "Markdown document with design decisions and dependencies" },
    ]
  },
  jiraStories: {
    title: "Jira Story Generation Algorithm",
    items: [
      { label: "Method", value: "LLM decomposition of requirements into user stories" },
      { label: "Input", value: "TDD output, estimation breakdown, impacted modules" },
      { label: "Story Types", value: "Stories, Tasks, Spikes generated based on work nature" },
      { label: "Sizing", value: "Story points aligned with estimation breakdown" },
      { label: "Acceptance", value: "Auto-generated acceptance criteria from requirements" },
    ]
  },
}
