import vegaEmbed from 'vega-embed';
import './scrolltrigger.js';

// Load and transform GeoJSON data
async function loadAndTransformData() {
  try {
    const response = await fetch('../data/colorado-cities-enriched.geojson');
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
    const response = await fetch('./vega-lite/theme.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading theme:', error);
    return { config: {} };
  }
}

// Load chart specification
async function loadChartSpec() {
  try {
    const response = await fetch(`./vega-lite/chart.json?t=${Date.now()}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading chart spec:', error);
    return {};
  }
}

// Check if animations should be enabled
function shouldAnimate() {
  const body = document.body;
  const isMobile = window.innerWidth <= 480;
  
  // Check global animation setting
  if (body.classList.contains('no-animations')) {
    return false;
  }
  
  // Check mobile animation setting
  if (isMobile && body.classList.contains('no-mobile-animations')) {
    return false;
  }
  
  return true;
}

// Check if ScrollTrigger animations should be enabled
function shouldUseScrollTrigger() {
  const body = document.body;
  return body.classList.contains('scroll-trigger-animations');
}

// Check if Lenis smooth scroll should be enabled
function shouldUseLenis() {
  const body = document.body;
  return body.classList.contains('smooth-scroll') || body.classList.contains('scroll-trigger-animations');
}

// Animate bars with GSAP
function animateBars(container) {
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded. Please check the CDN link in index.html');
    return;
  }
  
  // Check if animations should be enabled
  if (!shouldAnimate()) {
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

    // Set initial state for bars immediately to prevent flash (only if animations are enabled)
    if (typeof gsap !== 'undefined' && shouldAnimate()) {
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
    
    // Animate bars with GSAP (only if not using ScrollTrigger)
    if (!shouldUseScrollTrigger()) {
      animateBars(container);
    }

    // Initialize ScrollTrigger and Lenis if enabled
    if (shouldUseScrollTrigger()) {
      // Enable ScrollTrigger animations
      // Call the ScrollTrigger module functions directly
      if (window.enableScrollTrigger) {
        window.enableScrollTrigger(container);
      }
      if (window.enableLenis) {
        window.enableLenis();
      }
    } else if (shouldUseLenis()) {
      // Enable only Lenis smooth scroll
      if (window.enableLenis) {
        window.enableLenis();
      }
    }

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

    // Handle scroll indicator for mobile
    setupScrollIndicator();

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
    
    // Refresh ScrollTrigger on resize
    if (window.refreshScrollTrigger) {
      window.refreshScrollTrigger(container);
    }
  }, 250);
});

// Setup scroll indicator for mobile (only when mobile-scroll class is present)
function setupScrollIndicator() {
  const chartContainer = document.querySelector('.chart-container');
  const body = document.body;
  
  if (!chartContainer) return;
  
  // Check if mobile scroll is enabled
  const isMobileScrollEnabled = () => {
    return body.classList.contains('mobile-scroll');
  };

  // Check if container is scrollable
  const isScrollable = () => {
    return chartContainer.scrollWidth > chartContainer.clientWidth;
  };

  // Check if user has scrolled
  const hasScrolled = () => {
    return chartContainer.scrollLeft > 0;
  };

  // Update classes based on scroll state
  const updateScrollState = () => {
    // Only proceed if mobile scroll is enabled
    if (!isMobileScrollEnabled()) {
      chartContainer.classList.remove('scrollable', 'scrolled');
      return;
    }
    
    if (isScrollable()) {
      chartContainer.classList.add('scrollable');
      if (hasScrolled()) {
        chartContainer.classList.add('scrolled');
      } else {
        chartContainer.classList.remove('scrolled');
      }
    } else {
      chartContainer.classList.remove('scrollable', 'scrolled');
    }
  };

  // Listen for scroll events
  chartContainer.addEventListener('scroll', updateScrollState);
  
  // Listen for resize events
  window.addEventListener('resize', () => {
    setTimeout(updateScrollState, 100); // Small delay to ensure layout is updated
  });

  // Initial check
  setTimeout(updateScrollState, 200); // Delay to ensure chart is rendered
}

// Utility functions for mobile scroll configuration
window.toggleMobileScroll = function(enable) {
  const body = document.body;
  if (enable) {
    body.classList.add('mobile-scroll');
  } else {
    body.classList.remove('mobile-scroll');
  }
  // Re-run scroll indicator setup to update state
  setupScrollIndicator();
};

window.isMobileScrollEnabled = function() {
  return document.body.classList.contains('mobile-scroll');
};

// Utility functions for animation configuration
window.toggleAnimations = function(enable) {
  const body = document.body;
  if (enable) {
    body.classList.remove('no-animations');
  } else {
    body.classList.add('no-animations');
  }
  // Re-render chart to apply animation changes
  renderChart();
};

window.toggleMobileAnimations = function(enable) {
  const body = document.body;
  if (enable) {
    body.classList.remove('no-mobile-animations');
  } else {
    body.classList.add('no-mobile-animations');
  }
  // Re-render chart to apply animation changes
  renderChart();
};

window.areAnimationsEnabled = function() {
  return !document.body.classList.contains('no-animations');
};

window.areMobileAnimationsEnabled = function() {
  return !document.body.classList.contains('no-mobile-animations');
};

// ScrollTrigger and Lenis utility functions
window.toggleScrollTrigger = function(enable) {
  const body = document.body;
  if (enable) {
    body.classList.add('scroll-trigger-animations');
    body.classList.remove('no-animations'); // Remove no-animations to allow ScrollTrigger
  } else {
    body.classList.remove('scroll-trigger-animations');
  }
  // Don't call renderChart() here to avoid infinite loop
  // The ScrollTrigger will be initialized in the main renderChart function
};

window.toggleLenisSmoothScroll = function(enable) {
  const body = document.body;
  if (enable) {
    body.classList.add('smooth-scroll');
  } else {
    body.classList.remove('smooth-scroll');
  }
  // Don't call renderChart() here to avoid infinite loop
  // The Lenis will be initialized in the main renderChart function
};

window.isScrollTriggerEnabled = function() {
  return document.body.classList.contains('scroll-trigger-animations');
};

window.isLenisEnabled = function() {
  return document.body.classList.contains('smooth-scroll') || document.body.classList.contains('scroll-trigger-animations');
};

// refreshScrollTrigger function is implemented in scrolltrigger.js

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', renderChart);
