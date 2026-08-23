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

      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
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

  // Admin-only: fires the "lineup ready" push via the serverless function
  // (it needs the service account credential, which only lives server-side).
  async notifyLineupReady() {
    if (!Auth.isAdmin()) return;
    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin: Auth.ADMIN_PIN,
          title: '⚽ Đội hình đã sẵn sàng!',
          body: 'Admin vừa chia xong đội hình - vào xem ngay!'
        })
      });
      const data = await res.json();
      if (data.ok) {
        App.showToast(`Đã gửi thông báo tới ${data.sent} thiết bị! 📣`, 'success');
      } else {
        App.showToast(data.error || 'Gửi thông báo thất bại.', 'error');
      }
    } catch (e) {
      console.error('notifyLineupReady failed', e);
      App.showToast('Không gửi được thông báo (server chưa sẵn sàng hoặc offline).', 'error');
    }
  }
}

window.PushNotify = new PushNotifyEngine();
