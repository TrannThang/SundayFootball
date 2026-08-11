/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 1: TRANG CHỦ (HOME)
   ========================================================================== */

class HomePageController {
  render() {
    const container = document.getElementById('page-home');
    if (!container) return;

    const players = Store.getPlayers();
    const goingCount = players.filter(p => p.attendance).length;
    const totalCount = players.length;
    const nextMatch = Store.getNextMatch();
    const noticeText = Store.getNotice();
    const currentUser = Auth.currentUser;
    const currentPlayer = Auth.getCurrentPlayer();

    container.innerHTML = `
      <!-- Next Match & Countdown Card -->
      <div class="card countdown-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div class="section-badge">⚽ BUỔI ĐÁ SẮP TỚI</div>
          ${Auth.isAdmin() ? `<button class="btn btn-outline btn-sm" onclick="HomePage.editNextMatch()" style="padding:2px 8px; font-size:0.75rem;">✏️ Sửa lịch</button>` : ''}
        </div>
        <h2 style="font-size:1.2rem; font-weight:800; color:var(--text-primary); margin:4px 0;">${nextMatch.date}</h2>
        <p style="font-size:0.85rem; color:var(--text-secondary);">⏰ ${nextMatch.time} • 📍 ${nextMatch.venue}</p>

        <!-- Countdown Timer -->
        <div class="countdown-timer" id="home-countdown">
          <div class="time-unit"><div class="time-val" id="cd-days">02</div><div class="time-lbl">Ngày</div></div>
          <div class="time-unit"><div class="time-val" id="cd-hours">14</div><div class="time-lbl">Giờ</div></div>
          <div class="time-unit"><div class="time-val" id="cd-mins">35</div><div class="time-lbl">Phút</div></div>
          <div class="time-unit"><div class="time-val" id="cd-secs">20</div><div class="time-lbl">Giây</div></div>
        </div>

        <div style="margin-top:10px; font-size:0.85rem; font-weight:700; color:var(--accent-emerald);">
          📊 Đã điểm danh: <strong>${goingCount}/${totalCount}</strong> cầu thủ
        </div>
      </div>

      <!-- Quick Attendance Card -->
      <div class="card attendance-action-card">
        ${this.renderAttendanceSection(currentUser, currentPlayer)}
      </div>

      <!-- Notice Announcement Card -->
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">
            <span class="card-title-icon">📢</span>
            <span>Thông Báo BHL</span>
          </div>
          ${Auth.isAdmin() ? `<button class="btn btn-outline btn-sm" onclick="HomePage.editNotice()">✏️ Sửa</button>` : ''}
        </div>
        <div style="background:rgba(9,13,22,0.6); padding:12px 14px; border-radius:var(--radius-sm); border-left:3px solid var(--accent-cyan); font-size:0.88rem; line-height:1.6;" id="notice-text-content">
          ${noticeText}
        </div>
      </div>

      <!-- 3 Match Round Robin Fixture Schedule -->
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">
            <span class="card-title-icon">🗓️</span>
            <span>Lịch 3 Trận Đá Luân Phiên</span>
          </div>
          <span class="section-badge">Sân 7 người</span>
        </div>

        <div class="fixture-item">
          <div class="fixture-team">
            <span class="team-badge team-badge-1">Đội 1 (Đỏ)</span>
          </div>
          <div class="fixture-vs">VS</div>
          <div class="fixture-team right">
            <span class="team-badge team-badge-2">Đội 2 (Xanh)</span>
          </div>
        </div>

        <div class="fixture-item">
          <div class="fixture-team">
            <span class="team-badge team-badge-2">Đội 2 (Xanh)</span>
          </div>
          <div class="fixture-vs">VS</div>
          <div class="fixture-team right">
            <span class="team-badge team-badge-3">Đội 3 (Vàng)</span>
          </div>
        </div>

        <div class="fixture-item">
          <div class="fixture-team">
            <span class="team-badge team-badge-3">Đội 3 (Vàng)</span>
          </div>
          <div class="fixture-vs">VS</div>
          <div class="fixture-team right">
            <span class="team-badge team-badge-1">Đội 1 (Đỏ)</span>
          </div>
        </div>
      </div>
    `;

    this.startCountdown(nextMatch.targetDate);
  }

  renderAttendanceSection(currentUser, currentPlayer) {
    if (!currentUser) {
      return `
        <div style="padding:4px 0;">
          <h3 style="font-size:1rem; font-weight:800; margin-bottom:4px;">🔑 ĐIỂM DANH BẰNG MÃ PIN CÁ NHÂN</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">Nhập mã PIN cá nhân 4 chữ số để xác thực nhanh trong 2 giây!</p>
          <button class="btn btn-primary btn-block" onclick="Auth.openPinModal()">
            ⚡ Nhập Mã PIN Điểm Danh Ngay
          </button>
        </div>
      `;
    }

    if (currentUser.isAdmin) {
      return `
        <div style="text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="font-size:0.95rem; font-weight:800; color:var(--accent-gold);">⚡ Quyền Quản Trị Viên (Admin)</h3>
            <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Đăng xuất</button>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px;">Bạn có thể nhanh chóng điểm danh giúp thành viên bên dưới:</p>

          <div style="display:flex; gap:8px; align-items:center;">
            <select id="admin-quick-player-select" class="form-select" style="flex:1;">
              ${Store.getPlayers().map(p => `
                <option value="${p.id}">${p.name} - ${p.attendance ? '✅ Đã ĐI' : '❌ VẮNG'}</option>
              `).join('')}
            </select>
            <button class="btn btn-success btn-sm" onclick="HomePage.adminToggleAttendance(true)">ĐI</button>
            <button class="btn btn-danger btn-sm" onclick="HomePage.adminToggleAttendance(false)">VẮNG</button>
          </div>
        </div>
      `;
    }

    if (currentPlayer) {
      const isGoing = currentPlayer.attendance;
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">Thành viên: <strong style="color:var(--text-primary); font-size:0.95rem;">${currentPlayer.name}</strong></span>
            <button class="btn btn-secondary btn-sm" onclick="Auth.logout()" style="padding:4px 8px; font-size:0.75rem;">Đổi PIN</button>
          </div>

          <div style="font-size:0.9rem; font-weight:700; margin-bottom:10px;">
            Trạng thái hiện tại của bạn:
            <span style="color:${isGoing ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight:900;">
              ${isGoing ? '✅ BẠN SẼ THAM GIA' : '❌ BẠN BÁO VẮNG'}
            </span>
          </div>

          <div class="attendance-btns-group">
            <button class="attendance-btn-go" onclick="HomePage.setUserAttendance(true)" style="${isGoing ? 'opacity:1; transform:scale(1.02); box-shadow:0 0 15px rgba(16,185,129,0.5);' : 'opacity:0.65;'}">
              ⚽ TÔI SẼ ĐI
            </button>
            <button class="attendance-btn-no" onclick="HomePage.setUserAttendance(false)" style="${!isGoing ? 'opacity:1; transform:scale(1.02); box-shadow:0 0 15px rgba(244,63,94,0.5);' : 'opacity:0.65;'}">
              ❌ BÁO VẮNG
            </button>
          </div>
        </div>
      `;
    }
  }

  setUserAttendance(status) {
    const player = Auth.getCurrentPlayer();
    if (player) {
      Store.updatePlayerAttendance(player.id, status);
      App.showToast(`Đã cập nhật trạng thái: ${status ? 'THAM GIA ✅' : 'BÁO VẮNG ❌'}`, status ? 'success' : 'info');
      App.refreshCurrentPage();
    }
  }

  adminToggleAttendance(status) {
    const select = document.getElementById('admin-quick-player-select');
    if (select) {
      const playerId = select.value;
      Store.updatePlayerAttendance(playerId, status);
      const player = Store.getPlayerById(playerId);
      App.showToast(`Admin đã điểm danh cho ${player ? player.name : ''}: ${status ? 'ĐI' : 'VẮNG'}`, 'success');
      App.refreshCurrentPage();
    }
  }

  editNextMatch() {
    const current = Store.getNextMatch();
    const newVenue = prompt("Nhập địa điểm sân mới:", current.venue);
    if (newVenue === null) return;
    const newTime = prompt("Nhập giờ đá mới:", current.time);
    if (newTime === null) return;

    Store.updateNextMatch({ venue: newVenue.trim(), time: newTime.trim() });
    App.showToast("Cập nhật thông tin trận đấu thành công!", "success");
    App.refreshCurrentPage();
  }

  editNotice() {
    const currentNotice = Store.getNotice();
    const updated = prompt("Nhập nội dung thông báo mới cho đội:", currentNotice);
    if (updated !== null && updated.trim() !== "") {
      Store.updateNotice(updated.trim());
      App.showToast("Cập nhật thông báo thành công!", "success");
      App.refreshCurrentPage();
    }
  }

  startCountdown(targetIso) {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetIso).getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-mins');
      const sEl = document.getElementById('cd-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    };

    update();
    if (window.homeInterval) clearInterval(window.homeInterval);
    window.homeInterval = setInterval(update, 1000);
  }
}

window.HomePage = new HomePageController();
