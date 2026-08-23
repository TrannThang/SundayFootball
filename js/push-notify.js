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
        const title = (payload.notification && payload.notification.title) || '';
        const body = (payload.notification && payload.notification.body) || '';
        App.showToast(`🔔 ${title}: ${body}`, 'info');
      });

      App.showToast('Đã bật thông báo cho thiết bị này! 🔔', 'success');
    } catch (e) {
      console.error('Push enable failed', e);
      App.showToast('Không bật được thông báo, thử lại sau.', 'error');
    }
  }

  // Admin picks exactly who gets the "lineup ready" push at send time -
  // either everyone currently 'going', or a hand-picked list. No persistent
  // per-player setting involved; it's decided fresh every time this opens.
  openNotifyModal() {
    if (!Auth.isAdmin()) return;
    const list = document.getElementById('notify-modal-list');
    if (!list) return;
    const players = Store.getPlayers();
    list.innerHTML = players.map(p => `
      <label style="display:flex; align-items:center; gap:8px; padding:6px 8px; background:rgba(var(--bg-dark-rgb), 0.6); border-radius:8px; cursor:pointer;">
        <input type="checkbox" class="notify-recipient-check" value="${p.id}" ${p.attendance === 'going' ? 'checked' : ''}>
        <span style="flex:1; font-size:0.85rem; font-weight:600;">${p.name}</span>
        <span style="font-size:0.72rem; color:var(--text-muted);">${p.attendance === 'going' ? '✅ Đi' : p.attendance === 'absent' ? '❌ Vắng' : '⏳ Chưa vote'}</span>
      </label>
    `).join('');
    App.openModal('notify-modal');
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
    const playerIds = [...document.querySelectorAll('.notify-recipient-check:checked')].map(cb => cb.value);
    if (playerIds.length === 0) {
      App.showToast('Chọn ít nhất 1 người để gửi.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin: Auth.ADMIN_PIN,
          playerIds,
          title: '⚽ Đội hình đã sẵn sàng!',
          body: 'Admin vừa chia xong đội hình - vào xem ngay!'
        })
      });
      const data = await res.json();
      App.closeModal('notify-modal');
      if (data.ok) {
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
    }
  }
}

window.PushNotify = new PushNotifyEngine();
