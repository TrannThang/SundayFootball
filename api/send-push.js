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

   Recipients are filtered to players who are BOTH marked 'going' for the
   current match day AND explicitly notify-enabled by the admin (see
   Store.setNotifyEnabled / HomePage.adminSetNotify) - registering a device
   token isn't enough on its own, the admin controls who's actually on the list.
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
    const [playersSnap, tokensSnap, notifySnap] = await Promise.all([
      admin.database().ref(`${DATA_ROOT}/players`).once('value'),
      admin.database().ref(`${DATA_ROOT}/pushTokens`).once('value'),
      admin.database().ref(`${DATA_ROOT}/notifyEnabled`).once('value'),
    ]);
    const players = playersSnap.val() || [];
    const tokenMap = coerceKeyedObject(tokensSnap.val());
    const notifyMap = coerceKeyedObject(notifySnap.val());

    const eligiblePlayerIds = players
      .filter((p) => p && p.attendance === 'going' && notifyMap[String(p.id)] === true)
      .map((p) => String(p.id));

    const getTokenList = (id) => {
      const v = tokenMap[id];
      return Array.isArray(v) ? v : Object.values(v || {});
    };

    const tokens = eligiblePlayerIds.flatMap(getTokenList).filter(Boolean);

    if (tokens.length === 0) {
      res.status(200).json({ ok: true, sent: 0, note: 'Không có ai vừa vote Đi vừa được bật thông báo.' });
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
