/* ==========================================================================
   SUNDAY FOOTBALL - PUSH NOTIFICATION SENDER (Vercel Serverless Function)
   Runs server-side because sending FCM pushes needs a service account
   credential that can never live in client code (same reasoning as the
   Telegram bot token - see js/telegram-config.js/.gitignore). Configure via
   Vercel Environment Variables:
     FIREBASE_SERVICE_ACCOUNT_JSON - the full service account JSON, as one
       string (Firebase Console -> Project settings -> Service accounts ->
       Generate new private key).
     ADMIN_PIN - mirrors Auth.ADMIN_PIN client-side; a lightweight gate so
       random requests can't spam the team with pushes. Not meant to be
       cryptographically strong - matches this app's existing PIN-based
       trust model, nothing more sensitive than a push message is at stake.
   ========================================================================== */

const admin = require('firebase-admin');

const DATABASE_URL = 'https://sunday-football-d953b-default-rtdb.asia-southeast1.firebasedatabase.app';
const DATA_ROOT = 'sundayFootballData';

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DATABASE_URL,
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const { adminPin, title, body } = req.body || {};

  if (!process.env.ADMIN_PIN || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    res.status(500).json({ ok: false, error: 'Server chưa cấu hình biến môi trường push notification.' });
    return;
  }
  if (adminPin !== process.env.ADMIN_PIN) {
    res.status(401).json({ ok: false, error: 'Sai mã Admin PIN.' });
    return;
  }
  if (!title || !body) {
    res.status(400).json({ ok: false, error: 'Thiếu title/body.' });
    return;
  }

  try {
    getAdminApp();
    const snap = await admin.database().ref(`${DATA_ROOT}/pushTokens`).once('value');
    const tokenMap = snap.val() || {};
    const tokens = Object.values(tokenMap)
      .flatMap((v) => (Array.isArray(v) ? v : Object.values(v || {})))
      .filter(Boolean);

    if (tokens.length === 0) {
      res.status(200).json({ ok: true, sent: 0, note: 'Chưa có ai bật thông báo.' });
      return;
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
    });

    // Prune tokens FCM reports as dead (uninstalled app, revoked permission,
    // etc.) so the token list doesn't grow forever with sends that always fail.
    const deadTokens = new Set();
    response.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error && r.error.code;
        if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
          deadTokens.add(tokens[i]);
        }
      }
    });
    if (deadTokens.size > 0) {
      const updates = {};
      Object.entries(tokenMap).forEach(([ownerId, arr]) => {
        const list = Array.isArray(arr) ? arr : Object.values(arr || {});
        updates[`${DATA_ROOT}/pushTokens/${ownerId}`] = list.filter((t) => !deadTokens.has(t));
      });
      await admin.database().ref().update(updates);
    }

    res.status(200).json({ ok: true, sent: response.successCount, failed: response.failureCount });
  } catch (e) {
    console.error('send-push error', e);
    res.status(500).json({ ok: false, error: 'Lỗi gửi thông báo: ' + e.message });
  }
};
