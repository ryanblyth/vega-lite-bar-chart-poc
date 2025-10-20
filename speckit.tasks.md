
# speckit.tasks.md

- [x] Scaffold project (Vite), install vega/vega-lite/vega-embed.
- [x] Implement GeoJSON → table transform with mapping + density (/mi²).
- [x] Compute rank by population and filter to Top 15 (Vega-Lite window + filter).
- [x] Implement vertical bar chart: x=name, y=pop; sort desc by pop.
- [x] Rotate x-axis labels to avoid overlap (e.g., -40deg) and ensure responsive width.
- [x] Add tooltip (name, GEOID, pop {comma}, density {comma}).
- [x] Optional color by density (quantitative legend).
- [x] Click selection on bars; fade unselected; dblclick clears; dispatch `chart:selection`.
- [x] Basic a11y (role/aria, keyboard focus on sort if provided, or ensure tab focus to chart container).
- [x] **Add GSAP CDN dependency** for chart animations.
- [x] **Implement bar entrance animations** with GSAP (scaleY from 0 to 1, staggered timing).
- [x] **Add Y-axis number formatting** with K notation for thousands.
- [x] **Set initial bar state** to prevent flash before animation.
- [ ] Cross-browser QA (Chrome, Safari, Firefox).
