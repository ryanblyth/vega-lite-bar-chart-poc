// ScrollTrigger + Lenis Animation Module
// Provides scroll-triggered bar growth animations with smooth scrolling

let lenisInstance = null;
let scrollTriggerInstance = null;

// Initialize ScrollTrigger animation
function initScrollTrigger(container) {
  if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') {
    console.error('GSAP or ScrollTrigger not loaded');
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Find all bar elements using a more reliable selector
  // Vega-Lite creates bars with specific role attributes
  const bars = Array.from(container.querySelectorAll('[role="graphics-symbol"]'))
    .filter(el => {
      // Filter to only include actual bar marks (not axes, legends, etc.)
      const ariaLabel = el.getAttribute('aria-label');
      return ariaLabel && ariaLabel.includes('pop:');
    });

  if (bars.length === 0) {
    console.error('No bars found!');
    return;
  }

  // Set initial state
  gsap.set(bars, {
    scaleY: 0,
    transformOrigin: 'bottom center'
  });

  // Create ScrollTrigger animation with pinning
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: container.parentElement, // Target the chart-container div
    start: 'top top',
    end: '+=100%', // Pin for the height of the viewport
    scrub: 1,
    pin: true, // Pin the section while scrolling
    anticipatePin: 1,
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
    }
  });
}

// Initialize Lenis smooth scroll
function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.error('Lenis not loaded');
    return;
  }

  if (lenisInstance) {
    lenisInstance.destroy();
  }

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
    smoothTouch: false,
  });

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
