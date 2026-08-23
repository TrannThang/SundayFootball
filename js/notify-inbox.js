/* ==========================================================================
   SUNDAY FOOTBALL - IN-APP NOTIFICATION INBOX
   The bell icon in the header. Separate from the OS push itself (see
   push-notify.js) - every message admin sends via "Báo đội hình" is also
   logged here, so a recipient can still read it inside the app even if they
   never enabled push notifications on that device, or the push failed.
   ========================================================================== */

class NotifyInboxEngine {
  currentOwnerId() {
    if (!Auth.currentUser) return null;
    return Auth.isAdmin() ? 'admin' : Auth.currentUser.id;
  }

  updateBadge() {
    const badge = document.getElementById('notify-bell-badge');
    if (!badge) return;
    const owner = this.currentOwnerId();
    if (!owner) {
      badge.style.display = 'none';
      return;
    }
    const count = Store.getUnreadNotificationCount(owner);
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  open() {
    const owner = this.currentOwnerId();
    if (!owner) {
      App.showToast('Vui lòng đăng nhập để xem thông báo.', 'error');
      return;
    }

    const notes = Store.getNotificationsFor(owner);
    const list = document.getElementById('notify-inbox-list');
    if (list) {
      list.innerHTML = notes.length > 0 ? notes.map(n => `
        <div style="background:rgba(var(--bg-dark-rgb), 0.6); padding:10px 12px; border-radius:8px; border-left:3px solid var(--accent-cyan);">
          <div style="font-weight:800; font-size:0.9rem;">${n.title}</div>
          <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">${n.body}</div>
          <div style="font-size:0.68rem; color:var(--text-muted); margin-top:6px;">${App.formatRelativeTime(n.createdAt)}</div>
        </div>
      `).join('') : '<div style="text-align:center; color:var(--text-muted); padding:20px;">Chưa có thông báo nào.</div>';
    }

    Store.markNotificationsSeen(owner);
    this.updateBadge();
    App.openModal('notify-inbox-modal');
  }
}

window.NotifyInbox = new NotifyInboxEngine();
