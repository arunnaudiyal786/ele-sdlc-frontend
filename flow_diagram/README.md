# SDLC AI Impact Assessment System - Flow Visualizations

This directory contains comprehensive visualizations and documentation for the AI Impact Assessment System workflow.

## 📁 Files Overview

### 1. Animated Flowchart Visualization ⭐ NEW
**File**: `sdlc_flow_animated.html`

A beautiful animated flowchart with **running dashed-line arrows** and step-by-step reveals!

**Features**:
- ✨ **Animated running arrows** with moving dots along connection lines
- 🎯 **Step-by-step navigation** - Click "Next" to reveal each agent
- 🎬 **Auto-play mode** - Watch the entire flow animate automatically
- ⌨️ **Keyboard shortcuts** - Use arrow keys or spacebar to navigate
- 📊 **Code snippets** - JSON examples appear as you progress
- 🎨 **Clean flowchart layout** - Similar to the Ralph AI example

**How to Use**:
```bash
# Open in your default browser
open sdlc_flow_animated.html
```

**Controls**:
- **Next Button**: Reveal the next step
- **Previous Button**: Go back one step
- **Reset Button**: Start over from the beginning
- **Auto Play**: Automatically advance through all steps
- **Arrow Keys**: Navigate forward/backward
- **Spacebar**: Advance to next step
- **R Key**: Reset to beginning

**Perfect For**: Presentations, demos, onboarding new team members

---

### 2. Interactive HTML Visualization
**File**: `sdlc_flow_interactive.html`

A fully interactive, browser-based visualization of the complete SDLC pipeline.

**Features**:
- Click any pipeline stage to expand details
- View processing steps, data flow, and state updates
- Color-coded status indicators (active/disabled agents)
- Responsive design (mobile-friendly)
- Technology stack badges
- Complete architecture diagram

**How to Use**:
```bash
# Open in your default browser
open sdlc_flow_interactive.html

# Or on Windows
start sdlc_flow_interactive.html

# Or on Linux
xdg-open sdlc_flow_interactive.html
```

**Navigation**:
- Click any stage box to expand/collapse details
- Scroll through all 10+ pipeline stages
- Hover over elements for visual feedback
- No internet connection required

**Perfect For**: Detailed technical documentation, deep-dive exploration

---

### 3. Mermaid Flow Diagram
**File**: `sdlc_flow_diagram.mmd`

A Mermaid.js diagram showing the complete data flow through the system.

**Features**:
- Visual flowchart of all agents
- State transitions and decision points
- Color-coded components (active/disabled/storage/LLM)
- Integration with vector DB and Ollama

**How to Use**:

**Option A: View Online**
1. Copy the file contents
2. Go to https://mermaid.live/
3. Paste the code in the editor
4. View and export as PNG/SVG

**Option B: In VS Code**
1. Install "Markdown Preview Mermaid Support" extension
2. Create a markdown file with:
   ```markdown
   # SDLC Flow
   ```mermaid
   [paste contents of sdlc_flow_diagram.mmd]
   ```
   ```
3. Open preview (Cmd+Shift+V / Ctrl+Shift+V)

**Option C: In Documentation**
- Include in Confluence, Notion, or GitLab markdown
- Most modern markdown renderers support Mermaid

---

### 4. Detailed Breakdown Document
**File**: `FLOW_DETAILED_BREAKDOWN.md`

A comprehensive 30+ page markdown document covering every aspect of the system.

**Contents**:
- System overview and architecture
- Complete pipeline flow (step-by-step)
- Detailed agent descriptions
- Data flow and state management
- Technology stack breakdown
- Storage and audit trail structure
- API endpoints reference
- Frontend integration details
- Performance metrics
- Troubleshooting guide

**How to Use**:
```bash
# View in VS Code or any markdown viewer
code FLOW_DETAILED_BREAKDOWN.md

# Or convert to PDF
pandoc FLOW_DETAILED_BREAKDOWN.md -o SDLC_Flow_Documentation.pdf

# Or view in browser (with markdown extension)
```

**Navigation Tips**:
- Use table of contents to jump to sections
- Search (Cmd+F / Ctrl+F) for specific topics
- Reference code snippets and file paths
- Follow cross-references to implementation files

---

### 5. Structured Data (JSON)
**File**: `sdlc_flow_data.json`

Machine-readable JSON representation of the entire system.

**Structure**:
```json
{
  "system": {...},           // System metadata
  "architecture": {...},     // Component details
  "pipeline": {
    "agents": [...]          // All 9 agents with full details
  },
  "state_management": {...}, // State schema and progression
  "data_storage": {...},     // DB and file storage
  "api_endpoints": {...},    // Complete API reference
  "frontend_integration": {...},
  "performance": {...},      // Timing metrics
  "models": {...},           // LLM and embedding models
  "deployment": {...}        // Deployment info
}
```

**Use Cases**:

**1. Generate Custom Diagrams**
```python
import json

with open('sdlc_flow_data.json') as f:
    data = json.load(f)

# Extract agent info
for agent in data['pipeline']['agents']:
    print(f"{agent['name']}: {agent['purpose']}")
    print(f"Time: {agent.get('typical_time_ms', 'N/A')}ms")
```

**2. Create Documentation**
```javascript
const data = require('./sdlc_flow_data.json');

// Generate API docs
data.api_endpoints.endpoints.forEach(endpoint => {
  console.log(`${endpoint.method} ${endpoint.path}`);
  console.log(`Purpose: ${endpoint.purpose}\n`);
});
```

**3. Build Monitoring Dashboards**
```python
# Use for Grafana, Datadog, or custom dashboards
agents = data['pipeline']['agents']
performance = data['performance']['agent_timings']

# Set up alerting thresholds based on typical times
```

---

## 🎯 Quick Start Guide

### For Developers
**Want to understand the codebase?**
1. Start with `sdlc_flow_interactive.html` for visual overview
2. Expand each agent to see implementation details
3. Reference `FLOW_DETAILED_BREAKDOWN.md` for code patterns

### For Product Managers
**Want to understand the workflow?**
1. Open `sdlc_flow_interactive.html`
2. Click through stages 0-7 (ignore disabled agents)
3. Review "Data Output" sections to see deliverables

### For Technical Writers
**Creating documentation?**
1. Use `sdlc_flow_diagram.mmd` for architecture diagrams
2. Reference `FLOW_DETAILED_BREAKDOWN.md` for technical details
3. Extract data from `sdlc_flow_data.json` for specifications

### For DevOps/SRE
**Setting up monitoring?**
1. Review `sdlc_flow_data.json` performance metrics
2. Set up alerts for agent timeouts
3. Monitor endpoints from API reference section

---

## 📊 What Each Agent Does

### Active Agents (Production)

| Agent | Input | Output | Time |
|-------|-------|--------|------|
| **Requirement** | User text | Keywords | ~1.5s |
| **Historical Match** | Keywords | Similar past work | ~3.5s |
| **Auto-Select** | All matches | Top 5 matches | ~0.1s |
| **Impacted Modules** | Requirement + matches | Affected modules | ~5.5s |
| **Estimation** | Modules + matches | Dev/QA hours, story points | ~4.2s |
| **TDD** | All above | Technical design doc | ~9s |
| **Jira Stories** | All above | User stories + criteria | ~6s |

**Total Pipeline Time**: ~30 seconds

### Disabled Agents (Future)

| Agent | Planned Feature | Status |
|-------|----------------|--------|
| **Code Impact** | GitLab analysis, file changes | Phase 2 |
| **Risk Assessment** | Risk matrix, mitigation | Phase 2 |

---

## 🔍 Key Insights

### Data Flow
```
User Input
   ↓
Keyword Extraction (LLM)
   ↓
Hybrid Search (ChromaDB)
  ├── Semantic Search (70%)
  └── Keyword Search (30%)
   ↓
Auto-Select Top 5
   ↓
Module Analysis (LLM)
   ↓
Effort Estimation (LLM + Historical)
   ↓
TDD Generation (LLM)
   ↓
Jira Stories (LLM)
   ↓
Complete Assessment
```

### Technology Stack
- **Backend**: FastAPI + LangGraph + Python 3.10+
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **AI/ML**: Ollama (phi3:mini, all-minilm)
- **Database**: ChromaDB (vector store)
- **Styling**: Tailwind CSS v4 + shadcn/ui

### State Management
- LangGraph `StateGraph` for workflow orchestration
- Partial state updates (agents only return changed fields)
- Automatic state merging by LangGraph
- Audit trail saved to `sessions/{date}/{id}/`

---

## 📖 Additional Resources

### Backend Documentation
- `../../ele-sdlc-backend/CLAUDE.md` - Backend architecture
- `../../ele-sdlc-backend/docs/PIPELINE_IMPLEMENTATION_PLAN.md` - Pipeline design
- `../../ele-sdlc-backend/docs/RUN.md` - Operation guide

### Frontend Documentation
- `../../CLAUDE.md` - Polyrepo overview
- `../src/contexts/sdlc-context.tsx` - State management
- `../src/lib/api/types.ts` - Type definitions

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🛠️ Troubleshooting

### Can't open interactive HTML?
**Issue**: File won't open in browser
**Solution**: Right-click → "Open With" → Choose browser

### Mermaid diagram not rendering?
**Issue**: Diagram shows as code
**Solution**: Use https://mermaid.live/ or install Mermaid extension

### JSON parse errors?
**Issue**: Can't read `sdlc_flow_data.json`
**Solution**: Validate at https://jsonlint.com/

### Want to edit visualizations?
**Issue**: Need to customize for your team
**Solutions**:
- HTML: Edit inline styles in `<style>` tag
- Mermaid: Modify flowchart in `.mmd` file
- Markdown: Edit `.md` file directly
- JSON: Update data structures as needed

---

## 📝 Maintenance

### Keeping Visualizations Updated

When the pipeline changes:

1. **Update JSON Data**
   - Edit `sdlc_flow_data.json` with new agent info
   - Update timings, endpoints, or state fields

2. **Update Mermaid Diagram**
   - Add/remove nodes for new/removed agents
   - Update edges for new flow paths

3. **Update Interactive HTML**
   - Add new pipeline stage sections
   - Update agent details in expandable panels

4. **Update Markdown Doc**
   - Add new sections for new features
   - Update code examples and file paths
   - Refresh performance metrics

### Version Control

These files should be committed to git:
```bash
git add flow_diagram/
git commit -m "Update SDLC flow visualizations"
```

---

## 🎨 Customization

### Branding
Update colors in `sdlc_flow_interactive.html`:
```css
background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);
```

### Export Options

**To PDF**:
```bash
# HTML to PDF
wkhtmltopdf sdlc_flow_interactive.html SDLC_Flow_Visual.pdf

# Markdown to PDF
pandoc FLOW_DETAILED_BREAKDOWN.md -o SDLC_Flow_Docs.pdf
```

**To PNG/SVG**:
- Open Mermaid diagram at https://mermaid.live/
- Click "Export" → Choose format

**To Presentation**:
- Screenshots of HTML visualization
- Embed Mermaid diagrams in PowerPoint/Google Slides
- Use JSON data to generate custom charts

---

## 🤝 Contributing

Found an issue or want to improve these visualizations?

1. Update the relevant file(s)
2. Test thoroughly (open HTML, render Mermaid, etc.)
3. Update this README if needed
4. Submit changes

---

## 📄 License

Internal Elevance Health documentation.

---

## 📞 Support

For questions about these visualizations or the SDLC system:
- Check `FLOW_DETAILED_BREAKDOWN.md` first
- Review backend/frontend CLAUDE.md files
- Contact the development team

---

**Generated**: 2026-01-20
**Version**: 1.0
**Status**: Complete and Production-Ready
