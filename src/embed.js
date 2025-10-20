import vegaEmbed from 'vega-embed';

// Load and transform GeoJSON data
async function loadAndTransformData() {
  try {
    const response = await fetch('./data/colorado-cities-enriched.geojson');
    const geojson = await response.json();
    
    // Transform FeatureCollection to table rows
    const table = geojson.features
      .map(feature => {
        const props = feature.properties;
        const geoid = props.GEOID;
        const name = props.NAME;
        const pop = props.Total_Pop;
        const aland_m2 = props.ALAND;
        
        // Filter out invalid rows
        if (!geoid || !name || !isFinite(pop) || !isFinite(aland_m2)) {
          return null;
        }
        
        // Compute density per square mile
        const density = pop / (aland_m2 * 0.00000038610215855);
        
        return {
          geoid,
          name,
          pop,
          aland_m2,
          density
        };
      })
      .filter(row => row !== null);
    
    return table;
  } catch (error) {
    console.error('Error loading GeoJSON data:', error);
    return [];
  }
}

// Load theme configuration
async function loadTheme() {
  try {
    const response = await fetch('./specs/vega-lite/theme.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading theme:', error);
    return { config: {} };
  }
}

// Load chart specification
async function loadChartSpec() {
  try {
    const response = await fetch('./specs/vega-lite/chart.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading chart spec:', error);
    return {};
  }
}

// Animate bars with GSAP
function animateBars(container) {
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded. Please check the CDN link in index.html');
    return;
  }
  
  const tryAnimate = () => {
    let bars = container.querySelectorAll('path');
    bars = Array.from(bars).filter(bar => {
      const rect = bar.getBoundingClientRect();
      return rect.width > 10;
    });
    
    if (bars.length > 0) {
      animateBarsNow(bars);
      return true;
    }
    return false;
  };
  
  if (!tryAnimate()) {
    setTimeout(() => {
      if (!tryAnimate()) {
        setTimeout(tryAnimate, 50);
      }
    }, 20);
  }
}

function animateBarsNow(bars) {
  gsap.to(bars, {
    scaleY: 1,
    duration: 1.2,
    ease: 'power2.out',
    stagger: 0.05,
    delay: 0.1
  });
}

// Main function to render the chart
async function renderChart() {
  const container = document.getElementById('chart');
  if (!container) {
    console.error('Chart container not found');
    return;
  }

  try {
    // Load data, theme, and chart spec in parallel
    const [table, theme, chartSpec] = await Promise.all([
      loadAndTransformData(),
      loadTheme(),
      loadChartSpec()
    ]);

    // Filter to top 15 cities by population
    const top15Cities = table
      .sort((a, b) => b.pop - a.pop)
      .slice(0, 15);

    // Adjust legend orientation and font sizes based on screen size
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    const adjustedChartSpec = {
      ...chartSpec,
      encoding: {
        ...chartSpec.encoding,
        x: {
          ...chartSpec.encoding.x,
          axis: {
            ...chartSpec.encoding.x.axis,
            labelFontSize: isSmallMobile ? 10 : (isMobile ? 11 : 12)
          }
        },
        color: {
          ...chartSpec.encoding.color,
          legend: {
            ...chartSpec.encoding.color.legend,
            orient: isMobile ? "bottom" : "right",
            direction: isMobile ? "horizontal" : "vertical"
          }
        }
      }
    };

    // Merge theme config into chart spec and add filtered data
    const spec = {
      ...adjustedChartSpec,
      config: {
        ...theme.config,
        ...adjustedChartSpec.config
      },
      data: {
        values: top15Cities
      }
    };

    // Create the Vega-Lite view

    const result = await vegaEmbed(container, spec, {
      actions: false,
      renderer: 'svg'
    }).catch(error => {
      console.error('Vega-Lite embed error:', error);
      throw error;
    });
    

    // Fix Y-axis number formatting
    setTimeout(() => {
      const svg = container.querySelector('svg');
      if (!svg) return;

      const allTextElements = svg.querySelectorAll('text');
      allTextElements.forEach(textEl => {
        const text = textEl.textContent.trim();
        if (text && (/^\d+\.?\d*e\+\d+$/.test(text) || /^\d{4,}$/.test(text))) {
          const num = parseFloat(text);
          if (!isNaN(num) && num > 0) {
            if (num >= 1000) {
              textEl.textContent = (num / 1000).toFixed(0) + 'K';
            } else {
              textEl.textContent = num.toLocaleString();
            }
          }
        }
      });
    }, 200);

    // Set initial state for bars immediately to prevent flash
    if (typeof gsap !== 'undefined') {
      const setInitialState = () => {
        const allPaths = container.querySelectorAll('path');
        const bars = Array.from(allPaths).filter(bar => {
          const rect = bar.getBoundingClientRect();
          return rect.width > 10;
        });

        if (bars.length > 0) {
          gsap.set(bars, {
            scaleY: 0,
            transformOrigin: 'bottom center'
          });
          return true;
        }
        return false;
      };

      if (!setInitialState()) {
        setTimeout(setInitialState, 10);
      }
    }
    
    // Animate bars with GSAP
    animateBars(container);

    // Set up selection event handling
    const view = result.view;
    
    // Listen for selection changes
    view.addSignalListener('selected_geoids', (name, value) => {
      const geoids = value ? value.geoid || [] : [];
      const event = new CustomEvent('chart:selection', {
        detail: { geoids: Array.isArray(geoids) ? geoids : [geoids] }
      });
      document.dispatchEvent(event);
    });

    // Clear selection on double-click
    container.addEventListener('dblclick', () => {
      view.signal('selected_geoids', null);
    });

    // Make chart keyboard accessible
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // Focus management could be enhanced here
      }
    });

  } catch (error) {
    console.error('Error rendering chart:', error);
    container.innerHTML = '<p>Error loading chart. Please check the console for details.</p>';
  }
}

// Handle window resize for responsive legend
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Re-render chart on resize to adjust legend position
    const container = document.getElementById('chart');
    if (container && container.innerHTML.trim()) {
      renderChart();
    }
  }, 250);
});

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', renderChart);
