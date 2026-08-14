/* ==========================================================================
   SUNDAY FOOTBALL - REAL-TIME CLOUD DATA SYNC ENGINE (Firebase Realtime DB)
   Allows instant cross-device synchronization (Admin changes on phone A
   reflect live on phone B, no refresh needed) via a Firebase websocket
   listener instead of manual polling.
   ========================================================================== */

class CloudSyncEngine {
  constructor() {
    this.dbRef = null;
    this.ready = false;
    this.applyingRemoteUpdate = false;
  }

  isConfigured() {
    return typeof firebase !== 'undefined' &&
      window.FIREBASE_CONFIG &&
      window.FIREBASE_CONFIG.databaseURL &&
      !window.FIREBASE_CONFIG.databaseURL.includes('PASTE_');
  }

  init() {
    if (!this.isConfigured()) {
      console.warn('⚠️ Firebase chưa được cấu hình (js/firebase-config.js) - dữ liệu chỉ lưu trên thiết bị này, không đồng bộ được.');
      return;
    }

    firebase.initializeApp(window.FIREBASE_CONFIG);
    this.dbRef = firebase.database().ref('sundayFootballData');

    // Seed the cloud once if it's completely empty (first-ever run for this team),
    // then attach a live listener that fires immediately and on every future change.
    this.dbRef.once('value').then((snapshot) => {
      if (!snapshot.exists()) {
        this.dbRef.set(Store.data);
      }
      this.ready = true;
      this.dbRef.on('value', (snap) => this.handleRemoteChange(snap));
    });
  }

  handleRemoteChange(snapshot) {
    const cloudData = snapshot.val();
    if (!cloudData) return;

    // Cloud data can come from an older app version or a partial write, so it
    // must go through the same normalize() pass local data gets on load() -
    // otherwise newer pages (e.g. Fund) crash on missing fields and render blank.
    const normalized = Store.normalize(cloudData);

    this.applyingRemoteUpdate = true;
    Store.data = normalized;
    localStorage.setItem('SUNDAY_FOOTBALL_DATA_V3', JSON.stringify(normalized));
    if (window.App) App.refreshCurrentPage();
    this.applyingRemoteUpdate = false;
  }

  pushToCloud(dataObj) {
    // Avoid re-pushing data that just arrived from the cloud itself.
    if (this.applyingRemoteUpdate) return;
    if (!this.ready || !this.dbRef) return;
    this.dbRef.set(dataObj).catch((e) => {
      console.warn('Không thể đồng bộ lên cloud (offline?), dữ liệu vẫn được lưu trên máy.', e);
    });
  }

  // Writes ONLY one field instead of the whole tree. Used for high-concurrency
  // actions (many different phones voting attendance around the same time) so
  // one person's stale local copy can't clobber someone else's newer change -
  // pushToCloud()'s full-tree set() would otherwise overwrite everything.
  pushFieldUpdate(path, value) {
    if (this.applyingRemoteUpdate) return;
    if (!this.ready || !this.dbRef) return;
    this.dbRef.child(path).set(value).catch((e) => {
      console.warn('Không thể đồng bộ trường dữ liệu lên cloud (offline?), dữ liệu vẫn được lưu trên máy.', e);
    });
  }

  // Merges several sibling fields under one path in a single write (Firebase
  // update(), not set()) - unlike pushFieldUpdate, this does NOT wipe out any
  // other fields under that same path.
  pushMultiFieldUpdate(path, fields) {
    if (this.applyingRemoteUpdate) return;
    if (!this.ready || !this.dbRef) return;
    this.dbRef.child(path).update(fields).catch((e) => {
      console.warn('Không thể đồng bộ dữ liệu lên cloud (offline?), dữ liệu vẫn được lưu trên máy.', e);
    });
  }
}

window.CloudSync = new CloudSyncEngine();
