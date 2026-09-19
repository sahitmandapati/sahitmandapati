// Theme Management
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    this.loadTheme();
    this.setupEventListeners();
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  loadTheme() {
    // An explicit user choice wins; otherwise fall back to the system preference
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : this.getSystemTheme();
    this.applyTheme(theme, false);
  }

  applyTheme(theme, persist) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    if (persist) {
      localStorage.setItem('theme', theme);
    }

    this.syncSwitch(theme);
  }

  syncSwitch(theme) {
    const input = document.getElementById('themeSwitch');
    if (input) {
      input.checked = theme === 'dark';
    }
  }

  setupEventListeners() {
    const input = document.getElementById('themeSwitch');
    if (input) {
      input.addEventListener('change', () => {
        this.applyTheme(input.checked ? 'dark' : 'light', true);
      });
    }

    // Keep following the system preference until the user flips the switch themselves
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(event.matches ? 'dark' : 'light', false);
      }
    });
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});