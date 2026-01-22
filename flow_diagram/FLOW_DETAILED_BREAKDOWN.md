# AI Impact Assessment System - Detailed Flow Breakdown

**System**: Elevance Health SDLC
**Purpose**: Automated software requirement impact assessment
**Generated**: 2026-01-20

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Complete Pipeline Flow](#complete-pipeline-flow)
4. [Agent Details](#agent-details)
5. [Data Flow & State Management](#data-flow--state-management)
6. [Technology Stack](#technology-stack)
7. [Storage & Audit Trail](#storage--audit-trail)

---

## System Overview

The AI Impact Assessment System is an intelligent pipeline that analyzes software requirements and generates comprehensive impact assessments. It combines:

- **Vector search** (semantic similarity)
- **Keyword matching** (BM25 algorithm)
- **LLM-based analysis** (Ollama local models)
- **Multi-agent orchestration** (LangGraph workflow)

### Key Capabilities

- Automatic keyword extraction from requirements
- Hybrid search across historical epics, estimations, and TDDs
- Module impact analysis
- Effort estimation (dev/QA hours, story points)
- Technical design document generation
- Jira story creation with acceptance criteria

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Impact Assessment System                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │  ele-sdlc-frontend  │  HTTP   │  ele-sdlc-backend   │        │
│  │  (Next.js/React)    │ ──────► │  (FastAPI/LangGraph)│        │
│  │  Port: 3000         │         │  Port: 8000         │        │
│  └─────────────────────┘         └─────────────────────┘        │
│                                           │                      │
│                                  ┌────────┴────────┐             │
│                                  ▼                 ▼             │
│                         ┌──────────────┐  ┌──────────────┐       │
│                         │   ChromaDB   │  │    Ollama    │       │
│                         │ Vector Store │  │  Local LLM   │       │
│                         └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **Frontend** | Next.js 16 + React 19 | 3000 | User interface, wizard flow |
| **Backend** | FastAPI + LangGraph | 8000 | API server, agent orchestration |
| **Vector DB** | ChromaDB | - | Semantic search, embeddings storage |
| **LLM** | Ollama (phi3:mini, all-minilm) | 11434 | Text generation, embeddings |

---

## Complete Pipeline Flow

### High-Level Flow

```
User Input → Requirement Agent → Historical Match → Auto-Select
    → Impacted Modules → Estimation → TDD → Jira Stories → Complete
```

### Detailed Step-by-Step Flow

#### **Phase 1: User Input**

**Entry Point**: Frontend web interface

**User Actions**:
1. Navigate to assessment wizard
2. Enter requirement description (text or file upload)
3. Optionally provide Jira Epic ID
4. Submit for analysis

**Frontend Components**:
- `app/assessment/wizard/page.tsx` - Wizard UI
- `contexts/wizard-context.tsx` - Wizard state
- `components/assessment/wizard/` - Form components

**API Call**:
```http
POST /api/v1/orchestrator/run
Content-Type: application/json

{
  "session_id": "uuid",
  "requirement_text": "Implement user authentication...",
  "jira_epic_id": "MM16783"
}
```

---

#### **Phase 2: Requirement Agent** (Agent 1)

**File**: `app/components/requirement/agent.py`
**Purpose**: Extract keywords from requirement text
**Model**: `phi3:mini` (Ollama)

**Processing Steps**:
1. Receive requirement text from state
2. Normalize and clean text
3. Send to Ollama with keyword extraction prompt
4. Parse LLM response (JSON format)
5. Extract list of keywords

**Prompt Template** (`requirement/prompts.py`):
```
Analyze the following requirement and extract key technical terms,
technologies, and domain concepts. Return as JSON array.

Requirement: {requirement_text}
```

**Output**:
```json
{
  "extracted_keywords": [
    "authentication",
    "user-management",
    "OAuth",
    "session-handling",
    "API-security"
  ]
}
```

**State Updates**:
```python
{
  "extracted_keywords": ["authentication", "user-management", ...],
  "status": "requirement_submitted",
  "current_agent": "historical_match",
  "messages": [{"role": "requirement", "content": "Extracted 5 keywords"}]
}
```

---

#### **Phase 3: Historical Match Agent** (Agent 2)

**File**: `app/components/historical_match/agent.py`
**Purpose**: Find similar past requirements via hybrid search
**Models**: `all-minilm` (embeddings)

**Processing Steps**:

1. **Prepare Search Query**
   - Combine requirement text + extracted keywords
   - Generate query embedding using `all-minilm`

2. **Semantic Search (70% weight)**
   - Query ChromaDB collections (epics, estimations, tdds)
   - Use cosine similarity on embeddings
   - Return top N matches per collection

3. **Keyword Search (30% weight)**
   - BM25 algorithm on text fields
   - Match against extracted keywords
   - Return top N matches

4. **Score Fusion**
   - Combine semantic + keyword scores
   - Formula: `final_score = (0.7 * semantic_score) + (0.3 * keyword_score)`
   - Sort by final score descending

**Implementation Files**:
- `app/rag/hybrid_search.py` - Main search logic
- `app/rag/vector_store.py` - ChromaDB wrapper
- `app/rag/embeddings.py` - Ollama embedding service

**ChromaDB Collections**:
```python
collections = {
  "epics": {
    "documents": epic_description,
    "metadatas": {epic_id, epic_name, req_id, ...}
  },
  "estimations": {
    "documents": task_description,
    "metadatas": {dev_est_id, epic_id, ...}
  },
  "tdds": {
    "documents": tdd_description,
    "metadatas": {tdd_id, epic_id, ...}
  }
}
```

**Output**:
```json
{
  "all_matches": [
    {
      "id": "EPIC-042",
      "score": 0.87,
      "score_breakdown": {
        "semantic_score": 0.91,
        "keyword_score": 0.75
      },
      "document": "Implement OAuth 2.0 authentication...",
      "metadata": {
        "epic_name": "User Authentication System",
        "epic_id": "EPIC-042",
        "jira_id": "MM16783"
      }
    },
    // ... more matches
  ]
}
```

**State Updates**:
```python
{
  "all_matches": [...],
  "status": "matches_found",
  "current_agent": "auto_select"
}
```

---

#### **Phase 4: Auto-Select Node** (Agent 3)

**File**: `app/components/orchestrator/workflow.py`
**Function**: `auto_select_node()`
**Purpose**: Select top matches for analysis

**Logic Flow**:

```python
if state.get("selected_matches"):
    # Manual selection mode (user pre-selected)
    return {
        "status": "matches_selected",
        "current_agent": "impacted_modules",
        "messages": [{"role": "auto_select", "content": f"Using {len(selected)} pre-selected"}]
    }
else:
    # Auto-selection mode
    all_matches = state.get("all_matches", [])
    sorted_matches = sorted(all_matches, key=lambda m: m["score"], reverse=True)
    top_5 = sorted_matches[:5]

    return {
        "selected_matches": top_5,
        "status": "matches_selected",
        "current_agent": "impacted_modules"
    }
```

**Why This Exists**:
- Enables automated pipeline from file uploads
- Allows manual user selection in interactive mode
- Ensures pipeline always has matches to analyze

**Output**:
```json
{
  "selected_matches": [
    // Top 5 matches by score
  ]
}
```

---

#### **Phase 5: Impacted Modules Agent** (Agent 4)

**File**: `app/components/impacted_modules/agent.py`
**Purpose**: Identify system modules affected by requirement
**Model**: `phi3:mini` (Ollama)

**Processing Steps**:

1. Gather context:
   - Requirement text
   - Selected historical matches
   - Past module impacts from matches

2. Build LLM prompt:
   - Request module identification
   - Ask for impact level (High/Medium/Low)
   - Request brief justification

3. Call Ollama LLM

4. Parse JSON response using `parse_llm_json()` (handles malformed JSON)

5. Validate output structure

**Prompt Template**:
```
Based on the requirement and historical data, identify which system
modules will be impacted. For each module, specify:
- Module name
- Impact level (High/Medium/Low)
- Brief description of changes needed

Requirement: {requirement_text}

Historical impacts: {past_modules}

Return JSON: {"modules": [...]}
```

**Output**:
```json
{
  "impacted_modules_output": {
    "modules": [
      {
        "name": "Authentication Service",
        "impact_level": "High",
        "description": "Major refactoring needed for OAuth integration"
      },
      {
        "name": "User Database Schema",
        "impact_level": "Medium",
        "description": "Add new tables for OAuth tokens"
      },
      {
        "name": "Frontend Login UI",
        "impact_level": "High",
        "description": "Complete redesign for OAuth flow"
      }
    ]
  }
}
```

**State Updates**:
```python
{
  "impacted_modules_output": {...},
  "status": "impacted_modules_generated",
  "current_agent": "estimation_effort"
}
```

---

#### **Phase 6: Estimation Effort Agent** (Agent 5)

**File**: `app/components/estimation_effort/agent.py`
**Purpose**: Calculate development and QA effort
**Model**: `phi3:mini` (Ollama)

**Processing Steps**:

1. Analyze complexity:
   - Requirement scope
   - Number of impacted modules
   - Historical estimation data from matches

2. Retrieve similar estimations:
   - Filter selected matches for estimation records
   - Extract dev/QA hours, story points
   - Calculate averages and adjustments

3. Generate estimates via LLM:
   - Dev effort (hours)
   - QA effort (hours)
   - Total effort (auto-calculated)
   - Story points (Fibonacci scale)
   - Complexity (Small/Medium/Large)
   - Risk level (Low/Medium/High)

4. Apply validation rules:
   - Total = Dev + QA
   - Story points ∈ {1,2,3,5,8,13,21}
   - Reasonable hour ranges

**Prompt Template**:
```
Estimate effort for the following requirement based on historical data.

Requirement: {requirement_text}
Impacted Modules: {modules}

Historical Estimations (similar work):
{past_estimations}

Provide estimates for:
- dev_effort_hours
- qa_effort_hours
- total_story_points
- complexity (Small/Medium/Large)
- risk_level (Low/Medium/High)

Return JSON format.
```

**Output**:
```json
{
  "estimation_effort_output": {
    "dev_effort_hours": 120.0,
    "qa_effort_hours": 40.0,
    "total_effort_hours": 160.0,
    "total_story_points": 21,
    "complexity": "Large",
    "risk_level": "Medium",
    "confidence_level": "High",
    "estimation_method": "Historical Analysis + LLM",
    "other_params": {
      "base_estimate": 100,
      "complexity_multiplier": 1.2,
      "risk_buffer": 20
    }
  }
}
```

**State Updates**:
```python
{
  "estimation_effort_output": {...},
  "status": "estimation_effort_completed",
  "current_agent": "tdd"
}
```

---

#### **Phase 7: TDD Agent** (Agent 6)

**File**: `app/components/tdd/agent.py`
**Purpose**: Generate Technical Design Document
**Model**: `phi3:mini` (Ollama)

**Processing Steps**:

1. Gather comprehensive context:
   - Requirement text
   - Impacted modules
   - Effort estimates
   - Historical TDDs from selected matches

2. Build detailed TDD prompt with sections:
   - Executive Summary
   - Technical Components
   - Design Decisions
   - Dependencies
   - Security Considerations
   - Performance Requirements

3. Call Ollama LLM with long-form generation

4. Parse markdown output

5. Save to file: `sessions/{date}/{session_id}/step3_agents/agent_tdd/tdd.md`

6. Extract structured fields for state

**Prompt Template** (truncated):
```
Generate a comprehensive Technical Design Document.

REQUIREMENT: {requirement_text}

IMPACTED MODULES: {modules}

EFFORT ESTIMATE: {effort}

HISTORICAL TDD EXAMPLES:
{past_tdds}

Generate sections:
1. Executive Summary
2. Technical Components
3. Architecture Pattern
4. Design Decisions
5. Dependencies
6. Security Considerations
7. Performance Requirements

Return as structured JSON with each section as a field.
```

**Output Structure**:
```json
{
  "tdd_output": {
    "tdd_name": "User Authentication System - OAuth 2.0 Implementation",
    "tdd_description": "Complete migration from basic auth to OAuth 2.0...",
    "tdd_version": "1.0",
    "technical_components": [
      "OAuth 2.0 Provider Integration",
      "Token Management Service",
      "User Profile Mapper"
    ],
    "architecture_pattern": "Microservices with API Gateway",
    "design_decisions": "Chose OAuth 2.0 over SAML for better mobile support...",
    "dependencies": [
      "passport.js library",
      "Redis for token caching"
    ],
    "security_considerations": "All tokens encrypted at rest, 15min expiry...",
    "performance_requirements": "Token validation < 50ms, support 10K concurrent users"
  }
}
```

**File Storage**:
```
sessions/2026-01-20/sess-uuid-1234/
└── step3_agents/
    └── agent_tdd/
        ├── input_prompt.txt
        ├── raw_response.txt
        ├── tdd.md              ← Markdown format
        └── parsed_output.json  ← Structured data
```

**State Updates**:
```python
{
  "tdd_output": {...},
  "status": "tdd_generated",
  "current_agent": "jira_stories"
}
```

---

#### **Phase 8: Jira Stories Agent** (Agent 7)

**File**: `app/components/jira_stories/agent.py`
**Purpose**: Generate actionable Jira user stories
**Model**: `phi3:mini` (Ollama)

**Processing Steps**:

1. Break down requirement into user stories:
   - Use impacted modules as guide
   - Reference effort estimates for sizing
   - Review historical story patterns

2. For each story, generate:
   - Title (user-facing format)
   - Description (details + context)
   - Acceptance criteria (testable conditions)
   - Story points (from effort estimate)
   - Priority (Critical/High/Medium/Low)
   - Labels (tags for categorization)

3. Create sub-tasks where appropriate

4. Validate story structure

**Prompt Template**:
```
Create Jira user stories for the following requirement.

REQUIREMENT: {requirement_text}

IMPACTED MODULES: {modules}

EFFORT ESTIMATE: {effort} hours, {points} story points

HISTORICAL STORIES (similar work):
{past_stories}

For each story, provide:
- Title (As a [user], I want [feature] so that [benefit])
- Description
- Acceptance Criteria (Given/When/Then format)
- Story Points
- Priority
- Labels

Break down into 3-7 stories. Return as JSON array.
```

**Output Structure**:
```json
{
  "jira_stories_output": {
    "stories": [
      {
        "story_title": "As a user, I want to login with Google OAuth so that I don't need to create another password",
        "description": "Implement Google OAuth 2.0 integration for user authentication. This allows users to sign in using their existing Google accounts.",
        "acceptance_criteria": [
          "Given a user on the login page",
          "When they click 'Sign in with Google'",
          "Then they are redirected to Google OAuth consent screen",
          "And upon approval, are logged into the system",
          "And their profile is created/updated in our database"
        ],
        "story_points": 8,
        "priority": "High",
        "labels": ["authentication", "oauth", "google"],
        "issue_type": "Story",
        "assignee": null,
        "sprint": null
      },
      {
        "story_title": "As a developer, I want token refresh mechanism so that users stay logged in securely",
        "description": "Implement automatic token refresh using refresh tokens to maintain user sessions without requiring frequent re-authentication.",
        "acceptance_criteria": [
          "Given a user with an expiring access token",
          "When the token is within 5 minutes of expiry",
          "Then the system automatically requests a new token using refresh token",
          "And the user session continues seamlessly"
        ],
        "story_points": 5,
        "priority": "High",
        "labels": ["authentication", "security", "tokens"],
        "issue_type": "Story"
      },
      {
        "story_title": "Update database schema for OAuth user profiles",
        "description": "Add necessary tables and fields to store OAuth provider information, tokens, and user profile data from external providers.",
        "acceptance_criteria": [
          "Given the new schema migration",
          "When applied to the database",
          "Then new tables oauth_providers and oauth_tokens are created",
          "And user table has provider_id and provider_type fields",
          "And all foreign keys are properly constrained"
        ],
        "story_points": 3,
        "priority": "Medium",
        "labels": ["database", "schema", "migration"],
        "issue_type": "Task"
      }
      // ... more stories
    ],
    "total_stories": 5,
    "total_story_points": 21
  }
}
```

**State Updates**:
```python
{
  "jira_stories_output": {...},
  "status": "jira_stories_generated",
  "current_agent": "done"
}
```

---

#### **Phase 9: Code Impact Agent** (DISABLED)

**Status**: Temporarily disabled in workflow
**File**: `app/components/code_impact/agent.py` (exists but not wired)

**Planned Functionality**:
- Analyze GitLab repository structure
- Identify affected code files/functions
- Estimate lines of code to change
- Assess backward compatibility risks
- Generate code change checklist

**Why Disabled**:
- Requires GitLab API integration (not yet implemented)
- Needs code parsing capabilities
- Frontend UI not ready for this section

**Future Activation**:
```python
# In workflow.py, uncomment:
# from ..code_impact.agent import code_impact_agent
# workflow.add_node("code_impact", code_impact_agent)
# workflow.add_edge("jira_stories", "code_impact")
```

---

#### **Phase 10: Risk Assessment Agent** (DISABLED)

**Status**: Temporarily disabled in workflow
**File**: `app/components/risks/agent.py` (exists but not wired)

**Planned Functionality**:
- Identify technical risks
- Assess timeline/schedule risks
- Evaluate resource availability
- Generate risk mitigation strategies
- Create risk matrix (probability × impact)

**Why Disabled**:
- Requires integration with project management data
- Needs resource allocation information
- Frontend UI not ready for this section

**Future Activation**:
```python
# In workflow.py, uncomment:
# from ..risks.agent import risks_agent
# workflow.add_node("risks", risks_agent)
# workflow.add_edge("code_impact", "risks")
# workflow.add_edge("risks", END)
```

---

#### **Phase 11: Pipeline Complete**

**Final State**:
```python
{
  "status": "completed",
  "current_agent": "done",
  "session_id": "uuid",
  "requirement_text": "...",
  "extracted_keywords": [...],
  "all_matches": [...],
  "selected_matches": [...],
  "impacted_modules_output": {...},
  "estimation_effort_output": {...},
  "tdd_output": {...},
  "jira_stories_output": {...},
  "timing": {
    "requirement": 1200,
    "historical_match": 3400,
    "impacted_modules": 5600,
    "estimation_effort": 4200,
    "tdd": 8900,
    "jira_stories": 6100
  },
  "messages": [
    // All agent messages
  ]
}
```

**Actions on Completion**:

1. **Save to Session Storage**:
   ```
   sessions/2026-01-20/sess-uuid-1234/
   ├── step1_input/
   │   ├── requirement.json
   │   └── extracted_keywords.json
   ├── step2_search/
   │   ├── search_request.json
   │   ├── all_matches.json
   │   └── selected_matches.json
   ├── step3_agents/
   │   ├── agent_impacted_modules/
   │   │   ├── input_prompt.txt
   │   │   ├── raw_response.txt
   │   │   └── parsed_output.json
   │   ├── agent_estimation_effort/
   │   ├── agent_tdd/
   │   │   ├── tdd.md
   │   │   └── parsed_output.json
   │   └── agent_jira_stories/
   └── final_summary.json
   ```

2. **Return to Frontend**:
   ```http
   HTTP/1.1 200 OK
   Content-Type: application/json

   {
     "session_id": "uuid",
     "status": "completed",
     "results": {
       "impacted_modules": {...},
       "estimation_effort": {...},
       "tdd": {...},
       "jira_stories": {...}
     }
   }
   ```

3. **Update Frontend Context**:
   ```typescript
   // SDLCContext state update
   setImpactedModules(results.impacted_modules);
   setEstimationEffort(results.estimation_effort);
   setTdd(results.tdd);
   setJiraStories(results.jira_stories);
   setStatus('completed');
   ```

4. **Display Results**:
   - Navigate to results dashboard
   - Show all agent outputs in tabs
   - Enable TDD download
   - Allow Jira export

---

## Data Flow & State Management

### LangGraph State Schema

**File**: `app/components/orchestrator/state.py`

```python
class ImpactAssessmentState(TypedDict, total=False):
    # SESSION CONTEXT
    session_id: str
    requirement_text: str
    jira_epic_id: Optional[str]
    extracted_keywords: List[str]

    # SEARCH RESULTS
    all_matches: List[Dict]
    selected_matches: List[Dict]

    # AGENT OUTPUTS
    impacted_modules_output: Dict
    estimation_effort_output: Dict
    tdd_output: Dict
    jira_stories_output: Dict
    code_impact_output: Dict      # Disabled
    risks_output: Dict             # Disabled

    # CONTROL FIELDS
    status: Literal[...]
    current_agent: str
    error_message: Optional[str]

    # TIMING & AUDIT
    timing: Dict[str, int]
    messages: Annotated[List[Dict], operator.add]
```

### State Update Pattern

Agents return **partial state updates**:

```python
async def my_agent(state: ImpactAssessmentState) -> dict:
    # Process logic...

    return {
        "my_output": {...},           # Only this field
        "status": "my_step_done",     # Update status
        "current_agent": "next_agent", # Route to next
        "messages": [...]             # Append message
    }
    # LangGraph auto-merges with existing state
```

### State Progression

```
created
  ↓
requirement_submitted (keywords extracted)
  ↓
matches_found (historical search complete)
  ↓
matches_selected (top matches chosen)
  ↓
impacted_modules_generated
  ↓
estimation_effort_completed
  ↓
tdd_generated
  ↓
jira_stories_generated
  ↓
completed (or error at any stage)
```

### Message Accumulation

Uses `operator.add` reducer for append-only message log:

```python
messages: Annotated[List[Dict], operator.add]

# Each agent appends:
"messages": [
    {
        "role": "requirement",
        "content": "Extracted 5 keywords",
        "timestamp": "2026-01-20T10:30:00Z"
    }
]

# Final state has all messages from all agents
```

---

## Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.10+ | Backend language |
| **FastAPI** | Latest | Web framework, API server |
| **LangGraph** | Latest | Agent workflow orchestration |
| **ChromaDB** | Latest | Vector database |
| **Ollama** | Latest | Local LLM runtime |
| **Pydantic** | v2 | Data validation, schemas |
| **pytest** | Latest | Testing framework |

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16 | React framework, App Router |
| **React** | 19 | UI library |
| **TypeScript** | Latest | Type-safe JavaScript |
| **Tailwind CSS** | v4 | Styling framework |
| **shadcn/ui** | Latest | Component library |

### AI/ML Models

| Model | Provider | Purpose | Dimensions |
|-------|----------|---------|------------|
| **phi3:mini** | Ollama | Text generation | - |
| **all-minilm** | Ollama | Embeddings | 384 |

### Data Storage

| Storage | Purpose | Location |
|---------|---------|----------|
| **ChromaDB** | Vector embeddings | `data/chroma/` |
| **CSV Files** | Source data | `data/raw/` |
| **Session Files** | Audit trail | `sessions/{date}/{id}/` |
| **Uploads** | User files | `data/uploads/` |

---

## Storage & Audit Trail

### Session Directory Structure

```
sessions/
└── 2026-01-20/
    └── sess-abc123-def456/
        ├── step1_input/
        │   ├── requirement.json
        │   └── extracted_keywords.json
        ├── step2_search/
        │   ├── search_request.json
        │   ├── all_matches.json
        │   └── selected_matches.json
        ├── step3_agents/
        │   ├── agent_impacted_modules/
        │   │   ├── input_prompt.txt
        │   │   ├── raw_response.txt
        │   │   └── parsed_output.json
        │   ├── agent_estimation_effort/
        │   │   ├── input_prompt.txt
        │   │   ├── raw_response.txt
        │   │   └── parsed_output.json
        │   ├── agent_tdd/
        │   │   ├── input_prompt.txt
        │   │   ├── raw_response.txt
        │   │   ├── tdd.md
        │   │   └── parsed_output.json
        │   └── agent_jira_stories/
        │       ├── input_prompt.txt
        │       ├── raw_response.txt
        │       └── parsed_output.json
        └── final_summary.json
```

### Audit Trail Manager

**File**: `app/utils/audit.py`

```python
class AuditTrailManager:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.base_path = self._create_session_dir()

    def save_step(self, step: str, data: dict):
        """Save data to specific pipeline step directory."""

    def save_agent_artifacts(self, agent_name: str, artifacts: dict):
        """Save agent prompts, responses, and outputs."""

    def save_final_summary(self, state: dict):
        """Save complete pipeline state as final summary."""
```

### Vector Database Collections

**ChromaDB Collections**:

```python
collections = [
    "epics",       # Epic descriptions
    "estimations", # Effort estimates
    "tdds"         # Technical design docs
]

# Each document stored with:
{
    "id": "unique-id",
    "document": "text content",
    "embedding": [384-dim vector],
    "metadata": {
        # Collection-specific fields
    }
}
```

**Initialization**:
```bash
python scripts/init_vector_db.py

# Reads from:
data/raw/epics.csv
data/raw/estimations.csv
data/raw/tdds.csv

# Writes to:
data/chroma/
```

---

## API Endpoints Reference

### Orchestrator Endpoints

```http
POST /api/v1/orchestrator/run
POST /api/v1/orchestrator/run-from-file
```

### Session Endpoints

```http
POST /api/v1/sessions
GET /api/v1/sessions/{id}
```

### Component Endpoints

```http
POST /api/v1/sessions/{id}/requirements
POST /api/v1/sessions/{id}/historical-matches
POST /api/v1/sessions/{id}/select-matches
```

### Health & Config

```http
GET /api/v1/health
GET /api/v1/config
```

---

## Error Handling

### Error Handler Node

**File**: `app/components/orchestrator/workflow.py`

```python
async def error_handler_node(state: ImpactAssessmentState) -> dict:
    return {
        "status": "error",
        "messages": [{
            "role": "error_handler",
            "content": f"Error: {state.get('error_message')}"
        }]
    }
```

### Conditional Routing

```python
def route_after_agent(state: ImpactAssessmentState) -> str:
    if state.get("status") == "error":
        return "error_handler"
    next_agent = state.get("current_agent", "done")
    if next_agent == "done":
        return END
    return next_agent
```

### Error Recovery

- All agents catch exceptions
- Update state with error message
- Route to error_handler node
- Return error status to frontend

---

## Performance Metrics

### Typical Timings (approximate)

| Agent | Time (ms) | Notes |
|-------|-----------|-------|
| Requirement | 1,000-2,000 | LLM keyword extraction |
| Historical Match | 2,000-5,000 | Vector search + fusion |
| Auto-Select | 50-100 | Simple sorting |
| Impacted Modules | 4,000-7,000 | LLM analysis |
| Estimation | 3,000-5,000 | LLM + calculations |
| TDD | 7,000-12,000 | Long-form generation |
| Jira Stories | 5,000-8,000 | Multiple stories |
| **Total** | **22-40 seconds** | Full pipeline |

### Optimization Opportunities

- Parallel agent execution (where independent)
- Cached embeddings for common queries
- Model quantization for faster inference
- Batch processing for file uploads

---

## Frontend Integration

### Context Management

**File**: `ele-sdlc-frontend/src/contexts/sdlc-context.tsx`

```typescript
interface SDLCContextType {
  // State
  sessionId: string | null;
  status: string;
  currentAgent: string;

  // Results
  historicalMatches: Match[];
  impactedModules: Module[];
  estimationEffort: Estimation;
  tdd: TDD;
  jiraStories: Story[];

  // Actions
  startAssessment: (requirement: string) => Promise<void>;
  updateAgentStatus: (agent: string, status: string) => void;
}
```

### Agent Tracking

**File**: `ele-sdlc-frontend/src/lib/api/types.ts`

```typescript
export const AGENTS = [
  "requirement",
  "historical_match",
  "auto_select",
  "impacted_modules",
  "estimation_effort",
  "tdd",
  "jira_stories"
] as const;

// Must match backend agent order!
```

### Wizard Navigation

```typescript
// Wizard steps align with agents
const wizardSteps = [
  { id: 1, name: "Requirement", agent: "requirement" },
  { id: 2, name: "Historical Matches", agent: "historical_match" },
  { id: 3, name: "Impact Analysis", agent: "impacted_modules" },
  { id: 4, name: "Effort Estimation", agent: "estimation_effort" },
  { id: 5, name: "TDD", agent: "tdd" },
  { id: 6, name: "Jira Stories", agent: "jira_stories" }
];
```

---

## Deployment

### Development Environment

```bash
# Backend
cd ele-sdlc-backend
./start_dev.sh

# Frontend
cd ele-sdlc-frontend
npm run dev
```

### Production Considerations

- Use Gunicorn/Uvicorn workers for FastAPI
- Redis for caching (future enhancement)
- PostgreSQL for persistent storage (future enhancement)
- Nginx reverse proxy
- Docker containerization
- Kubernetes orchestration (enterprise)

---

## Future Enhancements

### Planned Features

1. **Code Impact Agent** (Phase 2)
   - GitLab API integration
   - Code change estimation
   - Backward compatibility checks

2. **Risk Assessment Agent** (Phase 2)
   - Risk matrix generation
   - Mitigation strategies
   - Timeline impact analysis

3. **Real-time Collaboration** (Phase 3)
   - WebSocket updates
   - Multi-user sessions
   - Comment threads

4. **Advanced Analytics** (Phase 3)
   - Historical trend analysis
   - Prediction accuracy tracking
   - Team velocity metrics

### Optimization Roadmap

- Model fine-tuning on domain-specific data
- Hybrid cloud deployment (local + cloud LLMs)
- Advanced caching strategies
- Parallel agent execution
- Incremental vector database updates

---

## Troubleshooting

### Common Issues

**Issue**: Ollama not responding
**Solution**: `curl http://localhost:11434/api/tags`, restart Ollama service

**Issue**: ChromaDB empty results
**Solution**: `python scripts/init_vector_db.py` to reindex

**Issue**: LLM returns malformed JSON
**Solution**: `parse_llm_json()` utility handles this, check logs for details

**Issue**: Agent timeout
**Solution**: Increase timeout in settings, check model size

---

## References

- **Backend Repo**: `ele-sdlc-backend/`
- **Frontend Repo**: `ele-sdlc-frontend/`
- **Main Documentation**: `CLAUDE.md` (polyrepo root)
- **Backend Architecture**: `ele-sdlc-backend/CLAUDE.md`
- **Pipeline Plan**: `ele-sdlc-backend/docs/PIPELINE_IMPLEMENTATION_PLAN.md`
- **API Docs**: http://localhost:8000/docs

---

**Document Version**: 1.0
**Last Updated**: 2026-01-20
**Author**: AI-Generated Documentation
**Status**: Complete
