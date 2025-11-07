/**
 * Main JavaScript - Interaction & Animation Logic
 */

// Smooth scroll animation on page load
document.addEventListener('DOMContentLoaded', () => {
  // Fade in elements on scroll
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
  
  // Navbar scroll effect
  let lastScroll = 0;
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      navbar.style.background = 'rgba(255, 255, 255, 0.72)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.9)';
    }
    
    lastScroll = currentScroll;
  });
});
