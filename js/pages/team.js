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
    const goingPlayers = players.filter(p => p.attendance);
    const absentPlayers = players.filter(p => !p.attendance);
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

      ${this.activeSubTab === 'upcoming' ? this.renderUpcomingView(players, goingPlayers, absentPlayers, isAdmin) : this.renderHistoryView(matches, isAdmin)}
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

  renderUpcomingView(players, goingPlayers, absentPlayers, isAdmin) {
    // Group players by Team ID (1, 2, 3)
    const team1 = players.filter(p => p.teamId === 1);
    const team2 = players.filter(p => p.teamId === 2);
    const team3 = players.filter(p => p.teamId === 3);

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
            <span style="color:var(--accent-rose);">❌ Chưa đi (${absentPlayers.length})</span>
          </div>
        </div>

        ${isAdmin ? `
          <div style="display:flex; gap:8px;">
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
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
            ${absentPlayers.map(p => `
              <span class="pos-badge" style="opacity:0.7;">${p.name} (${p.pos})</span>
            `).join('')}
          </div>
        </div>
      ` : ''}
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
                <span style="font-weight:700; font-size:0.9rem; ${!p.attendance ? 'text-decoration:line-through; opacity:0.5;' : ''}">${p.name}</span>
                ${!p.attendance ? '<span style="font-size:0.7rem; color:var(--accent-rose); font-weight:800;">(VẮNG)</span>' : ''}
              </div>

              <div style="display:flex; align-items:center; gap:10px;">
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
    const teamNames = { 1: 'Đội 1 (Đỏ 🟥)', 2: 'Đội 2 (Xanh 🟦)', 3: 'Đội 3 (Vàng 🟨)' };

    return `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div class="card-header-flex">
          <h3 class="card-title">⚽ Kết Quả Các Trận Luân Phiên</h3>
          ${isAdmin ? `<p style="font-size:0.75rem; color:var(--accent-gold);">Click "Nhập tỷ số" để cập nhật kết quả</p>` : ''}
        </div>

        ${matches.map((m, idx) => `
          <div class="card" style="margin-bottom:0;">
            <div class="card-header-flex" style="margin-bottom:8px;">
              <span style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">TRẬN ${idx + 1}</span>
              ${isAdmin ? `<button class="btn btn-outline btn-sm" onclick="TeamPage.openMatchModal(${idx})">✏️ Nhập tỷ số</button>` : ''}
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
                ⚽ <strong>Ghi bàn:</strong> ${m.scorers.map(s => `${s.name} (${s.goals} bàn)`).join(', ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
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

  openMatchModal(matchIndex) {
    const matches = Store.getMatches();
    const match = matches[matchIndex];
    if (!match) return;

    const teamNames = { 1: 'Đội 1 (Đỏ)', 2: 'Đội 2 (Xanh)', 3: 'Đội 3 (Vàng)' };

    document.getElementById('match-index-input').value = matchIndex;
    document.getElementById('match-teams-label').textContent = `${teamNames[match.homeTeam]} vs ${teamNames[match.awayTeam]}`;
    document.getElementById('match-home-name').textContent = teamNames[match.homeTeam];
    document.getElementById('match-away-name').textContent = teamNames[match.awayTeam];
    document.getElementById('match-home-score').value = match.homeScore || 0;
    document.getElementById('match-away-score').value = match.awayScore || 0;

    // Render scorers
    const scorersContainer = document.getElementById('match-scorers-container');
    scorersContainer.innerHTML = '';

    if (match.scorers && match.scorers.length > 0) {
      match.scorers.forEach(s => this.addScorerRow(s.name, s.goals));
    } else {
      this.addScorerRow('', 1);
    }

    App.openModal('match-modal');
  }

  addScorerRow(name = '', goals = 1) {
    const container = document.getElementById('match-scorers-container');
    if (!container) return;

    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:8px; align-items:center;';
    div.innerHTML = `
      <select class="form-select scorer-name-select" style="flex:2;">
        <option value="">-- Chọn cầu thủ --</option>
        ${Store.getPlayers().map(p => `<option value="${p.name}" ${p.name === name ? 'selected' : ''}>${p.name} (${p.pos})</option>`).join('')}
      </select>
      <input type="number" class="form-input scorer-goals-input" min="1" value="${goals}" style="flex:1; text-align:center;">
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
  }

  saveMatchResult(e) {
    e.preventDefault();
    const matchIndex = document.getElementById('match-index-input').value;
    const homeScore = document.getElementById('match-home-score').value;
    const awayScore = document.getElementById('match-away-score').value;

    const scorerRows = document.querySelectorAll('#match-scorers-container > div');
    const scorers = [];

    scorerRows.forEach(row => {
      const nameSelect = row.querySelector('.scorer-name-select');
      const goalsInput = row.querySelector('.scorer-goals-input');
      if (nameSelect && nameSelect.value) {
        scorers.push({
          name: nameSelect.value,
          goals: Number(goalsInput.value || 1)
        });
      }
    });

    Store.updateMatchResult(matchIndex, homeScore, awayScore, scorers);
    App.showToast('Cập nhật tỷ số trận đấu & BXH thành công! ⚽', 'success');
    App.closeModal('match-modal');
    this.render();
  }
}

window.TeamPage = new TeamPageController();
