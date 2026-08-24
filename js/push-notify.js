/* ==========================================================================
   SUNDAY FOOTBALL - PUSH NOTIFICATION CLIENT
   Lets a logged-in user opt this device into real push notifications (works
   even when the app is closed, if installed to the home screen). Registers
   the FCM token to this player (or 'admin') in Firebase; the actual send
   happens server-side via api/send-push.js, since sending requires a secret
   credential that can't live in client code.
   ========================================================================== */

class PushNotifyEngine {
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && typeof firebase !== 'undefined' && !!firebase.messaging;
  }

  isConfigured() {
    return !!(window.PUSH_VAPID_KEY && !window.PUSH_VAPID_KEY.includes('PASTE_'));
  }

  async enable() {
    if (!Auth.isLoggedIn()) {
      App.showToast('Vui lòng đăng nhập trước khi bật thông báo.', 'error');
      return;
    }
    if (!this.isSupported()) {
      App.showToast('Trình duyệt này không hỗ trợ thông báo đẩy.', 'error');
      return;
    }
    if (!this.isConfigured()) {
      App.showToast('Thông báo đẩy chưa được cấu hình (thiếu VAPID key).', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        App.showToast('Bạn đã từ chối quyền thông báo.', 'info');
        return;
      }

      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const reg = await navigator.serviceWorker.ready; // wait for it to actually activate
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      const messaging = firebase.messaging();

      const token = await messaging.getToken({ vapidKey: window.PUSH_VAPID_KEY, serviceWorkerRegistration: reg });
      if (!token) {
        App.showToast('Không lấy được mã thiết bị, thử lại sau.', 'error');
        return;
      }

      const ownerId = Auth.isAdmin() ? 'admin' : Auth.currentUser.id;
      Store.addPushToken(ownerId, token);

      // Foreground messages don't show an OS notification on their own -
      // surface them as a toast instead while the app is actually open.
      messaging.onMessage((payload) => {
        const title = (payload.data && payload.data.title) || '';
        const body = (payload.data && payload.data.body) || '';
        App.showToast(`🔔 ${title}: ${body}`, 'info');
      });

      App.showToast('Đã bật thông báo cho thiết bị này! 🔔', 'success');
    } catch (e) {
      console.error('Push enable failed', e);
      App.showToast('Không bật được thông báo, thử lại sau.', 'error');
    }
  }

  // Admin picks exactly who gets a push at send time - either everyone
  // currently 'going' (or everyone, for announcements like a rest week that
  // concern people regardless of their vote), or a hand-picked list. No
  // persistent per-player setting involved; it's decided fresh every open.
  // title/body become the message actually sent (see sendToSelected);
  // defaultAll pre-checks every player instead of just the 'going' ones.
  openNotifyModal(title, body, defaultAll = false) {
    if (!Auth.isAdmin()) return;
    const list = document.getElementById('notify-modal-list');
    if (!list) return;
    this.pendingTitle = title || '⚽ Đội hình đã sẵn sàng!';
    this.pendingBody = body || 'Admin vừa chia xong đội hình - vào xem ngay!';
    const players = Store.getPlayers();
    list.innerHTML = players.map(p => `
      <label style="display:flex; align-items:center; gap:8px; padding:6px 8px; background:rgba(var(--bg-dark-rgb), 0.6); border-radius:8px; cursor:pointer;">
        <input type="checkbox" class="notify-recipient-check" value="${p.id}" ${(defaultAll || p.attendance === 'going') ? 'checked' : ''}>
        <span style="flex:1; font-size:0.85rem; font-weight:600;">${p.name}</span>
        <span style="font-size:0.72rem; color:var(--text-muted);">${p.attendance === 'going' ? '✅ Đi' : p.attendance === 'absent' ? '❌ Vắng' : '⏳ Chưa vote'}</span>
      </label>
    `).join('');
    App.openModal('notify-modal');
  }

  // Convenience presets for the two other common announcements - reuse the
  // exact same recipient-picker modal, just with different message text and
  // defaulting to "everyone" instead of "everyone going".
  notifyRestWeek() {
    if (!Auth.isAdmin()) return;
    const [y, m, d] = Store.getMatchDay().date.split('-');
    this.openNotifyModal('🌧 Nghỉ đá tuần này', `Chủ Nhật ${d}/${m}/${y} nghỉ, không đá nhé anh em!`, true);
  }

  notifyCheckinReminder() {
    if (!Auth.isAdmin()) return;
    const [y, m, d] = Store.getMatchDay().date.split('-');
    this.openNotifyModal('📢 Nhắc điểm danh', `Chủ Nhật ${d}/${m}/${y} có đá - vào điểm danh nhé!`, true);
  }

  selectAll() {
    document.querySelectorAll('.notify-recipient-check').forEach(cb => { cb.checked = true; });
  }

  selectAllGoing() {
    document.querySelectorAll('.notify-recipient-check').forEach(cb => {
      const player = Store.getPlayerById(cb.value);
      cb.checked = !!(player && player.attendance === 'going');
    });
  }

  selectNone() {
    document.querySelectorAll('.notify-recipient-check').forEach(cb => { cb.checked = false; });
  }

  async sendToSelected() {
    if (!Auth.isAdmin()) return;
    // Guard against double-tap: without this, a fast double-click on the send
    // button fires two separate API calls, each one a real successful send -
    // the recipient then gets the exact same push twice.
    if (this.isSending) return;
    const playerIds = [...document.querySelectorAll('.notify-recipient-check:checked')].map(cb => cb.value);
    if (playerIds.length === 0) {
      App.showToast('Chọn ít nhất 1 người để gửi.', 'error');
      return;
    }
    this.isSending = true;
    const sendBtn = document.getElementById('notify-send-btn');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Đang gửi...'; }

    const title = this.pendingTitle || '⚽ Đội hình đã sẵn sàng!';
    const body = this.pendingBody || 'Admin vừa chia xong đội hình - vào xem ngay!';
    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin: Auth.ADMIN_PIN, playerIds, title, body })
      });
      const data = await res.json();
      App.closeModal('notify-modal');
      if (data.ok) {
        // Logged in the in-app inbox regardless of whether an OS push actually
        // went out - a recipient without push enabled should still see this
        // next time they open the app.
        Store.addNotification({ title, body, recipientIds: playerIds });
        if (data.sent > 0) {
          App.showToast(`Đã gửi thông báo tới ${data.sent} thiết bị! 📣`, 'success');
        } else {
          App.showToast(data.note || 'Không ai trong danh sách đã bật thông báo trên máy.', 'info');
        }
      } else {
        App.showToast(data.error || 'Gửi thông báo thất bại.', 'error');
      }
    } catch (e) {
      console.error('sendToSelected failed', e);
      App.showToast('Không gửi được thông báo (server chưa sẵn sàng hoặc offline).', 'error');
    } finally {
      this.isSending = false;
      if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = '📣 Gửi Thông Báo'; }
    }
  }
}

window.PushNotify = new PushNotifyEngine();
