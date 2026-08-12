/* ==========================================================================
   SUNDAY FOOTBALL - AUTHENTICATION & PIN CODE SYSTEM
   ========================================================================== */

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
    this.pinBuffer = '';
    this.ADMIN_PIN = '0804';
  }

  init() {
    this.updateHeaderUI();
  }

  loadSession() {
    const stored = localStorage.getItem('sf_current_user');
    return stored ? JSON.parse(stored) : null;
  }

  saveSession(userObj) {
    this.currentUser = userObj;
    if (userObj) {
      localStorage.setItem('sf_current_user', JSON.stringify(userObj));
    } else {
      localStorage.removeItem('sf_current_user');
    }
    this.updateHeaderUI();
  }

  updateHeaderUI() {
    const avatarEl = document.getElementById('header-avatar');
    const nameEl = document.getElementById('header-username');
    const attendanceCounter = document.getElementById('header-attendance-count');
    const memberCountEl = document.getElementById('header-member-count');

    // Update Attendance Counter
    const players = Store.getPlayers();
    const goingCount = players.filter(p => p.attendance === 'going').length;
    const pendingCount = players.filter(p => p.attendance === 'pending').length;
    if (attendanceCounter) {
      attendanceCounter.textContent = `${goingCount}/${players.length} Đi` + (pendingCount > 0 ? ` • ${pendingCount} chưa vote` : '');
    }
    if (memberCountEl) {
      memberCountEl.textContent = `${players.length} thành viên`;
    }

    if (this.currentUser) {
      if (this.currentUser.isAdmin) {
        if (avatarEl) avatarEl.textContent = '⚡';
        if (nameEl) nameEl.innerHTML = `Admin <span class="admin-badge">ADMIN</span>`;
      } else {
        const p = Store.getPlayerById(this.currentUser.id);
        if (p) {
          if (avatarEl) avatarEl.textContent = p.name.charAt(0);
          if (nameEl) nameEl.textContent = p.name;
        }
      }
    } else {
      if (avatarEl) avatarEl.textContent = '?';
      if (nameEl) nameEl.textContent = 'Đăng nhập';
    }
  }

  handleUserHeaderClick() {
    if (this.currentUser) {
      const name = this.currentUser.isAdmin ? 'Admin Quản Trị' : (this.getCurrentPlayer() ? this.getCurrentPlayer().name : 'Thành viên');
      if (confirm(`🔑 Bạn đang đăng nhập: ${name}\n\nBạn có muốn ĐĂNG XUẤT khỏi tài khoản này không?`)) {
        this.logout();
      }
    } else {
      this.openPinModal();
    }
  }

  openPinModal() {
    this.pinBuffer = '';
    const textInput = document.getElementById('pin-text-input');
    if (textInput) textInput.value = '';

    // Populate quick member dropdown
    const select = document.getElementById('quick-member-pin-select');
    if (select) {
      const players = Store.getPlayers();
      select.innerHTML = `<option value="">-- Chọn tên thành viên --</option>` +
        players.map(p => `<option value="${p.pin}">${p.id}. ${p.name} (PIN: ${p.pin})</option>`).join('');
    }

    this.updatePinDisplay();
    App.openModal('pin-modal');
  }

  closePinModal() {
    App.closeModal('pin-modal');
  }

  enterDigit(digit) {
    if (this.pinBuffer.length < 6) {
      this.pinBuffer += digit;
      const textInput = document.getElementById('pin-text-input');
      if (textInput) textInput.value = this.pinBuffer;
      this.updatePinDisplay();
    }
  }

  clearPin() {
    this.pinBuffer = '';
    const textInput = document.getElementById('pin-text-input');
    if (textInput) textInput.value = '';
    this.updatePinDisplay();
  }

  updatePinDisplay() {
    const display = document.getElementById('pin-display');
    if (display) {
      display.textContent = this.pinBuffer ? this.pinBuffer.padEnd(4, '•') : '____';
    }
  }

  selectMemberPin(pin) {
    if (pin) {
      const textInput = document.getElementById('pin-text-input');
      if (textInput) textInput.value = pin;
      this.pinBuffer = pin;
      this.submitPinWithVal(pin);
    }
  }

  submitPinText() {
    const textInput = document.getElementById('pin-text-input');
    const val = textInput ? textInput.value : this.pinBuffer;
    this.submitPinWithVal(val);
  }

  submitPin() {
    const textInput = document.getElementById('pin-text-input');
    const val = (textInput && textInput.value.trim()) ? textInput.value : this.pinBuffer;
    this.submitPinWithVal(val);
  }

  submitPinWithVal(pinVal) {
    const pin = String(pinVal || '').trim();
    if (!pin) {
      App.showToast('Vui lòng nhập mã PIN cá nhân!', 'error');
      return;
    }

    // Check Admin PIN
    if (pin === this.ADMIN_PIN || pin.toUpperCase() === 'ADMIN') {
      this.saveSession({ isAdmin: true, name: 'Quản trị viên' });
      App.showToast('Đăng nhập thành công với quyền Admin! ⚡', 'success');
      this.closePinModal();
      App.refreshCurrentPage();
      return;
    }

    // Check Player PIN
    const player = Store.getPlayerByPin(pin);
    if (player) {
      this.saveSession({ id: player.id, name: player.name, isAdmin: false });
      App.showToast(`Chào mừng ${player.name}! 👋`, 'success');
      this.closePinModal();
      App.refreshCurrentPage();
    } else {
      App.showToast(`Mã PIN "${pin}" không đúng! Thử lại (VD: TT123, A001)`, 'error');
      this.clearPin();
    }
  }

  logout() {
    this.saveSession(null);
    App.showToast('Đã đăng xuất tài khoản', 'info');
    App.refreshCurrentPage();
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.isAdmin;
  }

  getCurrentPlayer() {
    if (!this.currentUser || this.currentUser.isAdmin) return null;
    return Store.getPlayerById(this.currentUser.id);
  }

  resetAppStoreData() {
    if (confirm("Bạn có muốn tải lại các thiết lập và dữ liệu từ file code JavaScript?")) {
      Store.resetToDefault();
      App.showToast("Đã cập nhật dữ liệu từ file Code!", "success");
      this.closePinModal();
      App.refreshCurrentPage();
    }
  }
}

window.Auth = new AuthManager();
