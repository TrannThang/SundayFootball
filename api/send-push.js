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

   The admin picks recipients at send time (see js/push-notify.js
   openNotifyModal - defaults to everyone 'going', freely editable) and this
   just resolves those player ids to device tokens and sends. Registering a
   device token isn't enough on its own to receive anything - the admin has
   to have actually picked that person in the modal.
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

// Firebase Realtime Database silently rewrites an object whose keys look like
// dense array indices (e.g. {1:.., 2:..}) into a real array with holes - same
// quirk DataStore.coerceKeyedObject() works around client-side in storage.js.
function coerceKeyedObject(value) {
  if (Array.isArray(value)) {
    const obj = {};
    value.forEach((v, idx) => { if (v !== null && v !== undefined) obj[idx] = v; });
    return obj;
  }
  return value || {};
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const { adminPin, title, body, playerIds } = req.body || {};

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
  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    res.status(400).json({ ok: false, error: 'Chưa chọn người nhận.' });
    return;
  }

  try {
    getAdminApp();
    const tokensSnap = await admin.database().ref(`${DATA_ROOT}/pushTokens`).once('value');
    const tokenMap = coerceKeyedObject(tokensSnap.val());

    const eligiblePlayerIds = playerIds.map(String);

    const getTokenList = (id) => {
      const v = tokenMap[id];
      return Array.isArray(v) ? v : Object.values(v || {});
    };

    const tokens = [...new Set(eligiblePlayerIds.flatMap(getTokenList).filter(Boolean))];

    if (tokens.length === 0) {
      res.status(200).json({ ok: true, sent: 0, note: 'Không ai trong danh sách đã bật thông báo trên máy.' });
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
      eligiblePlayerIds.forEach((id) => {
        updates[`${DATA_ROOT}/pushTokens/${id}`] = getTokenList(id).filter((t) => !deadTokens.has(t));
      });
      await admin.database().ref().update(updates);
    }

    res.status(200).json({ ok: true, sent: response.successCount, failed: response.failureCount, targeted: eligiblePlayerIds.length });
  } catch (e) {
    console.error('send-push error', e);
    res.status(500).json({ ok: false, error: 'Lỗi gửi thông báo: ' + e.message });
  }
};
