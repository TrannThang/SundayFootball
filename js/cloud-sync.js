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
    // Full-tree writes are only safe once this device holds the real cloud
    // data AND is online right now (see pushToCloud).
    this.hasSynced = false;
    this.connected = false;
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

    // NOTE: this used to also "seed the cloud if empty" by calling
    // this.dbRef.set(Store.data) when a once('value') check resolved as
    // !snapshot.exists() - removed after that exact path wiped months of
    // real production data (nextMatch/matchDay/period/cycleChampions all
    // reverted to a device's stale local copy from the app's very first
    // week). A transient network/permission hiccup on ANY device opening
    // the app can make that check falsely report "doesn't exist" even
    // when the cloud has real data, and there's no safe way to tell a
    // genuinely-empty first run apart from that from the client alone.
    // The database already exists for this team now, so this isn't
    // needed again - if it ever is (a brand new team's first deploy),
    // seed it once manually instead of leaving this automatic.
    this.ready = true;
    firebase.database().ref('.info/connected').on('value', (snap) => {
      this.connected = snap.val() === true;
    });
    this.dbRef.on('value', (snap) => this.handleRemoteChange(snap));
  }

  handleRemoteChange(snapshot) {
    const cloudData = snapshot.val();
    if (!cloudData) return;

    // Cloud data can come from an older app version or a partial write, so it
    // must go through the same normalize() pass local data gets on load() -
    // otherwise newer pages (e.g. Fund) crash on missing fields and render blank.
    const normalized = Store.normalize(cloudData);

    this.applyingRemoteUpdate = true;
    this.hasSynced = true;
    Store.data = normalized;
    localStorage.setItem('SUNDAY_FOOTBALL_DATA_V3', JSON.stringify(normalized));
    if (window.Auth) Auth.checkSessionValidity();
    if (window.App) App.refreshCurrentPage();
    this.applyingRemoteUpdate = false;
  }

  pushToCloud(dataObj) {
    // Avoid re-pushing data that just arrived from the cloud itself.
    if (this.applyingRemoteUpdate) return;
    if (!this.ready || !this.dbRef) return;
    // pushToCloud replaces the WHOLE tree. A phone that hasn't received the
    // cloud snapshot yet (just opened, slow network) or is offline (Firebase
    // would queue the set() and replay it on reconnect) only has its own
    // stale localStorage copy - pushing that once reverted 25 players' PINs
    // to the August defaults (TT123, XH345...). Refuse instead of clobbering.
    if (!this.hasSynced || !this.connected) {
      console.warn('Chưa đồng bộ xong với cloud / đang offline - không ghi đè dữ liệu chung.');
      if (window.App && App.showToast) {
        App.showToast('Chưa kết nối được máy chủ - thao tác chưa được lưu. Vui lòng tải lại trang và thử lại.', 'error');
      }
      return;
    }
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
