// Main Application - Performance Optimized
class PortfolioApp {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      // Show loading indicator
      this.showLoading();

      // Wait for all dependencies to be ready
      await this.waitForDependencies();

      // Initialize components
      await this.initializeComponents();

      // Setup additional features
      this.setupScrollEffects();
      this.setupSmoothScrolling();
      this.setupScrollSpy();
      this.setupCarouselControls();

      // Hide loading indicator
      this.hideLoading();

      this.isInitialized = true;
      console.log('Portfolio app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize portfolio app:', error);
      this.hideLoading();
    }
  }

  async waitForDependencies() {
    // Wait for all required dependencies
    const promises = [];

    // Wait for AOS to be ready (deferred loading)
    if (typeof AOS === 'undefined') {
      promises.push(this.waitForScript('AOS'));
    }

    // Wait for data manager
    if (!window.dataManager) {
      promises.push(this.waitForGlobal('dataManager'));
    }

    // Wait for component renderer
    if (!window.componentRenderer) {
      promises.push(this.waitForGlobal('componentRenderer'));
    }

    await Promise.all(promises);
  }

  waitForScript(globalName) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window[globalName]) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  waitForGlobal(globalName) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window[globalName]) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  async initializeComponents() {
    if (window.componentRenderer) {
      const success = await window.componentRenderer.renderAll();
      if (!success) {
        throw new Error('Failed to render components');
      }
      
      // Set favicon after components are rendered
      this.setFavicon();
    } else {
      throw new Error('Component renderer not available');
    }
  }

  setFavicon() {
    if (window.dataManager) {
      const social = window.dataManager.getSocial();
      if (social.favicon) {
        const faviconLink = document.getElementById('favicon');
        if (faviconLink) {
          faviconLink.href = social.favicon;
        }
      }
    }
  }

  setupScrollEffects() {
    // Add scroll effects for navigation and animations
    let lastScrollY = window.scrollY;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Add/remove scroll class to body for any scroll-dependent styling
          if (currentScrollY > 50) {
            document.body.classList.add('scrolled');
          } else {
            document.body.classList.remove('scrolled');
          }

          lastScrollY = currentScrollY;
          isScrolling = false;
        });
        
        isScrolling = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  setupSmoothScrolling() {
    // Add smooth scrolling for internal anchor links only
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1).trim();
      const section = targetId ? document.getElementById(targetId) : null;
      if (!section) return;

      e.preventDefault();
      if (document.body.classList.contains('blog-page-open')) {
        window.componentRenderer?.closeBlogPage();
      }
      this.scrollToSection(targetId);

      if (window.history && 'pushState' in window.history) {
        const url = new URL(window.location.href);
        url.hash = targetId;
        window.history.pushState({}, '', url);
      }
    }, { passive: false });
  }

  setupCarouselControls() {
    document.querySelectorAll('.carousel-control').forEach((button) => {
      button.addEventListener('click', () => {
        const track = document.getElementById(button.dataset.carouselTarget);
        const direction = button.dataset.carouselDirection;
        const card = track?.firstElementChild;
        if (!track || !card || !['left', 'right'].includes(direction)) return;

        if (!track.classList.contains('carousel-manual')) {
          const transform = getComputedStyle(track).transform;
          const offset = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
          track.dataset.carouselOffset = offset.toString();
          track.classList.add('carousel-manual');
          track.style.transform = `translateX(${offset}px)`;
        }

        const cardWidth = card.getBoundingClientRect().width;
        const trackStyles = getComputedStyle(track);
        const gap = parseFloat(trackStyles.columnGap) || 0;
        const halfTrackWidth = track.scrollWidth / 2;
        if (!halfTrackWidth) return;

        const offset = parseFloat(track.dataset.carouselOffset) || 0;
        const movement = cardWidth + gap;
        const nextOffset = offset + (direction === 'left' ? -movement : movement);
        const wrappedOffset = ((nextOffset % halfTrackWidth) + halfTrackWidth) % halfTrackWidth - halfTrackWidth;
        track.dataset.carouselOffset = wrappedOffset.toString();
        track.style.transform = `translateX(${wrappedOffset}px)`;
      });
    });
  }

  showLoading() {
    document.body.classList.add('loading');
  }

  hideLoading() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');

    // The fixed full-viewport spinner overlay must be hidden separately, or it silently blocks all clicks
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.classList.add('hidden');
  }

  scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Highlights the nav tab matching whichever section is currently in view
  setupScrollSpy() {
    const navLinks = [...document.querySelectorAll('.nav-link')];
    if (!navLinks.length) return;

    const sections = navLinks
      .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);
    if (!sections.length) return;

    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

    sections.forEach((section) => observer.observe(section));
    setActive(sections[0].id);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});