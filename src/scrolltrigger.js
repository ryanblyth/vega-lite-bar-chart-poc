// ScrollTrigger + Lenis Animation Module
// Provides scroll-triggered bar growth animations with smooth scrolling

let lenisInstance = null;
let scrollTriggerInstance = null;

// Initialize ScrollTrigger animation
function initScrollTrigger(container) {
  if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') {
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

         // Find all bar elements using a more reliable selector
         // Vega-Lite creates bars with specific role attributes
         const allGraphicsSymbols = Array.from(container.querySelectorAll('[role="graphics-symbol"]'));
         
         const bars = allGraphicsSymbols.filter(el => {
           // Filter to only include actual bar marks (not axes, legends, etc.)
           const ariaLabel = el.getAttribute('aria-label');
           const ariaRoleDescription = el.getAttribute('aria-roledescription');
           
           // Exclude legend elements
           if (ariaRoleDescription === 'legend') {
             return false;
           }
           
           // Only include elements with population data
           return ariaLabel && ariaLabel.includes('pop:');
         });

         // Also find and protect legend gradient elements specifically
         const legendGradientElements = Array.from(container.querySelectorAll('.role-legend-gradient, [class*="legend-gradient"]'));
         
         // Protect legend gradient elements from ScrollTrigger
         legendGradientElements.forEach(el => {
           // Reset any transforms that might interfere with legend positioning
           el.style.transform = '';
           el.style.scale = '';
           // Reset SVG transform attribute directly
           el.setAttribute('transform', '');
           
           // Also protect child elements
           const children = Array.from(el.children);
           children.forEach(child => {
             child.style.transform = '';
             child.style.scale = '';
             // Reset SVG transform attribute directly
             child.setAttribute('transform', '');
           });
         });

  if (bars.length === 0) {
    return;
  }

  // Set initial state for bars only
  gsap.set(bars, {
    scaleY: 0,
    transformOrigin: 'bottom center'
  });

  // Ensure legend elements are not affected by setting them to normal scale
  const legendElements = Array.from(container.querySelectorAll('[aria-roledescription="legend"], .role-legend'));
  legendElements.forEach(legendGroup => {
    const allChildren = legendGroup.querySelectorAll('*');
    allChildren.forEach(child => {
      gsap.set(child, {
        scaleY: 1,
        scaleX: 1,
        transformOrigin: 'center center'
      });
    });
  });

  // Ensure legend positioning is maintained after ScrollTrigger initialization
  setTimeout(() => {
    const legend = container.querySelector('.vega-legend');
    if (legend) {
      // Reset any transforms that might interfere with positioning
      legend.style.transform = '';
      legend.style.scale = '';
      
      // Ensure the legend gradient is properly positioned
      const legendGradient = legend.querySelector('.vega-legend-gradient');
      if (legendGradient) {
        legendGradient.style.transform = '';
        legendGradient.style.scale = '';
      }
    }
  }, 100);


  // Check if we're on mobile - more comprehensive detection
  const isMobile = window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0);

  // Create ScrollTrigger animation with conditional pinning
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: container.parentElement.parentElement, // Use main element as trigger (includes heading + chart)
    start: 'top top', // Start when main element reaches top of viewport
    end: isMobile ? '+=400vh' : '+=300vh', // Moderate speed on mobile (4x viewport height)
    scrub: isMobile ? 1.5 : 1, // Balanced scrub on desktop
    pin: true, // Pin on both desktop and mobile - we need it for complete animation
    pinSpacing: !isMobile, // Only add pin spacing on desktop to avoid mobile layout issues
    anticipatePin: 1, // Smooth pinning
           onUpdate: (self) => {
             const progress = self.progress;
             
             // Animate bars with staggered timing
             bars.forEach((bar, index) => {
               const staggerDelay = index * 0.05;
               const barProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
               
               gsap.set(bar, {
                 scaleY: barProgress,
                 transformOrigin: 'bottom center'
               });
             });

             // Ensure legend elements remain unaffected
             const legendElements = Array.from(container.querySelectorAll('[aria-roledescription="legend"], .role-legend'));
             legendElements.forEach(legendGroup => {
               const allChildren = legendGroup.querySelectorAll('*');
               allChildren.forEach(child => {
                 gsap.set(child, {
                   scaleY: 1,
                   scaleX: 1,
                   transformOrigin: 'center center'
                 });
               });
             });

             // Specifically protect legend gradient elements
             const legendGradientElements = Array.from(container.querySelectorAll('.role-legend-gradient, [class*="legend-gradient"]'));
             legendGradientElements.forEach(el => {
               // Reset any transforms that might interfere with legend positioning
               el.style.transform = '';
               el.style.scale = '';
               // Reset SVG transform attribute directly
               el.setAttribute('transform', '');
               
               // Also protect child elements
               const children = Array.from(el.children);
               children.forEach(child => {
                 child.style.transform = '';
                 child.style.scale = '';
                 // Reset SVG transform attribute directly
                 child.setAttribute('transform', '');
               });
             });

             // Ensure legend positioning is maintained during animation
             const legend = container.querySelector('.vega-legend');
             if (legend) {
               legend.style.transform = '';
               legend.style.scale = '';
               
               const legendGradient = legend.querySelector('.vega-legend-gradient');
               if (legendGradient) {
                 legendGradient.style.transform = '';
                 legendGradient.style.scale = '';
               }
             }
           }
  });

  // ScrollTrigger will be updated by Lenis on both mobile and desktop
}

// Initialize Lenis smooth scroll
function initLenis() {
  if (typeof Lenis === 'undefined') {
    return;
  }

  // Check if we're on mobile - more comprehensive detection
  const isMobile = window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0);

  if (lenisInstance) {
    lenisInstance.destroy();
  }

  // Configure Lenis differently for mobile vs desktop
  const lenisConfig = isMobile ? {
    duration: 1.4, // Moderate speed on mobile
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
    smoothTouch: true, // Enable smooth touch on mobile
    touchMultiplier: 0.8, // Moderate touch sensitivity
    wheelMultiplier: 0.8, // Moderate wheel sensitivity
    normalizeWheel: true,
    lerp: 0.08, // Moderate lerp for smoother animation
  } : {
    duration: 1.0, // Shorter duration for more responsive scrolling
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    wheelMultiplier: 1, // Standard wheel responsiveness
    normalizeWheel: true,
    lerp: 0.08, // Lower lerp for more responsive page scrolling
  };

  lenisInstance = new Lenis(lenisConfig);

  // Update ScrollTrigger on scroll
  lenisInstance.on('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.update();
    }
  });

  // Animation frame loop
  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Enable ScrollTrigger
function enableScrollTrigger(container) {
  initScrollTrigger(container);
}

// Disable ScrollTrigger
function disableScrollTrigger() {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
}

// Enable Lenis
function enableLenis() {
  initLenis();
}

// Disable Lenis
function disableLenis() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

// Refresh ScrollTrigger
function refreshScrollTrigger() {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
  if (lenisInstance) {
    lenisInstance.resize();
  }
}

// Export functions for global access
window.enableScrollTrigger = enableScrollTrigger;
window.disableScrollTrigger = disableScrollTrigger;
window.enableLenis = enableLenis;
window.disableLenis = disableLenis;
window.refreshScrollTrigger = refreshScrollTrigger;

// Utility functions
window.toggleScrollTrigger = function(enable) {
  const container = document.getElementById('chart');
  if (enable) {
    enableScrollTrigger(container);
  } else {
    disableScrollTrigger();
  }
};

window.toggleLenisSmoothScroll = function(enable) {
  if (enable) {
    enableLenis();
  } else {
    disableLenis();
  }
};

// Export for module use
export {
  enableScrollTrigger,
  disableScrollTrigger,
  enableLenis,
  disableLenis,
  refreshScrollTrigger
};
