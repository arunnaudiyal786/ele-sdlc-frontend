# SDLC AI Impact Assessment - Quick Reference

**One-page cheat sheet for the complete system**

---

## 🎯 What It Does

Analyzes software requirements and automatically generates:
- ✓ Module impact analysis
- ✓ Effort estimates (dev/QA hours, story points)
- ✓ Technical design documents (TDD)
- ✓ Jira user stories with acceptance criteria

**Time**: ~30 seconds per requirement

---

## 🏗️ System Architecture

```
Frontend (3000) → Backend (8000) → Ollama (11434)
                       ↓
                   ChromaDB
```

| Layer | Tech | Purpose |
|-------|------|---------|
| **UI** | Next.js 16 + React 19 | User interface |
| **API** | FastAPI + LangGraph | Agent orchestration |
| **AI** | Ollama (phi3:mini) | Text generation |
| **DB** | ChromaDB | Vector search |

---

## 🔄 Pipeline Flow (7 Active Agents)

```
1. Requirement → Extract keywords (1.5s)
2. Historical Match → Find similar past work (3.5s)
3. Auto-Select → Pick top 5 matches (0.1s)
4. Impacted Modules → Identify affected systems (5.5s)
5. Estimation → Calculate effort (4.2s)
6. TDD → Generate design doc (9s)
7. Jira Stories → Create user stories (6s)

Total: ~30 seconds
```

---

## 📊 Agent Details

### Agent 1: Requirement Analysis
- **Input**: User requirement text
- **Output**: List of keywords
- **Model**: phi3:mini (Ollama)
- **Time**: ~1.5s

### Agent 2: Historical Match
- **Input**: Keywords
- **Output**: Top matches (scored)
- **Method**: Hybrid search (70% semantic + 30% keyword)
- **Model**: all-minilm (embeddings)
- **Time**: ~3.5s

### Agent 3: Auto-Select
- **Input**: All matches
- **Output**: Top 5 selected
- **Logic**: Sort by score, take top 5
- **Time**: ~0.1s

### Agent 4: Impacted Modules
- **Input**: Requirement + selected matches
- **Output**: Modules with impact levels (High/Medium/Low)
- **Model**: phi3:mini
- **Time**: ~5.5s

### Agent 5: Estimation Effort
- **Input**: Modules + historical data
- **Output**: Dev hours, QA hours, story points, complexity, risk
- **Model**: phi3:mini
- **Time**: ~4.2s

### Agent 6: TDD Generation
- **Input**: All previous outputs
- **Output**: Complete technical design document
- **Sections**: Summary, components, architecture, design, dependencies, security, performance
- **Model**: phi3:mini
- **Time**: ~9s

### Agent 7: Jira Stories
- **Input**: All previous outputs
- **Output**: User stories with acceptance criteria
- **Fields**: Title, description, criteria, points, priority, labels
- **Model**: phi3:mini
- **Time**: ~6s

---

## 🗄️ Data Storage

### ChromaDB Collections
- **epics**: Epic descriptions + metadata
- **estimations**: Effort estimates + metadata
- **tdds**: Technical design docs + metadata

### Session Storage
```
sessions/{date}/{session_id}/
├── step1_input/
│   ├── requirement.json
│   └── extracted_keywords.json
├── step2_search/
│   ├── all_matches.json
│   └── selected_matches.json
├── step3_agents/
│   ├── agent_tdd/
│   │   └── tdd.md
│   └── agent_jira_stories/
│       └── parsed_output.json
└── final_summary.json
```

---

## 🔌 API Endpoints

**Base URL**: `http://localhost:8000/api/v1`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/orchestrator/run` | POST | Execute full pipeline |
| `/orchestrator/run-from-file` | POST | Pipeline from file |
| `/sessions` | POST | Create session |
| `/sessions/{id}/requirements` | POST | Submit requirement |
| `/health` | GET | Health check |
| `/config` | GET | Current config |

**Docs**: http://localhost:8000/docs

---

## 🎨 Frontend Integration

### Contexts
- **SDLCContext**: Pipeline state, agent outputs
- **WizardContext**: Wizard navigation

### Agent Tracking
```typescript
AGENTS = [
  "requirement",
  "historical_match",
  "auto_select",
  "impacted_modules",
  "estimation_effort",
  "tdd",
  "jira_stories"
]
```

### State Fields
```typescript
{
  sessionId: string,
  status: string,
  historicalMatches: Match[],
  impactedModules: Module[],
  estimationEffort: Estimation,
  tdd: TDD,
  jiraStories: Story[]
}
```

---

## 🚀 Quick Start

### Start Full Stack
```bash
# From polyrepo root
./start.sh
```

### Start Backend Only
```bash
cd ele-sdlc-backend
./start_dev.sh
```

### Start Frontend Only
```bash
cd ele-sdlc-frontend
npm run dev
```

### Initialize Vector DB
```bash
cd ele-sdlc-backend
python scripts/init_vector_db.py
```

---

## 📈 State Progression

```
created
  ↓
requirement_submitted
  ↓
matches_found
  ↓
matches_selected
  ↓
impacted_modules_generated
  ↓
estimation_effort_completed
  ↓
tdd_generated
  ↓
jira_stories_generated
  ↓
completed
```

---

## 🔍 Search Strategy

### Hybrid Search Formula
```
final_score = (0.7 × semantic_score) + (0.3 × keyword_score)
```

### Semantic Search
- **Model**: all-minilm
- **Method**: Cosine similarity on 384-dim vectors
- **Weight**: 70%

### Keyword Search
- **Method**: BM25 algorithm
- **Fields**: Text content
- **Weight**: 30%

---

## ⚙️ Configuration

### Backend Settings
- **File**: `config/settings.yaml`
- **Override**: `.env` file
- **Prefixes**: `OLLAMA_*`, `CHROMA_*`, `SEARCH_*`

### Frontend Settings
- **File**: `.env.local`
- **Keys**: `NEXT_PUBLIC_API_URL`

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Ollama not responding | `curl http://localhost:11434/api/tags` |
| ChromaDB empty | `python scripts/init_vector_db.py` |
| Frontend can't reach API | Check backend running on port 8000 |
| LLM returns bad JSON | Uses `parse_llm_json()` auto-fix |

---

## 📊 Performance Benchmarks

| Metric | Value |
|--------|-------|
| **Total Pipeline** | 22-40s (avg 31s) |
| **Requirement Agent** | 1-2s |
| **Historical Match** | 2-5s |
| **Impacted Modules** | 4-7s |
| **Estimation** | 3-5s |
| **TDD** | 7-12s |
| **Jira Stories** | 5-8s |

---

## 🔐 Security

- Local Ollama (no external API calls)
- Session-based isolation
- Audit trail for all operations
- No user data sent externally

---

## 📁 File Locations

### Backend
```
ele-sdlc-backend/
├── app/components/orchestrator/workflow.py
├── app/rag/hybrid_search.py
├── data/chroma/
└── sessions/
```

### Frontend
```
ele-sdlc-frontend/
├── src/contexts/sdlc-context.tsx
├── src/lib/api/types.ts
└── src/components/assessment/
```

---

## 🚫 Disabled Features (Future)

- **Code Impact Agent**: Requires GitLab integration
- **Risk Assessment Agent**: Requires PM data

**Status**: Phase 2 development

---

## 📞 Resources

- **Interactive Flow**: `flow_diagram/sdlc_flow_interactive.html`
- **Detailed Docs**: `flow_diagram/FLOW_DETAILED_BREAKDOWN.md`
- **Mermaid Diagram**: `flow_diagram/sdlc_flow_diagram.mmd`
- **JSON Data**: `flow_diagram/sdlc_flow_data.json`
- **API Docs**: http://localhost:8000/docs

---

## 🎓 Key Concepts

### LangGraph
- Workflow orchestration framework
- State-based agent coordination
- Partial state updates auto-merge

### Vector Search
- ChromaDB for similarity matching
- 384-dimensional embeddings
- Cosine similarity metric

### Hybrid Search
- Combines semantic + keyword
- Weighted fusion (70/30 split)
- Better than either alone

### Audit Trail
- Every step saved to disk
- Prompt + response + output
- Reproducible results

---

**Version**: 1.0
**Date**: 2026-01-20
**Print**: Letter size, landscape recommended
