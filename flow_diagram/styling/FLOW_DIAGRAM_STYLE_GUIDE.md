# Flow Diagram Style Guide

Complete design system and styling guide for animated flow diagrams. Use this guide to recreate the exact look, feel, and behavior in any future project.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Node Styles](#node-styles)
4. [Code Box Styles](#code-box-styles)
5. [Connection Lines](#connection-lines)
6. [Animations](#animations)
7. [Layout & Spacing](#layout--spacing)
8. [Interactive Patterns](#interactive-patterns)
9. [Responsive Design](#responsive-design)

---

## Color Palette

### Primary Colors

```css
/* Background */
--background: #fafbfc;
--card-background: #ffffff;

/* Node Colors */
--node-bg: #ddf4ff;              /* Light blue background */
--node-border: #54aeff;          /* Blue border */
--node-border-active: #0969da;   /* Darker blue for active state */

/* Decision Node (Yellow variant) */
--decision-bg: #fff8c5;          /* Light yellow */
--decision-border: #d4a72c;      /* Gold border */

/* Disabled Node */
--disabled-bg: #f6f8fa;          /* Light gray */
--disabled-border: #d0d7de;      /* Gray border */

/* Code Boxes */
--code-bg: #f6f8fa;              /* Light gray */
--code-border: #8250df;          /* Purple */
--code-border-darker: #6639ba;   /* Darker purple for hover */

/* Text Colors */
--text-primary: #24292f;         /* Almost black */
--text-secondary: #57606a;       /* Medium gray */
--text-muted: #8c959f;           /* Light gray */

/* Accent Colors */
--accent-blue: #0969da;          /* Blue for badges, highlights */
--accent-purple: #8250df;        /* Purple for code elements */

/* Connection Lines */
--line-color: #24292f;           /* Dark gray/black */
--line-color-code: #8250df;      /* Purple for code box connections */
```

### Color Usage

| Element | Background | Border | Text |
|---------|-----------|--------|------|
| Standard Node | `#ddf4ff` | `#54aeff` | `#24292f` |
| Active Node | `#ddf4ff` | `#0969da` (2px) | `#24292f` |
| Decision Node | `#fff8c5` | `#d4a72c` | `#24292f` |
| Disabled Node | `#f6f8fa` | `#d0d7de` | `#24292f` |
| Code Box | `#f6f8fa` | `#8250df` (dashed) | `#24292f` |
| Badge | `rgba(9,105,218,0.12)` | none | `#0969da` |
| Info Icon | `rgba(130,80,223,0.15)` | none | `#8250df` |

---

## Typography

### Font Families

```css
/* Primary Text */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

/* Code/Monospace */
font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
```

### Font Sizes

```css
/* Headers */
--h1-size: 2.2rem;               /* Page title */
--node-title-size: 1rem;         /* Node heading */

/* Body Text */
--body-size: 0.85rem;            /* Node description */
--small-size: 0.8rem;            /* Hints */
--badge-size: 0.7rem;            /* Badges */
--code-size: 0.75rem;            /* Code boxes */
```

### Font Weights

```css
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
```

### Text Hierarchy

```css
/* Page Header */
h1 {
    font-size: 2.2rem;
    color: #24292f;
    font-weight: 600;
}

/* Node Title */
.node h3 {
    font-size: 1rem;
    color: #24292f;
    font-weight: 600;
    margin-bottom: 0.4rem;
}

/* Node Description */
.node p {
    font-size: 0.85rem;
    color: #57606a;
    line-height: 1.3;
}

/* Code Box */
.code-box {
    font-size: 0.75rem;
    line-height: 1.5;
    color: #24292f;
}

/* Code Box Headers */
.code-box strong {
    color: #0969da;
    font-weight: 600;
}
```

---

## Node Styles

### Standard Node

```css
.node {
    position: absolute;
    background: #ddf4ff;
    border: 2px solid #54aeff;
    border-radius: 8px;
    padding: 1.2rem 1.5rem;
    min-width: 200px;
    max-width: 260px;
    box-shadow: none;
    cursor: pointer;
    transition: all 0.4s ease;
    z-index: 10;
}
```

### Node States

**Invisible (Initial State)**
```css
.node {
    opacity: 0;
    transform: scale(0.8);
}
```

**Visible**
```css
.node.visible {
    opacity: 1;
    transform: scale(1);
}
```

**Highlighted (Active Step)**
```css
.node.highlighted {
    border-color: #0969da;
    border-width: 2px;
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.15);
}
```

**Hover Effect**
```css
.node:hover:not(.disabled) {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(9, 105, 218, 0.2);
}
```

### Node Variants

**Decision Node (Yellow)**
```css
.node.decision {
    background: #fff8c5;
    border-color: #d4a72c;
}
```

**Disabled Node (Gray)**
```css
.node.disabled {
    background: #f6f8fa;
    border-color: #d0d7de;
    cursor: default;
}
```

### Badge Style

```css
.node .badge {
    display: inline-block;
    background: rgba(9, 105, 218, 0.12);
    color: #0969da;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-size: 0.7rem;
    margin-top: 0.5rem;
    font-weight: 500;
}
```

### Info Icon

```css
.node .info-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(130, 80, 223, 0.15);
    color: #8250df;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.1);
    }
}
```

---

## Code Box Styles

### Base Style

```css
.code-box {
    position: absolute;
    background: #f6f8fa;
    border: 2px dashed #8250df;
    border-radius: 6px;
    padding: 1rem;
    padding-top: 2.5rem;           /* Space for close button */
    font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
    font-size: 0.75rem;
    color: #24292f;
    max-width: 350px;
    max-height: 320px;
    overflow-y: auto;
    overflow-x: hidden;
    line-height: 1.5;
    z-index: 15;

    /* Initially hidden */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s ease, visibility 0.4s ease;
}
```

### Visible State

```css
.code-box.visible {
    opacity: 1;
    visibility: visible;
}
```

### Close Button

```css
.code-box-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: #8250df;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.6rem;
    font-size: 0.7rem;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s ease;
}

.code-box-close:hover {
    background: #6639ba;
}
```

### Custom Scrollbar

```css
.code-box::-webkit-scrollbar {
    width: 10px;
}

.code-box::-webkit-scrollbar-track {
    background: #d0d7de;
    border-radius: 5px;
}

.code-box::-webkit-scrollbar-thumb {
    background: #8250df;
    border-radius: 5px;
}

.code-box::-webkit-scrollbar-thumb:hover {
    background: #6639ba;
}
```

---

## Connection Lines

### SVG Line Styles

```css
.connection-line {
    stroke: #24292f;
    stroke-width: 2;
    fill: none;
    stroke-dasharray: 5 5;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.connection-line.visible {
    opacity: 0.6;
    animation: dash 40s linear infinite;
}

.connection-line.highlighted {
    opacity: 1;
    animation: dash 40s linear infinite;
}
```

### Arrow Markers

Arrow markers provide directional flow indication at the end of each connection line.

**SVG Marker Definition:**
```html
<defs>
    <!-- Standard arrow for main flow connections -->
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#24292f" />
    </marker>

    <!-- Purple arrow for code box connections -->
    <marker id="arrowhead-purple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#8250df" />
    </marker>
</defs>
```

**Usage:**
- Main flow connections: `marker-end="url(#arrowhead)"`
- Code box connections: `marker-end="url(#arrowhead-purple)"`

**Properties:**
- Size: 10x10 units
- Style: Filled triangular polygon
- Orientation: `auto` (automatically points in direction of path)
- refX/refY: Positioning reference point (9, 3) for proper alignment

### Dash Animation

```css
@keyframes dash {
    to {
        stroke-dashoffset: -1000;
    }
}
```

**Animation Speed:** 40 seconds per cycle (slower = smoother visual flow)

### Connection Dots

```css
.connection-dot {
    fill: #24292f;
    r: 6;
}
```

### Code Box Connection Lines

```css
/* Applied to code-line-* elements */
stroke: #8250df;
opacity: 0.4;
```

### Bezier Curve Logic

All connections use smooth cubic bezier curves instead of straight lines.

**Algorithm:**
```javascript
function createCurvedPath(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const curveIntensity = 0.5;  // 50% of distance

    let cx1, cy1, cx2, cy2;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal curve (S-shape)
        cx1 = from.x + dx * curveIntensity;
        cy1 = from.y;
        cx2 = to.x - dx * curveIntensity;
        cy2 = to.y;
    } else {
        // Vertical curve with horizontal offset
        cx1 = from.x + dx * 0.3;
        cy1 = from.y + dy * curveIntensity;
        cx2 = to.x - dx * 0.3;
        cy2 = to.y - dy * curveIntensity;
    }

    return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
}
```

**Path Format:** SVG cubic bezier curve
- `M x y` = Move to start point
- `C cx1 cy1, cx2 cy2, x y` = Cubic curve with two control points

---

## Animations

### Node Entrance

```css
/* Timing */
transition: all 0.4s ease;

/* From */
opacity: 0;
transform: scale(0.8);

/* To */
opacity: 1;
transform: scale(1);
```

### Node Hover

```css
transition: all 0.4s ease;
transform: scale(1.02);
box-shadow: 0 2px 8px rgba(9, 105, 218, 0.2);
```

### Code Box Appearance

```css
transition: opacity 0.4s ease, visibility 0.4s ease;
```

### Info Icon Pulse

```css
animation: pulse 2s ease-in-out infinite;

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.1);
    }
}
```

### Line Dash Animation

```css
animation: dash 40s linear infinite;

@keyframes dash {
    to {
        stroke-dashoffset: -1000;
    }
}
```

**Timing:** 40 seconds for smooth, visible flow

---

## Layout & Spacing

### Container

```css
.flowchart-container {
    max-width: 1800px;
    margin: 0 auto;
    position: relative;
    min-height: 1800px;
    padding: 2rem;
}
```

### Node Positioning Pattern

**Strategy:** Non-linear, staggered layout for visual interest

**Vertical Spacing:** 200-240px between vertical steps
**Horizontal Positioning:** Percentage-based for responsiveness

**Example Layout:**
```css
#node-0 { top: 30px; left: 50%; transform: translateX(-50%); }  /* Centered */
#node-1 { top: 200px; left: 28%; }                              /* Left */
#node-2 { top: 400px; left: 20%; }                              /* Further left */
#node-3 { top: 600px; left: 35%; }                              /* Center-left */
#node-4 { top: 820px; left: 8%; }                               /* Far left */
#node-5 { top: 820px; right: 8%; }                              /* Far right (parallel) */
#node-6 { top: 1060px; left: 22%; }                             /* Converge */
#node-7 { top: 1300px; right: 22%; }                            /* Right */
#node-8 { top: 1540px; left: 15%; }                             /* Bottom left */
#node-9 { top: 1540px; right: 15%; }                            /* Bottom right */
```

### Code Box Positioning

**Strategy:** Place near corresponding nodes without overlap

```css
#code-1 { top: 180px; right: 8%; }      /* Near node-1 */
#code-2 { top: 380px; right: 10%; }     /* Near node-2 */
#code-3 { top: 800px; left: 52%; }      /* Between parallel nodes */
#code-4 { top: 800px; right: 52%; }     /* Between parallel nodes */
#code-5 { top: 1040px; right: 8%; }     /* Near node-6 */
#code-6 { top: 1280px; left: 8%; }      /* Near node-7 */
```

### Spacing Guidelines

| Element | Value |
|---------|-------|
| Node padding | `1.2rem 1.5rem` |
| Code box padding | `1rem` (2.5rem top for close button) |
| Node min-width | `200px` |
| Node max-width | `260px` |
| Code box max-width | `350px` |
| Code box max-height | `320px` |
| Vertical gap between nodes | `200-240px` |
| Badge margin-top | `0.5rem` |
| Container padding | `2rem` |

---

## Interactive Patterns

### Click to View Details

**Pattern:** Nodes with information have clickable interaction

**Implementation:**
1. Add `data-code` attribute to node linking to code box ID
2. Add info icon (ℹ) in top-right corner with pulse animation
3. On click, toggle code box visibility
4. Add close button (✕) to code box

**HTML Structure:**
```html
<div class="node" data-code="code-1">
    <span class="info-icon">ℹ</span>
    <h3>Title</h3>
    <p>Description</p>
    <span class="badge">Details</span>
</div>

<div class="code-box" id="code-1">
    <button class="code-box-close" onclick="closeCodeBox('code-1')">✕</button>
    <strong>Content:</strong>
    ...
</div>
```

**JavaScript:**
```javascript
// Toggle code box on node click
node.addEventListener('click', () => {
    if (node.classList.contains('visible')) {
        toggleCodeBox(codeId);
    }
});

// Show/hide with animation
function toggleCodeBox(codeId) {
    document.getElementById(codeId).classList.toggle('visible');
    // Redraw connections
    setTimeout(() => {
        drawConnections();
        updateConnections();
    }, 50);
}
```

### Progressive Disclosure

**Pattern:** Step-through navigation revealing nodes sequentially

**States:**
- `currentStep = 0` → Only node-0 visible
- `currentStep++` → Show next node(s) matching that step
- Previous nodes remain visible but unhighlighted

**Controls:**
- Next button: `currentStep++`
- Previous button: `currentStep--`
- Reset button: `currentStep = 0`, hide all code boxes
- Auto-play: Increment every 2.5 seconds

### Visual Feedback

| Interaction | Feedback |
|-------------|----------|
| Node hover | Scale 1.02, subtle shadow |
| Node click | Toggle code box, redraw connections |
| Info icon | Continuous pulse animation |
| Close button hover | Darken purple background |
| Step change | Highlight border + glow on active node |

---

## Responsive Design

### Breakpoint

```css
@media (max-width: 1200px) {
    /* Switch to vertical stacking */
}
```

### Mobile Behavior

**Changes at narrow screens:**
1. Disable absolute positioning
2. Switch to relative/auto positioning
3. Stack nodes vertically
4. Hide SVG connections
5. Center all elements
6. Expand max-width to 90%

```css
@media (max-width: 1200px) {
    .node {
        position: relative !important;
        left: auto !important;
        right: auto !important;
        top: auto !important;
        transform: none !important;
        margin: 1.5rem auto !important;
        max-width: 90%;
    }

    .code-box {
        position: relative !important;
        left: auto !important;
        right: auto !important;
        top: auto !important;
        margin: 1rem auto !important;
        max-width: 90% !important;
    }

    .connections {
        display: none;
    }
}
```

---

## Control Panel

### Fixed Bottom Bar

```css
.controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    padding: 1.5rem 2rem;
    background: white;
    border-top: 1px solid #d0d7de;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
    z-index: 100;
}
```

### Button Styles

**Base Button:**
```css
.btn {
    padding: 0.6rem 1.5rem;
    border: 1px solid #d0d7de;
    background: white;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    color: #24292f;
}

.btn:hover:not(:disabled) {
    background: #f6f8fa;
    border-color: #0969da;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

**Primary Button:**
```css
.btn.primary {
    background: #0969da;
    border-color: #0969da;
    color: white;
}

.btn.primary:hover:not(:disabled) {
    background: #0550ae;
    border-color: #0550ae;
}
```

---

## Implementation Checklist

When recreating this design in a new project:

### HTML Structure
- [ ] Container with `flowchart-container` class
- [ ] SVG element with id `connections` for drawing lines
- [ ] Nodes with `data-step` attribute for progressive disclosure
- [ ] Nodes with `data-code` attribute linking to code boxes
- [ ] Info icons (ℹ) in nodes that have details
- [ ] Code boxes with close buttons (✕)
- [ ] Fixed bottom controls panel

### CSS
- [ ] Import color palette variables
- [ ] Apply typography hierarchy
- [ ] Set up node base styles and variants
- [ ] Configure code box styles with scrollbar
- [ ] Add connection line styles with dashed pattern
- [ ] Implement all animations (entrance, hover, pulse, dash)
- [ ] Position nodes using absolute positioning
- [ ] Add responsive breakpoints

### JavaScript
- [ ] Define SVG arrow markers in `<defs>` section (standard and purple)
- [ ] Implement bezier curve path generation
- [ ] Add progressive disclosure logic (step tracking)
- [ ] Handle node click events for code box toggling
- [ ] Draw SVG connections dynamically with `marker-end` attributes
- [ ] Update connection visibility based on state
- [ ] Add keyboard shortcuts (Arrow keys, Space, R, A)
- [ ] Implement auto-play feature
- [ ] Handle window resize events
- [ ] Clean up state on reset

---

## Design Principles

1. **Progressive Disclosure:** Information is revealed step-by-step to avoid overwhelming users
2. **Interactive Details:** Users can click to explore deeper information at their own pace
3. **Smooth Animations:** All transitions use 0.4s ease timing for consistency
4. **Visual Hierarchy:** Color, size, and position guide the eye through the flow
5. **Non-linear Layout:** Staggered positioning creates visual interest and follows natural reading patterns
6. **Accessible Feedback:** Hover states, pulses, and highlights provide clear interaction cues
7. **Curved Connections:** Bezier curves create organic, professional flow between elements

---

## Quick Reference

### Most Used Values

```css
/* Colors */
--primary-blue: #0969da;
--primary-purple: #8250df;
--border-gray: #d0d7de;
--text-black: #24292f;

/* Spacing */
--node-padding: 1.2rem 1.5rem;
--border-radius: 8px;
--transition: all 0.4s ease;

/* Animation */
--dash-speed: 40s;
--pulse-speed: 2s;
--curve-intensity: 0.5;

/* Arrow Markers */
--arrow-size: 10x10;
--arrow-ref-point: (9, 3);
--arrow-colors: #24292f (main), #8250df (code)
```

---

**Version:** 1.1
**Last Updated:** 2026-01-21
**Project:** AI Impact Assessment Flow Diagram
**Changelog:** Added arrow markers for directional flow indication
