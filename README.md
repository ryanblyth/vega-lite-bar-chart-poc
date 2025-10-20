
# CO Cities — Vega‑Lite (Spec‑Kit, Spec‑Only) — Top 15 by Population (Vertical Bars)

This package is **spec‑only** (no working chart code). It’s shaped like a GitHub Spec‑Kit project so you can
hand it to **Cursor** (or any agent) to implement the chart from the build spec.

**Chart goal**: Vertical bar chart showing the **top 15 most populated** Colorado cities/CDPs, sorted by population (desc).
Optional color by density. Selection should emit a DOM CustomEvent `chart:selection` with the selected GEOIDs.

## What’s inside
- `speckit.plan.md` — *why/what* (narrative + scope)
- `speckit.tasks.md` — human checklist
- `speckit.build.yml` — **machine‑readable build spec** (source of truth)
- `specs/vega-lite/chart.json` — **skeleton** (agent must implement)
- `specs/vega-lite/theme.json` — **skeleton** (agent must implement)
- `src/` — placeholders (agent must create the real embed code)
- `data/colorado-cities-enriched.geojson` — your data (already included)


## Use with Cursor Auto
1) Open this folder in Cursor.
2) Open `speckit.build.yml` and paste the prompt from `.cursor-prompt.txt` (or just say: *Implement the build spec end‑to‑end.*).
3) Let Cursor scaffold the app, fill the spec/theme, and run `npm i && npm run dev`.
