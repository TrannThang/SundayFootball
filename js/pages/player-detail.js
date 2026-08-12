/* ==========================================================================
   SUNDAY FOOTBALL - PLAYER DETAIL CARD (Profile View + Radar Chart)
   ========================================================================== */

class PlayerDetailController {
  show(playerId) {
    const p = Store.getPlayerById(playerId);
    if (!p) return;

    const container = document.getElementById('player-detail-content');
    if (!container) return;

    const teamColors = { 1: '#ef4444', 2: '#3b82f6', 3: '#eab308' };
    const teamNames = { 1: 'Đội 1', 2: 'Đội 2', 3: 'Đội 3' };
    const teamColor = teamColors[p.teamId] || '#06b6d4';

    const ranked = [...Store.getPlayers()].sort((a, b) => b.ovr - a.ovr);
    const rank = ranked.findIndex(x => x.id === p.id) + 1;

    const streak = p.streak || 0;
    const hasBonus = streak >= 3;
    const bonusText = hasBonus
      ? 'Đã đạt bonus +1 OVR – đi đá đều 3 trận liên tiếp! 🔥'
      : `Chưa có bonus – đi đá đều ${3 - streak} trận liên tiếp nữa để +1 OVR`;

    container.innerHTML = `
      <div class="fifa-card" style="cursor:default; border-top:3px solid ${teamColor};">
        <div class="fifa-card-top">
          <div>
            <div class="fifa-ovr">${p.ovr}</div>
            <div class="fifa-pos pos-${p.pos}">${p.pos}</div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.8rem; font-weight:800; color:${teamColor};">#${rank}</span>
            <div style="font-size:0.68rem; color:${teamColor}; font-weight:700;">${teamNames[p.teamId] || ''}</div>
          </div>
        </div>

        <div class="fifa-avatar-wrap" style="width:88px; height:88px; font-size:2.4rem; margin:12px auto;">
          <span>${p.name.charAt(0)}</span>
        </div>

        <div class="fifa-name" style="font-size:1.15rem; white-space:normal;">${p.name}</div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px 6px; margin-top:14px; text-align:center;">
          <div><div class="stat-lbl" style="font-size:0.7rem;">Tốc độ</div><div class="stat-val" style="font-size:1.15rem;">${p.stats.pac}</div></div>
          <div><div class="stat-lbl" style="font-size:0.7rem;">Dứt điểm</div><div class="stat-val" style="font-size:1.15rem;">${p.stats.sho}</div></div>
          <div><div class="stat-lbl" style="font-size:0.7rem;">Chuyền</div><div class="stat-val" style="font-size:1.15rem;">${p.stats.pas}</div></div>
          <div><div class="stat-lbl" style="font-size:0.7rem;">Rê dắt</div><div class="stat-val" style="font-size:1.15rem;">${p.stats.dri}</div></div>
          <div><div class="stat-lbl" style="font-size:0.7rem;">Phòng ngự</div><div class="stat-val" style="font-size:1.15rem;">${p.stats.def}</div></div>
          <div><div class="stat-lbl" style="font-size:0.7rem;">Thể lực</div><div class="stat-val" style="font-size:1.15rem;">${p.stats.phy}</div></div>
        </div>
      </div>

      <div style="text-align:center; margin-top:10px;">
        <span class="streak-bonus-badge">${bonusText}</span>
      </div>

      <div class="radar-chart-card" style="margin-top:14px;">
        <div class="card-title" style="justify-content:center; margin-bottom:4px;">
          <span class="card-title-icon">📊</span>
          <span>CHỈ SỐ</span>
        </div>
        <div style="display:flex; justify-content:center;">
          ${this.buildRadarSvg(p.stats)}
        </div>
      </div>

      ${Auth.isAdmin() ? `
        <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="App.closeModal('player-detail-modal'); SquadPage.openEditPlayerModal(${p.id});">
          ✏️ Chỉnh sửa cầu thủ
        </button>
      ` : ''}
    `;

    App.openModal('player-detail-modal');
  }

  buildRadarSvg(stats) {
    const labels = ['Tốc độ', 'Dứt điểm', 'Chuyền', 'Rê dắt', 'Phòng ngự', 'Thể lực'];
    const keys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
    const size = 240;
    const center = size / 2;
    const maxR = 80;
    const levels = [0.25, 0.5, 0.75, 1];

    const angleFor = (i) => (Math.PI * 2 * i / 6) - Math.PI / 2;
    const pointAt = (i, frac) => {
      const angle = angleFor(i);
      return [center + Math.cos(angle) * maxR * frac, center + Math.sin(angle) * maxR * frac];
    };

    const gridPolys = levels.map(lv => {
      const pts = keys.map((k, i) => pointAt(i, lv).join(',')).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`;
    }).join('');

    const axisLines = keys.map((k, i) => {
      const [x, y] = pointAt(i, 1);
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`;
    }).join('');

    const dataPts = keys.map((k, i) => {
      const val = stats[k] || 0;
      const frac = Math.max(0, Math.min(1, val / 99));
      return pointAt(i, frac).join(',');
    }).join(' ');

    const labelEls = keys.map((k, i) => {
      const [x, y] = pointAt(i, 1.26);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" style="fill:var(--text-secondary); font-size:11px; font-weight:700;">${labels[i]}</text>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:260px;">
        ${gridPolys}
        ${axisLines}
        <polygon points="${dataPts}" fill="rgba(6,182,212,0.35)" stroke="var(--accent-cyan)" stroke-width="2"/>
        ${labelEls}
      </svg>
    `;
  }
}

window.PlayerDetail = new PlayerDetailController();
