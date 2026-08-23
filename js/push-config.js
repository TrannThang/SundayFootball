/* ==========================================================================
   SUNDAY FOOTBALL - PUSH NOTIFICATION (WEB PUSH / VAPID) PUBLIC KEY
   This key is the "public" half of the Web Push key pair - Firebase Console
   -> Project Settings -> Cloud Messaging -> Web configuration -> Web Push
   certificates -> key pair. Safe to commit (unlike the service account key
   used server-side in api/send-push.js, which must stay a Vercel env var).
   ========================================================================== */

window.PUSH_VAPID_KEY = "BNoViXurZZ3bZyXBDCUE5PMEl1qB2fvOUmWejjh7DQwsqfuBcTBOUAAOSwH44Uvs4QAvmy6p3ASOlXS37h2cYtQ";
