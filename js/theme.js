// Theme Management
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    this.loadTheme();
    this.setupEventListeners();
  }

  loadTheme() {
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem('theme') || 'system';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'system') {
      // Remove explicit theme attribute to use CSS media query
      root.removeAttribute('data-theme');
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      // Set explicit theme
      root.setAttribute('data-theme', theme);
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icon
    this.updateThemeIcon(theme);
  }

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById('themeBtn');
    const sunIcon = themeBtn?.querySelector('.sun-icon');
    const moonIcon = themeBtn?.querySelector('.moon-icon');
    
    if (!sunIcon || !moonIcon) return;

    // Always update based on actual applied theme
    const currentTheme = this.getCurrentTheme();
    
    if (currentTheme === 'dark') {
      sunIcon.style.transform = 'rotate(-90deg) scale(0)';
      moonIcon.style.transform = 'rotate(0deg) scale(1)';
    } else {
      sunIcon.style.transform = 'rotate(0deg) scale(1)';
      moonIcon.style.transform = 'rotate(90deg) scale(0)';
    }
  }

  getCurrentTheme() {
    const root = document.documentElement;
    const dataTheme = root.getAttribute('data-theme');
    
    if (dataTheme) {
      return dataTheme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setupEventListeners() {
    const themeBtn = document.getElementById('themeBtn');
    const themeDropdown = document.getElementById('themeDropdown');
    const themeOptions = document.querySelectorAll('.theme-option');

    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('open');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-toggle')) {
        themeDropdown?.classList.remove('open');
      }
    });

    // Theme option clicks
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        this.setTheme(theme);
        themeDropdown.classList.remove('open');
      });
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'system' || !savedTheme) {
        this.setTheme('system');
      }
    });

    // Update icon when theme changes
    const observer = new MutationObserver(() => {
      const savedTheme = localStorage.getItem('theme') || 'system';
      this.updateThemeIcon(savedTheme);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});