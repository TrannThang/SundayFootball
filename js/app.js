/* ==========================================================================
   SUNDAY FOOTBALL - SPA APP CONTROLLER & ROUTER
   ========================================================================== */

class AppController {
  constructor() {
    this.currentPage = 'home';
  }

  init() {
    this.setupNavigation();
    Auth.init();
    this.navigateTo(this.currentPage);
    if (window.CloudSync) CloudSync.init();
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetPage = item.getAttribute('data-page');
        this.navigateTo(targetPage);
      });
    });
  }

  navigateTo(pageId) {
    this.currentPage = pageId;

    // Update Bottom Nav UI
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-page') === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Hide all views and show active target page
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetEl = document.getElementById(`page-${pageId}`);
    if (targetEl) {
      targetEl.classList.add('active');
      window.scrollTo(0, 0);

      // Render page content dynamically
      this.renderPage(pageId);
    }
  }

  renderPage(pageId) {
    switch (pageId) {
      case 'home':
        if (window.HomePage) HomePage.render();
        break;
      case 'team':
        if (window.TeamPage) TeamPage.render();
        break;
      case 'squad':
        if (window.SquadPage) SquadPage.render();
        break;
      case 'fund':
        if (window.FundPage) FundPage.render();
        break;
      case 'ranking':
        if (window.RankingPage) RankingPage.render();
        break;
      default:
        console.warn(`Unknown page: ${pageId}`);
    }
  }

  refreshCurrentPage() {
    Auth.updateHeaderUI();
    this.renderPage(this.currentPage);
  }

  // Modal Handlers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Returns today's date as YYYY-MM-DD using the browser's LOCAL calendar day,
  // not UTC (new Date().toISOString() shifts to UTC and can land on the wrong
  // day for Vietnam users late at night / early morning).
  todayLocalISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Renders an ISO timestamp as a short Vietnamese relative-time string
  // (e.g. "5 phút trước", "hôm qua"), for showing when someone voted.
  formatRelativeTime(isoString) {
    if (!isoString) return '';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'hôm qua';
    return `${days} ngày trước`;
  }

  // Toast Notification System
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Instantiate App
window.App = new AppController();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
