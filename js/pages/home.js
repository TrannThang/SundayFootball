/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 1: TRANG CHỦ (HOME)
   ========================================================================== */

class HomePageController {
  render() {
    const container = document.getElementById('page-home');
    if (!container) return;

    const players = Store.getPlayers();
    const goingCount = players.filter(p => p.attendance === 'going').length;
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
          ${Auth.isAdmin() ? `
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline btn-sm" onclick="HomePage.editNextMatch()">✏️ Sửa lịch</button>
              <button class="btn btn-primary btn-sm" onclick="HomePage.startNewWeek()">🔄 Tuần mới</button>
            </div>
          ` : ''}
        </div>
        <h2 style="font-size:1.6rem; font-weight:800; color:var(--text-primary); margin:6px 0 2px;">${this.formatMatchDayLabel(nextMatch.date)}</h2>
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

      <!-- Attendance + Notice sit side-by-side on desktop (see .home-grid),
           stacked on mobile - both are equally "glanceable" info, not a
           strict priority order between them. -->
      <div class="home-grid">
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
          <div style="background:rgba(var(--bg-dark-rgb), 0.6); padding:12px 14px; border-radius:var(--radius-sm); border-left:3px solid var(--accent-cyan); font-size:0.88rem; line-height:1.6;" id="notice-text-content">
            ${noticeText}
          </div>
        </div>
      </div>

      <!-- 3 Match Round Robin Fixture Schedule -->
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">
            <span class="card-title-icon">🗓️</span>
            <span>Lịch 3 Trận Đá Luân Phiên</span>
          </div>
          <span class="section-badge">Sân 5 · Tối đa 7 người/đội</span>
        </div>

        <div class="fixture-item">
          <div class="fixture-team">
            <span class="team-badge team-badge-1">Đội 1 (Cam)</span>
          </div>
          <div class="fixture-vs">VS</div>
          <div class="fixture-team right">
            <span class="team-badge team-badge-2">Đội 2 (Xanh Lá)</span>
          </div>
        </div>

        <div class="fixture-item">
          <div class="fixture-team">
            <span class="team-badge team-badge-2">Đội 2 (Xanh Lá)</span>
          </div>
          <div class="fixture-vs">VS</div>
          <div class="fixture-team right">
            <span class="team-badge team-badge-3">Đội 3 (Thường)</span>
          </div>
        </div>

        <div class="fixture-item">
          <div class="fixture-team">
            <span class="team-badge team-badge-3">Đội 3 (Thường)</span>
          </div>
          <div class="fixture-vs">VS</div>
          <div class="fixture-team right">
            <span class="team-badge team-badge-1">Đội 1 (Cam)</span>
          </div>
        </div>
      </div>
    `;

    this.startCountdown(nextMatch.targetDate);
  }

  // Computes the Vietnamese weekday name from the ISO date itself, so it can
  // never drift out of sync with the actual date the way a stored text label could.
  formatMatchDayLabel(isoDate) {
    if (!isoDate) return '';
    const weekdayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const [y, m, d] = isoDate.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return `${weekdayNames[dateObj.getDay()]}, ${d}/${m}/${y}`;
  }

  renderAttendanceSection(currentUser, currentPlayer) {
    if (!currentUser) {
      return `
        <div>
          <h3 class="attendance-title">Điểm danh buổi đá</h3>
          <p class="attendance-hint">Đăng nhập bằng mã PIN cá nhân để báo đi hoặc vắng.</p>
          <button class="btn btn-primary btn-block btn-lg" onclick="Auth.openPinModal()">
            Nhập PIN để điểm danh
          </button>
        </div>
      `;
    }

    if (currentUser.isAdmin) {
      return `
        <div>
          <div class="attendance-account-row">
            <h3 class="attendance-title attendance-title-admin">⚡ Quản trị viên</h3>
            <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Đăng xuất</button>
          </div>

          <p class="attendance-hint">Điểm danh giúp thành viên:</p>
          <select id="admin-quick-player-select" class="form-select" aria-label="Chọn thành viên">
            ${Store.getPlayers().map(p => `
              <option value="${p.id}">${p.name} - ${p.attendance === 'going' ? '✅ Đã ĐI' : p.attendance === 'absent' ? '❌ VẮNG' : '⏳ Chưa vote'}</option>
            `).join('')}
          </select>
          <div class="admin-quick-btns">
            <button class="btn btn-success btn-sm" onclick="HomePage.adminToggleAttendance('going')">ĐI</button>
            <button class="btn btn-danger btn-sm" onclick="HomePage.adminToggleAttendance('absent')">VẮNG</button>
            <button class="btn btn-secondary btn-sm" onclick="HomePage.adminToggleAttendance('pending')">Chưa vote</button>
          </div>

          <button class="btn btn-outline btn-sm" onclick="PushNotify.enable()" style="margin-top:12px;">🔔 Bật thông báo cho máy này</button>

          <!-- Destructive actions live in their own clearly-labelled zone,
               away from the everyday buttons, so a stray tap meant for
               "Đăng xuất" can't hit them. -->
          <div class="danger-zone">
            <div class="danger-zone-title">Vùng nguy hiểm</div>
            <div class="danger-zone-btns">
              <button class="btn btn-danger-outline btn-sm" onclick="HomePage.forceLogoutAll()">🚪 Đăng xuất tất cả thành viên</button>
              <button class="btn btn-danger-outline btn-sm" onclick="HomePage.forceLogoutAdmins()">🔒 Đăng xuất Admin khác</button>
            </div>
          </div>
        </div>
      `;
    }

    if (currentPlayer) {
      const status = currentPlayer.attendance;
      const isGoing = status === 'going';
      const isAbsent = status === 'absent';
      const statusClass = isGoing ? 'is-going' : isAbsent ? 'is-absent' : 'is-pending';
      const statusLabel = isGoing ? '✅ Bạn sẽ tham gia' : isAbsent ? '❌ Bạn báo vắng' : '⏳ Bạn chưa xác nhận';
      return `
        <div>
          <div class="attendance-account-row">
            <span class="attendance-hint" style="margin:0;">Thành viên: <strong class="attendance-name">${currentPlayer.name}</strong></span>
            <div class="attendance-account-btns">
              <button class="btn btn-outline btn-sm" onclick="HomePage.changeMyPin()">🔑 Đổi PIN</button>
              <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Đăng xuất</button>
            </div>
          </div>

          <div class="attendance-status ${statusClass}" role="status">${statusLabel}</div>

          <!-- Both choices always stay fully visible and tappable; the chosen
               one is filled with a ✓, the other is an outline. (Used to dim
               the unchosen one to 0.65, which made both look disabled before
               anyone had voted.) -->
          <div class="attendance-btns-group">
            <button class="attendance-choice choice-go ${isGoing ? 'is-selected' : ''}" aria-pressed="${isGoing}" onclick="HomePage.setUserAttendance('going')">
              ${isGoing ? '✓ ' : '⚽ '}Tôi sẽ đi
            </button>
            <button class="attendance-choice choice-no ${isAbsent ? 'is-selected' : ''}" aria-pressed="${isAbsent}" onclick="HomePage.setUserAttendance('absent')">
              ${isAbsent ? '✓ ' : ''}Báo vắng
            </button>
          </div>

          <button class="btn btn-outline btn-sm" onclick="PushNotify.enable()" style="margin-top:12px;">🔔 Bật thông báo cho máy này</button>
        </div>
      `;
    }
  }

  changeMyPin() {
    const player = Auth.getCurrentPlayer();
    if (!player) return;
    const newPin = prompt('Nhập mã PIN mới (4 chữ số):');
    if (newPin === null) return;
    const result = Store.changePlayerPin(player.id, newPin);
    if (!result.ok) {
      App.showToast(result.error, 'error');
      return;
    }
    App.showToast('Đã đổi mã PIN thành công! Nhớ mã mới nhé.', 'success');
  }

  // Force every device currently logged in as a member (not Admin) back to
  // the PIN screen, without touching those devices directly - bumps the
  // shared session counter, each device notices next time it syncs.
  forceLogoutAll() {
    if (!confirm('Đăng xuất tất cả tài khoản thành viên đang đăng nhập trên mọi thiết bị? (Admin không bị ảnh hưởng, mọi người sẽ cần nhập lại mã PIN)')) return;
    Store.bumpAuthEpoch();
    App.showToast('Đã đăng xuất tất cả thành viên. Họ sẽ cần nhập lại mã PIN ở lần mở app tiếp theo.', 'success');
  }

  // Same idea as forceLogoutAll, but for Admin sessions - useful since the
  // admin PIN is one shared code handed out to several people, not a
  // per-person login, so this is the only way to kick someone's current
  // session once they have it. Every other device holding an admin session
  // gets logged out next time it syncs. Doesn't stop anyone logging back in
  // with the same PIN - change Auth.ADMIN_PIN (js/auth.js) if that's needed.
  //
  // Re-stamps THIS device's own session BEFORE bumping Store's epoch, not
  // after - Firebase's local-cache echo fires CloudSync.handleRemoteChange
  // (which re-runs checkSessionValidity) synchronously as part of the push
  // below, so by the time control would return to an "after" restamp, this
  // device's own session had already been nuked as "stale" by its own click.
  forceLogoutAdmins() {
    if (!confirm('Đăng xuất tất cả phiên Admin đang mở trên các thiết bị khác? (Thiết bị này vẫn giữ đăng nhập, thành viên không bị ảnh hưởng - ai vẫn có mã PIN admin thì vẫn đăng nhập lại được)')) return;
    const newEpoch = Store.getAdminAuthEpoch() + 1;
    if (Auth.currentUser && Auth.currentUser.isAdmin) {
      Auth.currentUser.epoch = newEpoch;
      Auth.saveSession(Auth.currentUser);
    }
    Store.bumpAdminAuthEpoch();
    App.showToast('Đã đăng xuất các phiên Admin khác. Thiết bị này vẫn đăng nhập bình thường.', 'success');
  }

  setUserAttendance(status) {
    const player = Auth.getCurrentPlayer();
    if (player) {
      Store.updatePlayerAttendance(player.id, status);
      const label = status === 'going' ? 'THAM GIA ✅' : status === 'absent' ? 'BÁO VẮNG ❌' : 'CHƯA VOTE ⏳';
      App.showToast(`Đã cập nhật trạng thái: ${label}`, status === 'going' ? 'success' : 'info');
      App.refreshCurrentPage();
    }
  }

  adminToggleAttendance(status) {
    const select = document.getElementById('admin-quick-player-select');
    if (select) {
      const playerId = select.value;
      Store.updatePlayerAttendance(playerId, status, 'admin');
      const player = Store.getPlayerById(playerId);
      const label = status === 'going' ? 'ĐI' : status === 'absent' ? 'VẮNG' : 'CHƯA VOTE';
      App.showToast(`Admin đã điểm danh cho ${player ? player.name : ''}: ${label}`, 'success');
      App.refreshCurrentPage();
    }
  }

  startNewWeek() {
    const suggested = App.todayLocalISO();
    const input = prompt('Nhập ngày Chủ Nhật mới (YYYY-MM-DD):', suggested);
    if (!input) return;
    const dateStr = input.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      App.showToast('Ngày không đúng định dạng YYYY-MM-DD!', 'error');
      return;
    }
    if (!confirm(
      `🔄 BẮT ĐẦU TUẦN MỚI (${dateStr})\n\n` +
      `Việc này sẽ:\n` +
      `• Đổi ngày trận sắp tới\n` +
      `• Đặt lại TẤT CẢ điểm danh về "chưa vote"\n` +
      `• Tạo buổi thu quỹ mới (xoá danh sách đã đóng tuần trước)\n\n` +
      `Lịch sử trận đấu & bảng xếp hạng KHÔNG bị ảnh hưởng.\n\nBạn có chắc chắn?`
    )) return;

    Store.startNewWeek(dateStr);
    App.showToast('✅ Đã bắt đầu tuần mới! Điểm danh & quỹ đã reset.', 'success');
    App.refreshCurrentPage();
  }

  editNextMatch() {
    const current = Store.getNextMatch();
    const newDate = prompt("Nhập ngày đá tới (YYYY-MM-DD):", current.date);
    if (newDate === null) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate.trim())) {
      App.showToast("Ngày không đúng định dạng YYYY-MM-DD!", "error");
      return;
    }
    const newVenue = prompt("Nhập địa điểm sân mới:", current.venue);
    if (newVenue === null) return;
    const newTime = prompt("Nhập giờ đá mới:", current.time);
    if (newTime === null) return;

    Store.updateNextMatch({
      date: newDate.trim(),
      venue: newVenue.trim(),
      time: newTime.trim(),
      targetDate: `${newDate.trim()}T18:00:00`
    });
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
