/**
 * Main JavaScript - Interaction & Animation Logic
 *
 * Features:
 * - Fade-in animations on scroll
 * - Navbar scroll effects
 * - Intersection Observer for performance
 */

/**
 * Initialize fade-in animations for elements
 */
function initFadeInAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
}

/**
 * Initialize smooth scroll behavior
 */
function initSmoothScroll() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Initialize all page interactions
 */
function initPageInteractions() {
  initFadeInAnimations();
  initSmoothScroll();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initPageInteractions);
