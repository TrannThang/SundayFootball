/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 3: TRANG ĐỘI HÌNH (SQUAD ROSTER)
   ========================================================================== */

class SquadPageController {
  constructor() {
    this.currentFilter = 'ALL'; // ALL, GK, DF, MF, FW
  }

  render() {
    const container = document.getElementById('page-squad');
    if (!container) return;

    let players = Store.getPlayers();

    // Sort by OVR descending
    players.sort((a, b) => b.ovr - a.ovr);

    // Apply Position Filter
    if (this.currentFilter !== 'ALL') {
      players = players.filter(p => {
        if (this.currentFilter === 'GK') return p.pos === 'GK';
        if (this.currentFilter === 'DF') return ['CB', 'LB', 'RB', 'DF'].includes(p.pos);
        if (this.currentFilter === 'MF') return ['CM', 'CDM', 'CAM', 'LM', 'RM', 'MF'].includes(p.pos);
        if (this.currentFilter === 'FW') return ['ST', 'LW', 'RW', 'FW'].includes(p.pos);
        return true;
      });
    }

    const isAdmin = Auth.isAdmin();

    container.innerHTML = `
      <!-- Header & Add Player Admin Button -->
      <div class="card-header-flex" style="margin-bottom:12px;">
        <div>
          <h2 style="font-size:1.1rem; font-weight:800;">🏃 Danh Sách ${Store.getPlayers().length} Cầu Thủ</h2>
          <p style="font-size:0.75rem; color:var(--text-secondary);">Sắp xếp theo chỉ số OVR từ cao xuống thấp</p>
        </div>

        ${isAdmin ? `
          <button class="btn btn-primary btn-sm" onclick="SquadPage.openAddPlayerModal()">
            ➕ Thêm Cầu Thủ
          </button>
        ` : ''}
      </div>

      <!-- Filter Bar -->
      <div class="filter-tabs">
        <button class="filter-tab-btn ${this.currentFilter === 'ALL' ? 'active' : ''}" onclick="SquadPage.setFilter('ALL')">Tất Cả (${Store.getPlayers().length})</button>
        <button class="filter-tab-btn ${this.currentFilter === 'FW' ? 'active' : ''}" onclick="SquadPage.setFilter('FW')">FW (Tiền đạo)</button>
        <button class="filter-tab-btn ${this.currentFilter === 'MF' ? 'active' : ''}" onclick="SquadPage.setFilter('MF')">MF (Tiền vệ)</button>
        <button class="filter-tab-btn ${this.currentFilter === 'DF' ? 'active' : ''}" onclick="SquadPage.setFilter('DF')">DF (Hậu vệ)</button>
        <button class="filter-tab-btn ${this.currentFilter === 'GK' ? 'active' : ''}" onclick="SquadPage.setFilter('GK')">GK (Thủ môn)</button>
      </div>

      <!-- Squad FIFA Cards Grid -->
      <div class="squad-grid">
        ${players.map(p => this.renderFifaCard(p, isAdmin)).join('')}
      </div>
    `;
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.render();
  }

  renderFifaCard(p, isAdmin) {
    const teamColors = { 1: '#ef4444', 2: '#3b82f6', 3: '#eab308' };
    const teamNames = { 1: 'Đội 1', 2: 'Đội 2', 3: 'Đội 3' };
    const teamColor = teamColors[p.teamId] || '#06b6d4';

    return `
      <div class="fifa-card" style="border-top: 3px solid ${teamColor};" onclick="PlayerDetail.show(${p.id})">
        <div class="fifa-card-top">
          <div>
            <div class="fifa-ovr">${p.ovr}</div>
            <div class="fifa-pos pos-${p.pos}">${p.pos}</div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.68rem; font-weight:800; color:${teamColor};">${teamNames[p.teamId]}</span>
            ${p.attendance === 'going' ? `<div style="font-size:0.65rem; color:var(--accent-emerald); font-weight:800;">🏅 Điểm danh</div>` : ''}
            ${p.attendance === 'pending' ? `<div style="font-size:0.65rem; color:var(--accent-gold); font-weight:800;">⏳ Chưa vote</div>` : ''}
          </div>
        </div>

        <div class="fifa-avatar-wrap">
          <span>${p.name.charAt(0)}</span>
        </div>

        <div class="fifa-name">${p.name}</div>

        <div class="fifa-stats-grid">
          <div class="stat-row"><span class="stat-lbl">PAC</span><span class="stat-val">${p.stats.pac}</span></div>
          <div class="stat-row"><span class="stat-lbl">SHO</span><span class="stat-val">${p.stats.sho}</span></div>
          <div class="stat-row"><span class="stat-lbl">PAS</span><span class="stat-val">${p.stats.pas}</span></div>
          <div class="stat-row"><span class="stat-lbl">DRI</span><span class="stat-val">${p.stats.dri}</span></div>
          <div class="stat-row"><span class="stat-lbl">DEF</span><span class="stat-val">${p.stats.def}</span></div>
          <div class="stat-row"><span class="stat-lbl">PHY</span><span class="stat-val">${p.stats.phy}</span></div>
        </div>

        ${isAdmin ? `
          <div style="margin-top:6px; font-size:0.68rem; color:var(--accent-gold); text-align:center; font-weight:700;">
            🔑 PIN: ${p.pin}
          </div>
        ` : ''}
      </div>
    `;
  }

  openAddPlayerModal() {
    document.getElementById('player-modal-title').textContent = '🏃 Thêm Cầu Thủ Mới';
    document.getElementById('player-edit-id').value = '';
    document.getElementById('player-name').value = '';
    document.getElementById('player-pin').value = String(1000 + Store.getPlayers().length + 1);
    document.getElementById('player-pos').value = 'CM';
    document.getElementById('player-ovr').value = 70;

    document.getElementById('stat-pac').value = 70;
    document.getElementById('stat-sho').value = 70;
    document.getElementById('stat-pas').value = 70;
    document.getElementById('stat-dri').value = 70;
    document.getElementById('stat-def').value = 70;
    document.getElementById('stat-phy').value = 70;

    App.openModal('player-modal');
  }

  openEditPlayerModal(playerId) {
    if (!Auth.isAdmin()) return;

    const p = Store.getPlayerById(playerId);
    if (!p) return;

    document.getElementById('player-modal-title').textContent = `✏️ Chỉnh Sửa: ${p.name}`;
    document.getElementById('player-edit-id').value = p.id;
    document.getElementById('player-name').value = p.name;
    document.getElementById('player-pin').value = p.pin;
    document.getElementById('player-pos').value = p.pos;
    document.getElementById('player-ovr').value = p.ovr;

    document.getElementById('stat-pac').value = p.stats.pac;
    document.getElementById('stat-sho').value = p.stats.sho;
    document.getElementById('stat-pas').value = p.stats.pas;
    document.getElementById('stat-dri').value = p.stats.dri;
    document.getElementById('stat-def').value = p.stats.def;
    document.getElementById('stat-phy').value = p.stats.phy;

    App.openModal('player-modal');
  }

  savePlayer(e) {
    e.preventDefault();
    const id = document.getElementById('player-edit-id').value;
    const name = document.getElementById('player-name').value.trim();
    const pin = document.getElementById('player-pin').value.trim();
    const pos = document.getElementById('player-pos').value;
    const ovr = Number(document.getElementById('player-ovr').value);

    const stats = {
      pac: Number(document.getElementById('stat-pac').value || 70),
      sho: Number(document.getElementById('stat-sho').value || 70),
      pas: Number(document.getElementById('stat-pas').value || 70),
      dri: Number(document.getElementById('stat-dri').value || 70),
      def: Number(document.getElementById('stat-def').value || 70),
      phy: Number(document.getElementById('stat-phy').value || 70)
    };

    const playerObj = {
      id: id ? Number(id) : null,
      name,
      fullName: name,
      pin,
      pos,
      ovr,
      stats
    };

    Store.savePlayer(playerObj);
    App.showToast('Lưu thông tin cầu thủ thành công! ⚽', 'success');
    App.closeModal('player-modal');
    this.render();
  }
}

window.SquadPage = new SquadPageController();
