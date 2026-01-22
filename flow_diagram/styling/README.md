# Flow Diagram Styling Package

Complete design system for creating animated, interactive flow diagrams with smooth bezier curves and progressive disclosure.

## 📦 What's Included

| File | Purpose | Format |
|------|---------|--------|
| `FLOW_DIAGRAM_STYLE_GUIDE.md` | Comprehensive style guide with all design decisions, colors, animations, and implementation patterns | Markdown |
| `flow-diagram-variables.css` | CSS custom properties (variables) for all colors, spacing, typography, and timing values | CSS |
| `flow-diagram-config.json` | Programmatic configuration for node positions, connections, and interaction settings | JSON |
| `README.md` | This file - overview and usage instructions | Markdown |

---

## 🎨 FLOW_DIAGRAM_STYLE_GUIDE.md

### What It Contains
- Complete color palette with hex values
- Typography system (fonts, sizes, weights)
- Node styling (standard, decision, disabled variants)
- Code box styling with custom scrollbars
- Connection line styles and bezier curve algorithm
- All animation timings and keyframes
- Layout positioning strategy
- Interactive patterns and behaviors
- Responsive design breakpoints
- Implementation checklist

### When to Use
- Starting a new flow diagram project from scratch
- Understanding the design philosophy and principles
- Learning how each component should look and behave
- Reference for specific styling decisions

### Example Usage
```markdown
# Read the guide to understand:
- Why nodes are positioned at specific percentages
- How the bezier curve algorithm works
- What colors to use for each element type
- How animations should be timed
```

---

## 🎨 flow-diagram-variables.css

### What It Contains
- CSS custom properties (`:root` variables)
- All colors organized by category
- Typography values (fonts, sizes, weights)
- Spacing and sizing constants
- Animation durations and timing functions
- Z-index layers
- Utility classes

### When to Use
- Quick implementation of the design system
- Maintaining consistency across multiple files
- Easy theming and customization
- Reducing hardcoded values in your CSS

### How to Use

**Option 1: Import into your CSS**
```css
@import './flow-diagram-variables.css';

/* Then use the variables */
.my-node {
    background: var(--fd-node-bg);
    border: var(--fd-node-border-width) solid var(--fd-node-border);
    padding: var(--fd-node-padding);
}
```

**Option 2: Copy variables into your existing stylesheet**
```css
/* Copy the :root block into your main CSS file */
:root {
    --fd-node-bg: #ddf4ff;
    --fd-node-border: #54aeff;
    /* ... other variables ... */
}
```

**Option 3: Link in HTML**
```html
<link rel="stylesheet" href="./styling/flow-diagram-variables.css">
```

### Variable Naming Convention
All variables use the prefix `fd-` (flow diagram) to avoid conflicts:
- **Colors:** `--fd-node-bg`, `--fd-accent-blue`, `--fd-text-primary`
- **Spacing:** `--fd-node-padding`, `--fd-vertical-spacing`
- **Typography:** `--fd-font-primary`, `--fd-text-h3`
- **Animation:** `--fd-animation-dash`, `--fd-transition-slow`

---

## ⚙️ flow-diagram-config.json

### What It Contains
- Container dimensions and settings
- Node positions (absolute coordinates)
- Node metadata (type, step, code box associations)
- Code box positions
- Connection definitions (main flow + code boxes)
- Animation configurations
- Color mappings
- Interaction settings
- Responsive breakpoints

### When to Use
- Building a flow diagram dynamically with JavaScript
- Programmatically positioning nodes
- Generating connections automatically
- Storing configuration separately from code
- Creating a node editor or diagram builder

### How to Use

**JavaScript/TypeScript:**
```javascript
import config from './styling/flow-diagram-config.json';

// Access node positions
config.nodes.positions.forEach(node => {
    const element = document.getElementById(node.id);
    element.style.top = node.position.top;
    element.style.left = node.position.left || 'auto';
    element.style.right = node.position.right || 'auto';
});

// Draw connections
config.connections.main.forEach(([from, to]) => {
    drawConnection(from, to, config.connections.style);
});

// Apply colors
const nodeColors = config.colors.nodes.standard;
element.style.background = nodeColors.background;
element.style.border = `2px solid ${nodeColors.border}`;
```

**Python (for backend configuration):**
```python
import json

with open('styling/flow-diagram-config.json', 'r') as f:
    config = json.load(f)

# Access configuration
total_steps = config['totalSteps']
node_positions = config['nodes']['positions']
animations = config['animations']
```

### JSON Structure
```json
{
  "nodes": {
    "dimensions": { /* sizes, padding, borders */ },
    "positions": [ /* array of node configs */ ]
  },
  "codeBoxes": {
    "dimensions": { /* sizes */ },
    "positions": [ /* array of code box positions */ ]
  },
  "connections": {
    "main": [ /* node-to-node connections */ ],
    "codeBox": [ /* node-to-codebox connections */ ],
    "style": { /* line styling */ }
  },
  "animations": { /* all animation configs */ },
  "colors": { /* color mappings */ },
  "interactions": { /* interaction settings */ }
}
```

---

## 🚀 Quick Start Guide

### Scenario 1: Recreating the Exact Design

1. **Read the style guide:**
   ```bash
   cat FLOW_DIAGRAM_STYLE_GUIDE.md
   ```

2. **Import CSS variables:**
   ```html
   <link rel="stylesheet" href="./styling/flow-diagram-variables.css">
   ```

3. **Use the configuration for positioning:**
   ```javascript
   import config from './styling/flow-diagram-config.json';
   ```

4. **Follow the implementation checklist** in the style guide

---

### Scenario 2: Customizing Colors

**Option A: Modify CSS Variables**
```css
/* Override specific variables */
:root {
    --fd-node-bg: #e3f2fd;           /* Change to different blue */
    --fd-accent-blue: #1976d2;       /* Adjust accent color */
}
```

**Option B: Modify JSON Config**
```json
{
  "colors": {
    "nodes": {
      "standard": {
        "background": "#e3f2fd",
        "border": "#1976d2"
      }
    }
  }
}
```

---

### Scenario 3: Different Layout

**Modify positions in config.json:**
```json
{
  "nodes": {
    "positions": [
      {
        "id": "node-1",
        "position": { "top": "100px", "left": "20%" }
      }
    ]
  }
}
```

Then use JavaScript to apply positions from the config.

---

### Scenario 4: Adding New Node Types

**1. Add to style guide:**
```markdown
### Warning Node (Red)
- Background: #fee
- Border: #f88
```

**2. Add CSS variable:**
```css
:root {
    --fd-warning-bg: #fee;
    --fd-warning-border: #f88;
}
```

**3. Add to JSON config:**
```json
{
  "colors": {
    "nodes": {
      "warning": {
        "background": "#fee",
        "border": "#f88"
      }
    }
  }
}
```

---

## 📋 File Usage Matrix

| Task | Style Guide | CSS Variables | JSON Config |
|------|-------------|---------------|-------------|
| Understand design decisions | ✅ Primary | ❌ | ❌ |
| Get color values | ✅ Reference | ✅ Primary | ✅ Reference |
| Apply styles in CSS | ❌ | ✅ Primary | ❌ |
| Position nodes with JS | ✅ Reference | ❌ | ✅ Primary |
| Learn animation timings | ✅ Primary | ✅ Reference | ✅ Reference |
| Build diagram programmatically | ❌ | ❌ | ✅ Primary |
| Customize theme | ✅ Reference | ✅ Primary | ❌ |
| Generate documentation | ✅ Primary | ❌ | ❌ |

---

## 🎯 Best Practices

### For Developers

1. **Start with the style guide** to understand the design philosophy
2. **Use CSS variables** for all styling to maintain consistency
3. **Reference the JSON config** for programmatic implementations
4. **Don't hardcode values** - always use variables or config
5. **Keep the three files in sync** when making changes

### For Designers

1. **Document changes in the style guide first**
2. **Update CSS variables** to reflect new colors/spacing
3. **Update JSON config** if structural changes are made
4. **Maintain the design principles** outlined in the guide

---

## 🔄 Keeping Files in Sync

When you make changes:

1. **Update the style guide (FLOW_DIAGRAM_STYLE_GUIDE.md)**
   - Document the reasoning behind the change
   - Update color palettes, spacing values, etc.
   - Revise implementation examples

2. **Update CSS variables (flow-diagram-variables.css)**
   - Add or modify CSS custom properties
   - Ensure naming follows the `--fd-*` convention

3. **Update JSON config (flow-diagram-config.json)**
   - Modify configuration values
   - Add new node positions or connection rules
   - Update color mappings

4. **Update this README if needed**
   - Add new usage examples
   - Document new patterns

---

## 📐 Design Principles

These files implement the following design principles:

1. **Progressive Disclosure** - Information revealed step-by-step
2. **Interactive Details** - Click to explore deeper information
3. **Smooth Animations** - Consistent 0.4s timing for all transitions
4. **Visual Hierarchy** - Color, size, and position guide the eye
5. **Curved Connections** - Bezier curves create organic flow
6. **Accessible Feedback** - Clear hover states and interaction cues

---

## 🛠️ Technical Requirements

- **CSS3** - Custom properties, animations, flexbox
- **JavaScript ES6+** - For dynamic diagram generation
- **SVG** - For drawing curved connection lines
- **JSON** - For configuration management

---

## 📝 Version History

- **1.0.0** (2026-01-21) - Initial release
  - Complete style guide
  - CSS variables system
  - JSON configuration structure
  - Bezier curve implementation
  - Interactive code boxes

---

## 🤝 Contributing

When adding new features or patterns:

1. Document in the style guide with reasoning
2. Add corresponding CSS variables
3. Update JSON config if applicable
4. Include usage examples
5. Maintain backward compatibility

---

## 📞 Support

For questions about using these files:
- Review the style guide for detailed explanations
- Check usage examples in each file
- Reference the original implementation: `../sdlc_flow_animated.html`

---

**Created:** 2026-01-21
**Project:** AI Impact Assessment Flow Diagram
**Package Version:** 1.0.0
