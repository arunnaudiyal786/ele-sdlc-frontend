# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Impact Assessment Frontend: A Next.js 16 application with React 19 providing the UI for the AI-powered SDLC impact assessment system. Consumes the FastAPI backend to run impact analysis pipelines and display results.

**Tech stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zod validation

## Essential Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# First time setup
npm install          # Install dependencies
cp .env.example .env # Configure environment
```

## Architecture

### Tech Stack Details

- **Next.js 16** - App Router with React Server Components
- **React 19** - Latest React with concurrent features
- **TypeScript** - Strict type checking throughout
- **Tailwind CSS v4** - Utility-first styling with `@import "tailwindcss"`
- **shadcn/ui** - Radix UI primitives with Tailwind styling
- **Zod** - Runtime type validation for forms and API responses

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home/dashboard page
│   ├── assessments/       # Impact assessment wizard
│   ├── previous-outputs/  # Historical results viewer
│   ├── data-engineering/  # Data pipeline UI (future)
│   └── sdlc-intelligence/ # Analytics dashboard (future)
│
├── components/
│   ├── ui/               # shadcn/ui primitives (Button, Card, etc.)
│   ├── layout/           # AppSidebar, Header, navigation
│   ├── assessment/       # Wizard steps and output viewers
│   ├── sdlc/             # SDLC-specific components
│   ├── dashboard/        # Dashboard widgets
│   ├── shared/           # Shared utilities
│   └── pipeline/         # Pipeline visualization (future)
│
├── contexts/
│   ├── sdlc-context.tsx  # Pipeline execution state management
│   └── wizard-context.tsx # Assessment wizard flow state
│
├── lib/
│   ├── api/              # Backend API client and types
│   │   ├── client.ts     # HTTP client with fetchApi wrapper
│   │   ├── types.ts      # TypeScript types matching backend
│   │   └── index.ts      # Exported API functions
│   └── utils.ts          # Utility functions (cn, etc.)
│
├── hooks/                # Custom React hooks
├── types/                # Global TypeScript types
└── globals.css           # Tailwind imports and theme
```

### Key Architectural Patterns

**1. App Router Structure**

Uses Next.js 16 App Router with file-based routing:
- `app/page.tsx` - Route pages
- `app/layout.tsx` - Nested layouts with providers
- Server Components by default, Client Components marked with `"use client"`

**2. Global State Management**

Two main context providers wrap the app:

```tsx
// Root Layout (app/layout.tsx)
<SDLCProvider>          {/* Pipeline execution state */}
  <SidebarProvider>     {/* UI sidebar state */}
    <AppSidebar />
    <SidebarInset>
      {children}
    </SidebarInset>
  </SidebarProvider>
</SDLCProvider>
```

**SDLC Context** (`contexts/sdlc-context.tsx`):
- Manages pipeline execution state
- Tracks agent completion status
- Handles SSE streaming from backend
- Stores agent outputs (historicalMatches, estimationEffort, tdd, jiraStories)

**Wizard Context** (`contexts/wizard-context.tsx`):
- Manages multi-step assessment wizard flow
- Tracks current step and navigation
- Stores form data across steps

**3. API Client Architecture**

Centralized API client with type safety:

```typescript
// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Type-safe fetch wrapper
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T>

// API functions
export async function runPipeline(request: PipelineRequest): Promise<PipelineResponse>
export async function runPipelineStreaming(request: PipelineRequest): AsyncGenerator<StreamEvent>
```

**Backend Type Synchronization** (`lib/api/types.ts`):
- TypeScript types **must match** backend Pydantic models
- Status enum matches backend status progression exactly
- Agent output types mirror backend response schemas

**4. Streaming Architecture**

Pipeline execution supports Server-Sent Events (SSE):

```typescript
// In sdlc-context.tsx
const eventSource = new EventSource(`${API_BASE_URL}/api/v1/impact/run-pipeline/stream?...`)

eventSource.onmessage = (event) => {
  const data: StreamEvent = JSON.parse(event.data)
  // Update progress based on agent completion
}
```

**5. Component Organization**

- **UI Components** (`components/ui/`) - shadcn/ui primitives, imported as-is
- **Layout Components** (`components/layout/`) - Navigation, sidebar, header
- **Feature Components** (`components/assessment/`, `components/sdlc/`) - Business logic

**6. Styling System**

Tailwind CSS v4 with custom theme:

```css
/* globals.css */
@import "tailwindcss";
@theme inline {
  --color-primary: var(--primary);  /* Blue theme */
  /* ... other theme vars */
}
```

- Uses `cn()` utility for conditional classes
- shadcn/ui components use `cva` (class-variance-authority)
- Custom blue color scheme defined in CSS variables

## Critical Backend-Frontend Contract

**Agent Sequence Must Match:**

The `AGENTS` array in `lib/api/types.ts` must match the backend workflow order in `backend/app/components/orchestrator/workflow.py`:

```typescript
// lib/api/types.ts
export const AGENTS = [
  'requirement',
  'historical_match',
  'auto_select',
  'impacted_modules',  // Currently disabled in backend
  'estimation_effort',
  'tdd',
  'jira_stories'
]
```

**Agent Output Field Mapping:**

Backend returns fields with suffixes that get mapped to context state:

| Backend Field | Frontend Context State |
|---------------|------------------------|
| `impacted_modules_output` | `impactedModules` |
| `estimation_effort_output` | `estimationEffort` |
| `tdd_output` | `tdd` |
| `jira_stories_output` | `jiraStories` |

**Historical Match Score Breakdown:**

Backend sends:
```json
{
  "score_breakdown": {
    "semantic_score": 0.85,
    "keyword_score": 0.65
  }
}
```

Frontend displays these as percentages in the Historical Matches component.

## Environment Variables

Create `.env.local` file:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: For production deployment
# NEXT_PUBLIC_API_URL=https://api.production.com
```

**Important:** Next.js requires `NEXT_PUBLIC_` prefix for client-side environment variables.

## Development Workflow

### Adding a New Page

1. Create route in `src/app/{route}/page.tsx`
2. Add navigation link in `components/layout/app-sidebar.tsx`
3. Update TypeScript types if needed

Example:
```tsx
// src/app/my-feature/page.tsx
export default function MyFeaturePage() {
  return <div>My Feature</div>
}
```

### Adding a New Component

1. Create in appropriate directory (`components/ui/`, `components/sdlc/`, etc.)
2. Use TypeScript interfaces for props
3. Follow shadcn/ui patterns for consistency

```tsx
// components/sdlc/my-component.tsx
interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  )
}
```

### Adding a New API Endpoint

1. Add TypeScript types in `lib/api/types.ts`
2. Add API function in `lib/api/client.ts`
3. Export from `lib/api/index.ts`

```typescript
// lib/api/types.ts
export interface MyRequest {
  data: string
}

export interface MyResponse {
  result: string
}

// lib/api/client.ts
export async function callMyEndpoint(request: MyRequest): Promise<MyResponse> {
  return fetchApi<MyResponse>('/api/v1/my-endpoint', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
```

### Modifying Pipeline State

Pipeline state is in `contexts/sdlc-context.tsx`. To add new state:

1. Add field to `PipelineState` interface
2. Add to initial state
3. Update `loadSession` function to populate from backend response
4. Add getter/setter methods if needed

## Path Aliases

Uses TypeScript path aliases for cleaner imports:

```typescript
import { Button } from "@/components/ui/button"
import { SDLCProvider } from "@/contexts/sdlc-context"
import { runPipeline } from "@/lib/api"
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## shadcn/ui Components

Components are in `components/ui/` and managed via `components.json`:

```bash
# Add a new shadcn component
npx shadcn@latest add button

# List available components
npx shadcn@latest
```

**Important:** Don't modify shadcn/ui components directly. Instead, extend them:

```tsx
// ✅ Good: Extend shadcn component
import { Button } from "@/components/ui/button"

export function MyButton(props) {
  return <Button className="custom-class" {...props} />
}

// ❌ Bad: Modify ui/button.tsx directly
```

## Styling Guidelines

**1. Use Tailwind Utility Classes**

```tsx
<div className="flex items-center justify-between p-4 bg-card rounded-lg">
  <h2 className="text-lg font-semibold text-foreground">Title</h2>
</div>
```

**2. Use Theme Variables**

Always use semantic color names, not hardcoded colors:

```tsx
// ✅ Good: Uses theme
className="bg-primary text-primary-foreground"

// ❌ Bad: Hardcoded color
className="bg-blue-600 text-white"
```

**3. Conditional Classes with cn()**

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

## Type Safety

**Always define types for:**
- Component props
- API requests/responses
- Context state
- Hook return values

```typescript
// ✅ Good: Typed component
interface CardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function Card({ title, description, children }: CardProps) {
  // ...
}

// ❌ Bad: Untyped component
export function Card(props) {
  // ...
}
```

## Testing Considerations

While tests are not currently implemented, when adding tests:

- Use React Testing Library for component tests
- Mock API calls with MSW or similar
- Test context providers with wrapper utilities
- Test form validation with Zod schemas

## Cross-Repository Context

This frontend consumes the FastAPI backend at `../ele-sdlc-backend/`. Key integration points:

1. **API Base URL**: Default `http://localhost:8000`, configurable via `NEXT_PUBLIC_API_URL`
2. **Type Contracts**: Types in `lib/api/types.ts` must match backend Pydantic models
3. **Agent Workflow**: `AGENTS` array must match backend workflow order
4. **SSE Streaming**: Uses `/api/v1/impact/run-pipeline/stream` endpoint
5. **Session Storage**: Frontend manages temporary state; backend stores session audit trails

When backend API changes, update:
- `lib/api/types.ts` - TypeScript types
- `lib/api/client.ts` - API functions
- `contexts/sdlc-context.tsx` - State management if needed

## Common Patterns

**1. Loading States**

```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await runPipeline(data)
  } finally {
    setIsLoading(false)
  }
}

return <Button disabled={isLoading}>
  {isLoading ? "Processing..." : "Submit"}
</Button>
```

**2. Error Handling**

```tsx
import { toast } from "sonner"

try {
  await apiCall()
  toast.success("Success!")
} catch (error) {
  toast.error(error instanceof Error ? error.message : "An error occurred")
}
```

**3. Using SDLC Context**

```tsx
"use client"

import { useSDLC } from "@/contexts/sdlc-context"

export function MyComponent() {
  const { pipeline, runImpactPipeline, streaming } = useSDLC()

  // Access pipeline state
  const { historicalMatches, tdd, jiraStories } = pipeline

  // Run pipeline
  const handleRun = () => {
    runImpactPipeline("User requirement text", "JIRA-123")
  }

  // Show streaming progress
  const progress = streaming.progressPercent
}
```

## Important Notes

**1. Server vs Client Components**

- Default to Server Components for better performance
- Use `"use client"` only when needed (hooks, event handlers, browser APIs)
- Contexts and hooks require Client Components

**2. API URL Configuration**

- Development: Uses `http://localhost:8000` by default
- Production: Set `NEXT_PUBLIC_API_URL` in deployment environment
- Never hardcode URLs in components - always use `API_BASE_URL` from client.ts

**3. Type Imports**

Import types with `type` keyword for better tree-shaking:

```typescript
import type { PipelineResponse } from "@/lib/api"
import { runPipeline } from "@/lib/api"  // Not a type
```

**4. Currently Disabled Features**

The following features are referenced in code but not actively used:
- `impacted_modules` - Agent disabled in backend
- `code_impact` - Agent disabled in backend
- `risks` - Agent disabled in backend
- Data Engineering Pipeline UI - Future feature
- SDLC Intelligence Dashboard - Future feature

These are maintained in types/context for future activation.
