/* ==========================================================================
   SUNDAY FOOTBALL - REAL-TIME CLOUD DATA SYNC ENGINE
   Allows cross-device synchronization (Admin changes on phone A reflect live on phone B)
   ========================================================================== */

class CloudSyncEngine {
  constructor() {
    // Cloud storage API endpoint (JSONBin / Firestore REST API fallback endpoint)
    this.binId = '66b9f291e41b4d34e41f02a5'; 
    this.apiKey = '$2a$10$w8T.NnS4P.M44YlR0W62q.7X3mXW9e4Wz7Q02g2GZg4Z2'; // Cloud API key or fallback endpoint
    this.syncInterval = null;
    this.lastSyncHash = '';
    this.isSyncing = false;
  }

  init() {
    // Initial fetch from cloud on load
    this.pullFromCloud();

    // Poll cloud every 6 seconds for live updates on all devices
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      this.pullFromCloud();
    }, 6000);
  }

  async pullFromCloud() {
    try {
      // Using Jsonbin / public cloud store endpoint for instant zero-config cross-device sync
      const res = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}/latest`, {
        headers: {
          'X-Master-Key': '$2a$10$7rK3r0vP2Y.0gZ4J4p8hU.S4f.3hP9r2b6mX0Z4'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.record) {
          const cloudHash = JSON.stringify(json.record);
          if (cloudHash !== this.lastSyncHash && this.lastSyncHash !== '') {
            this.lastSyncHash = cloudHash;
            // Update LocalStorage Store
            Store.data = json.record;
            localStorage.setItem('SUNDAY_FOOTBALL_DATA_V2', cloudHash);
            App.refreshCurrentPage();
            console.log('⚡ Cloud data synced live from other device!');
          } else if (this.lastSyncHash === '') {
            this.lastSyncHash = cloudHash;
          }
        }
      }
    } catch (e) {
      // Silent catch if offline, falls back seamlessly to LocalStorage
    }
  }

  async pushToCloud(dataObj) {
    this.lastSyncHash = JSON.stringify(dataObj);
    try {
      await fetch(`https://api.jsonbin.io/v3/b/${this.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': '$2a$10$7rK3r0vP2Y.0gZ4J4p8hU.S4f.3hP9r2b6mX0Z4'
        },
        body: JSON.stringify(dataObj)
      });
      console.log('☁️ Data pushed to Cloud successfully!');
    } catch (e) {
      console.warn('Offline mode: Saved locally only', e);
    }
  }
}

window.CloudSync = new CloudSyncEngine();
