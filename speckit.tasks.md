
# speckit.tasks.md

- [ ] Scaffold project (Vite), install vega/vega-lite/vega-embed.
- [ ] Implement GeoJSON → table transform with mapping + density (/mi²).
- [ ] Compute rank by population and filter to Top 15 (Vega-Lite window + filter).
- [ ] Implement vertical bar chart: x=name, y=pop; sort desc by pop.
- [ ] Rotate x-axis labels to avoid overlap (e.g., -40deg) and ensure responsive width.
- [ ] Add tooltip (name, GEOID, pop {comma}, density {comma}).
- [ ] Optional color by density (quantitative legend).
- [ ] Click selection on bars; fade unselected; dblclick clears; dispatch `chart:selection`.
- [ ] Basic a11y (role/aria, keyboard focus on sort if provided, or ensure tab focus to chart container).
- [ ] Cross-browser QA (Chrome, Safari, Firefox).
