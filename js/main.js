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
      this.scrollToSection(targetId);

      if (window.history && 'pushState' in window.history) {
        const url = new URL(window.location.href);
        url.hash = targetId;
        window.history.pushState({}, '', url);
      }
    }, { passive: false });
  }

  showLoading() {
    document.body.classList.add('loading');
  }

  hideLoading() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});