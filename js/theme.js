/* ==========================================================================
   SUNDAY FOOTBALL - LIGHT/DARK THEME TOGGLE
   Per-device display preference (localStorage only, not synced to Firebase -
   this is a personal UI choice, not team data).
   ========================================================================== */

class ThemeManager {
  constructor() {
    this.KEY = 'sf_theme';
  }

  init() {
    this.updateIcon();
  }

  isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  toggle() {
    if (this.isLight()) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(this.KEY, 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(this.KEY, 'light');
    }
    this.updateIcon();
  }

  updateIcon() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = this.isLight() ? '☀️' : '🌙';
  }
}

window.Theme = new ThemeManager();
document.addEventListener('DOMContentLoaded', () => Theme.init());
