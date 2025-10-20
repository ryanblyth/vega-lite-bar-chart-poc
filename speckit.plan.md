
# speckit.plan.md

## Objective
Build a **vertical** Vega‑Lite bar chart of **Top 15 by population** from a Colorado places GeoJSON.
Bars are sorted by population (descending). Optionally color bars by density (/mi²).
Click selection emits `chart:selection` with selected GEOIDs for map coordination.

## MVP Scope
- Data pipeline: GeoJSON FeatureCollection → table rows { geoid, name, pop, density }.
- Rank by population; filter to top 15; sort descending.
- Vertical bars: x = name (categorical), y = population (quantitative).
- Tooltips (name, GEOID, pop, density), responsive X‑axis labels.
- Optional color by density.
- Selection + CustomEvent `chart:selection`.
- **Chart animations**: GSAP-powered bar entrance animations with staggered timing.

## Non‑Goals
- Multi‑view dashboards, server rendering, persistence.

## Success Criteria
- Only 15 bars render (top 15 by pop), correctly sorted.
- `chart:selection` fires with accurate `geoids`.
- Basic accessibility and keyboard operability.
- **Smooth bar entrance animations** using GSAP with staggered timing (0.05s delay between bars).
- **Y-axis number formatting** with proper K notation for thousands.
