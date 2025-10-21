
# CO Cities — Vega‑Lite (Spec‑Kit) — Top 15 by Population (Vertical Bars)

This is a **complete Vega-Lite implementation** with a proper Spec-Kit project structure. The chart shows the **top 15 most populated** Colorado cities/CDPs, sorted by population (desc), with optional density coloring and advanced features.

**Chart goal**: Vertical bar chart with smooth GSAP animations, responsive mobile design, configurable features, and comprehensive accessibility support.

## What's inside
- `specs/` — **Specification documents** (source of truth)
  - `speckit.plan.md` — Project narrative and scope
  - `speckit.tasks.md` — Human-readable task checklist  
  - `speckit.build.yml` — Machine-readable build specification
- `src/` — **Working implementation**
  - `vega-lite/chart.json` — Chart configuration (colors, layout, interactions)
  - `vega-lite/theme.json` — Visual theme configuration
  - `index.html` — Main application
  - `embed.js` — Chart logic and interactions
  - `styles.css` — Responsive styling
- `data/colorado-cities-enriched.geojson` — Colorado cities data

## Features
- **Interactive bar chart** with click selection and custom event emission
- **Smooth GSAP animations** with staggered bar entrance effects (configurable)
- **Responsive mobile design** with horizontal scroll and scroll indicators
- **Configurable features** via CSS classes and JavaScript functions
- **Accessibility support** with keyboard navigation and ARIA labels
- **Y-axis number formatting** with K notation for thousands
- **Color scheme flexibility** with built-in Vega-Lite schemes and custom ranges

## Dependencies
- **Vega-Lite ecosystem**: vega, vega-lite, vega-embed
- **Build tool**: Vite
- **Animation library**: GSAP (loaded via CDN)

## Quick Start
1) Clone this repository
2) Run `npm install` to install dependencies
3) Run `npm run dev` to start the development server
4) Open `http://localhost:5173/src/` in your browser

## Configuration

### Mobile Scroll
Add/remove the `mobile-scroll` class on the `<body>` element to enable/disable horizontal scrolling on mobile devices.

### Animations
- `no-animations` - Disable all bar animations globally
- `no-mobile-animations` - Disable bar animations only on mobile (≤480px)

### JavaScript API
- `toggleMobileScroll(enable)` - Enable/disable mobile scroll
- `toggleAnimations(enable)` - Enable/disable all animations
- `toggleMobileAnimations(enable)` - Enable/disable mobile animations
- `isMobileScrollEnabled()` - Check if mobile scroll is enabled
- `areAnimationsEnabled()` - Check if animations are enabled

## Animation Details
The chart includes smooth entrance animations powered by GSAP:
- Bars start with `scaleY: 0` and animate to `scaleY: 1`
- Staggered timing with 0.05s delay between each bar
- 1.2s duration with `power2.out` easing
- Y-axis numbers are formatted with K notation for better readability

## Color Configuration

### Current Setup
Colors are configured in `specs/vega-lite/chart.json` using a custom yellow-to-brown gradient for density visualization.

### Switching Between Color Schemes

#### To Use Built-in Vega-Lite Schemes:
Replace the `range` array with a `scheme` property in `specs/vega-lite/chart.json`:

```json
"scale": {
  "scheme": "viridis"  // or any other scheme below
}
```

#### Available Built-in Schemes:

**Sequential (Single Hue):**
- `"blues"` - Light to dark blue
- `"reds"` - Light to dark red  
- `"greens"` - Light to dark green
- `"oranges"` - Light to dark orange
- `"purples"` - Light to dark purple

**Sequential (Multi-Hue):**
- `"viridis"` - Purple to yellow (default)
- `"plasma"` - Purple to pink
- `"inferno"` - Black to yellow
- `"magma"` - Black to white
- `"spectral"` - Rainbow spectrum

**Diverging:**
- `"rdylbu"` - Red-yellow-blue
- `"rdylgn"` - Red-yellow-green
- `"rdbu"` - Red-blue
- `"rdgy"` - Red-gray

**Categorical:**
- `"set1"`, `"set2"`, `"set3"` - Distinct categorical colors
- `"pastel1"`, `"pastel2"` - Pastel variations
- `"dark2"` - Dark categorical
- `"paired"` - Paired colors
- `"accent"` - Accent colors
- `"tableau10"`, `"tableau20"` - Tableau color palettes

#### To Use Custom Colors:
Replace the `scheme` with a `range` array:

```json
"scale": {
  "range": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
}
```

### Current Custom Range
The chart currently uses a 9-color yellow-to-brown gradient:
- `#ffffe5` - Very light yellow (lowest density)
- `#fff7bc` - Light yellow
- `#fee391` - Yellow
- `#fec44f` - Orange-yellow
- `#fe9929` - Orange
- `#ec7014` - Dark orange
- `#cc4c02` - Red-orange
- `#993404` - Dark red
- `#662506` - Very dark brown (highest density)
