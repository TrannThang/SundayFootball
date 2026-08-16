/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 2: TRANG CHIA ĐỘI (TEAMS & MATCH GENERATOR)
   ========================================================================== */

class TeamPageController {
  constructor() {
    this.activeSubTab = 'upcoming'; // 'upcoming' or 'history'
    this.manualEditMode = false;
  }

  render() {
    const container = document.getElementById('page-team');
    if (!container) return;

    const players = Store.getPlayers();
    const goingPlayers = players.filter(p => p.attendance === 'going');
    const absentPlayers = players.filter(p => p.attendance === 'absent');
    const pendingPlayers = players.filter(p => p.attendance === 'pending');
    const matches = Store.getMatches();
    const isAdmin = Auth.isAdmin();

    container.innerHTML = `
      <!-- Sub Tab Filters -->
      <div class="filter-tabs">
        <button class="filter-tab-btn ${this.activeSubTab === 'upcoming' ? 'active' : ''}" onclick="TeamPage.setSubTab('upcoming')">
          ⚽ Sắp Tới (${goingPlayers.length} Cầu Thủ)
        </button>
        <button class="filter-tab-btn ${this.activeSubTab === 'history' ? 'active' : ''}" onclick="TeamPage.setSubTab('history')">
          📜 Lịch Sử & Kết Quả
        </button>
      </div>

      ${this.activeSubTab === 'upcoming' ? this.renderUpcomingView(goingPlayers, absentPlayers, pendingPlayers, isAdmin) : this.renderHistoryView(matches, isAdmin)}
    `;
  }

  setSubTab(tab) {
    this.activeSubTab = tab;
    this.render();
  }

  toggleManualEdit() {
    this.manualEditMode = !this.manualEditMode;
    this.render();
  }

  renderUpcomingView(goingPlayers, absentPlayers, pendingPlayers, isAdmin) {
    // Team cards only show players who confirmed 'going' - absent/pending players
    // are listed separately below, not mixed into the 3 team boxes.
    const team1 = goingPlayers.filter(p => p.teamId === 1);
    const team2 = goingPlayers.filter(p => p.teamId === 2);
    const team3 = goingPlayers.filter(p => p.teamId === 3);

    const calcAvgOvr = (teamList) => {
      if (!teamList.length) return 0;
      const sum = teamList.reduce((acc, p) => acc + p.ovr, 0);
      return (sum / teamList.length).toFixed(1);
    };

    return `
      <!-- Attendance Stats Header Card -->
      <div class="card card-header-flex" style="margin-bottom:12px; padding:12px 16px;">
        <div>
          <span style="font-size:0.8rem; color:var(--text-secondary);">Thống kê điểm danh:</span>
          <div style="font-size:1.1rem; font-weight:800;">
            <span style="color:var(--accent-emerald);">✅ Đã đi (${goingPlayers.length})</span> •
            <span style="color:var(--accent-rose);">❌ Vắng (${absentPlayers.length})</span> •
            <span style="color:var(--accent-gold);">⏳ Chưa vote (${pendingPlayers.length})</span>
          </div>
        </div>

        ${isAdmin ? `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="TeamPage.autoBalance()">
              ⚡ Chia Đội Tự Động
            </button>
            <button class="btn btn-secondary btn-sm" onclick="TeamPage.toggleManualEdit()">
              ${this.manualEditMode ? '✅ Xong' : '✏️ Sửa'}
            </button>
          </div>
        ` : ''}
      </div>

      <!-- 3 Teams Section -->
      <div style="display:flex; flex-direction:column; gap:14px;">
        <!-- Team 1 Card (Red) -->
        ${this.renderTeamCard(1, 'Đội 1 (Áo Đỏ 🟥)', team1, calcAvgOvr(team1), 'var(--team-1-red)', 'team-badge-1', isAdmin)}

        <!-- Team 2 Card (Blue) -->
        ${this.renderTeamCard(2, 'Đội 2 (Áo Xanh 🟦)', team2, calcAvgOvr(team2), 'var(--team-2-blue)', 'team-badge-2', isAdmin)}

        <!-- Team 3 Card (Yellow) -->
        ${this.renderTeamCard(3, 'Đội 3 (Áo Vàng 🟨)', team3, calcAvgOvr(team3), 'var(--team-3-yellow)', 'team-badge-3', isAdmin)}
      </div>

      ${absentPlayers.length > 0 ? `
        <div class="card" style="margin-top:16px;">
          <div class="card-title" style="color:var(--text-muted); font-size:0.9rem;">
            ❌ Danh sách báo vắng (${absentPlayers.length} người):
          </div>
          ${this.manualEditMode && isAdmin ? this.renderAssignableList(absentPlayers) : this.renderVoteList(absentPlayers)}
        </div>
      ` : ''}

      ${pendingPlayers.length > 0 ? `
        <div class="card" style="margin-top:16px;">
          <div class="card-title" style="color:var(--accent-gold); font-size:0.9rem;">
            ⏳ Chưa vote điểm danh (${pendingPlayers.length} người):
          </div>
          ${this.manualEditMode && isAdmin ? this.renderAssignableList(pendingPlayers) : this.renderVoteList(pendingPlayers)}
        </div>
      ` : ''}
    `;
  }

  // Shows who voted when (and whether admin voted for them) for absent/pending lists.
  renderVoteList(players) {
    return `
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
        ${players.map(p => `
          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(9,13,22,0.6); padding:6px 12px; border-radius:8px;">
            <span style="font-weight:700; font-size:0.85rem;">${p.name} (${p.pos})</span>
            ${this.renderVoteTimeLabel(p)}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderVoteTimeLabel(p) {
    if (!p.votedAt) return `<span style="font-size:0.7rem; color:var(--text-muted);">chưa bấm gì</span>`;
    const who = p.votedBy === 'admin' ? ' • Admin bấm' : '';
    return `<span style="font-size:0.7rem; color:var(--text-muted);">${App.formatRelativeTime(p.votedAt)}${who}</span>`;
  }

  // Manual-edit list for absent/pending players: lets admin drop any of them
  // straight into a team (this also confirms them as 'going').
  renderAssignableList(players) {
    return `
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
        ${players.map(p => `
          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(9,13,22,0.6); padding:8px 12px; border-radius:8px;">
            <div>
              <span style="font-weight:700; font-size:0.88rem;">${p.name} (${p.pos})</span><br>
              ${this.renderVoteTimeLabel(p)}
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <select id="assign-team-${p.id}" class="form-select" style="padding:2px 6px; font-size:0.75rem;">
                <option value="1">Đội 1</option>
                <option value="2">Đội 2</option>
                <option value="3">Đội 3</option>
              </select>
              <button class="btn btn-primary btn-sm" onclick="TeamPage.assignToTeam(${p.id})">➕ Vào đội</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderTeamCard(teamId, title, teamList, avgOvr, colorHex, badgeClass, isAdmin) {
    return `
      <div class="card" style="border-left: 4px solid ${colorHex}; margin-bottom:0;">
        <div class="card-header-flex" style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="team-badge ${badgeClass}" style="font-size:0.88rem; padding:4px 10px;">${title}</span>
            <span style="font-size:0.75rem; color:var(--text-secondary);">(${teamList.length}/7 người)</span>
          </div>
          <div style="font-size:0.85rem; font-weight:800; color:var(--accent-gold); background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:6px;">
            ⭐ OVR TB: ${avgOvr}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          ${teamList.map(p => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(9,13,22,0.6); padding:8px 12px; border-radius:8px; border:1px solid var(--border-color);">
              <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="PlayerDetail.show(${p.id})">
                <span class="pos-badge pos-${p.pos}">${p.pos}</span>
                <span style="font-weight:700; font-size:0.9rem; ${p.attendance === 'absent' ? 'text-decoration:line-through; opacity:0.5;' : p.attendance === 'pending' ? 'opacity:0.6;' : ''}">${p.name}</span>
                ${p.attendance === 'absent' ? '<span style="font-size:0.7rem; color:var(--accent-rose); font-weight:800;">(VẮNG)</span>' : ''}
                ${p.attendance === 'pending' ? '<span style="font-size:0.7rem; color:var(--accent-gold); font-weight:800;">(CHƯA VOTE)</span>' : ''}
              </div>

              <div style="display:flex; align-items:center; gap:10px;">
                ${p.votedAt ? `<span style="font-size:0.68rem; color:var(--text-muted);">${App.formatRelativeTime(p.votedAt)}${p.votedBy === 'admin' ? ' • Admin' : ''}</span>` : ''}
                <span style="font-weight:900; font-size:0.9rem; color:var(--ovr-gold);">${p.ovr}</span>

                ${this.manualEditMode && isAdmin ? `
                  <select onchange="TeamPage.changePlayerTeam(${p.id}, this.value)" class="form-select" style="padding:2px 6px; font-size:0.75rem;">
                    <option value="1" ${p.teamId === 1 ? 'selected' : ''}>Đội 1</option>
                    <option value="2" ${p.teamId === 2 ? 'selected' : ''}>Đội 2</option>
                    <option value="3" ${p.teamId === 3 ? 'selected' : ''}>Đội 3</option>
                  </select>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderHistoryView(matches, isAdmin) {
    const matchDay = Store.getMatchDay();
    const skippedWeeks = Store.getSkippedWeeks();
    const currentSkip = skippedWeeks.find(s => s.date === matchDay.date);

    // Group matches by their session date, newest date first.
    const groups = {};
    matches.forEach(m => {
      const key = m.matchDate || matchDay.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    // Weeks that were skipped but have no matches at all still deserve a row.
    skippedWeeks.forEach(s => { if (!groups[s.date]) groups[s.date] = []; });
    const allDates = [...new Set([...sortedDates, ...skippedWeeks.map(s => s.date)])].sort((a, b) => b.localeCompare(a));

    return `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <!-- Current Matchday Card -->
        <div class="card" style="margin-bottom:0; background:linear-gradient(135deg, rgba(6,182,212,0.1), rgba(19,27,46,0.9)); border:1px solid rgba(6,182,212,0.3);">
          <div class="card-header-flex" style="margin-bottom:${isAdmin ? '10px' : '0'};">
            <div>
              <span class="section-badge">BUỔI ĐÁ HIỆN TẠI</span>
              <h3 style="font-size:1.05rem; font-weight:800; margin-top:4px;">${TeamPage.formatDate(matchDay.date)}</h3>
              <p style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Đổi ngày này ở nút "🔄 Tuần Mới" trên Trang chủ</p>
            </div>
            ${isAdmin ? `<button class="btn btn-outline btn-sm" onclick="TeamPage.sendWeeklyReportNow()">📤 Gửi Telegram</button>` : ''}
          </div>

          ${currentSkip ? `
            <div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:10px 12px; font-size:0.82rem;">
              🌧 <strong>Tuần này nghỉ:</strong> ${currentSkip.reason}
              ${isAdmin ? `<button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="TeamPage.unmarkWeekSkipped()">Huỷ đánh dấu nghỉ</button>` : ''}
            </div>
          ` : isAdmin ? `
            <div style="display:flex; gap:8px; align-items:center;">
              <select id="new-match-home" class="form-select" style="flex:1;">
                <option value="1">Đội 1 (Đỏ)</option>
                <option value="2">Đội 2 (Xanh)</option>
                <option value="3">Đội 3 (Vàng)</option>
              </select>
              <span style="font-weight:800;">vs</span>
              <select id="new-match-away" class="form-select" style="flex:1;">
                <option value="1">Đội 1 (Đỏ)</option>
                <option value="2" selected>Đội 2 (Xanh)</option>
                <option value="3">Đội 3 (Vàng)</option>
              </select>
              <button class="btn btn-primary btn-sm" onclick="TeamPage.addMatch()">➕ Thêm trận</button>
            </div>
            <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="TeamPage.markWeekSkipped()">🌧 Đánh dấu tuần này nghỉ</button>
          ` : ''}
        </div>

        ${allDates.length === 0 ? `
          <div class="card" style="text-align:center; color:var(--text-muted); padding:20px;">
            Chưa có trận nào được ghi nhận. Bấm "➕ Thêm trận" ở trên để bắt đầu.
          </div>
        ` : allDates.map(dateKey => {
          const skip = skippedWeeks.find(s => s.date === dateKey);
          const dayMatches = groups[dateKey] || [];
          return `
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="font-size:0.78rem; font-weight:800; color:var(--text-muted); padding-left:2px;">
                📅 ${TeamPage.formatDate(dateKey)} ${dateKey === matchDay.date ? '(hiện tại)' : ''}
              </div>
              ${isAdmin && dayMatches.length > 0 ? `<button class="btn btn-danger btn-sm" onclick="TeamPage.deleteWeekData('${dateKey}')">🗑️ Xoá dữ liệu tuần này</button>` : ''}
            </div>
            ${skip && (groups[dateKey] || []).length === 0 ? `
              <div class="card" style="margin-bottom:0; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25);">
                🌧 Nghỉ: ${skip.reason}
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${(groups[dateKey] || []).map(m => this.renderMatchCard(m, isAdmin)).join('')}
              </div>
            `}
          </div>
        `;
        }).join('')}
      </div>
    `;
  }

  renderMatchCard(m, isAdmin) {
    const teamNames = { 1: 'Đội 1 (Đỏ 🟥)', 2: 'Đội 2 (Xanh 🟦)', 3: 'Đội 3 (Vàng 🟨)' };

    return `
      <div class="card" style="margin-bottom:0;">
        <div class="card-header-flex" style="margin-bottom:8px;">
          <span style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">
            ${m.status === 'finished' ? 'ĐÃ ĐÁ' : 'CHƯA CÓ TỶ SỐ'}${m.startTime && m.endTime ? ` • ⏰ ${m.startTime} - ${m.endTime}` : ''}
          </span>
          ${isAdmin ? `
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline btn-sm" onclick="TeamPage.openMatchModal(${m.id})">✏️ Nhập tỷ số</button>
              <button class="btn btn-danger btn-sm" onclick="TeamPage.deleteMatch(${m.id})">🗑️</button>
            </div>
          ` : ''}
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(9,13,22,0.7); padding:14px; border-radius:10px;">
          <div style="flex:1; text-align:center; font-weight:800; font-size:0.95rem;">
            ${teamNames[m.homeTeam]}
          </div>

          <div style="font-size:1.6rem; font-weight:900; color:var(--accent-cyan); padding:0 16px;">
            ${m.status === 'finished' ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
          </div>

          <div style="flex:1; text-align:center; font-weight:800; font-size:0.95rem;">
            ${teamNames[m.awayTeam]}
          </div>
        </div>

        ${m.scorers && m.scorers.length > 0 ? `
          <div style="margin-top:10px; font-size:0.8rem; color:var(--text-secondary); background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px;">
            ⚽ <strong>Ghi bàn:</strong> ${m.scorers.map(s => `${s.name}${s.assist ? ` (KT: ${s.assist})` : ''}`).join(', ')}
          </div>
        ` : ''}
      </div>
    `;
  }

  formatDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }

  addMatch() {
    const home = document.getElementById('new-match-home').value;
    const away = document.getElementById('new-match-away').value;
    if (home === away) {
      App.showToast('Hai đội thi đấu phải khác nhau!', 'error');
      return;
    }
    Store.addMatch(home, away);
    App.showToast('Đã thêm trận đấu mới, bấm "Nhập tỷ số" khi có kết quả!', 'success');
    this.render();
  }

  sendWeeklyReportNow() {
    if (!window.TelegramNotify || !TelegramNotify.isConfigured()) {
      App.showToast('Telegram chưa được cấu hình!', 'error');
      return;
    }
    const matchDay = Store.getMatchDay();
    TelegramNotify.sendWeeklyReport(matchDay.date, Store.data);
    App.showToast('Đã gửi báo cáo tuần này qua Telegram! 📤', 'success');
  }

  deleteWeekData(dateStr) {
    if (!confirm(`Xoá TOÀN BỘ trận đấu của tuần ${this.formatDate(dateStr)}? Không thể hoàn tác.`)) return;
    Store.deleteMatchesForDate(dateStr);
    App.showToast('Đã xoá dữ liệu tuần đó.', 'info');
    this.render();
  }

  markWeekSkipped() {
    const reason = prompt('Lý do tuần này nghỉ (VD: Mưa lớn, Nghỉ lễ...):');
    if (!reason || !reason.trim()) return;
    const matchDay = Store.getMatchDay();
    Store.markWeekSkipped(matchDay.date, reason.trim());
    App.showToast('Đã đánh dấu tuần này nghỉ!', 'info');
    this.render();
  }

  unmarkWeekSkipped() {
    const matchDay = Store.getMatchDay();
    Store.unmarkWeekSkipped(matchDay.date);
    App.showToast('Đã huỷ đánh dấu nghỉ.', 'info');
    this.render();
  }

  deleteMatch(matchId) {
    if (!confirm('Xoá trận đấu này?')) return;
    Store.deleteMatch(matchId);
    App.showToast('Đã xoá trận đấu.', 'info');
    this.render();
  }

  autoBalance() {
    Store.autoBalanceTeams();
    App.showToast('Đã chia đội tự động cân bằng theo chỉ số OVR! ⚡', 'success');
    this.render();
  }

  changePlayerTeam(playerId, targetTeamId) {
    Store.swapPlayerTeam(playerId, targetTeamId);
    App.showToast('Đã chuyển cầu thủ sang đội mới!', 'info');
    this.render();
  }

  assignToTeam(playerId) {
    const select = document.getElementById(`assign-team-${playerId}`);
    if (!select) return;
    Store.assignPlayerToTeam(playerId, select.value);
    const player = Store.getPlayerById(playerId);
    App.showToast(`Đã thêm ${player ? player.name : ''} vào Đội ${select.value}!`, 'success');
    this.render();
  }

  openMatchModal(matchId) {
    const match = Store.getMatches().find(m => m.id === matchId);
    if (!match) return;

    const teamNames = { 1: 'Đội 1 (Đỏ)', 2: 'Đội 2 (Xanh)', 3: 'Đội 3 (Vàng)' };

    document.getElementById('match-index-input').value = match.id;
    document.getElementById('match-teams-label').textContent = `${teamNames[match.homeTeam]} vs ${teamNames[match.awayTeam]}`;
    document.getElementById('match-home-name').textContent = teamNames[match.homeTeam];
    document.getElementById('match-away-name').textContent = teamNames[match.awayTeam];
    document.getElementById('match-home-score').value = match.homeScore || 0;
    document.getElementById('match-away-score').value = match.awayScore || 0;
    document.getElementById('match-start-time').value = match.startTime || '';
    document.getElementById('match-end-time').value = match.endTime || '';

    // Render scorers
    const scorersContainer = document.getElementById('match-scorers-container');
    scorersContainer.innerHTML = '';

    if (match.scorers && match.scorers.length > 0) {
      match.scorers.forEach(s => {
        // Legacy matches stored one row per scorer with a goal count; expand
        // those into one row per goal so old data still opens cleanly.
        const goalCount = s.goals || 1;
        for (let i = 0; i < goalCount; i++) {
          this.addScorerRow(s.name, i === 0 ? (s.assist || '') : '');
        }
      });
    } else {
      this.addScorerRow('', '');
    }

    App.openModal('match-modal');
  }

  addScorerRow(name = '', assist = '') {
    const container = document.getElementById('match-scorers-container');
    if (!container) return;

    const playerOptions = (selected) => Store.getPlayers()
      .map(p => `<option value="${p.name}" ${p.name === selected ? 'selected' : ''}>${p.name} (${p.pos})</option>`).join('');

    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:8px; align-items:center;';
    div.innerHTML = `
      <select class="form-select scorer-name-select" style="flex:2;">
        <option value="">-- Ai ghi bàn --</option>
        ${playerOptions(name)}
      </select>
      <select class="form-select scorer-assist-select" style="flex:2;">
        <option value="">-- Không kiến tạo --</option>
        ${playerOptions(assist)}
      </select>
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
  }

  saveMatchResult(e) {
    e.preventDefault();
    const matchId = Number(document.getElementById('match-index-input').value);
    const homeScore = document.getElementById('match-home-score').value;
    const awayScore = document.getElementById('match-away-score').value;
    const startTime = document.getElementById('match-start-time').value;
    const endTime = document.getElementById('match-end-time').value;

    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const minutes = (eh * 60 + em) - (sh * 60 + sm);
      if (minutes <= 0) {
        App.showToast('Giờ kết thúc phải sau giờ bắt đầu!', 'error');
        return;
      }
      if (minutes > 10) {
        App.showToast(`⚠️ Trận này dài ${minutes} phút, vượt quá 10 phút quy định nhưng vẫn được lưu.`, 'info');
      }
    }

    // One row = one goal, each with an optional assist.
    const scorerRows = document.querySelectorAll('#match-scorers-container > div');
    const scorers = [];

    scorerRows.forEach(row => {
      const nameSelect = row.querySelector('.scorer-name-select');
      const assistSelect = row.querySelector('.scorer-assist-select');
      if (nameSelect && nameSelect.value) {
        scorers.push({
          name: nameSelect.value,
          assist: (assistSelect && assistSelect.value) || null
        });
      }
    });

    Store.updateMatchResult(matchId, homeScore, awayScore, startTime, endTime, scorers);
    App.showToast('Cập nhật tỷ số trận đấu & BXH thành công! ⚽', 'success');
    App.closeModal('match-modal');
    this.render();
  }
}

window.TeamPage = new TeamPageController();
